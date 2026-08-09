import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MessageSquare, CheckCircle2, CreditCard, Clock } from 'lucide-react';

const HeroSection: React.FC = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.8,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.21, 0.47, 0.32, 0.98],
      }
    },
  };

  const headlineWords = "The infrastructure of African excellence.".split(" ");

  return (
    <section className="relative min-h-[90vh] bg-[#0D1B3E] overflow-hidden flex flex-col justify-center font-['Inter',sans-serif]">
      {/* Subtle Background Pattern / Gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-gradient-to-b from-[#1B6B6B]/20 to-transparent blur-[120px] rounded-full transform -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-[#C89B2A]/10 to-transparent blur-[100px] rounded-full transform translate-y-1/3 translate-x-1/4"></div>
        {/* Optional: Add a subtle texture overlay here if needed */}
      </div>

      <div className="container mx-auto px-6 md:px-12 lg:px-24 max-w-[1280px] relative z-10 py-20">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          
          {/* Emotional Hook */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mb-8 inline-block"
          >
            <span className="text-[#C89B2A] text-sm md:text-base font-semibold tracking-wider uppercase drop-shadow-sm">
              Your institution isn't broken. It's running on infrastructure that was never built for it.
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#F9F6EF] mb-8 leading-[1.1] md:leading-[1.1] lg:leading-[1.1] font-['Playfair_Display',serif] max-w-4xl"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: { staggerChildren: 0.12, delayChildren: 0.2 }
              }
            }}
          >
            {headlineWords.map((word, index) => (
              <motion.span
                key={index}
                className="inline-block mr-[0.25em] pb-2"
                variants={{
                  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    filter: "blur(0px)",
                    transition: { duration: 1, ease: [0.21, 0.47, 0.32, 0.98] }
                  }
                }}
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            className="text-[#8A9BAB] text-lg sm:text-xl lg:text-2xl mb-12 max-w-3xl leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            One operating system for African institutions. Live in 24 hours. CBC compliant. Payments built in.
          </motion.p>

          {/* CTAs */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-5 mb-16 w-full sm:w-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <motion.button 
              className="bg-[#C89B2A] text-[#0D1B3E] px-8 py-4 rounded-md flex items-center justify-center font-semibold text-lg transition-all"
              whileHover={{ 
                scale: 1.03,
                boxShadow: "0 0 30px rgba(200, 155, 42, 0.5)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              Book a free demo
              <ArrowRight className="ml-2 w-5 h-5" />
            </motion.button>
            
            <motion.button 
              className="border-2 border-[#C89B2A] text-[#F9F6EF] px-8 py-4 rounded-md flex items-center justify-center font-medium text-lg transition-colors hover:bg-[#C89B2A]/10"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <MessageSquare className="mr-3 w-5 h-5 text-[#C89B2A]" />
              Chat with us
            </motion.button>
          </motion.div>

          {/* Stat Badges */}
          <motion.div 
            className="flex flex-wrap items-center justify-center md:justify-start gap-6 sm:gap-10 border-t border-[#1B6B6B]/40 pt-10 w-full"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-4 group cursor-default">
              <div className="w-12 h-12 rounded-full bg-[#1B6B6B]/30 flex items-center justify-center group-hover:bg-[#1B6B6B]/50 transition-colors">
                <CreditCard className="w-6 h-6 text-[#C89B2A]" />
              </div>
              <div className="text-left">
                <p className="text-[#F9F6EF] font-semibold text-lg">M-Pesa </p>
                <p className="text-[#8A9BAB] text-sm font-medium">Integrated payments</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-4 group cursor-default">
              <div className="w-12 h-12 rounded-full bg-[#1B6B6B]/30 flex items-center justify-center group-hover:bg-[#1B6B6B]/50 transition-colors">
                <Clock className="w-6 h-6 text-[#C89B2A]" />
              </div>
              <div className="text-left">
                <p className="text-[#F9F6EF] font-semibold text-lg">1 Day</p>
                <p className="text-[#8A9BAB] text-sm font-medium">Average go-live</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-4 group cursor-default">
              <div className="w-12 h-12 rounded-full bg-[#1B6B6B]/30 flex items-center justify-center group-hover:bg-[#1B6B6B]/50 transition-colors">
                <CheckCircle2 className="w-6 h-6 text-[#C89B2A]" />
              </div>
              <div className="text-left">
                <p className="text-[#F9F6EF] font-semibold text-lg">CBC Compliant</p>
                <p className="text-[#8A9BAB] text-sm font-medium">Fully certified</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Founder Quote */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 1.4, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mt-20 pt-2 max-w-2xl border-l-2 border-[#C89B2A] pl-6 hidden md:block"
          >
            <p className="text-[#8A9BAB] font-['Playfair_Display',serif] italic text-xl mb-3 tracking-wide">
              "Your institution deserves to run with clarity, calm, and pride."
            </p>
            <p className="text-[#F9F6EF] text-sm font-semibold tracking-widest uppercase opacity-80">
              — James Mbugua, Founder
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
