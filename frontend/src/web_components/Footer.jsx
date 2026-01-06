import React from "react";

function Footer() {
  return (
    <footer className="bg-[#eaf2ff] text-[#0C274A]">
      {/* 🔹 Top Section */}
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#cfd8ea]">
        
        {/* Left: Brand + Description */}
        <div className="max-w-md mb-6 md:mb-0 text-left">
          <h2 className="text-lg font-semibold text-gray-900">Virtulab</h2>
          <p className="text-gray-600 text-sm mt-2 leading-relaxed">
            Inspiring the next generation of Filipino innovators with hands-on
            learning, real-world mentors, and a playful approach to coding.
          </p>
        </div>

        {/* Right: Navigation Links */}
        <div className="flex flex-wrap gap-6 text-sm font-medium text-[#2b4b83] justify-center md:justify-end">
          <a href="#" className="hover:text-[#4FA9E2] transition">Activities</a>
          <a href="#" className="hover:text-[#4FA9E2] transition">Sign in</a>
          <a href="#" className="hover:text-[#4FA9E2] transition">Contact</a>
        </div>
      </div>

      {/* 🔹 Bottom Section */}
      <div className="text-center text-gray-500 text-sm py-4">
        © 2025 <span className="font-medium text-[#0C274A]">Virtulab</span>. Crafted with love in the Philippines.
      </div>
    </footer>
  );
}

export default Footer;
