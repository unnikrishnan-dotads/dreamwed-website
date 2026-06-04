const fs = require('fs');
const path = require('path');
const axios = require('axios');

const DB_PATH = path.join(__dirname, '../dreamwed_bot_db.json');

const SUPABASE_URL = 'https://iuiezdaeqtvlljymudra.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1aWV6ZGFlcXR2bGxqeW11ZHJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNDQ3MDYsImV4cCI6MjA5NTcyMDcwNn0.9paDnEe2HjUayK8jCG4w2jOoOeXOdwJipySqs0cQIFM';

async function syncToSupabase(table, record, method = 'POST', matchColumn = 'id', matchValue = null) {
  try {
    const url = method === 'POST' 
      ? `${SUPABASE_URL}/rest/v1/${table}`
      : `${SUPABASE_URL}/rest/v1/${table}?${matchColumn}=eq.${matchValue}`;
      
    const headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };

    let res;
    if (method === 'POST') {
      res = await axios.post(url, record, { headers });
    } else if (method === 'PATCH' || method === 'PUT') {
      res = await axios.patch(url, record, { headers });
    } else if (method === 'DELETE') {
      res = await axios.delete(url, { headers });
    }
    console.log(`[SUPABASE SYNC] Successfully synced ${method} to ${table}`);
    return res ? res.data : null;
  } catch (err) {
    console.warn(`[SUPABASE SYNC WARNING] Failed to sync ${method} to ${table}:`, err.response ? err.response.data : err.message);
    return null;
  }
}

let data = {
  customers: [],
  messages: [],
  reminders: [],
  bookings: [],
  projects: [],
  project_chats: [],
  activity_logs: [],
  staff_users: []
};

function getDbDate(dateObj = new Date()) {
  return dateObj.toISOString().replace('T', ' ').substring(0, 19);
}

function saveToDisk() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('❌ Failed to save database to disk:', err.message);
  }
}

function initDB() {
  if (fs.existsSync(DB_PATH)) {
    try {
      const fileContent = fs.readFileSync(DB_PATH, 'utf8');
      if (fileContent.trim()) {
        data = JSON.parse(fileContent);
      }
      data.customers = data.customers || [];
      data.messages = data.messages || [];
      data.reminders = data.reminders || [];
      data.bookings = data.bookings || [];
      data.projects = data.projects || [];
      data.project_chats = data.project_chats || [];
      data.activity_logs = data.activity_logs || [];
      data.staff_users = data.staff_users || [];
    } catch (e) {
      console.error('⚠️ Error loading database JSON, starting fresh:', e.message);
      saveToDisk();
    }
  } else {
    saveToDisk();
  }
  console.log('✅ Pure JavaScript database initialized successfully');
}

// Mock better-sqlite3 API for server.js
const mockDB = {
  prepare(sql) {
    const normalizedSql = sql.replace(/\s+/g, ' ').trim();
    
    return {
      run(...args) {
        // Handle: UPDATE customers SET status = ? WHERE customer_number = ?
        if (normalizedSql.includes('UPDATE customers SET status = ? WHERE customer_number = ?')) {
          const status = args[0];
          const rawNum = args[1];
          const fullNumber = rawNum.includes('whatsapp') ? rawNum : `whatsapp:+${rawNum.replace(/\D/g, '')}`;
          const customer = data.customers.find(c => c.customer_number === fullNumber);
          if (customer) {
            customer.status = status;
            customer.updated_at = getDbDate();
            saveToDisk();
            syncToSupabase('profiles', customer, 'PATCH', 'customer_number', fullNumber);
          }
          return { changes: 1 };
        }
        return { changes: 0 };
      },
      
      get(...args) {
        // Handle: SELECT * FROM customers WHERE customer_number = ?
        if (normalizedSql.includes('FROM customers WHERE customer_number = ?')) {
          const rawNum = args[0];
          const fullNumber = rawNum.includes('whatsapp') ? rawNum : `whatsapp:+${rawNum.replace(/\D/g, '')}`;
          return data.customers.find(c => c.customer_number === fullNumber) || null;
        }
        return null;
      },
      
      all(...args) {
        // Handle: Dashboard stats and list
        if (normalizedSql.includes('message_count')) {
          return data.customers.map(c => {
            const msgs = data.messages.filter(m => m.customer_number === c.customer_number);
            const lastMsgObj = msgs[msgs.length - 1];
            return {
              ...c,
              last_message: lastMsgObj ? lastMsgObj.message : null,
              message_count: msgs.length
            };
          }).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        }
        
        // Handle: SELECT * FROM messages WHERE customer_number = ? ORDER BY created_at ASC
        if (normalizedSql.includes('FROM messages WHERE customer_number = ?')) {
          const rawNum = args[0];
          const fullNumber = rawNum.includes('whatsapp') ? rawNum : `whatsapp:+${rawNum.replace(/\D/g, '')}`;
          return data.messages
            .filter(m => m.customer_number === fullNumber)
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }
        
        return [];
      }
    };
  }
};

