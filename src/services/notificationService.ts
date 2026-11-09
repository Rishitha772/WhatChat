import { notificationAudio } from '../utils/notificationSound';
import { InAppNotification, NotificationType } from '../types/whatchat';

export interface SendNotificationOptions {
  title: string;
  body: string;
  avatarUrl?: string;
  type: NotificationType;
  conversationId?: string;
  eventId?: string;
  soundEnabled?: boolean;
  showPreviews?: boolean;
  onClick?: () => void;
}

class NotificationService {
  /**
   * Check if the Web Notification API is supported in this browser/device
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Get current browser notification permission
   */
  getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  /**
   * Request native notification permission from the user
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (e) {
      // In some older mobile browsers, requestPermission is callback-based
      return new Promise((resolve) => {
        Notification.requestPermission((res) => resolve(res));
      });
    }
  }

  /**
   * Dispatch a notification across native OS/browser and audio chime
   */
  dispatch(options: SendNotificationOptions): InAppNotification {
    const {
      title,
      body,
      avatarUrl,
      type,
      conversationId,
      eventId,
      soundEnabled = true,
      showPreviews = true,
      onClick,
    } = options;

    // 1. Play Synthesized Web Audio Chime if enabled
    if (soundEnabled) {
      if (type === 'mention') {
        notificationAudio.playMentionChime();
      } else if (type === 'memory') {
        notificationAudio.playMemoryChime();
      } else {
        notificationAudio.playMessageChime();
      }
    }

    // 2. Format Body based on user privacy preferences
    const displayedBody = showPreviews ? body : 'New message received on WhatChat';

    // 3. Native System / OS Push Notification
    if (this.isSupported() && this.getPermission() === 'granted') {
      try {
        const notif = new Notification(title, {
          body: displayedBody,
          icon: avatarUrl || '/src/assets/images/whatchat_hero_banner_1794229994931.jpg',
          badge: '/src/assets/images/whatchat_hero_banner_1794229994931.jpg',
          tag: conversationId || eventId || 'whatchat_notification',
          silent: true, // we handle our own gentle chime
        });

        notif.onclick = () => {
          window.focus();
          notif.close();
          if (onClick) onClick();
        };

        // Auto close after 5 seconds
        setTimeout(() => notif.close(), 5000);
      } catch (err) {
        // May fail if in certain restrictive iframe policies; in-app toast will catch it
      }
    }

    // 4. Return In-App Notification representation
    return {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title,
      body: displayedBody,
      avatarUrl,
      type,
      conversationId,
      eventId,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }
}

export const notificationService = new NotificationService();
