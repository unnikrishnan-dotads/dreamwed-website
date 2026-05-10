import React from "react";
import { motion } from "framer-motion";
import { Photos } from "../components/Photos";
import portrait1 from "../assets/images/portrait1.png";
import portrait2 from "../assets/images/portrait2.png";
import portrait3 from "../assets/images/portrait3.png";
import portrait4 from "../assets/images/portrait4.png";
import {
  Heart,
  Camera,
  Video,
  Image as ImageIcon,
  Star,
  Play,
} from "lucide-react";
import Button from "../components/Button";
import { FaArrowRight } from "react-icons/fa6";
import SectionHeader from "../components/SectionHeader";

const Home = () => {
  const COUPLE_IMAGE_URL =
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1470";

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center p-0 bg-white">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat">
          <div className="absolute inset-0" />
        </div>

        <div className="container relative z-10 text-center text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <h1 className="font-poppins text-8xl text-black font-medium leading-none tracking-tight">
              {"Wedding".split(" ").map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {word}{" "}
                </motion.span>
              ))}{" "}
            </h1>
            <h1 className="font-poppins text-8xl text-black font-medium leading-none tracking-tight">
              {" Photography in Trivandrum, Kerala"
                .split(" ")
                .map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {word}{" "}
                  </motion.span>
                ))}{" "}
            </h1>
            <p className="text-xl mt-6 mb-12 text-gray-700 max-w-2xl mx-auto">
              Candid, Traditional & Cinematic Wedding Shoots in Trivandrum,
              Kerala. Capturing timeless love stories with elegance and
              creativity.
            </p>
            <Button className="!px-12 !py-4 text-lg bg-black hover:bg-green-600">
              <div className="flex items-center gap-2">
                Book A Free Consultation
                <FaArrowRight className="ml-2" />
              </div>
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center p-2">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1 h-2 bg-white rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Intro / About Preview */}

      <div className="flex justify-around w-full transition-all duration-300">
        <Photos image={portrait1} />
        <Photos image={portrait2} />
        <Photos image={portrait3} />
        <Photos image={portrait4} />
      </div>

      <div className="w-full flex justify-center items-center py-32 px-36 bg-transparent">
        <h2
          className="
    max-w-8xl
    text-center
    font-poppins
    text-[#5f6963]
    font-light
    leading-[0.95]
    tracking-[-3px]
    text-l
    sm:text-6xl
    md:text-7xl
    pb-0
    lg:text-[88px]
    "
        >
          Wedding photography in Trivandrum with candid, traditional & cinematic
          styles. Book professional wedding shoots in Kerala today.
        </h2>
      </div>
      <div className="w-full flex justify-center items-center py-32 px-36 pt-0 bg-transparent">
        <Button className="!px-12 !py-4 text-lg bg-black hover:bg-green-600">
              <div className="flex items-center gap-2">
                <h1 className="inline-block animate-bounce">Learn More</h1>
                <FaArrowRight className="ml-2" />
                
              </div>
      </Button>
      </div>
      

      <section className="bg-white">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h1>Book Wedding Photography in  
                  Trivandrum for  
                  Your Big Day</h1>
              <p className="text-[var(--color-text-muted)] text-lg mb-8 leading-relaxed">
                Our expert team offers professional wedding photography in Trivandrum,
                 capturing every emotion from pre-wedding shoots to cinematic wedding films.
                  Using premium gear and creative storytelling, we preserve your most cherished
                   moments with elegance and authenticity.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src={COUPLE_IMAGE_URL}
                  alt="Happy Wedding Couple"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 w-48 h-48 glass rounded-2xl p-6 hidden lg:block border border-[var(--color-primary)]/20">
                <p className="text-3xl font-serif text-[var(--color-text-main)] mb-2">
                  10+
                </p>
                <p className="text-sm font-medium uppercase tracking-wider text-[var(--color-primary)]">
                  Years of Stories
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gallery Preview Section */}
      <section className="bg-[var(--color-bg-light)]">
        <div className="container text-center">
          <SectionHeader
            subtitle="Work Highlights"
            title="Moments We've Preserved"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative h-[400px] overflow-hidden rounded-xl bg-gray-200"
              >
                <img
                  src={`https://images.unsplash.com/photo-${1519225421980 + idx}-e58a7d54d55d?auto=format&fit=crop&q=80&w=800`}
                  alt={`Highlight ${idx}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Heart className="text-white fill-white scale-150" />
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-16">
            <Button variant="outline">View Full Gallery</Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white">
        <div className="container">
          <SectionHeader subtitle="Kind Words" title="What Our Couples Say" />

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah & Leo",
                text: "The team didn't just take photos; they captured the exact feeling of our day. Looking through our album is like reliving the wedding over and over.",
              },
              {
                name: "Maya & James",
                text: "Professional, invisible when they needed to be, and incredibly talented. The video they created moves us to tears every single time we watch it.",
              },
              {
                name: "Elena & David",
                text: "We wanted a minimalist aesthetic and they delivered beyond our expectations. Every shot is a work of art and perfectly reflects our style.",
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="p-10 glass rounded-2xl border border-[var(--color-primary)]/10 text-center"
              >
                <div className="flex justify-center gap-1 mb-6 text-[var(--color-accent)]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-[var(--color-text-muted)] italic mb-8 ">{`"${t.text}"`}</p>
                <h4 className="font-serif text-xl text-[var(--color-text-main)]">
                  — {t.name}
                </h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[var(--color-primary)] py-20">
        <div className="container text-center text-white">
          <h2 className="text-4xl md:text-6xl font-serif mb-8">
            Ready to tell your story?
          </h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto opacity-90">
            Let’s craft a timeless memory of your love. Currently booking for
            2026/2027 weddings.
          </p>
          <Button
            variant="secondary"
            className="!bg-white !text-[var(--color-primary)] !border-white !px-12"
          >
            Book a Consultation
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
