import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import SplitText from '../components/SplitText';

const services = {
  'web-dev': {
    title: 'Web Development',
    items: [
      { name: 'Portfolio Website', price: 499, description: 'Showcase your work in style' },
      { name: 'Business Website', price: 999, description: 'Professional business presence' },
      { name: 'Project Website', price: 799, description: 'Custom project showcase' },
    ]
  },
  'app-dev': {
    title: 'App Development',
    items: [
      { name: 'Portfolio App', price: 998, description: 'Mobile portfolio app' },
      { name: 'Business App', price: 1998, description: 'Enterprise mobile solution' },
      { name: 'Project App', price: 1598, description: 'Custom mobile app' },
    ]
  },
  'ml': {
    title: 'Machine Learning',
    items: [
      { name: 'Custom ML Model', price: 2000, description: 'AI-powered machine learning solutions' },
    ]
  },
  'ai-agents': {
    title: 'AI Agents',
    items: [
      { name: 'AI Agent', price: 5000, description: 'Intelligent automation agents' },
    ]
  }
};

const OrderForm = ({ cart, total, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    projectTitle: '',
    projectDescription: '',
    timeline: '',
    budget: total,
    additionalRequirements: '',
    preferredContact: 'email'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formDataToSend = new FormData();
    
    // Add all form fields
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });

    // Add cart details
    formDataToSend.append('services', cart.map(item => `${item.name} - ₹${item.price}`).join(', '));
    formDataToSend.append('totalAmount', `₹${total}`);
    formDataToSend.append('orderDate', new Date().toLocaleDateString());

    try {
      const response = await fetch('https://formspree.io/f/mldnlodb', {
        method: 'POST',
        body: formDataToSend,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setSubmitted(true);
        onSubmit();
      } else {
        alert('There was an error submitting your order. Please try again.');
      }
    } catch (error) {
      alert('There was an error submitting your order. Please try again.');
    }

    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-zinc-900 rounded-xl max-w-md w-full p-8 text-center border border-zinc-700"
        >
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-white mb-4">Order Submitted!</h2>
          <p className="text-gray-300 mb-6">
            Thank you for your order! I'll review your requirements and get back to you within 24 hours with a detailed proposal and timeline.
          </p>
          <p className="text-sm text-gray-400 mb-6">
            You'll receive a confirmation email shortly at {formData.email}
          </p>
          <button
            onClick={onClose}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold transition-colors duration-200"
          >
            Close
          </button>
        </motion.div>
      </div>
    );
  }

  const hasWebDev = cart.some(item => item.label === 'Websites');
  const hasAppDev = cart.some(item => item.label === 'Apps');
  const hasML = cart.some(item => item.label === 'ML Models');
  const hasAI = cart.some(item => item.label === 'AI Agents');

  return (
    <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-zinc-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-700"
      >
        <div className="p-6 border-b border-zinc-700 flex items-center justify-between sticky top-0 bg-zinc-900">
          <h2 className="text-2xl font-bold text-white">Order Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-bold text-red-500 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-semibold mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-zinc-800 text-white px-4 py-3 rounded-lg border border-zinc-700 focus:border-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-zinc-800 text-white px-4 py-3 rounded-lg border border-zinc-700 focus:border-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-800 text-white px-4 py-3 rounded-lg border border-zinc-700 focus:border-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Company/Organization</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-800 text-white px-4 py-3 rounded-lg border border-zinc-700 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Project Information */}
          <div>
            <h3 className="text-lg font-bold text-red-500 mb-4">Project Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white font-semibold mb-2">Project Title *</label>
                <input
                  type="text"
                  name="projectTitle"
                  value={formData.projectTitle}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., My Portfolio Website, E-commerce App, etc."
                  className="w-full bg-zinc-800 text-white px-4 py-3 rounded-lg border border-zinc-700 focus:border-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Project Description *</label>
                <textarea
                  name="projectDescription"
                  value={formData.projectDescription}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  placeholder="Describe your project, goals, target audience, and any specific features you need..."
                  className="w-full bg-zinc-800 text-white px-4 py-3 rounded-lg border border-zinc-700 focus:border-red-500 focus:outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-semibold mb-2">Preferred Timeline</label>
                  <select
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-800 text-white px-4 py-3 rounded-lg border border-zinc-700 focus:border-red-500 focus:outline-none"
                  >
                    <option value="">Select timeline</option>
                    <option value="asap">ASAP (Rush Order)</option>
                    <option value="1-2weeks">1-2 weeks</option>
                    <option value="2-4weeks">2-4 weeks</option>
                    <option value="1-2months">1-2 months</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Preferred Contact Method</label>
                  <select
                    name="preferredContact"
                    value={formData.preferredContact}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-800 text-white px-4 py-3 rounded-lg border border-zinc-700 focus:border-red-500 focus:outline-none"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone Call</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="video">Video Call</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Service-Specific Questions */}
          {(hasWebDev || hasAppDev) && (
            <div>
              <h3 className="text-lg font-bold text-red-500 mb-4">Development Requirements</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Do you have any design preferences or existing branding?
                  </label>
                  <textarea
                    name="designPreferences"
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Describe your design style, colors, fonts, or attach references..."
                    className="w-full bg-zinc-800 text-white px-4 py-3 rounded-lg border border-zinc-700 focus:border-red-500 focus:outline-none resize-none"
                  />
                </div>
                {hasWebDev && (
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Do you need hosting, domain, or CMS setup?
                    </label>
                    <textarea
                      name="hostingRequirements"
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="Yes/No - describe your hosting needs..."
                      className="w-full bg-zinc-800 text-white px-4 py-3 rounded-lg border border-zinc-700 focus:border-red-500 focus:outline-none resize-none"
                    />
                  </div>
                )}
                {hasAppDev && (
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Which platforms do you need? (iOS, Android, Web)
                    </label>
                    <input
                      type="text"
                      name="platforms"
                      onChange={handleInputChange}
                      placeholder="e.g., iOS and Android, Web App only, etc."
                      className="w-full bg-zinc-800 text-white px-4 py-3 rounded-lg border border-zinc-700 focus:border-red-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {(hasML || hasAI) && (
            <div>
              <h3 className="text-lg font-bold text-red-500 mb-4">AI/ML Requirements</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-semibold mb-2">
                    What type of data will the model work with?
                  </label>
                  <textarea
                    name="dataType"
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Text, images, numbers, sensor data, etc..."
                    className="w-full bg-zinc-800 text-white px-4 py-3 rounded-lg border border-zinc-700 focus:border-red-500 focus:outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">
                    What should the model predict or do?
                  </label>
                  <textarea
                    name="modelGoal"
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Classification, prediction, recommendation, automation, etc..."
                    className="w-full bg-zinc-800 text-white px-4 py-3 rounded-lg border border-zinc-700 focus:border-red-500 focus:outline-none resize-none"
                  />
                </div>
                {hasAI && (
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      What tasks should the AI agent perform?
                    </label>
                    <textarea
                      name="agentTasks"
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Customer support, data analysis, content generation, etc..."
                      className="w-full bg-zinc-800 text-white px-4 py-3 rounded-lg border border-zinc-700 focus:border-red-500 focus:outline-none resize-none"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Requirements */}
          <div>
            <h3 className="text-lg font-bold text-red-500 mb-4">Additional Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white font-semibold mb-2">Any specific requirements or questions?</label>
                <textarea
                  name="additionalRequirements"
                  value={formData.additionalRequirements}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Special features, integrations, budget constraints, or anything else you'd like me to know..."
                  className="w-full bg-zinc-800 text-white px-4 py-3 rounded-lg border border-zinc-700 focus:border-red-500 focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t border-zinc-700 pt-6">
            <h3 className="text-lg font-bold text-white mb-4">Order Summary</h3>
            <div className="bg-zinc-800 rounded-lg p-4 mb-4">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2">
                  <span className="text-white">{item.name}</span>
                  <span className="text-red-500 font-bold">₹{item.price}</span>
                </div>
              ))}
              <div className="border-t border-zinc-700 mt-4 pt-4 flex justify-between items-center">
                <span className="text-lg font-bold text-white">Total:</span>
                <span className="text-xl font-bold text-red-500">₹{total}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-4 rounded-lg font-bold text-lg transition-colors duration-200"
          >
            {isSubmitting ? 'Submitting Order...' : 'Submit Order & Get Quote'}
          </button>

          <p className="text-sm text-gray-400 text-center">
            By submitting this form, you agree to our{' '}
            <Link to="/terms" className="text-red-400 hover:underline">
              Terms & Conditions
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

const Client = () => {
  const [activeTab, setActiveTab] = useState('web-dev');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);

  const addToCart = (item) => {
    setCart([...cart, { ...item, id: Date.now() }]);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const handleOrderSubmit = () => {
    setCart([]);
    setShowOrderForm(false);
    setShowCart(false);
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-black to-red-900 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <SplitText
            text="Your Digital Vision, My Expertise"
            className="text-4xl md:text-6xl font-bold text-white mb-6"
            delay={50}
            duration={0.5}
            ease="power3.out"
            splitType="words"
            from={{ opacity: 0, y: 30 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            textAlign="center"
          />
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Professional web development, mobile apps, ML models, and AI agents. Choose your service and let's build something amazing.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-2 p-4">
            {Object.entries(services).map(([key, service]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === key
                    ? 'bg-red-600 text-white'
                    : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                }`}
              >
                {service.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Services Content */}
      <div className="max-w-6xl mx-auto py-12 px-4">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-red-500">
            {services[activeTab].title}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services[activeTab].items.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 hover:border-red-600 transition-all duration-300"
              >
                <h3 className="text-xl font-bold text-white mb-3">{item.name}</h3>
                <p className="text-gray-400 mb-4">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-red-500">₹{item.price}</span>
                  <button
                    onClick={() => addToCart(item)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
                  >
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          className="fixed top-0 right-0 h-full w-80 bg-zinc-950 border-l border-zinc-800 z-50 p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Your Cart</h3>
            <button
              onClick={() => setShowCart(false)}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-gray-400 text-center">Your cart is empty</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="bg-zinc-900 rounded-lg p-4 mb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white">{item.name}</h4>
                      <p className="text-gray-400 text-sm">₹{item.price}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-400 text-xl"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {cart.length > 0 && (
            <div className="border-t border-zinc-800 pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-xl font-bold text-red-500">₹{total}</span>
              </div>
              <button
                onClick={() => setShowOrderForm(true)}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold transition-colors duration-200"
              >
                Proceed to Order
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Order Form */}
      {showOrderForm && (
        <OrderForm
          cart={cart}
          total={total}
          onClose={() => setShowOrderForm(false)}
          onSubmit={handleOrderSubmit}
        />
      )}

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg z-40 transition-all duration-200"
        >
          🛒
          <span className="absolute -top-2 -right-2 bg-white text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
            {cart.length}
          </span>
        </button>
      )}

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-800 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h3 className="text-xl font-bold text-red-500 mb-2">Sreevallabh Kakarala</h3>
              <p className="text-gray-400">Professional Digital Services</p>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <Link
                to="/terms"
                className="text-gray-400 hover:text-white transition-colors duration-200 underline"
              >
                Terms & Conditions
              </Link>
              <p className="text-gray-500 text-sm">© 2024 All rights reserved</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Client; 