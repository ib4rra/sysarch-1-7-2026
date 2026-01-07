
import React, { useState } from 'react';
import { User, Lock } from 'lucide-react';

const LoginForm = ({ onLogin, onForgotPassword }) => {
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(idNumber, password);
  };

  return (
    <div className="w-full max-w-[400px] bg-[#3a0606] rounded-2xl p-8 border-2 border-[#5a0a0a] shadow-2xl">
      <div className="text-center mb-6">
        <h2 className="text-white text-2xl font-bold uppercase tracking-wide leading-tight font-montserrat">
          Barangay Nangka<br />PWD Management
        </h2>
        <div className="w-full h-[1px] bg-gray-500/50 mt-4"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <input
            type="text"
            placeholder="ID Number"
            className="w-full bg-white px-4 py-2 pr-10 rounded-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800"
            style={{ color: 'rgb(31, 41, 55)' }}
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            required
          />
          <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        <div className="relative">
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-white px-4 py-2 pr-10 rounded-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800"
            style={{ color: 'rgb(31, 41, 55)' }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-b from-gray-100 to-gray-300 text-gray-800 font-bold py-2 rounded-lg border border-gray-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] hover:from-white hover:to-gray-200 transition-all active:scale-[0.98]"
        >
          Sign In
        </button>
      </form>

      <div className="mt-8 text-center">
        <div className="w-full h-[1px] bg-gray-500/50 mb-4"></div>
        <button 
          className="text-white text-sm hover:underline tracking-wide"
          onClick={onForgotPassword}
        >
          Forgot Password ?
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
