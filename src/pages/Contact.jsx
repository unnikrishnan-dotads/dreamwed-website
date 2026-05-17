import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Globe, Send, Heart, Loader2, X } from 'lucide-react';
import { FaInstagram, FaFacebook } from 'react-icons/fa6';
import SectionHeader from '../components/ui/SectionHeader';
import Button from '../components/ui/Button';
import SEO from '../components/SEO';

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzy15y5t2F5uM9NiYPimHvlS6xDw2N1Z5oTHF3SQnR6AI_fxo6y6mhIepsUj-kav31g/exec";

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', date: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    try {
      // Create form data for submission
      const form = new FormData();
      form.append('name', formData.name);
      form.append('email', formData.email);
      form.append('phone', formData.phone);
      form.append('date', formData.date);
      form.append('message', formData.message);
      form.append('timestamp', new Date().toLocaleString());

      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: form,
        mode: 'no-cors' // Google Apps Script requires no-cors for simple POST
      });

      // Since we use no-cors, we won't get a proper response object
      // but if the fetch doesn't throw, it's usually successful
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', date: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error("Submission error:", error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <div className="pt-24 bg-white">
      <SEO 
        title="Contact Us"
        description="Get in touch with Dreamwed Stories today to book a professional wedding shoot, cinematic film consultation, or pre-wedding session in Trivandrum, Kerala. View pricing and options."
      />
      <section className="py-24">
        <div className="container">
          <SectionHeader 
            title="Wedding Photography in Trivandrum, Kerala" 
            description="Candid, Traditional & Cinematic Wedding Shoots in Trivandrum, Kerala. Capturing timeless love stories with elegance and creativity."
          />
          
          <div className="grid lg:grid-cols-2 gap-20">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <h3 className="text-[32px] md:text-[42px] tracking-[-0.04em] font-normal mb-8">Contact Details</h3>
              
              <div className="space-y-10 mb-12">
                <div className="flex items-start gap-6">
                  <div className="p-5 bg-[#f9f9f7] rounded-3xl text-black shadow-sm">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[12px] uppercase tracking-[0.2em] text-[#8a9289] mb-1">Email Us</h4>
                    <a href="mailto:dreamwedweddingstories@gmail.com" className="text-[18px] md:text-[20px] text-black font-light hover:text-[#5d665f] transition-colors">
                      dreamwedweddingstories@gmail.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-6">
                  <div className="p-5 bg-[#f9f9f7] rounded-3xl text-black shadow-sm">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[12px] uppercase tracking-[0.2em] text-[#8a9289] mb-1">Call Us</h4>
                    <a href="tel:+919995412955" className="text-[18px] md:text-[20px] text-black font-light numbers-pro hover:text-[#5d665f] transition-colors">
                      +91 99954 12955
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-6">
                  <div className="p-5 bg-[#f9f9f7] rounded-3xl text-black shadow-sm">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[12px] uppercase tracking-[0.2em] text-[#8a9289] mb-1">Studio Location</h4>
                    <p className="text-[18px] md:text-[20px] text-black font-light">Kazhakkoottam, Trivandrum, Kerala</p>
                  </div>
                </div>
              </div>
              
              <div className="p-12 bg-[#f9f9f7] rounded-[40px] border border-zinc-100 shadow-sm">
                <h4 className="text-[24px] md:text-[28px] tracking-tight font-normal mb-8 flex items-center gap-3">
                  Follow the Journey <Heart className="text-black fill-black" size={20} />
                </h4>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    href="https://www.instagram.com/dreamwed_stories.co?igsh=MWxuOXZkcHZ2cWgwdw==" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    variant="outline" 
                    className="flex items-center gap-2 px-8"
                  >
                    <FaInstagram size={18} /> Instagram
                  </Button>
                  <Button 
                    href="https://www.facebook.com/dreamwedweddingphotography/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    variant="outline" 
                    className="flex items-center gap-2 px-8"
                  >
                    <FaFacebook size={18} /> Facebook
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#f9f9f7] p-12 md:p-16 rounded-[40px] shadow-sm relative overflow-hidden"
            >
              {status === 'success' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-[#f9f9f7] z-20"
                >
                  <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-8 shadow-sm">
                    <Send size={32} />
                  </div>
                  <h3 className="text-[32px] md:text-[42px] tracking-tight font-normal mb-4 text-balance">Message Sent!</h3>
                  <p className="text-[#66706a] text-[18px] font-light">Thank you for reaching out. We've added your request to our records and will be in touch shortly.</p>
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-[#f9f9f7] z-20"
                >
                  <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-8 shadow-sm">
                    <X size={32} />
                  </div>
                  <h3 className="text-[32px] md:text-[42px] tracking-tight font-normal mb-4 text-balance">Submission Error</h3>
                  <p className="text-[#66706a] text-[18px] font-light">Something went wrong while saving your data. Please try again or call us directly.</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className={`space-y-8 transition-opacity duration-300 ${status === 'loading' ? 'opacity-50 pointer-events-none' : ''}`}>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.25em] text-[#8a9289] mb-3 ml-2">Your Name</label>
                  <input 
                    name="name"
                    required
                    className="w-full px-8 py-5 rounded-[20px] bg-white border border-zinc-100 focus:border-black outline-none transition-all text-[17px] font-light shadow-sm"
                    placeholder="E.g. Sarah & Leo"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.25em] text-[#8a9289] mb-3 ml-2">Email Address</label>
                  <input 
                    name="email"
                    type="email"
                    required
                    className="w-full px-8 py-5 rounded-[20px] bg-white border border-zinc-100 focus:border-black outline-none transition-all text-[17px] font-light shadow-sm"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.25em] text-[#8a9289] mb-3 ml-2">Phone Number</label>
                  <input 
                    name="phone"
                    type="tel"
                    required
                    className="w-full px-8 py-5 rounded-[20px] bg-white border border-zinc-100 focus:border-black outline-none transition-all text-[17px] font-light shadow-sm numbers-pro"
                    placeholder="+91 00000 00000"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.25em] text-[#8a9289] mb-3 ml-2">Wedding Date (Approx)</label>
                  <input 
                    name="date"
                    type="text"
                    className="w-full px-8 py-5 rounded-[20px] bg-white border border-zinc-100 focus:border-black outline-none transition-all text-[17px] font-light shadow-sm numbers-pro"
                    placeholder="Spring 2027"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.25em] text-[#8a9289] mb-3 ml-2">Tell Us Your Vision</label>
                  <textarea 
                    name="message"
                    rows="4"
                    required
                    className="w-full px-8 py-5 rounded-[20px] bg-white border border-zinc-100 focus:border-black outline-none transition-all resize-none text-[17px] font-light shadow-sm"
                    placeholder="Share a little bit about your wedding style and what's important to you..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-full py-6 text-[18px] flex items-center justify-center gap-3 shadow-xl rounded-full bg-black hover:bg-zinc-900 transition-all duration-500"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? (
                    <>Sending... <Loader2 className="animate-spin" size={20} /></>
                  ) : (
                    <>Book A Free Consultation <Send size={20} /></>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Embed Section */}
      <section className="h-[500px] bg-gray-50 grayscale hover:grayscale-0 transition-all duration-1000 border-t border-zinc-100">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3945.3941589333!2d76.877862!3d8.563065!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b05be3d00000001%3A0xe76472485e921508!2sKazhakkoottam%2C%20Thiruvananthapuram%2C%20Kerala!5e0!3m2!1sen!2s!4v1715424567890!5m2!1sen!2s" 
          width="100%" 
          height="100%" 
          style={{ border:0 }} 
          allowFullScreen="" 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </section>
    </div>
  );
};

export default Contact;
