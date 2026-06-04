const axios = require('axios');

const BOT_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
const OWNER_NUMBER = process.env.OWNER_WHATSAPP || 'whatsapp:+918590637350';
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

async function sendWhatsApp(to, message) {
  if (!accountSid || !authToken) {
    console.error('❌ Twilio credentials missing in environment variables');
    return;
  }

  const cleanTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  
  const params = new URLSearchParams();
  params.append('From', BOT_NUMBER);
  params.append('To', cleanTo);
  params.append('Body', message);
  
  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  
  try {
    await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      params,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    console.log(`✅ Message sent to ${to}`);
  } catch (err) {
    const errorMsg = err.response ? JSON.stringify(err.response.data) : err.message;
    console.error(`❌ Failed to send to ${to}:`, errorMsg);
  }
}

async function alertOwner(customerNumber, customerName, weddingDate, venue, packageInterested, chatSummary) {
  const cleanNumber = customerNumber.replace('whatsapp:', '');
  const message = `🔔 *NEW BOOKING ENQUIRY!*

👤 Customer: ${customerName || 'Not yet given'}
📱 Number: ${cleanNumber}
📅 Wedding Date: ${weddingDate || 'Not specified'}
📍 Venue: ${venue || 'Not specified'}
📦 Package Interest: ${packageInterested || 'Not specified yet'}

💬 *Last message:* ${chatSummary}

━━━━━━━━━━━━━━━━━━━━
Reply with:
✅ *AVAILABLE* — to confirm date is free
❌ *UNAVAILABLE* — if date is booked

Or reply with: *VIEW ${cleanNumber}* to see full chat

━━━━━━━━━━━━━━━━━━━━
📊 Dashboard: http://localhost:3000/dashboard`;

  await sendWhatsApp(OWNER_NUMBER, message);
  console.log(`🔔 Owner alerted about ${customerNumber}`);
}

module.exports = { sendWhatsApp, alertOwner, OWNER_NUMBER, BOT_NUMBER };