function getDB() {
  return mockDB;
}

function saveMessage(customerNumber, role, message) {
  data.messages.push({
    id: data.messages.length + 1,
    customer_number: customerNumber,
    role: role,
    message: message,
    created_at: getDbDate()
  });
  
  let customer = data.customers.find(c => c.customer_number === customerNumber);
  if (customer) {
    customer.updated_at = getDbDate();
  }
  saveToDisk();
}

function getOrCreateCustomer(customerNumber) {
  let customer = data.customers.find(c => c.customer_number === customerNumber);
  if (!customer) {
    customer = {
      id: data.customers.length + 1,
      customer_number: customerNumber,
      name: null,
      wedding_date: null,
      venue: null,
      package_interested: null,
      status: 'new',
      availability_checked: 0,
      owner_confirmed: null,
      created_at: getDbDate(),
      updated_at: getDbDate()
    };
    data.customers.push(customer);
    saveToDisk();
    syncToSupabase('profiles', customer, 'POST');
  }
  return customer;
}

function updateCustomer(customerNumber, fields) {
  let customer = data.customers.find(c => c.customer_number === customerNumber);
  if (customer) {
    Object.assign(customer, fields);
    customer.updated_at = getDbDate();
    saveToDisk();
    syncToSupabase('profiles', customer, 'PATCH', 'customer_number', customerNumber);
  }
}

function getChatHistory(customerNumber, limit = 20) {
  return data.messages
    .filter(m => m.customer_number === customerNumber)
    .slice(-limit)
    .map(m => ({ role: m.role, message: m.message }));
}

function scheduleReminder(customerNumber, type, delayMinutes) {
  const scheduledAt = getDbDate(new Date(Date.now() + delayMinutes * 60 * 1000));
  // Remove existing unsent reminder of same type for this customer
  data.reminders = data.reminders.filter(
    r => !(r.customer_number === customerNumber && r.reminder_type === type && r.sent === 0)
  );
  data.reminders.push({
    id: data.reminders.length + 1,
    customer_number: customerNumber,
    reminder_type: type,
    scheduled_at: scheduledAt,
    sent: 0,
    created_at: getDbDate()
  });
  saveToDisk();
}

function getPendingReminders() {
  const now = getDbDate();
  return data.reminders.filter(r => r.sent === 0 && r.scheduled_at <= now);
}

function markReminderSent(id) {
  let reminder = data.reminders.find(r => r.id === Number(id));
  if (reminder) {
    reminder.sent = 1;
    saveToDisk();
  }
}

