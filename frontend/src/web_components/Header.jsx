
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Header = ({ userLabel = "Admin", userName = "User" }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <header className="bg-[#800000] text-white shadow-lg w-full sticky top-0 z-50">
        <div className="w-full px-4 py-3 md:px-6">
          <div className="flex items-center justify-between gap-4">
            {/* Left Section - Logo and Branding */}
            <div className="flex items-center gap-3 flex-1">
              {/* Mobile Menu Toggle */}
              <button 
                onClick={toggleMobileMenu}
                className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              {/* Logo */}
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-white overflow-hidden flex-shrink-0">
                <img 
                  src="./src/assets/logo.png" 
                  alt="Barangay Logo" 
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Branding Text */}
              <div className="hidden sm:block">
                <h1 className="text-base md:text-xl font-bold leading-tight tracking-wide uppercase">
                  Barangay Nangka
                </h1>
                <p className="text-[9px] md:text-xs font-semibold tracking-wider opacity-90 uppercase">
                  PWD Management System
                </p>
              </div>
            </div>

            {/* Right Section - User Info */}
            <div className="flex items-center gap-3 md:gap-6">
              {/* User Info */}
              <div className="text-right">
                <p className="text-xs md:text-sm font-medium">{userName}</p>
                <p className="text-[9px] md:text-xs opacity-75">{userLabel}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Dropdown for small screens */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 bg-[#6b0000] px-4 py-3">
            <div className="space-y-2 text-center">
              <p className="text-xs opacity-75 uppercase tracking-wider">Logged in as</p>
              <p className="font-semibold">{userName}</p>
              <p className="text-xs opacity-75">{userLabel}</p>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu Overlay - Close menu when clicking outside */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 top-16 z-40 bg-black/20"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Header;
