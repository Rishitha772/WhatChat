import React, { useState } from 'react';
import { MessageSquare, Sparkles, Smartphone, ShieldCheck, ArrowRight, Check } from 'lucide-react';
import { useWhatChat } from '../../context/WhatChatContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, loginWithPhone, verifyOtp, completeProfile } = useWhatChat();

  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('98765 43210');
  const [otp, setOtp] = useState('');
  const [displayName, setDisplayName] = useState('Rishitha Khandesh');
  const [username, setUsername] = useState('rishitha_k');
  const [about, setAbout] = useState('Living in the moment & collecting memories in My Space ✨');
  const [selectedAvatar, setSelectedAvatar] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;
    setIsLoading(true);
    setErrorMsg('');

    await loginWithPhone(phoneNumber.trim(), countryCode);
    setIsLoading(false);
    setStep('otp');
    setOtp('749216'); // Pre-populate for easy testing
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      setErrorMsg('Please enter a 6-digit verification code.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');

    const success = await verifyOtp(otp);
    setIsLoading(false);
    if (success) {
      setStep('profile');
    } else {
      setErrorMsg('Invalid code. Please try again.');
    }
  };

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    completeProfile(displayName.trim(), username.trim(), about.trim(), selectedAvatar);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#EAE5F1] overflow-hidden">
        {/* Top Brand Banner */}
        <div className="bg-[#E9DDFB] p-6 text-center border-b border-[#D9C7F7]">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-xs mx-auto flex items-center justify-center text-[#8064B5] mb-3">
            <MessageSquare className="w-7 h-7 stroke-[2.2] fill-[#E9DDFB]" />
          </div>
          <h2 className="text-xl font-bold text-[#292333]">WhatChat</h2>
          <p className="text-xs text-[#777181] mt-0.5">Your Chats. Your Memories.</p>
        </div>

        <div className="p-6">
          {/* STEP 1: Phone Entry */}
          {step === 'phone' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="text-center space-y-1 mb-4">
                <h3 className="text-sm font-bold text-[#292333]">Phone Authentication</h3>
                <p className="text-xs text-[#777181]">
                  Enter your phone number to receive a secure SMS verification code.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#292333] block">Mobile Number</label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="bg-[#F8F5FC] border border-[#EAE5F1] rounded-xl px-2.5 py-2 text-xs text-[#292333] focus:outline-hidden"
                  >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+65">🇸🇬 +65</option>
                    <option value="+61">🇦🇺 +61</option>
                  </select>

                  <input
                    type="tel"
                    placeholder="98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1 bg-[#F8F5FC] border border-[#EAE5F1] rounded-xl px-3 py-2 text-xs text-[#292333] font-mono focus:outline-hidden focus:border-[#B99AEF]"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F5FC] border border-[#EAE5F1] flex items-center gap-2 text-[11px] text-[#777181]">
                <ShieldCheck className="w-4 h-4 text-[#5EAA85] shrink-0" />
                <span>Your phone number is encrypted and never revealed publicly.</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-[#E9DDFB] hover:bg-[#D9C7F7] text-[#8064B5] text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <span>{isLoading ? 'Sending SMS...' : 'Next: Get Verification Code'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: OTP Verification */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center space-y-1 mb-4">
                <h3 className="text-sm font-bold text-[#292333]">Verify Phone Number</h3>
                <p className="text-xs text-[#777181]">
                  Sent 6-digit code to <strong className="text-[#292333]">{countryCode} {phoneNumber}</strong>
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-[#292333] block mb-1">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="749216"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-widest font-mono text-lg font-bold bg-[#F8F5FC] border border-[#EAE5F1] rounded-xl py-2 text-[#292333] focus:outline-hidden focus:border-[#B99AEF]"
                  autoFocus
                />
              </div>

              {errorMsg && <p className="text-xs text-rose-500 text-center">{errorMsg}</p>}

              <div className="flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-[#777181] hover:underline"
                >
                  Change Number
                </button>
                <button
                  type="button"
                  onClick={() => setOtp('749216')}
                  className="text-[#8064B5] font-semibold hover:underline"
                >
                  Autofill Dev Code (749216)
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-[#E9DDFB] hover:bg-[#D9C7F7] text-[#8064B5] text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <span>{isLoading ? 'Verifying...' : 'Verify & Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 3: Profile Setup */}
          {step === 'profile' && (
            <form onSubmit={handleComplete} className="space-y-4">
              <div className="text-center space-y-1 mb-3">
                <h3 className="text-sm font-bold text-[#292333]">Set Up Your Profile</h3>
                <p className="text-xs text-[#777181]">
                  Choose how your name and avatar appear to your contacts.
                </p>
              </div>

              {/* Avatar Preview */}
              <div className="flex justify-center mb-3">
                <img
                  src={selectedAvatar}
                  alt="Profile Avatar"
                  className="w-20 h-20 rounded-full object-cover border-4 border-[#E9DDFB] shadow-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#292333] block mb-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#F8F5FC] border border-[#EAE5F1] rounded-xl px-3 py-2 text-xs text-[#292333] focus:outline-hidden focus:border-[#B99AEF]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#292333] block mb-1">Username (@handle)</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#F8F5FC] border border-[#EAE5F1] rounded-xl px-3 py-2 text-xs text-[#292333] focus:outline-hidden focus:border-[#B99AEF]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#292333] block mb-1">About / Bio</label>
                <input
                  type="text"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="w-full bg-[#F8F5FC] border border-[#EAE5F1] rounded-xl px-3 py-2 text-xs text-[#292333] focus:outline-hidden focus:border-[#B99AEF]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#8064B5] hover:bg-[#6c519d] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 mt-2"
              >
                <span>Enter WhatChat</span>
                <Check className="w-4 h-4 stroke-[3]" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
