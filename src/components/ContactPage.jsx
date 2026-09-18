import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Linkedin, Github, MapPin, Phone } from 'lucide-react';
import { useForm, ValidationError } from '@formspree/react';
import { CONTACT } from '@/data/portfolio';

const ContactPage = () => {
  const [state, handleSubmit] = useForm('mvgrzwle');

  // Formspree already exposes `state.submitting`. The component used to keep a
  // second `isSubmitting` flag around the same call, which could disagree with
  // it (and left the button enabled if handleSubmit threw).
  const isSubmitting = state.submitting;

  const contactInfo = {
    email: CONTACT.email,
    linkedin: CONTACT.linkedin,
    github: CONTACT.github,
    location: CONTACT.location,
    phone: CONTACT.phone,
  };

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="page-fade min-h-screen bg-black text-white"
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
          {/* Contact Information.
              These two columns used to slide in from x: -30 / +30. On a phone
              the right-hand column started 30px past the container edge, which
              gave the whole page a horizontal scrollbar while the animation
              ran. The CSS entrance moves vertically only. */}
          <div className="rise-in min-w-0 space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Contact Information</h2>
            
            <div className="space-y-4">
              <a
                href={`mailto:${contactInfo.email}`}
                className="flex items-center space-x-4 responsive-padding-sm bg-[#181818] rounded-lg hover:bg-[#252525] transition-colors duration-200 touch-feedback hover-lift"
              >
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0" />
                <span className="text-sm sm:text-base break-all">{contactInfo.email}</span>
              </a>

              <a
                href={contactInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-4 responsive-padding-sm bg-[#181818] rounded-lg hover:bg-[#252525] transition-colors duration-200 touch-feedback hover-lift"
              >
                <Linkedin className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0" />
                <span className="text-sm sm:text-base">LinkedIn Profile</span>
              </a>

              <a
                href={contactInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-4 responsive-padding-sm bg-[#181818] rounded-lg hover:bg-[#252525] transition-colors duration-200 touch-feedback hover-lift"
              >
                <Github className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0" />
                <span className="text-sm sm:text-base">GitHub Profile</span>
              </a>

              <div className="flex items-center space-x-4 responsive-padding-sm bg-[#181818] rounded-lg">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0" />
                <span className="text-sm sm:text-base">{contactInfo.location}</span>
              </div>

              <a
                href={`tel:${contactInfo.phone}`}
                className="flex items-center space-x-4 responsive-padding-sm bg-[#181818] rounded-lg hover:bg-[#252525] transition-colors duration-200 touch-feedback hover-lift"
              >
                <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0" />
                <span className="text-sm sm:text-base">{contactInfo.phone}</span>
              </a>
            </div>
          </div>

          {/* Anonymous Message Form */}
          <div
            className="rise-in min-w-0 space-y-4 sm:space-y-6"
            style={{ animationDelay: '0.12s' }}
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
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <textarea
                    name="message"
                    placeholder="Your anonymous message..."
                    rows="6"
                    required
                    className="w-full responsive-padding-sm bg-[#181818] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 resize-none text-white placeholder-gray-400 mobile-input"
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
                  className={`mobile-button w-full bg-red-600 text-white font-semibold rounded-lg transition-all duration-200 touch-feedback ${
                    isSubmitting 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-red-700 hover:scale-[1.02]'
                  }`}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ContactPage; 