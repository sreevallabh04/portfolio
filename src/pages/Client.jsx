import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import SplitText from '../components/SplitText';
import RazorpayCheckout from '../components/RazorpayCheckout';

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

const Client = () => {
  const [activeTab, setActiveTab] = useState('web-dev');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const addToCart = (item) => {
    setCart([...cart, { ...item, id: Date.now() }]);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
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
                onClick={() => setShowCheckout(true)}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold transition-colors duration-200"
              >
                Checkout
              </button>
            </div>
          )}
        </motion.div>
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

      {/* Razorpay Checkout */}
      {showCheckout && (
        <RazorpayCheckout
          amount={total}
          onClose={() => setShowCheckout(false)}
          cart={cart}
        />
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