import React, { useEffect } from 'react';

const RAZORPAY_KEY = 'rzp_test_YourKeyHere'; // Replace with your real Razorpay key

const RazorpayCheckout = ({ amount, onClose, cart }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      const options = {
        key: RAZORPAY_KEY,
        amount: amount * 100, // in paise
        currency: 'INR',
        name: 'Sreevallabh Kakarala',
        description: 'Netflix-Themed Services',
        image: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
        handler: function (response) {
          alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
          onClose();
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        notes: {
          services: cart.map(item => item.name).join(', '),
        },
        theme: {
          color: '#e50914',
        },
        modal: {
          ondismiss: function () {
            onClose();
          },
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [amount, onClose, cart]);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
      <div className="bg-zinc-900 p-8 rounded-xl shadow-2xl text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Processing Payment...</h2>
        <p className="mb-4">Please complete the payment in the Razorpay popup.</p>
        <button
          className="mt-2 bg-[#e50914] text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition-all"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RazorpayCheckout; 