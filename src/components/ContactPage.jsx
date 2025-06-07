import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Linkedin, Github, MapPin, Phone } from 'lucide-react';
import { useForm, ValidationError } from '@formspree/react';

const ContactPage = () => {
  const [state, handleSubmit] = useForm("mvgrzwle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactInfo = {
    email: "srivallabhkakarala@gmail.com",
    linkedin: "linkedin.com/in/sreevallabh-kakarala-52ab8a248/",
    github: "github.com/sreevallabh04",
    location: "Chennai, India",
    phone: "+91 9381704258" // Replace with your actual phone number
  };

  const onSubmit = async (e) => {
    setIsSubmitting(true);
    await handleSubmit(e);
    setIsSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black text-white"
    >
      {/* Hero Banner */}
      <div className="relative h-[30vh] sm:h-[40vh] md:h-[50vh] w-full bg-gradient-to-r from-red-900 to-black flex items-center justify-center">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white drop-shadow-lg text-center px-2">
          Get in Touch
        </h1>
      </div>

      {/* Contact Content */}
      <div className="px-2 sm:px-[4%] py-8 sm:py-12 max-w-full sm:max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Contact Information */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-4 sm:space-y-6"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Contact Information</h2>
            
            <div className="space-y-4">
              <a
                href={`mailto:${contactInfo.email}`}
                className="flex items-center space-x-4 p-4 bg-[#181818] rounded-lg hover:bg-[#252525] transition-colors duration-200"
              >
                <Mail className="w-6 h-6 text-red-600" />
                <span>{contactInfo.email}</span>
              </a>

              <a
                href={`https://${contactInfo.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-4 p-4 bg-[#181818] rounded-lg hover:bg-[#252525] transition-colors duration-200"
              >
                <Linkedin className="w-6 h-6 text-red-600" />
                <span>LinkedIn Profile</span>
              </a>

              <a
                href={`https://${contactInfo.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-4 p-4 bg-[#181818] rounded-lg hover:bg-[#252525] transition-colors duration-200"
              >
                <Github className="w-6 h-6 text-red-600" />
                <span>GitHub Profile</span>
              </a>

              <div className="flex items-center space-x-4 p-4 bg-[#181818] rounded-lg">
                <MapPin className="w-6 h-6 text-red-600" />
                <span>{contactInfo.location}</span>
              </div>

              <a
                href={`tel:${contactInfo.phone}`}
                className="flex items-center space-x-4 p-4 bg-[#181818] rounded-lg hover:bg-[#252525] transition-colors duration-200"
              >
                <Phone className="w-6 h-6 text-red-600" />
                <span>{contactInfo.phone}</span>
              </a>
            </div>
          </motion.div>

          {/* Anonymous Message Form */}
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4 sm:space-y-6"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Send an Anonymous Message</h2>
            
            {state.succeeded ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-[#181818] rounded-lg text-center"
              >
                <p className="text-xl text-white mb-2">🎉 Thanks for your anonymous message!</p>
                <p className="text-sm text-gray-400">I'll get back to you soon.</p>
              </motion.div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <textarea
                    name="message"
                    placeholder="Your anonymous message..."
                    rows="6"
                    required
                    className="w-full p-4 bg-[#181818] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 resize-none text-white placeholder-gray-400"
                  />
                  <ValidationError 
                    prefix="Message" 
                    field="message"
                    errors={state.errors}
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 bg-red-600 text-white font-semibold rounded-lg transition-all duration-200 ${
                    isSubmitting 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-red-700 hover:scale-[1.02]'
                  }`}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ContactPage; 