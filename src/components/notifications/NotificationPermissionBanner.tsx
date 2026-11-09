import React, { useState } from 'react';
import { Bell, X, ShieldCheck } from 'lucide-react';
import { useWhatChat } from '../../context/WhatChatContext';

export const NotificationPermissionBanner: React.FC = () => {
  const {
    notificationPermission,
    requestNotificationPermission,
    user,
    sendTestNotification,
  } = useWhatChat();

  const [isDismissed, setIsDismissed] = useState(false);

  // If permission is already granted or explicitly denied or dismissed, do not show banner
  if (
    notificationPermission === 'granted' ||
    notificationPermission === 'denied' ||
    isDismissed ||
    !user?.notificationSettings?.enabled
  ) {
    return null;
  }

  const handleEnable = async () => {
    const res = await requestNotificationPermission();
    if (res === 'granted') {
      // Send a welcoming confirmation push notification!
      sendTestNotification();
    }
  };

  return (
    <div className="bg-[#E9DDFB]/80 border-b border-[#D9C7F7] px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-[#292333] shrink-0 z-20">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="p-1 rounded-lg bg-white text-[#8064B5] shrink-0 shadow-2xs">
          <Bell className="w-4 h-4" />
        </div>
        <div className="truncate">
          <span className="font-bold text-[#8064B5] mr-1.5">Stay connected:</span>
          <span className="text-[#292333]">
            Enable push notifications to receive real-time alerts for incoming messages, @mentions, and My Space memories.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleEnable}
          className="px-3 py-1 rounded-lg bg-[#8064B5] hover:bg-[#6c519d] text-white text-xs font-semibold transition-all shadow-2xs"
        >
          Enable Alerts
        </button>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 text-[#777181] hover:text-[#292333] rounded-md"
          title="Dismiss for now"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
