const cron = require('node-cron');
const { getPendingReminders, markReminderSent, getChatHistory, getOrCreateCustomer } = require('./database');
const { sendWhatsApp } = require('./whatsapp');
const { saveMessage } = require('./database');

const REMINDER_MESSAGES = {
  follow_up_6h: [
    "Hi! 😊 Just checking in — did you get a chance to discuss with family about your wedding photography? We're here if you have any questions! 💛",
    "Hey! Hope you're doing well 🙏 Just wanted to make sure you had all the info you needed about our packages. Feel free to ask anything! — Dreamwed Stories"
  ],
  follow_up_1d: [
    "Hi again! 💛 Wanted to share — we recently captured a beautiful wedding in Trivandrum and the couple absolutely loved their album! Would love to do the same for you 😊\n\nIs your date still available to discuss? 📅",
    "Good day! 🌟 We still have your enquiry with us. Your wedding day deserves the best memories — that's exactly what we create at Dreamwed Stories 💛\n\nShall we take the next step?"
  ],
  follow_up_3d: [
    "Hi! 🔔 Just a gentle reminder — *your date may still be open* but we're getting more enquiries for that period!\n\nWe'd love to block it for you before it fills up 🙏 Just say the word!",
    "Hey! We wanted to reach out one more time 💛 Dreamwed Stories has very *limited slots per month* — we do this so every couple gets our complete attention and care.\n\nWould you like to secure your date today? 😊"
  ],
  follow_up_7d: [
    "Hi! This is a final follow-up from Dreamwed Stories 🌸\n\nWe understand wedding planning is a big decision! If you'd like to revisit our packages or have any questions, we're always here.\n\nWishing you a beautiful wedding ahead! 💛🙏",
    "Hello! 😊 One last check-in from Dreamwed Stories. Your date may still be available — let us know if you'd like to move forward!\n\nOr feel free to reach us anytime at +91 8590637350 💛"
  ]
};

function getRandomMessage(type) {
  const msgs = REMINDER_MESSAGES[type];
  if (!msgs) return null;
  return msgs[Math.floor(Math.random() * msgs.length)];
}

function startReminderScheduler() {
  // Check every 5 minutes for pending reminders
  cron.schedule('*/5 * * * *', async () => {
    const pending = getPendingReminders();
    for (const reminder of pending) {
      try {
        const customer = getOrCreateCustomer(reminder.customer_number);
        
        // Skip if already booked
        if (customer.status === 'booked' || customer.status === 'lost') {
          markReminderSent(reminder.id);
          continue;
        }

        const message = getRandomMessage(reminder.reminder_type);
        if (message) {
          await sendWhatsApp(reminder.customer_number, message);
          saveMessage(reminder.customer_number, 'assistant', `[REMINDER] ${message}`);
          console.log(`⏰ Reminder sent to ${reminder.customer_number} — type: ${reminder.reminder_type}`);
        }

        markReminderSent(reminder.id);
      } catch (err) {
        console.error(`Failed to send reminder to ${reminder.customer_number}:`, err.message);
      }
    }
  });

  console.log('⏰ Reminder scheduler started (checks every 5 min)');
}

module.exports = { startReminderScheduler };
