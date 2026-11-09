import React, { useState } from 'react';
import { Sparkles, X, Calendar, Image as ImageIcon, Check } from 'lucide-react';
import { useWhatChat } from '../../context/WhatChatContext';

export const CreateEventModal: React.FC = () => {
  const { isCreateEventOpen, setIsCreateEventOpen, categories, createEvent } = useWhatChat();

  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'Personal');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [selectedCover, setSelectedCover] = useState(
    '/src/assets/images/event_birthday_celebration_1794229996051.jpg'
  );

  if (!isCreateEventOpen) return null;

  const coverOptions = [
    {
      title: 'Birthday & Moments',
      url: '/src/assets/images/event_birthday_celebration_1794229996051.jpg',
    },
    {
      title: 'College & Graduation',
      url: '/src/assets/images/event_college_farewell_1794229996497.jpg',
    },
    {
      title: 'Alpine Travel & Trek',
      url: '/src/assets/images/event_mountain_travel_1794229996300.jpg',
    },
    {
      title: 'WhatChat Creative Space',
      url: '/src/assets/images/whatchat_hero_banner_1794229994931.jpg',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createEvent(
      name.trim(),
      category,
      eventDate,
      description.trim() || undefined,
      selectedCover
    );

    setIsCreateEventOpen(false);
    setName('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-[#EAE5F1] space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-[#EAE5F1]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#E9DDFB] text-[#8064B5]">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-[#292333]">Create Personal Event</h3>
          </div>
          <button
            onClick={() => setIsCreateEventOpen(false)}
            className="text-[#777181] hover:text-[#292333]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#777181]">
          My Space events act as specialized memory capsules. You can log personal reflections, save photos from your chats, and attach documents within this event.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#292333] block mb-1">
              Event Name <span className="text-[#8064B5]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 21st Birthday, College Farewell, Seed Pitch Deck..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#F8F5FC] border border-[#EAE5F1] rounded-xl px-3 py-2 text-xs text-[#292333] focus:outline-hidden focus:border-[#B99AEF]"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#292333] block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#F8F5FC] border border-[#EAE5F1] rounded-xl px-3 py-2 text-xs text-[#292333] focus:outline-hidden focus:border-[#B99AEF]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#292333] block mb-1">Event Date</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-[#F8F5FC] border border-[#EAE5F1] rounded-xl px-3 py-2 text-xs text-[#292333] focus:outline-hidden focus:border-[#B99AEF]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#292333] block mb-1">Description</label>
            <textarea
              placeholder="What makes this event meaningful to you?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-[#F8F5FC] border border-[#EAE5F1] rounded-xl px-3 py-2 text-xs text-[#292333] focus:outline-hidden focus:border-[#B99AEF]"
            />
          </div>

          {/* Cover Photo Picker */}
          <div>
            <label className="text-xs font-bold text-[#292333] block mb-2">
              Select Cover Artwork
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {coverOptions.map((opt, idx) => {
                const isSelected = selectedCover === opt.url;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedCover(opt.url)}
                    className={`relative h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                      isSelected
                        ? 'border-[#8064B5] ring-2 ring-[#E9DDFB]'
                        : 'border-[#EAE5F1] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={opt.url} alt={opt.title} className="w-full h-full object-cover" />
                    {isSelected && (
                      <span className="absolute top-1 right-1 p-0.5 rounded-full bg-[#8064B5] text-white">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#EAE5F1]">
            <button
              type="button"
              onClick={() => setIsCreateEventOpen(false)}
              className="px-4 py-2 text-xs text-[#777181] hover:text-[#292333]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#E9DDFB] hover:bg-[#D9C7F7] text-[#8064B5] rounded-xl transition-all shadow-xs"
            >
              Create Space
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
