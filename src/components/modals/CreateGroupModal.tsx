import React, { useState } from 'react';
import { Users, X, Check, Search } from 'lucide-react';
import { useWhatChat } from '../../context/WhatChatContext';
import { GroupCategoryType } from '../../types/whatchat';

export const CreateGroupModal: React.FC = () => {
  const { isCreateGroupOpen, setIsCreateGroupOpen, contacts, createGroup } = useWhatChat();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GroupCategoryType>('College');
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [contactSearch, setContactSearch] = useState('');

  if (!isCreateGroupOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedContactIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredContacts = contacts.filter((c) =>
    c.displayName.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createGroup(name.trim(), description.trim(), category, selectedContactIds);

    setIsCreateGroupOpen(false);
    setName('');
    setDescription('');
    setSelectedContactIds([]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#EAE5F1] space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-[#EAE5F1]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#E9DDFB] text-[#8064B5]">
              <Users className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-[#292333]">New Group Conversation</h3>
          </div>
          <button
            onClick={() => setIsCreateGroupOpen(false)}
            className="text-[#777181] hover:text-[#292333]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#292333] block mb-1">
              Group Name <span className="text-[#8064B5]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. College Friends, Project Team, Family Circle..."
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
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#F8F5FC] border border-[#EAE5F1] rounded-xl px-3 py-2 text-xs text-[#292333] focus:outline-hidden focus:border-[#B99AEF]"
              >
                <option value="College">College</option>
                <option value="Project">Project</option>
                <option value="Family">Family</option>
                <option value="Business">Business</option>
                <option value="Community">Community</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#292333] block mb-1">Members Selected</label>
              <div className="h-9 px-3 bg-[#F8F5FC] border border-[#EAE5F1] rounded-xl flex items-center text-xs font-semibold text-[#8064B5]">
                {selectedContactIds.length} members
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#292333] block mb-1">Description (Optional)</label>
            <textarea
              placeholder="Group purpose or guidelines"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-[#F8F5FC] border border-[#EAE5F1] rounded-xl px-3 py-2 text-xs text-[#292333] focus:outline-hidden focus:border-[#B99AEF]"
            />
          </div>

          {/* Member Selection List */}
          <div>
            <label className="text-xs font-bold text-[#292333] block mb-1">Add Participants</label>
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-[#777181] absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                className="w-full bg-[#F8F5FC] border border-[#EAE5F1] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#292333] focus:outline-hidden"
              />
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1.5 border border-[#EAE5F1] rounded-xl p-2 bg-[#F8F5FC]">
              {filteredContacts.map((contact) => {
                const isChecked = selectedContactIds.includes(contact.id);
                return (
                  <div
                    key={contact.id}
                    onClick={() => toggleSelect(contact.id)}
                    className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={contact.avatarUrl}
                        alt={contact.displayName}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-xs font-semibold text-[#292333]">{contact.displayName}</p>
                        <span className="text-[10px] text-[#777181]">{contact.phoneNumber}</span>
                      </div>
                    </div>

                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                        isChecked
                          ? 'bg-[#8064B5] border-[#8064B5] text-white'
                          : 'border-[#EAE5F1] bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#EAE5F1]">
            <button
              type="button"
              onClick={() => setIsCreateGroupOpen(false)}
              className="px-4 py-2 text-xs text-[#777181] hover:text-[#292333]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#E9DDFB] hover:bg-[#D9C7F7] text-[#8064B5] rounded-xl transition-all shadow-xs"
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
