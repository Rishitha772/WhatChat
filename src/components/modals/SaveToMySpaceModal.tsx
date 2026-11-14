import React, { useState } from 'react';
import { Sparkles, X, Check, Calendar, ArrowRight } from 'lucide-react';
import { useWhatChat } from '../../context/WhatChatContext';

export const SaveToMySpaceModal: React.FC = () => {
  const {
    saveToEventModalData,
    setSaveToEventModalData,
    events,
    saveMessageToMySpace,
    setActiveTab,
    setActiveEventId,
  } = useWhatChat();

  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');

  if (!saveToEventModalData) return null;

  const handleSave = () => {
    if (!selectedEventId) return;

    saveMessageToMySpace(saveToEventModalData, selectedEventId);
    setSaveToEventModalData(null);
  };

  const handleSaveAndOpen = () => {
    if (!selectedEventId) return;

    saveMessageToMySpace(saveToEventModalData, selectedEventId);
    setSaveToEventModalData(null);
    setActiveTab('myspace');
    setActiveEventId(selectedEventId);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#EAE5F1] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#EAE5F1]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#E9DDFB] text-[#8064B5]">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-[#292333]">Save to My Space</h3>
          </div>
          <button
            onClick={() => setSaveToEventModalData(null)}
            className="text-[#777181] hover:text-[#292333]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Snippet of the message being saved */}
        <div className="p-3 bg-[#F8F5FC] border border-[#EAE5F1] rounded-2xl">
          <span className="text-[10px] font-bold text-[#8064B5] uppercase tracking-wider block mb-1">
            Message Preview from {saveToEventModalData.senderName}:
          </span>
          {saveToEventModalData.attachments && saveToEventModalData.attachments.length > 0 && (
            <div className="mb-2">
              <span className="text-xs font-semibold text-[#292333]">
                📎 Attached {saveToEventModalData.attachments[0].type}: {saveToEventModalData.attachments[0].fileName}
              </span>
            </div>
          )}
          <p className="text-xs text-[#292333] italic line-clamp-3">
            "{saveToEventModalData.text || 'Shared media memory'}"
          </p>
        </div>

        {/* Destination Event Chooser */}
        <div>
          <label className="text-xs font-bold text-[#292333] block mb-2">
            Choose Destination Event Capsule:
          </label>
          <div className="max-h-52 overflow-y-auto space-y-2 border border-[#EAE5F1] rounded-2xl p-2 bg-[#F8F5FC]">
            {events.map((evt) => {
              const isSelected = selectedEventId === evt.id;
              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEventId(evt.id)}
                  className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-2 border-[#8064B5] shadow-xs'
                      : 'hover:bg-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={evt.coverImageUrl}
                      alt={evt.name}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#292333] truncate">{evt.name}</p>
                      <span className="text-[10px] text-[#777181] flex items-center gap-1">
                        <span>{evt.category}</span>
                        {evt.eventDate && <span>· {evt.eventDate}</span>}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-[#8064B5] bg-[#8064B5] text-white'
                        : 'border-[#777181]'
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t border-[#EAE5F1]">
          <button
            onClick={() => setSaveToEventModalData(null)}
            className="px-4 py-2 text-xs text-[#777181] hover:text-[#292333]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold bg-[#F8F5FC] hover:bg-[#E9DDFB] text-[#8064B5] rounded-xl transition-all"
          >
            Save to Event
          </button>
          <button
            onClick={handleSaveAndOpen}
            className="px-4 py-2 text-xs font-bold bg-[#E9DDFB] hover:bg-[#D9C7F7] text-[#8064B5] rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span>Save & Open Space</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
