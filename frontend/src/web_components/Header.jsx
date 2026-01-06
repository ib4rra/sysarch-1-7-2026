
import React from 'react';
import { Menu } from 'lucide-react';

const Header = ({ userLabel = "Admin" }) => {
  return (
    <header className="bg-[#800000] text-white p-3 shadow-md w-full sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Menu className="md:hidden cursor-pointer" />
          {/* Logo */}
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 overflow-hidden shrink-0">
            <img 
              src="./src/assets/logo.png" 
              alt="Barangay Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg md:text-2xl font-bold leading-none tracking-wide font-montserrat uppercase">
              Barangay Nangka
            </h1>
            <p className="text-[10px] md:text-xs font-semibold tracking-wider opacity-90 uppercase">
              Marikina City
            </p>
          </div>
        </div>
        
        {userLabel && (
          <div className="text-sm md:text-lg font-medium opacity-90">
            {userLabel}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
