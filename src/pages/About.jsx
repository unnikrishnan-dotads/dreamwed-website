import React from 'react';
import { motion } from 'framer-motion';
import SectionHeader from '../components/ui/SectionHeader';
import Button from '../components/ui/Button';
import SEO from '../components/SEO';

const About = () => {
  const ABOUT_IMAGE = "https://images.unsplash.com/photo-1510076857177-744361488957?auto=format&fit=crop&q=80&w=1000";

  return (
    <div className="pt-24">
      <SEO 
        title="About Us"
        description="Learn more about Dreamwed Stories, our team, legacy, and artistic philosophy. Based in Trivandrum, Kerala, we blend unscripted emotion with fine-art cinematic wedding photography."
      />
      <section className="bg-white">
        <div className="container">
          <SectionHeader 
            subtitle="Our Heartbeat" 
            title="Introduction to Dreamwed Stories" 
          />
          
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="rounded-3xl overflow-hidden shadow-2xl"
            >
              <img src={ABOUT_IMAGE} alt="Founder" className="w-full h-full object-cover" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-serif mb-6 text-[var(--color-text-main)]">A Legacy of Love Captured</h3>
              <p className="text-[var(--color-text-muted)] text-lg mb-6 leading-relaxed">
                Dreamwed Stories was born out of a simple realization: that weddings are the most beautiful tapestries of human emotion. Founded by a group of artists and storytellers, we set out to change how these moments are preserved.
              </p>
              <p className="text-[var(--color-text-muted)] text-lg mb-8 leading-relaxed">
                Our mission is to blend artistic creativity with pure, unadulterated emotion. We don't just point a camera; we look for the stories between the frames—the handshake that lingers, the proud tear of a mother, and the quiet whisper between a couple.
              </p>
              
              <div className="bg-[var(--color-bg-light)] p-8 rounded-2xl border-l-4 border-[var(--color-primary)]">
                <p className="font-serif italic text-xl text-[var(--color-text-main)] mb-2">
                  "We don't capture how it looks, we capture how it feels."
                </p>
                <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-primary)]">- Founding Principle</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-[var(--color-bg-light)]">
        <div className="container text-center">
          <SectionHeader subtitle="What Drives Us" title="Our Core Mission" />
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { title: "Authenticity", desc: "We celebrate the real, the raw, and the unscripted. No forced poses, just your true story." },
              { title: "Legacy", desc: "We craft stories that will be cherished not just tomorrow, but for generations to come." },
              { title: "Elegance", desc: "A minimalist approach that lets the natural beauty of your love take center stage." }
            ].map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 bg-white rounded-3xl shadow-sm border border-gray-100"
              >
                <h4 className="text-2xl font-serif mb-4 text-[var(--color-primary)]">{v.title}</h4>
                <p className="text-[var(--color-text-muted)] leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="bg-white py-32">
        <div className="container text-center">
          <h2 className="text-[42px] md:text-[64px] font-normal tracking-tight mb-8">Ready to tell your story?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Button to="/services" variant="primary">Explore Services</Button>
            <Button to="/contact" variant="outline">Say Hello</Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
