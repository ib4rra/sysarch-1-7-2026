
import React, { useState } from 'react';
import { Mail, CheckCircle, X } from 'lucide-react';

const ForgotPasswordView = ({ onBack }) => {
  const [step, setStep] = useState('input');
  const [email, setEmail] = useState('');

  const handleSendOTP = (e) => {
    e.preventDefault();
    setStep('sent');
  };

  if (step === 'input') {
    return (
      <div className="w-full max-w-[400px] bg-[#3a0606] rounded-2xl p-8 border-2 border-[#5a0a0a] shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-white text-2xl font-bold uppercase tracking-wide leading-tight font-montserrat">
            Reset Accounts<br />Password
          </h2>
          <div className="w-full h-[1px] bg-gray-500/50 mt-4"></div>
        </div>

        <form onSubmit={handleSendOTP} className="space-y-6">
          <div className="relative">
            <input
              type="email"
              placeholder="Email"
              className="w-full bg-white px-4 py-2 rounded-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-b from-gray-100 to-gray-300 text-gray-800 font-bold py-2 rounded-lg border border-gray-400 shadow-md hover:from-white transition-all"
          >
            Send an OTP
          </button>
        </form>

        <div className="mt-8 text-center">
          <div className="w-full h-[1px] bg-gray-500/50 mb-4"></div>
          <button onClick={onBack} className="text-white text-sm hover:underline">
            Already have an account?
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-10 max-w-md w-full relative shadow-2xl">
        <button onClick={onBack} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center">
          {step === 'sent' ? (
            <>
              <div className="w-24 h-24 mb-6 text-gray-800">
                <Mail size={96} strokeWidth={1.5} />
              </div>
              <p className="text-gray-700 text-lg leading-relaxed mb-8">
                Please check the email address associated with the username <span className="font-bold text-red-700">"juswa"</span> for instructions to reset your password!
              </p>
              <div className="w-full h-[1px] bg-gray-200 mb-6"></div>
              <button 
                onClick={() => setStep('success')}
                className="text-gray-600 text-sm"
              >
                Didn't receive an email? <span className="text-blue-500 hover:underline">Resend Email</span>
              </button>
            </>
          ) : (
            <>
              <div className="w-24 h-24 mb-6 text-green-500">
                <CheckCircle size={96} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-8">Password Changed Successfully!</h3>
              <div className="w-full h-[1px] bg-gray-200 mb-8"></div>
              <button
                onClick={onBack}
                className="w-full bg-gradient-to-b from-gray-100 to-gray-300 text-gray-800 font-bold py-2 rounded-lg border border-gray-400 shadow-md hover:from-white transition-all"
              >
                Return to Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordView;
