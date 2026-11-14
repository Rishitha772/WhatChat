<<<<<<< HEAD
import { Users } from 'lucide-react';

export function ContactsView() {
  return (
    <main className="flex-1 grid place-items-center overflow-y-auto bg-[#f8f5fc] p-6">
      <section className="max-w-sm text-center">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[#e9ddfb] text-[#8064b5]">
          <Users size={25} />
        </div>
        <h1 className="text-xl font-semibold text-[#292333]">Contacts</h1>
        <p className="mt-2 text-sm leading-6 text-[#777181]">Find people and start a conversation.</p>
        <p className="mt-3 text-xs leading-5 text-[#9994a1]">Contact discovery will be available when the WhatChat contacts service is connected.</p>
      </section>
    </main>
  );
}
=======
import React, { useState } from 'react';
import {
  Users,
  Search,
  MessageSquare,
  Phone,
  UserPlus,
  Star,
  CheckCircle,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useWhatChat } from '../../context/WhatChatContext';

export const ContactsView: React.FC = () => {
  const { contacts, startDirectChatWithContact } = useWhatChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [lookupPhone, setLookupPhone] = useState('');
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [isSearchingPhone, setIsSearchingPhone] = useState(false);

  const filteredContacts = contacts.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.displayName.toLowerCase().includes(q) ||
      c.phoneNumber.includes(q) ||
      c.username?.toLowerCase().includes(q)
    );
  });

  const handlePhoneLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupPhone.trim()) return;

    setIsSearchingPhone(true);
    setLookupResult(null);

    setTimeout(() => {
      setIsSearchingPhone(false);
      // Check existing contacts or mock match
      const matched = contacts.find((c) => c.phoneNumber.includes(lookupPhone.trim()));
      if (matched) {
        setLookupResult({ found: true, contact: matched });
      } else {
        setLookupResult({
          found: true,
          contact: {
            id: `cnt_new_${Date.now()}`,
            displayName: 'Devika Nair',
            username: 'devika_n',
            phoneNumber: lookupPhone.startsWith('+') ? lookupPhone : `+91 ${lookupPhone}`,
            avatarUrl:
              'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
            about: 'Exploring WhatChat & organizing college notes!',
            isOnline: true,
          },
        });
      }
    }, 700);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8F5FC] overflow-y-auto select-none">
      {/* 1. Header Banner */}
      <div className="bg-white border-b border-[#EAE5F1] p-6 lg:p-8 shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-lg bg-[#E9DDFB] text-[#8064B5]">
                  <Users className="w-5 h-5" />
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-[#292333]">Contacts & Discovery</h1>
              </div>
              <p className="text-xs text-[#777181]">
                Find friends and colleagues by phone number, discover active WhatChat users, and start encrypted 1:1 messaging.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-[#5EAA85] bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Phone numbers privacy protected</span>
              </span>
            </div>
          </div>

          {/* Phone Number Discovery Box */}
          <form
            onSubmit={handlePhoneLookup}
            className="mt-6 p-4 rounded-2xl bg-[#F8F5FC] border border-[#EAE5F1] flex flex-col sm:flex-row items-center gap-3"
          >
            <div className="flex-1 w-full relative">
              <Phone className="w-4 h-4 text-[#777181] absolute left-3 top-3 pointer-events-none" />
              <input
                type="tel"
                placeholder="Enter phone number to discover on WhatChat (e.g. +91 98450 11223)..."
                value={lookupPhone}
                onChange={(e) => setLookupPhone(e.target.value)}
                className="w-full bg-white border border-[#EAE5F1] rounded-xl pl-9 pr-3 py-2 text-xs text-[#292333] focus:outline-hidden focus:border-[#B99AEF]"
              />
            </div>

            <button
              type="submit"
              disabled={isSearchingPhone || !lookupPhone.trim()}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#E9DDFB] hover:bg-[#D9C7F7] text-[#8064B5] text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              {isSearchingPhone ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Discover User</span>
                </>
              )}
            </button>
          </form>

          {/* Discovery Result */}
          {lookupResult && (
            <div className="mt-3 p-3 bg-white border border-[#B99AEF] rounded-2xl flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <img
                  src={lookupResult.contact.avatarUrl}
                  alt={lookupResult.contact.displayName}
                  className="w-10 h-10 rounded-full object-cover border border-[#EAE5F1]"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-[#292333]">
                      {lookupResult.contact.displayName}
                    </h4>
                    <span className="text-[10px] text-[#5EAA85] bg-emerald-50 px-1.5 py-0.2 rounded font-semibold">
                      Registered on WhatChat
                    </span>
                  </div>
                  <p className="text-[11px] text-[#777181]">{lookupResult.contact.about}</p>
                </div>
              </div>

              <button
                onClick={() => startDirectChatWithContact(lookupResult.contact.id)}
                className="px-3.5 py-1.5 rounded-xl bg-[#8064B5] hover:bg-[#6c519d] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Contacts List */}
      <div className="max-w-4xl w-full mx-auto p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-[#777181] absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search your contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#EAE5F1] rounded-xl pl-9 pr-3 py-2 text-xs text-[#292333] focus:outline-hidden focus:border-[#B99AEF]"
            />
          </div>

          <span className="text-xs text-[#777181] font-medium">
            {filteredContacts.length} contacts available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white border border-[#EAE5F1] hover:border-[#B99AEF] rounded-2xl p-4 shadow-2xs transition-all flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={contact.avatarUrl}
                    alt={contact.displayName}
                    className="w-12 h-12 rounded-full object-cover border border-[#EAE5F1]"
                  />
                  {contact.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#5EAA85] border-2 border-white rounded-full"></span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-[#292333] truncate">
                      {contact.displayName}
                    </h3>
                    {contact.isFavorite && (
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#777181] truncate">{contact.about}</p>
                  <span className="text-[10px] text-[#8064B5] font-medium block mt-0.5">
                    {contact.isOnline ? 'Online now' : contact.lastSeen || 'Offline'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => startDirectChatWithContact(contact.id)}
                className="p-2.5 rounded-xl bg-[#E9DDFB] hover:bg-[#D9C7F7] text-[#8064B5] transition-all hover:scale-105 active:scale-95 shrink-0 shadow-2xs"
                title={`Chat with ${contact.displayName}`}
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
>>>>>>> origin/main
