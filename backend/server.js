require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { handleIncomingMessage } = require('./bot/handler');
const { 
  initDB,
  getBookings,
  getBooking,
  saveBooking,
  updateBooking,
  confirmBooking,
  deleteBooking,
  getBookingByPhone,
  getProjects,
  getProject,
  updateProject,
  logActivity,
  getProjectLogs,
  saveProjectMessage,
  getProjectChats,
  getProjectAllChats,
  createProjectFromBooking,
  getProjectByPhone,
  getStaffUsers,
  getStaffUser,
  createStaffUser,
  updateStaffUser,
  deleteStaffUser,
  authenticateStaff
} = require('./bot/database');
const { startReminderScheduler } = require('./bot/reminders');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));

// Serve monitoring dashboard
app.use('/dashboard', express.static(path.join(__dirname, 'dashboard')));

// Serve static client website from DreamwedWebsite dist folder
const websiteDist = path.join(__dirname, '../DreamwedWebsite/dist');
if (fs.existsSync(websiteDist)) {
  console.log(`📦 Serving React website static assets from: ${websiteDist}`);
  app.use(express.static(websiteDist, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
      } else {
        res.set('Cache-Control', 'public, max-age=0, must-revalidate');
      }
    }
  }));
  
  // Support React Router client-side routing fallback (but exclude API / webhook / dashboard routes)
  app.get(/^\/(?!api|webhook|dashboard).*$/, (req, res) => {
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.sendFile(path.join(websiteDist, 'index.html'));
  });
} else {
  console.log(`⚠️ React website build not found at: ${websiteDist}. Run a local Vite build first.`);
}

// WhatsApp Webhook (Twilio sends messages here)
app.post('/webhook', async (req, res) => {
  try {
    await handleIncomingMessage(req.body);
    res.status(200).send('OK');
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).send('Error');
  }
});

// Dashboard API — get all chats
app.get('/api/chats', (req, res) => {
  const db = require('./bot/database').getDB();
  const chats = db.prepare(`
    SELECT c.*, 
      (SELECT message FROM messages WHERE customer_number = c.customer_number ORDER BY created_at DESC LIMIT 1) as last_message,
      (SELECT COUNT(*) FROM messages WHERE customer_number = c.customer_number) as message_count
    FROM customers c 
    ORDER BY c.updated_at DESC
  `).all();
  res.json(chats);
});

// Dashboard API — get full chat history for one customer
app.get('/api/chats/:number', (req, res) => {
  const db = require('./bot/database').getDB();
  const fullNumber = req.params.number.includes('whatsapp') ? req.params.number : `whatsapp:+${req.params.number}`;
  const messages = db.prepare(
    'SELECT * FROM messages WHERE customer_number = ? ORDER BY created_at ASC'
  ).all(fullNumber);
  const customer = db.prepare(
    'SELECT * FROM customers WHERE customer_number = ?'
  ).get(fullNumber);
  res.json({ customer, messages });
});

// Dashboard API — update customer status
app.post('/api/chats/:number/status', (req, res) => {
  const db = require('./bot/database').getDB();
  const fullNumber = req.params.number.includes('whatsapp') ? req.params.number : `whatsapp:+${req.params.number}`;
  db.prepare('UPDATE customers SET status = ? WHERE customer_number = ?')
    .run(req.body.status, fullNumber);
  res.json({ success: true });
});

// OTP Storage (In-memory map for phone -> { otp, expiresAt })
const otpStore = new Map();

