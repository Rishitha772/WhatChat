import { useState } from 'react';
import { LogOut, Save, UserRound, Phone } from 'lucide-react';
import { useWhatChat } from '../../context/WhatChatContext';

export function ProfileView() {
  const { user, updateProfile, logout } = useWhatChat();
  const [name, setName] = useState(user?.displayName ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [about, setAbout] = useState(user?.about ?? '');
  const [phone, setPhone] = useState(user?.phoneNumber ?? '');
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
        phoneNumber: phone.trim(),
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
            Phone number <span className="font-normal text-[#777181]">(for contact discovery, e.g. +91 98765 43210)</span>
            <input
              type="tel"
              className="auth-profile-input"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+91 98765 43210"
              maxLength={25}
            />
          </label>
          <label className="block space-y-2 text-sm font-medium text-[#3a3444]">
            About <span className="font-normal text-[#777181]">(optional)</span>
            <textarea className="auth-profile-input" value={about} onChange={(event) => setAbout(event.target.value)} rows={3} maxLength={255} />
          </label>
          <div className="flex flex-col-reverse justify-between gap-3 border-t border-[#eae5f1] pt-5 sm:flex-row sm:items-center">
            <button onClick={logout} className="btn-aesthetic-soft inline-flex min-h-10 items-center justify-center gap-2 px-4 text-sm font-semibold">
              <LogOut size={16} /> Sign out
            </button>
            <div className="flex items-center justify-end gap-3">
              {saved && <span className="text-xs text-[#8064b5] font-semibold" role="status">Saved</span>}
              <button onClick={save} disabled={!name.trim() || saving} className="btn-aesthetic-primary inline-flex min-h-10 items-center justify-center gap-2 px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50">
                <Save size={16} /> {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
