<<<<<<< HEAD
import { useState } from 'react';
import { LogOut, Save, UserRound } from 'lucide-react';
import { useWhatChat } from '../../context/WhatChatContext';

export function ProfileView() {
  const { user, updateProfile, logout } = useWhatChat();
  const [name, setName] = useState(user?.displayName ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [about, setAbout] = useState(user?.about ?? '');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!user) return null;

  const save = async () => {
    if (saving || !name.trim()) return;
    setSaving(true);
    setError('');
    try {
      await updateProfile({
        displayName: name.trim(),
        username: username.trim(),
        about: about.trim(),
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-[#f8f5fc] p-5 md:p-8">
      <section className="mx-auto max-w-2xl">
        <h1 className="mb-1 text-2xl font-semibold text-[#292333]">Profile</h1>
        <p className="mb-7 text-sm text-[#777181]">Manage the details connected to your account.</p>
        <div className="space-y-6 rounded-xl border border-[#eae5f1] bg-white p-5 md:p-7">
          <div className="flex items-center gap-4 border-b border-[#eae5f1] pb-5">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-[#e9ddfb] text-[#8064b5]">
              <UserRound size={25} />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-[#292333]">{user.displayName}</p>
              <p className="truncate text-sm text-[#777181]">{user.email ?? ''}</p>
            </div>
          </div>

          <label className="block space-y-2 text-sm font-medium text-[#3a3444]">
            Display name
            <input className="auth-profile-input" value={name} onChange={(event) => setName(event.target.value)} maxLength={100} />
          </label>
          {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
          <label className="block space-y-2 text-sm font-medium text-[#3a3444]">
            Username <span className="font-normal text-[#777181]">(optional)</span>
            <input className="auth-profile-input" value={username} onChange={(event) => setUsername(event.target.value.replace(/[^a-zA-Z0-9_]/g, ''))} maxLength={30} />
          </label>
          <label className="block space-y-2 text-sm font-medium text-[#3a3444]">
            About <span className="font-normal text-[#777181]">(optional)</span>
            <textarea className="auth-profile-input" value={about} onChange={(event) => setAbout(event.target.value)} rows={3} maxLength={255} />
          </label>
          <div className="flex flex-col-reverse justify-between gap-3 border-t border-[#eae5f1] pt-5 sm:flex-row sm:items-center">
            <button onClick={logout} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#eae5f1] px-4 text-sm font-medium text-[#70549f] hover:bg-[#f8f5fc]">
              <LogOut size={16} /> Sign out
            </button>
            <div className="flex items-center justify-end gap-3">
              {saved && <span className="text-xs text-[#5b467f]" role="status">Saved</span>}
              <button onClick={save} disabled={!name.trim() || saving} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#8064b5] px-4 text-sm font-semibold text-white hover:bg-[#70549f] disabled:cursor-not-allowed disabled:opacity-50">
                <Save size={16} /> {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
=======
import React, { useState } from 'react';
import {
  User,
  Shield,
  HardDrive,
  Camera,
  Check,
  Edit3,
  Lock,
  Eye,
  Bell,
  BellRing,
  AtSign,
  Volume2,
  VolumeX,
  LogOut,
  Sparkles,
  Smartphone,
  Save,
  CheckCircle2,
  AlertCircle,
  Radio,
} from 'lucide-react';
import { useWhatChat } from '../../context/WhatChatContext';

export const ProfileView: React.FC = () => {
  const {
    user,
    updateProfile,
    updatePrivacy,
    logout,
    notificationPermission,
    requestNotificationPermission,
    updateNotificationSettings,
    sendTestNotification,
  } = useWhatChat();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.displayName || '');
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutInput, setAboutInput] = useState(user?.about || '');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  if (!user) return null;

  const usedMB = Math.round(user.storageUsedBytes / (1024 * 1024));
  const totalGB = Math.round(user.storageTotalBytes / (1024 * 1024 * 1024));
  const percent = Math.min(100, Math.round((usedMB / (totalGB * 1024)) * 100));

  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  ];

  const handleSaveName = () => {
    if (nameInput.trim()) {
      updateProfile({ displayName: nameInput.trim() });
    }
    setIsEditingName(false);
  };

  const handleSaveAbout = () => {
    if (aboutInput.trim()) {
      updateProfile({ about: aboutInput.trim() });
    }
    setIsEditingAbout(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8F5FC] overflow-y-auto select-none">
      <div className="max-w-3xl w-full mx-auto p-6 md:p-8 space-y-6">
        {/* 1. Header Card with Avatar */}
        <div className="bg-white border border-[#EAE5F1] rounded-3xl p-6 md:p-8 shadow-2xs relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative group">
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="w-24 h-24 rounded-full object-cover border-4 border-[#E9DDFB] shadow-xs"
              />
              <button
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="absolute bottom-0 right-0 p-2 bg-[#8064B5] text-white rounded-full hover:bg-[#6c519d] transition-all shadow-md hover:scale-105"
                title="Change profile avatar"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* User Details */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="bg-[#F8F5FC] border border-[#B99AEF] rounded-xl px-3 py-1.5 text-base font-bold text-[#292333] focus:outline-hidden"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-2 bg-[#8064B5] text-white rounded-xl hover:bg-[#6c519d]"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl font-bold text-[#292333]">{user.displayName}</h2>
                  <button
                    onClick={() => {
                      setNameInput(user.displayName);
                      setIsEditingName(true);
                    }}
                    className="text-[#777181] hover:text-[#8064B5]"
                    title="Edit Name"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <p className="text-xs text-[#8064B5] font-semibold">@{user.username}</p>

              {/* Phone display with privacy lock */}
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-[#777181]">
                <Smartphone className="w-3.5 h-3.5" />
                <span className="font-mono">{user.phoneNumber}</span>
                <span className="text-[10px] text-[#5EAA85] bg-emerald-50 px-1.5 py-0.5 rounded-full font-medium ml-1">
                  Private & Verified
                </span>
              </div>
            </div>
          </div>

          {/* Avatar Presets Drawer */}
          {showAvatarPicker && (
            <div className="mt-6 pt-4 border-t border-[#EAE5F1]">
              <p className="text-xs font-semibold text-[#292333] mb-3">Choose Profile Photo Preset</p>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {avatarPresets.map((preset, idx) => (
                  <img
                    key={idx}
                    src={preset}
                    alt={`Preset ${idx}`}
                    onClick={() => {
                      updateProfile({ avatarUrl: preset });
                      setShowAvatarPicker(false);
                    }}
                    className="w-14 h-14 rounded-full object-cover border-2 border-transparent hover:border-[#8064B5] cursor-pointer hover:scale-105 transition-all"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. About / Status Card */}
        <div className="bg-white border border-[#EAE5F1] rounded-3xl p-6 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#292333]">About / Bio</h3>
            {!isEditingAbout && (
              <button
                onClick={() => {
                  setAboutInput(user.about);
                  setIsEditingAbout(true);
                }}
                className="text-xs font-semibold text-[#8064B5] hover:underline"
              >
                Edit
              </button>
            )}
          </div>

          {isEditingAbout ? (
            <div className="space-y-3">
              <textarea
                value={aboutInput}
                onChange={(e) => setAboutInput(e.target.value)}
                rows={2}
                className="w-full bg-[#F8F5FC] border border-[#B99AEF] rounded-xl p-3 text-xs text-[#292333] focus:outline-hidden"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditingAbout(false)}
                  className="px-3 py-1.5 text-xs text-[#777181]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAbout}
                  className="px-4 py-1.5 text-xs font-semibold bg-[#8064B5] text-white rounded-xl hover:bg-[#6c519d]"
                >
                  Save About
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#292333] leading-relaxed p-3 bg-[#F8F5FC] rounded-2xl border border-[#EAE5F1]">
              {user.about}
            </p>
          )}

          {/* Quick status presets */}
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              'Living in the moment & collecting memories in My Space ✨',
              'Coding with Spring Boot & React 💻',
              'At college quad 🎓',
              'Traveling in the mountains 🏔️',
            ].map((preset, idx) => (
              <button
                key={idx}
                onClick={() => updateProfile({ about: preset })}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[#F8F5FC] hover:bg-[#E9DDFB] text-[#777181] hover:text-[#8064B5] transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Cloud S3 Object Storage Breakdown */}
        <div className="bg-white border border-[#EAE5F1] rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#E9DDFB] text-[#8064B5]">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#292333]">S3 Cloud Media Storage</h3>
                <p className="text-xs text-[#777181]">
                  High-durability object storage for photos, video clips, and documents.
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-[#8064B5] bg-[#E9DDFB] px-2.5 py-1 rounded-full">
              {(usedMB / 1024).toFixed(2)} GB of {totalGB} GB Used
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#EAE5F1] h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-[#8064B5] h-full rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            ></div>
          </div>

          {/* Breakdown cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 bg-[#F8F5FC] rounded-xl border border-[#EAE5F1]">
              <span className="text-[10px] text-[#777181] font-medium block">Photos & Videos</span>
              <p className="text-sm font-bold text-[#292333] mt-0.5">850 MB</p>
            </div>
            <div className="p-3 bg-[#F8F5FC] rounded-xl border border-[#EAE5F1]">
              <span className="text-[10px] text-[#777181] font-medium block">PDFs & Documents</span>
              <p className="text-sm font-bold text-[#292333] mt-0.5">420 MB</p>
            </div>
            <div className="p-3 bg-[#F8F5FC] rounded-xl border border-[#EAE5F1]">
              <span className="text-[10px] text-[#777181] font-medium block">Voice Reflections</span>
              <p className="text-sm font-bold text-[#292333] mt-0.5">90 MB</p>
            </div>
            <div className="p-3 bg-[#F8F5FC] rounded-xl border border-[#EAE5F1]">
              <span className="text-[10px] text-[#777181] font-medium block">MySQL State</span>
              <p className="text-sm font-bold text-[#292333] mt-0.5">60 MB</p>
            </div>
          </div>
        </div>

        {/* 4. Privacy & Permissions */}
        <div className="bg-white border border-[#EAE5F1] rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#E9DDFB] text-[#8064B5]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#292333]">Privacy & Security Controls</h3>
              <p className="text-xs text-[#777181]">Manage how contacts see your status and discover you.</p>
            </div>
          </div>

          <div className="divide-y divide-[#F8F5FC] space-y-3 pt-1">
            {/* Last Seen */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-xs font-bold text-[#292333]">Last Seen & Online Status</p>
                <span className="text-[11px] text-[#777181]">Who can see when you were last active</span>
              </div>
              <select
                value={user.privacySettings.lastSeenVisibility}
                onChange={(e) =>
                  updatePrivacy({ lastSeenVisibility: e.target.value as any })
                }
                className="bg-[#F8F5FC] border border-[#EAE5F1] rounded-xl px-3 py-1.5 text-xs text-[#292333] focus:outline-hidden"
              >
                <option value="everyone">Everyone</option>
                <option value="contacts">My Contacts Only</option>
                <option value="nobody">Nobody</option>
              </select>
            </div>

            {/* Read Receipts */}
            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-xs font-bold text-[#292333]">Read Receipts</p>
                <span className="text-[11px] text-[#777181]">
                  If turned off, you won't send or receive lavender read checkmarks
                </span>
              </div>
              <input
                type="checkbox"
                checked={user.privacySettings.readReceipts}
                onChange={(e) => updatePrivacy({ readReceipts: e.target.checked })}
                className="w-4 h-4 accent-[#8064B5] rounded cursor-pointer"
              />
            </div>

            {/* Profile Photo Visibility */}
            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-xs font-bold text-[#292333]">Profile Photo Visibility</p>
                <span className="text-[11px] text-[#777181]">Who can see your profile picture</span>
              </div>
              <select
                value={user.privacySettings.profilePhotoVisibility}
                onChange={(e) =>
                  updatePrivacy({ profilePhotoVisibility: e.target.value as any })
                }
                className="bg-[#F8F5FC] border border-[#EAE5F1] rounded-xl px-3 py-1.5 text-xs text-[#292333] focus:outline-hidden"
              >
                <option value="everyone">Everyone</option>
                <option value="contacts">My Contacts Only</option>
                <option value="nobody">Nobody</option>
              </select>
            </div>

            {/* Phone Discovery */}
            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-xs font-bold text-[#292333]">Phone Number Discovery</p>
                <span className="text-[11px] text-[#777181]">
                  Allow people who have your phone number to find you on WhatChat
                </span>
              </div>
              <input
                type="checkbox"
                checked={user.privacySettings.phoneDiscovery}
                onChange={(e) => updatePrivacy({ phoneDiscovery: e.target.checked })}
                className="w-4 h-4 accent-[#8064B5] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 5. Push Notifications & Alerts Configuration */}
        <div className="bg-white border border-[#EAE5F1] rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#E9DDFB] text-[#8064B5]">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#292333]">Push Notifications & Alerts</h3>
                <p className="text-xs text-[#777181]">
                  Manage reliable delivery for messages, @mentions, and My Space memories.
                </p>
              </div>
            </div>

            {/* Permission Status Pill */}
            <div className="flex items-center gap-1.5">
              {notificationPermission === 'granted' ? (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-[#5EAA85] border border-emerald-200 text-[11px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>OS Push Active</span>
                </span>
              ) : notificationPermission === 'denied' ? (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-[11px] font-bold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Blocked in Browser</span>
                </span>
              ) : (
                <button
                  onClick={() => requestNotificationPermission()}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#E9DDFB] hover:bg-[#D9C7F7] text-[#8064B5] text-[11px] font-bold transition-colors"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Request Permission</span>
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-[#F8F5FC] space-y-3 pt-1">
            {/* Master Push Toggle */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-xs font-bold text-[#292333]">Enable Push Notifications</p>
                <span className="text-[11px] text-[#777181]">
                  Receive notifications when new messages, mentions, or memories occur
                </span>
              </div>
              <input
                type="checkbox"
                checked={user.notificationSettings.enabled}
                onChange={(e) => updateNotificationSettings({ enabled: e.target.checked })}
                className="w-4 h-4 accent-[#8064B5] rounded cursor-pointer"
              />
            </div>

            {/* Message Previews Toggle */}
            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-xs font-bold text-[#292333]">Message Content Preview</p>
                <span className="text-[11px] text-[#777181]">
                  Show sender name and message text preview in notification banner
                </span>
              </div>
              <input
                type="checkbox"
                checked={user.notificationSettings.showPreviews}
                onChange={(e) => updateNotificationSettings({ showPreviews: e.target.checked })}
                className="w-4 h-4 accent-[#8064B5] rounded cursor-pointer"
              />
            </div>

            {/* Sound Chimes Toggle */}
            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-xs font-bold text-[#292333]">Audio Chimes & Tones</p>
                <span className="text-[11px] text-[#777181]">
                  Play gentle dual-tone lavender chimes on incoming alerts
                </span>
              </div>
              <input
                type="checkbox"
                checked={user.notificationSettings.sound}
                onChange={(e) => updateNotificationSettings({ sound: e.target.checked })}
                className="w-4 h-4 accent-[#8064B5] rounded cursor-pointer"
              />
            </div>

            {/* Mention Alerts */}
            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-xs font-bold text-[#292333]">@Mention Notifications</p>
                <span className="text-[11px] text-[#777181]">
                  Prioritize notifications when someone tags you with @{user.username} or @all
                </span>
              </div>
              <input
                type="checkbox"
                checked={user.notificationSettings.mentionAlerts}
                onChange={(e) => updateNotificationSettings({ mentionAlerts: e.target.checked })}
                className="w-4 h-4 accent-[#8064B5] rounded cursor-pointer"
              />
            </div>

            {/* Group Notification Mode */}
            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-xs font-bold text-[#292333]">Group Conversation Delivery</p>
                <span className="text-[11px] text-[#777181]">
                  Control alert volume from large campus & project groups
                </span>
              </div>
              <select
                value={user.notificationSettings.groupMode}
                onChange={(e) => updateNotificationSettings({ groupMode: e.target.value as any })}
                className="bg-[#F8F5FC] border border-[#EAE5F1] rounded-xl px-3 py-1.5 text-xs text-[#292333] focus:outline-hidden"
              >
                <option value="all">All Group Messages</option>
                <option value="mentions_only">Only When Mentioned (@)</option>
                <option value="none">Mute Group Notifications</option>
              </select>
            </div>

            {/* My Space Memory Milestones */}
            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-xs font-bold text-[#292333]">My Space Memory Milestones</p>
                <span className="text-[11px] text-[#777181]">
                  Revisit anniversary memories and important saved event updates
                </span>
              </div>
              <input
                type="checkbox"
                checked={user.notificationSettings.memoryMilestones}
                onChange={(e) => updateNotificationSettings({ memoryMilestones: e.target.checked })}
                className="w-4 h-4 accent-[#8064B5] rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Testing Bar */}
          <div className="mt-4 pt-3 border-t border-[#F8F5FC] flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-[#8064B5] uppercase tracking-wider mr-1">
              Verify Delivery:
            </span>
            <button
              onClick={() => sendTestNotification('message')}
              className="px-3 py-1.5 rounded-xl bg-[#F8F5FC] hover:bg-[#E9DDFB] text-[#292333] hover:text-[#8064B5] text-xs font-semibold transition-all border border-[#EAE5F1]"
            >
              Test Message Alert
            </button>
            <button
              onClick={() => sendTestNotification('mention')}
              className="px-3 py-1.5 rounded-xl bg-[#F8F5FC] hover:bg-[#E9DDFB] text-[#292333] hover:text-[#8064B5] text-xs font-semibold transition-all border border-[#EAE5F1]"
            >
              Test @Mention
            </button>
            <button
              onClick={() => sendTestNotification('memory')}
              className="px-3 py-1.5 rounded-xl bg-[#F8F5FC] hover:bg-[#E9DDFB] text-[#292333] hover:text-[#8064B5] text-xs font-semibold transition-all border border-[#EAE5F1]"
            >
              Test My Space Memory
            </button>
          </div>
        </div>

        {/* 6. Logout */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={logout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of WhatChat</span>
          </button>
        </div>
      </div>
    </div>
  );
};
>>>>>>> origin/main
