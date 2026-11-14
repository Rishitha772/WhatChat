import React from 'react';
import { Sparkles, MessageSquare, AtSign, X } from 'lucide-react';
import { useWhatChat } from '../../context/WhatChatContext';
import { InAppNotification } from '../../types/whatchat';

export const NotificationToasts: React.FC = () => {
  const {
    activeNotifications,
    dismissNotification,
    setActiveTab,
    setActiveConversationId,
    setActiveEventId,
  } = useWhatChat();

  if (!activeNotifications || activeNotifications.length === 0) {
    return null;
  }

  const handleNotificationClick = (notif: InAppNotification) => {
    dismissNotification(notif.id);

    if (notif.conversationId) {
      setActiveTab('chats');
      setActiveConversationId(notif.conversationId);
    } else if (notif.eventId) {
      setActiveTab('myspace');
      setActiveEventId(notif.eventId);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none select-none">
      {activeNotifications.map((notif) => {
        const isMention = notif.type === 'mention';
        const isMemory = notif.type === 'memory';

        return (
          <div
            key={notif.id}
            onClick={() => handleNotificationClick(notif)}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md shadow-xl border cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all animate-in slide-in-from-top-3 duration-200 ${
              isMention
                ? 'border-[#B99AEF] ring-2 ring-[#E9DDFB]'
                : isMemory
                ? 'border-amber-300 ring-2 ring-amber-100'
                : 'border-[#EAE5F1]'
            }`}
          >
            {/* Avatar or Icon */}
            <div className="relative shrink-0">
              {notif.avatarUrl ? (
                <img
                  src={notif.avatarUrl}
                  alt={notif.title}
                  className="w-10 h-10 rounded-full object-cover border border-[#EAE5F1]"
                />
              ) : (
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isMention
                      ? 'bg-[#E9DDFB] text-[#8064B5]'
                      : isMemory
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-[#F8F5FC] text-[#8064B5]'
                  }`}
                >
                  {isMention ? (
                    <AtSign className="w-5 h-5" />
                  ) : isMemory ? (
                    <Sparkles className="w-5 h-5" />
                  ) : (
                    <MessageSquare className="w-5 h-5" />
                  )}
                </div>
              )}

              {/* Type badge dot */}
              <span
                className={`absolute -bottom-1 -right-1 p-0.5 rounded-full border border-white text-white ${
                  isMention
                    ? 'bg-[#8064B5]'
                    : isMemory
                    ? 'bg-amber-500'
                    : 'bg-[#5EAA85]'
                }`}
              >
                {isMention ? (
                  <AtSign className="w-2.5 h-2.5" />
                ) : isMemory ? (
                  <Sparkles className="w-2.5 h-2.5" />
                ) : (
                  <MessageSquare className="w-2.5 h-2.5" />
                )}
              </span>
            </div>

            {/* Notification Text */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center justify-between gap-1">
                <h4 className="text-xs font-bold text-[#292333] truncate">{notif.title}</h4>
                <span className="text-[10px] text-[#777181] shrink-0">{notif.timestamp}</span>
              </div>
              <p className="text-xs text-[#777181] line-clamp-2 mt-0.5 leading-snug">
                {notif.body}
              </p>
              {isMention && (
                <span className="inline-block text-[10px] font-semibold text-[#8064B5] bg-[#E9DDFB] px-1.5 py-0.2 rounded mt-1">
                  Mentioned you
                </span>
              )}
            </div>

            {/* Dismiss Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismissNotification(notif.id);
              }}
              className="text-[#777181] hover:text-[#292333] p-1 -mr-1 -mt-1 rounded-lg"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
