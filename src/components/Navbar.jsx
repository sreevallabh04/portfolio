import React from 'react';
import { Link } from 'react-router-dom'; // Assuming react-router-dom for navigation

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center px-4 py-3 backdrop-blur-sm text-white"> {/* Removed background color and opacity */}
      {/* Combined Left section: Image and Navigation Links */}
      <div className="flex items-center"> {/* This div now contains both image and links */}
        {/* Placeholder for Sreevallabh's image */}
        {/* Replace with actual image path and alt text */}
        <img src="https://storage.googleapis.com/hostinger-horizons-assets-prod/5c57ed43-384d-4353-9118-29cad8a3dc9c/d075d826c58328f5561b91f4e67e2276.png" alt="Netflix Logo" className="h-8 mr-6 object-contain" /> {/* Replaced image, removed rounded-full, adjusted object-cover to object-contain */}
        {/* Optional: Add name next to image */}
        {/* <span className="text-lg font-bold mr-6">Sreevallabh</span> */} {/* Removed name for now to match image */}

        {/* Navigation Links */}
        <div className="flex space-x-6"> {/* Links are now inside the main flex container */}
          <Link to="/" className="hover:text-red-600 transition-colors duration-200">Home</Link>
          {/* These links might need to scroll to sections on the Dashboard page */}
          <Link to="/browse/recruiter#professional" className="hover:text-red-600 transition-colors duration-200">Professional</Link>
          <Link to="/skills" className="hover:text-red-600 transition-colors duration-200">Skills</Link>
          <Link to="/browse/recruiter#projects" className="hover:text-red-600 transition-colors duration-200">Projects</Link>
          {/* Assuming "Hire Me" is a contact link or section */}
          <Link to="/contact" className="hover:text-red-600 transition-colors duration-200">Contact</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;