// Real Twilio OTP SMS & WhatsApp Sender Routes
app.post('/api/otp/send', async (req, res) => {
  try {
    const { phone, digits } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number is required' });

    const length = parseInt(digits) === 4 ? 4 : 6;
    const otp = length === 4 
      ? String(Math.floor(Math.random() * 9000) + 1000)
      : String(Math.floor(Math.random() * 900000) + 100000);

    // Save OTP (Expires in 10 minutes)
    otpStore.set(phone.trim(), { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

    let formattedPhone = phone.trim();
    if (formattedPhone.length === 10 && !formattedPhone.startsWith('+')) {
      formattedPhone = `+91${formattedPhone}`;
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`;
    }

    const messageText = `Your Dreamwed Stories OTP is ${otp}. Valid for 10 minutes.`;
    let smsSuccess = false;
    let whatsappSuccess = false;

    // Initialize Twilio Client
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (accountSid && authToken && accountSid.startsWith('AC') && authToken.length === 32) {
      const twilio = require('twilio');
      const client = twilio(accountSid, authToken);

      // 1. Try Twilio SMS
      try {
        const fromSms = process.env.TWILIO_SMS_NUMBER || (process.env.TWILIO_WHATSAPP_NUMBER ? process.env.TWILIO_WHATSAPP_NUMBER.replace('whatsapp:', '') : null);
        if (fromSms) {
          await client.messages.create({
            body: messageText,
            from: fromSms,
            to: formattedPhone
          });
          console.log(`[Twilio SMS] OTP ${otp} successfully sent to ${formattedPhone}`);
          smsSuccess = true;
        }
      } catch (err) {
        console.error(`[Twilio SMS] Failed to send SMS to ${formattedPhone}:`, err.message);
      }

      // 2. Try Twilio WhatsApp
      try {
        const fromWhatsapp = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
        await client.messages.create({
          body: `Your Dreamwed Stories OTP code is: *${otp}* 🔑\n\nValid for 10 minutes. Please enter this code in the verification screen.`,
          from: fromWhatsapp,
          to: `whatsapp:${formattedPhone}`
        });
        console.log(`[Twilio WhatsApp] OTP ${otp} successfully sent to ${formattedPhone}`);
        whatsappSuccess = true;
      } catch (err) {
        console.error(`[Twilio WhatsApp] Failed to send WhatsApp to ${formattedPhone}:`, err.message);
      }
    }

    // Fallback: If Twilio is not set up or both calls fail, use simulated mode
    if (!smsSuccess && !whatsappSuccess) {
      console.log(`\n⚠️ [SIMULATED SMS GATEWAY] Twilio credentials missing or failed. OTP for ${phone} is: [ ${otp} ]\n`);
      return res.json({ success: true, simulated: true, otp });
    }

    res.json({ success: true, simulated: false });
  } catch (err) {
    console.error('OTP Send error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/otp/verify', (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP are required' });

    const record = otpStore.get(phone.trim());
    if (!record) {
      return res.status(400).json({ error: 'No OTP requested for this phone number' });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(phone.trim());
      return res.status(400).json({ error: 'OTP has expired' });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ error: 'Incorrect OTP code' });
    }

    otpStore.delete(phone.trim()); // Success! Remove from store
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Booking APIs
app.get('/api/bookings', (req, res) => {
  try {
    res.json(getBookings());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bookings/:id', (req, res) => {
  try {
    const booking = getBooking(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings', (req, res) => {
  try {
    const booking = saveBooking(req.body);
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/bookings/:id', (req, res) => {
  try {
    const booking = updateBooking(req.params.id, req.body);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings/:id/confirm', (req, res) => {
  try {
    const booking = confirmBooking(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/bookings/:id', (req, res) => {
  try {
    const deleted = deleteBooking(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Booking not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Client booking query API
app.get('/api/client/booking', (req, res) => {
  try {
    const phone = req.query.phone;
    if (!phone) return res.status(400).json({ error: 'Phone parameter is required' });
    
    const booking = getBookingByPhone(phone);
    if (!booking) return res.status(404).json({ error: 'No booking request found for this phone number' });
    
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Project & Workflow APIs
app.get('/api/projects', (req, res) => {
  try {
    res.json(getProjects());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/projects/:id', (req, res) => {
  try {
    const project = getProject(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/projects/:id', (req, res) => {
  try {
    const project = updateProject(req.params.id, req.body);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    // Log updates automatically
    if (req.body.current_step !== undefined) {
      const stepName = project.timeline_steps[project.current_step - 1]?.name || `Step ${project.current_step}`;
      logActivity(project.id, "Admin", `Moved timeline to stage: ${stepName}`);
      
      // WhatsApp Automation Mock
      console.log(`[WHATSAPP AUTOMATION] Nudge client for step: ${stepName}`);
    }
    if (req.body.deliveries !== undefined) {
      logActivity(project.id, "Admin", `Uploaded project draft deliverables / links`);
    }
    
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/projects/:id/logs', (req, res) => {
  try {
    res.json(getProjectLogs(req.params.id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects/:id/logs', (req, res) => {
  try {
    const { user, action } = req.body;
    logActivity(req.params.id, user || "Team", action);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/projects/:id/chats/:channel', (req, res) => {
  try {
    res.json(getProjectChats(req.params.id, req.params.channel));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects/:id/chats/:channel', (req, res) => {
  try {
    const { sender, text } = req.body;
    const messages = saveProjectMessage(req.params.id, req.params.channel, sender, text);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/client/project', (req, res) => {
  try {
    const phone = req.query.phone;
    if (!phone) return res.status(400).json({ error: 'Phone parameter is required' });
    
    const result = getProjectByPhone(phone);
    if (!result) return res.status(404).json({ error: 'No booking request found for this phone number' });
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects/:id/whatsapp-reminder', (req, res) => {
  try {
    const { type } = req.body;
    const project = getProject(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    let reminderText = "";
    if (type === "photo_selection") {
      reminderText = `Hello ${project.couple_name}! 💍 Just a friendly reminder to heart and select your wedding album photos inside your Client Workspace so our album designer can begin layout work. 📸`;
    } else if (type === "album_approval") {
      reminderText = `Hello ${project.couple_name}! ✨ Your custom layflat album layout design is awaiting your approval. Please view the PDF preview inside your Client Workspace and let us know! 📖`;
    } else {
      reminderText = `Hello ${project.couple_name}! 💛 Just checking in regarding your wedding project progress inside your Client Workspace.`;
    }
    
    logActivity(project.id, "System", `Sent automatic WhatsApp reminder: "${type.replace('_', ' ')}"`);
    
    console.log(`[WHATSAPP BOT AUTOMATED NUDGE to ${project.couple_name}]: ${reminderText}`);
    
    res.json({ success: true, reminder: reminderText });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================= STAFF USER MANAGEMENT APIs =========================

// Get all staff users (admin only)
app.get('/api/staff', (req, res) => {
  try {
    const users = getStaffUsers().map(u => ({ ...u, password: undefined })); // strip password from response
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new staff user
app.post('/api/staff', (req, res) => {
  try {
    const { username, password, role, display_name } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ error: 'username, password, and role are required' });
    }
    // Check duplicate username
    if (getStaffUser(username)) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    const user = createStaffUser({ username, password, role, display_name });
    res.status(201).json({ ...user, password: undefined });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update staff user (name, password, role, assigned_projects)
app.put('/api/staff/:id', (req, res) => {
  try {
    const user = updateStaffUser(req.params.id, req.body);
    if (!user) return res.status(404).json({ error: 'Staff user not found' });
    res.json({ ...user, password: undefined });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete staff user
app.delete('/api/staff/:id', (req, res) => {
  try {
    const deleted = deleteStaffUser(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Staff user not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Authenticate staff login (for Editor and Designer portals)
app.post('/api/staff/auth', (req, res) => {
  try {
    const { username, password } = req.body;
    const user = authenticateStaff(username, password);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ ...user, password: undefined });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: get all chats across all channels for a project
app.get('/api/projects/:id/all-chats', (req, res) => {
  try {
    const chats = getProjectAllChats(req.params.id);
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload PDF file from Designer Portal (Saves to static public folder)
app.post('/api/upload-pdf', (req, res) => {
  try {
    const { projectId, fileName, fileData } = req.body;
    if (!projectId || !fileName || !fileData) {
      return res.status(400).json({ error: 'projectId, fileName, and fileData are required' });
    }

    // Strip base64 metadata header if present
    const base64Data = fileData.replace(/^data:application\/pdf;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    // Create target directory if it doesn't exist
    const albumsDir = path.join(__dirname, '../DreamwedWebsite/public/albums');
    if (!fs.existsSync(albumsDir)) {
      fs.mkdirSync(albumsDir, { recursive: true });
    }

    // Save PDF file to public static folder
    const safeFileName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const filePath = path.join(albumsDir, safeFileName);
    fs.writeFileSync(filePath, buffer);

    // Save relative URL path to database
    const relativeUrl = `/albums/${safeFileName}`;
    const project = getProject(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    project.deliveries = project.deliveries || {};
    project.deliveries.album_pdf_url = relativeUrl;
    project.deliveries.album_status = "pending"; // reset status for client review
    
    // Log designer action
    logActivity(project.id, "Designer", `Uploaded new album layout draft: ${fileName}`);
    
    // Save project changes
    const updatedProject = updateProject(project.id, { deliveries: project.deliveries });
    
    // Automatically post a message in the client-designer chat channel
    saveProjectMessage(
      project.id, 
      "client-designer", 
      "designer", 
      `🔔 I have uploaded a new layflat album layout draft (${fileName})! Please check your "Album Design selections" tab to review the blueprint pages. Let me know if you would like any changes!`
    );
    
    res.json({ success: true, project: updatedProject, url: relativeUrl });
  } catch (err) {
    console.error("PDF upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Generic file uploader (Saves to static public uploads folder)
app.post('/api/upload-file', (req, res) => {
  try {
    const { fileName, fileData } = req.body;
    if (!fileName || !fileData) {
      return res.status(400).json({ error: 'fileName and fileData are required' });
    }

    // Strip base64 metadata header if present
    const match = fileData.match(/^data:(.+);base64,(.+)$/);
    let base64Data = fileData;
    if (match) {
      base64Data = match[2];
    }
    const buffer = Buffer.from(base64Data, 'base64');

    // Create target directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../DreamwedWebsite/public/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Save file to public static folder
    const safeFileName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const filePath = path.join(uploadsDir, safeFileName);
    fs.writeFileSync(filePath, buffer);

    const relativeUrl = `/uploads/${safeFileName}`;
    res.json({ success: true, url: relativeUrl });
  } catch (err) {
    console.error("File upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Initialize DB and start server
initDB();
startReminderScheduler();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Dreamwed Bot Server running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`📱 Webhook URL: http://localhost:${PORT}/webhook\n`);
});