function getBookings() {
  return (data.bookings || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function getBooking(id) {
  return (data.bookings || []).find(b => b.id === Number(id)) || null;
}

function saveBooking(booking) {
  data.bookings = data.bookings || [];
  const id = data.bookings.length > 0 ? Math.max(...data.bookings.map(b => b.id)) + 1 : 1;
  
  const invoiceNo = booking.invoice_number || `DW-${new Date().getFullYear()}-${String(id).padStart(3, '0')}`;
  
  const newBooking = {
    id,
    customer_name: booking.customer_name || 'Anonymous Client',
    customer_phone: booking.customer_phone || '',
    customer_email: booking.customer_email || '',
    customer_name_2: booking.customer_name_2 || '',
    customer_phone_2: booking.customer_phone_2 || '',
    customer_email_2: booking.customer_email_2 || '',
    coverage_type: booking.coverage_type || 'single',
    coverage_side: booking.coverage_side || '',
    event_date: booking.event_date || '',
    event_venue: booking.event_venue || '',
    package_name: booking.package_name || 'Custom Package',
    package_price: Number(booking.package_price) || 0,
    add_ons: booking.add_ons || [],
    total_price: Number(booking.total_price) || Number(booking.package_price) || 0,
    advance_paid: Number(booking.advance_paid) || 0,
    balance_amount: (Number(booking.total_price) || 0) - (Number(booking.advance_paid) || 0),
    invoice_number: invoiceNo,
    invoice_date: booking.invoice_date || getDbDate().split(' ')[0],
    status: booking.status || 'pending',
    payment_milestones: booking.payment_milestones || [
      { label: `Advance - Wedding Photography (${booking.package_name || 'Custom Package'})`, amount: Number(booking.advance_paid) || 0, date: booking.invoice_date || getDbDate().split(' ')[0], status: 'Paid' },
      { label: 'Second Payment (Event Day)', amount: 0, date: booking.event_date || '', status: 'Pending' },
      { label: 'Final Payment (Before Delivery)', amount: (Number(booking.total_price) || 0) - (Number(booking.advance_paid) || 0), date: '', status: 'Pending' }
    ],
    bride_password: booking.bride_password || `bride${String(Math.floor(Math.random() * 900) + 100)}`,
    groom_password: booking.groom_password || `groom${String(Math.floor(Math.random() * 900) + 100)}`,
    bride_selections: booking.bride_selections || [],
    groom_selections: booking.groom_selections || [],
    selection_locked: booking.selection_locked !== undefined ? booking.selection_locked : false,
    drive_link: booking.drive_link || "https://drive.google.com/drive/folders/1A2B3C4D5E6F7G8H9I0J",
    travel_charges: booking.travel_charges || "Excluded",
    stay_charges: booking.stay_charges || "Excluded",
    coverage_scope: booking.coverage_scope || booking.coverage_type || "both",
    pincode: booking.pincode || "",
    created_at: getDbDate(),
    updated_at: getDbDate()
  };
  
  data.bookings.push(newBooking);
  saveToDisk();
  syncToSupabase('bookings', newBooking, 'POST');
  return newBooking;
}

function updateBooking(id, fields) {
  data.bookings = data.bookings || [];
  const booking = data.bookings.find(b => b.id === Number(id));
  if (booking) {
    Object.assign(booking, fields);
    // recalculate balance just in case
    if (fields.total_price !== undefined || fields.advance_paid !== undefined) {
      booking.balance_amount = (Number(booking.total_price) || 0) - (Number(booking.advance_paid) || 0);
    }
    booking.updated_at = getDbDate();
    saveToDisk();
    syncToSupabase('bookings', booking, 'PATCH', 'id', id);
    return booking;
  }
  return null;
}

function confirmBooking(id) {
  const booking = updateBooking(id, { status: 'confirmed' });
  if (booking) {
    createProjectFromBooking(booking);
  }
  return booking;
}

function deleteBooking(id) {
  data.bookings = data.bookings || [];
  const before = data.bookings.length;
  data.bookings = data.bookings.filter(b => b.id !== Number(id));
  if (data.bookings.length < before) {
    saveToDisk();
    syncToSupabase('bookings', null, 'DELETE', 'id', id);
    return true;
  }
  return false;
}

function getBookingByPhone(phone) {
  data.bookings = data.bookings || [];
  const normalizedInput = phone.replace(/\D/g, '');
  if (!normalizedInput) return null;
  
  return data.bookings.find(b => {
    const normalizedBookingPhone = (b.customer_phone || '').replace(/\D/g, '');
    const normalizedBookingPhone2 = (b.customer_phone_2 || '').replace(/\D/g, '');
    return normalizedBookingPhone === normalizedInput || 
           normalizedBookingPhone.endsWith(normalizedInput) || 
           normalizedInput.endsWith(normalizedBookingPhone) ||
           (normalizedBookingPhone2 && (
             normalizedBookingPhone2 === normalizedInput ||
             normalizedBookingPhone2.endsWith(normalizedInput) ||
             normalizedInput.endsWith(normalizedBookingPhone2)
           ));
  }) || null;
}

function getProjects() {
  data.projects = data.projects || [];
  return data.projects;
}

function getProject(id) {
  data.projects = data.projects || [];
  return data.projects.find(p => p.id === Number(id) || p.booking_id === Number(id)) || null;
}

function logActivity(projectId, user, action) {
  data.activity_logs = data.activity_logs || [];
  const id = data.activity_logs.length > 0 ? Math.max(...data.activity_logs.map(l => l.id)) + 1 : 1;
  data.activity_logs.push({
    id,
    project_id: Number(projectId),
    user,
    action,
    timestamp: getDbDate()
  });
  saveToDisk();
}

function getProjectLogs(projectId) {
  data.activity_logs = data.activity_logs || [];
  return data.activity_logs.filter(l => l.project_id === Number(projectId));
}

function createProjectFromBooking(booking) {
  data.projects = data.projects || [];
  
  let project = data.projects.find(p => p.booking_id === booking.id);
  if (project) return project;
  
  const id = data.projects.length > 0 ? Math.max(...data.projects.map(p => p.id)) + 1 : 1;
  
  const defaultPhotos = [
    { id: 1, url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600", favorited: false, categories: [], comment: "" },
    { id: 2, url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600", favorited: false, categories: [], comment: "" },
    { id: 3, url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=600", favorited: false, categories: [], comment: "" },
    { id: 4, url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=600", favorited: false, categories: [], comment: "" },
    { id: 5, url: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=600", favorited: false, categories: [], comment: "" },
    { id: 6, url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=600", favorited: false, categories: [], comment: "" },
    { id: 7, url: "https://images.unsplash.com/photo-1507504038482-76210f52b6d1?auto=format&fit=crop&q=80&w=600", favorited: false, categories: [], comment: "" },
    { id: 8, url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=600", favorited: false, categories: [], comment: "" }
  ];
  
  project = {
    id,
    booking_id: booking.id,
    couple_name: booking.customer_name,
    wedding_date: booking.event_date,
    current_step: 1, 
    timeline_steps: [
      { name: "Photos Uploaded", completed: true, updated_at: getDbDate() },
      { name: "Client Selected Photos", completed: false, updated_at: null },
      { name: "Video Editing Completed", completed: false, updated_at: null },
      { name: "Album Design Pending Approval", completed: false, updated_at: null },
      { name: "Final Delivery Completed", completed: false, updated_at: null }
    ],
    package_details: {
      photography: "Traditional + Candid (4-Camera coverage)",
      video: "Cinematic Pre-Wedding Video + Teaser Reel + Highlight Film",
      album: "One 80-Page Premium Couture Leather Layflat Album",
      edited_photos: "120 color-corrected high-res photos included",
      delivery_items: "Premium Signature bag, custom photo calendar & USB drive"
    },
    gallery_images: defaultPhotos,
    deliveries: {
      video_teaser_url: "https://www.youtube.com/embed/S9-SrdnKsMs",
      video_status: "pending", 
      album_pdf_url: "https://dreamwedstories.co.in/draft-album.pdf",
      album_status: "pending",
      final_download_url: ""
    },
    created_at: getDbDate(),
    updated_at: getDbDate()
  };
  
  data.projects.push(project);
  logActivity(id, "System", "Project Workspace created and pre-filled with photo gallery");
  saveToDisk();
  syncToSupabase('projects', project, 'POST');
  return project;
}

function getProjectByPhone(phone) {
  data.projects = data.projects || [];
  const booking = getBookingByPhone(phone);
  if (booking) {
    let project = data.projects.find(p => p.booking_id === booking.id);
    if (!project) {
      project = createProjectFromBooking(booking);
    }
    return { project, booking };
  }
  return null;
}

function updateProject(id, fields) {
  data.projects = data.projects || [];
  const project = data.projects.find(p => p.id === Number(id));
  if (project) {
    Object.assign(project, fields);
    project.updated_at = getDbDate();
    saveToDisk();
    syncToSupabase('projects', project, 'PATCH', 'id', id);
    return project;
  }
  return null;
}

function saveProjectMessage(projectId, channel, sender, text) {
  data.project_chats = data.project_chats || [];
  let chat = data.project_chats.find(c => c.project_id === Number(projectId) && c.channel === channel);
  if (!chat) {
    chat = {
      id: data.project_chats.length + 1,
      project_id: Number(projectId),
      channel,
      messages: []
    };
    data.project_chats.push(chat);
  }
  const newMsg = {
    id: chat.messages.length + 1,
    sender,
    text,
    timestamp: getDbDate()
  };
  chat.messages.push(newMsg);
  
  // Log message in activity
  const senderName = sender === "client" ? "Client" : sender.charAt(0).toUpperCase() + sender.slice(1);
  logActivity(projectId, senderName, `Sent message in channel ${channel.replace('client-', '')}`);
  
  saveToDisk();
  return chat.messages;
}

function getProjectChats(projectId, channel) {
  data.project_chats = data.project_chats || [];
  const chat = data.project_chats.find(c => c.project_id === Number(projectId) && c.channel === channel);
  return chat ? chat.messages : [];
}

// ==================== STAFF USER MANAGEMENT ====================

function getStaffUsers() {
  data.staff_users = data.staff_users || [];
  return data.staff_users;
}

function getStaffUser(username) {
  data.staff_users = data.staff_users || [];
  return data.staff_users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
}

function createStaffUser(userData) {
  data.staff_users = data.staff_users || [];
  const id = data.staff_users.length > 0 ? Math.max(...data.staff_users.map(u => u.id)) + 1 : 1;
  const user = {
    id,
    username: userData.username.trim(),
    password: userData.password.trim(),
    role: userData.role || 'editor', // 'editor' or 'designer'
    display_name: userData.display_name || userData.username,
    assigned_projects: userData.assigned_projects || [], // array of project IDs
    created_at: getDbDate()
  };
  data.staff_users.push(user);
  saveToDisk();
  return user;
}

function updateStaffUser(id, fields) {
  data.staff_users = data.staff_users || [];
  const user = data.staff_users.find(u => u.id === Number(id));
  if (user) {
    Object.assign(user, fields);
    saveToDisk();
    return user;
  }
  return null;
}

function deleteStaffUser(id) {
  data.staff_users = data.staff_users || [];
  const before = data.staff_users.length;
  data.staff_users = data.staff_users.filter(u => u.id !== Number(id));
  if (data.staff_users.length < before) {
    saveToDisk();
    return true;
  }
  return false;
}

function authenticateStaff(username, password) {
  const user = getStaffUser(username);
  if (user && user.password === password) {
    return user;
  }
  return null;
}

function getProjectAllChats(projectId) {
  data.project_chats = data.project_chats || [];
  return data.project_chats
    .filter(c => c.project_id === Number(projectId))
    .map(c => ({ channel: c.channel, messages: c.messages }));
}

module.exports = {
  initDB, getDB, saveMessage, getOrCreateCustomer,
  updateCustomer, getChatHistory, scheduleReminder,
  getPendingReminders, markReminderSent,
  getBookings, getBooking, saveBooking, updateBooking, confirmBooking, deleteBooking,
  getBookingByPhone,
  getProjects, getProject, updateProject, logActivity, getProjectLogs,
  saveProjectMessage, getProjectChats, getProjectAllChats, createProjectFromBooking, getProjectByPhone,
  getStaffUsers, getStaffUser, createStaffUser, updateStaffUser, deleteStaffUser, authenticateStaff
};
