const { getAIReply } = require('./ai');
const { sendWhatsApp, alertOwner, OWNER_NUMBER } = require('./whatsapp');
const {
  saveMessage, getOrCreateCustomer, updateCustomer,
  getChatHistory, scheduleReminder
} = require('./database');

// Detect date mentions in message
function extractDate(text) {
  const datePatterns = [
    /(\d{1,2})[\/\-\s](\d{1,2})[\/\-\s](\d{2,4})/,
    /(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(\d{2,4})?/i,
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})[,\s]*(\d{2,4})?/i,
    /(\d{1,2})(st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*/i
  ];
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return null;
}

// Detect venue/place mentions
function extractVenue(text) {
  const venueKeywords = [
    'resort', 'hotel', 'hall', 'convention', 'auditorium', 'garden',
    'beach', 'palace', 'club', 'banquet', 'kalyanamandapam', 'church',
    'temple', 'house', 'home', 'leela', 'taj', 'marriott', 'kovalam',
    'trivandrum', 'varkala', 'kollam', 'kochi', 'thrissur', 'calicut',
    'venue', 'location', 'place', 'at', 'in'
  ];
  const lowerText = text.toLowerCase();
  for (const keyword of venueKeywords) {
    if (lowerText.includes(keyword)) {
      // Extract surrounding context
      const idx = lowerText.indexOf(keyword);
      return text.substring(Math.max(0, idx - 5), Math.min(text.length, idx + 40)).trim();
    }
  }
  return null;
}

// Handle owner replies (AVAILABLE/UNAVAILABLE)
async function handleOwnerReply(body) {
  const message = body.Body?.trim().toUpperCase();
  const ownerNumber = body.From;

  // Owner replies AVAILABLE <number> or UNAVAILABLE <number>
  const availMatch = message.match(/^(AVAILABLE|UNAVAILABLE)\s*(\+?\d+)?/);
  if (availMatch) {
    const status = availMatch[1];
    let targetNumber = availMatch[2];

    if (!targetNumber) {
      // Find the most recent pending availability check
      const db = require('./database').getDB();
      const pending = db.prepare(
        "SELECT customer_number FROM customers WHERE availability_checked = 1 AND owner_confirmed IS NULL ORDER BY updated_at DESC LIMIT 1"
      ).get();
      if (pending) targetNumber = pending.customer_number.replace('whatsapp:', '');
    }

    if (targetNumber) {
      const customerWhatsApp = `whatsapp:+${targetNumber.replace(/\D/g, '')}`;
      const confirmation = status === 'AVAILABLE' ? 'available' : 'unavailable';
      updateCustomer(customerWhatsApp, { owner_confirmed: confirmation });

      if (status === 'AVAILABLE') {
        const replyMsg = `Great news! 🎉 Your date is *available* with Dreamwed Stories!\n\nWe'd love to be part of your special day 💛\n\nShall I share our package details with you?`;
        await sendWhatsApp(customerWhatsApp, replyMsg);
        saveMessage(customerWhatsApp, 'assistant', replyMsg);
        updateCustomer(customerWhatsApp, { status: 'hot_lead' });
        scheduleReminder(customerWhatsApp, 'follow_up_6h', 360);
      } else {
        const replyMsg = `I checked with our team and unfortunately that specific date is already booked 😔\n\nBut don't worry — we may have nearby dates available! Could you tell me if you have any flexibility on the date? 🙏`;
        await sendWhatsApp(customerWhatsApp, replyMsg);
        saveMessage(customerWhatsApp, 'assistant', replyMsg);
      }

      await sendWhatsApp(OWNER_NUMBER, `✅ Done! Customer ${targetNumber} has been notified — *${status}*`);
    }
    return true;
  }
  return false;
}

// Main message handler
async function handleIncomingMessage(body) {
  const from = body.From; // e.g., whatsapp:+919876543210
  const messageText = body.Body?.trim();

  if (!messageText) return;

  console.log(`📨 Message from ${from}: ${messageText}`);

  // Check if message is from the OWNER
  if (from === OWNER_NUMBER || from === process.env.OWNER_WHATSAPP) {
    const handled = await handleOwnerReply(body);
    if (handled) return;
    // Owner sent something else — ignore or handle manually
    return;
  }

  // Get or create customer
  const customer = getOrCreateCustomer(from);

  // Save incoming message
  saveMessage(from, 'user', messageText);

  // Extract date and venue from message
  const detectedDate = extractDate(messageText);
  const detectedVenue = extractVenue(messageText);

  let updatedFields = {};
  if (detectedDate && !customer.wedding_date) {
    updatedFields.wedding_date = detectedDate;
  }
  if (detectedVenue && !customer.venue) {
    updatedFields.venue = detectedVenue;
  }

  // Check if name is mentioned
  const nameMatch = messageText.match(/(?:i am|i'm|my name is|this is)\s+([A-Za-z]+)/i);
  if (nameMatch && !customer.name) {
    updatedFields.name = nameMatch[1];
  }

  if (Object.keys(updatedFields).length > 0) {
    updateCustomer(from, updatedFields);
  }

  // Reload customer with updated info
  const updatedCustomer = getOrCreateCustomer(from);

  // If both date AND venue detected for first time → alert owner
  const hasDate = updatedCustomer.wedding_date || detectedDate;
  const hasVenue = updatedCustomer.venue || detectedVenue;

  if (hasDate && hasVenue && !updatedCustomer.availability_checked) {
    updateCustomer(from, { availability_checked: 1, status: 'awaiting_availability' });
    await alertOwner(
      from,
      updatedCustomer.name,
      hasDate,
      hasVenue,
      updatedCustomer.package_interested,
      messageText
    );
  }

  // Get chat history for AI context
  const chatHistory = getChatHistory(from, 15);

  // Get AI reply
  const aiReply = await getAIReply(chatHistory, updatedCustomer);

  // Send reply to customer
  await sendWhatsApp(from, aiReply);

  // Save bot reply
  saveMessage(from, 'assistant', aiReply);

  // Schedule first reminder if new customer and no reminder yet
  if (updatedCustomer.status === 'new') {
    updateCustomer(from, { status: 'chatting' });
    scheduleReminder(from, 'follow_up_6h', 360);   // 6 hours
    scheduleReminder(from, 'follow_up_1d', 1440);  // 1 day
    scheduleReminder(from, 'follow_up_3d', 4320);  // 3 days
    scheduleReminder(from, 'follow_up_7d', 10080); // 7 days
  }
}

module.exports = { handleIncomingMessage };
