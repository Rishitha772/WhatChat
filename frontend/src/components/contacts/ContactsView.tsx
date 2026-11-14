import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Search,
  UserPlus,
  MessageSquare,
  Trash2,
  Check,
  Globe,
  X,
  Phone,
  AlertCircle,
  Loader2,
  Smartphone,
  Lock,
  ShieldCheck,
  Link2,
  Unlink,
  CheckCircle2,
  RefreshCw,
  Share2,
  FileUp,
  HelpCircle,
  ArrowRight,
  UserCheck,
  Copy,
} from 'lucide-react';
import { useWhatChat } from '../../context/WhatChatContext';
import {
  isContactPickerSupported,
  pickDeviceContacts,
  normalizePhoneNumber,
  formatDisplayPhone,
  parseManualContacts,
  parseVCard,
  shareWhatChatInvite,
} from '../../utils/phoneUtils';
import { UnregisteredContact } from '../../types/whatchat';

export function ContactsView() {
  const {
    contacts,
    addContact,
    removeContact,
    searchUsers,
    startDirectChat,
    user: currentUser,
    isDeviceContactsLinked,
    linkDeviceContacts,
    unlinkDeviceContacts,
    syncDeviceContacts,
  } = useWhatChat();

  const [activeTab, setActiveTab] = useState<'contacts' | 'discover' | 'unregistered'>('contacts');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showManualSyncModal, setShowManualSyncModal] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    type: 'success' | 'error' | 'denied' | null;
    message: string;
  }>({ type: null, message: '' });

  // Unregistered contacts saved in session for inviting
  const [unregisteredList, setUnregisteredList] = useState<UnregisteredContact[]>([]);

  // Manual sync input
  const [manualText, setManualText] = useState('');
  const [defaultCountryCode, setDefaultCountryCode] = useState('+91');
  const vcfInputRef = useRef<HTMLInputElement>(null);

  // Single Add Contact State
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newAbout, setNewAbout] = useState('Hey there! I am using WhatChat.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Discover Users State
  const [discoverQuery, setDiscoverQuery] = useState('');
  const [discoveredUsers, setDiscoveredUsers] = useState<
    Array<{ id: string; fullName: string; username?: string; about?: string; createdAt?: string }>
  >([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [addedUserIds, setAddedUserIds] = useState<Set<string>>(new Set());
  const [startingChatUserId, setStartingChatUserId] = useState<string | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Discover Users live search
  useEffect(() => {
    if (activeTab === 'discover' && isDeviceContactsLinked) {
      let isCurrent = true;
      setIsSearchingUsers(true);
      searchUsers(discoverQuery)
        .then((res) => {
          if (isCurrent) {
            setDiscoveredUsers(res.filter((u) => u.id !== currentUser?.id));
          }
        })
        .finally(() => {
          if (isCurrent) setIsSearchingUsers(false);
        });
      return () => {
        isCurrent = false;
      };
    }
  }, [activeTab, discoverQuery, currentUser?.id, searchUsers, isDeviceContactsLinked]);

  /**
   * Primary entry point: "Sync Phone Contacts"
   * First opens the privacy explanation modal before accessing any contacts.
   */
  const handleInitiateSync = () => {
    setSyncStatus({ type: null, message: '' });
    setShowPermissionModal(true);
  };

  /**
   * Called when user confirms in the permission explainer modal.
   */
  const handleProceedWithSync = async () => {
    setShowPermissionModal(false);
    setIsSyncing(true);
    setSyncStatus({ type: null, message: '' });

    if (isContactPickerSupported()) {
      // 1. Native mobile Contact Picker API
      try {
        const rawContacts = await pickDeviceContacts();
        if (rawContacts.length === 0) {
          setIsSyncing(false);
          setSyncStatus({
            type: 'denied',
            message: 'No contacts were selected from your device.',
          });
          return;
        }

        // Send to backend
        const result = await syncDeviceContacts(rawContacts);
        setIsSyncing(false);
        setUnregisteredList(result.unregisteredContacts || []);

        setSyncStatus({
          type: 'success',
          message: `Synchronized ${result.matchedCount} registered WhatChat contact(s). ${result.unregisteredCount} contact(s) are not on WhatChat yet.`,
        });

        if (result.unregisteredCount > 0) {
          setActiveTab('contacts');
        }
      } catch (err: any) {
        setIsSyncing(false);
        if (err.message === 'PERMISSION_DENIED') {
          setSyncStatus({
            type: 'denied',
            message: 'Contact permission was denied. WhatChat cannot access your contacts without permission.',
          });
        } else if (err.message === 'USER_CANCELLED') {
          setSyncStatus({
            type: 'denied',
            message: 'Contact selection was cancelled. You can retry whenever you are ready.',
          });
        } else {
          setSyncStatus({
            type: 'error',
            message: 'An error occurred while reading device contacts. Please try manual entry or retry.',
          });
        }
      }
    } else {
      // 2. Desktop or unsupported browser -> Open manual sync dialog
      setIsSyncing(false);
      setShowManualSyncModal(true);
    }
  };

  /**
   * Handle Manual / Paste / vCard synchronization
   */
  const handlePerformManualSync = async (contactsToSync: Array<{ name: string; phoneNumber: string }>) => {
    if (contactsToSync.length === 0) {
      setSyncStatus({ type: 'error', message: 'No valid phone numbers found to synchronize.' });
      return;
    }

    setIsSyncing(true);
    try {
      const result = await syncDeviceContacts(contactsToSync);
      setIsSyncing(false);
      setShowManualSyncModal(false);
      setManualText('');
      setUnregisteredList(result.unregisteredContacts || []);

      setSyncStatus({
        type: 'success',
        message: `Synchronized ${result.matchedCount} registered contact(s). ${result.unregisteredCount} contact(s) can be invited.`,
      });
      showToast(`Matched ${result.matchedCount} contacts!`);
    } catch (err) {
      setIsSyncing(false);
      setSyncStatus({
        type: 'error',
        message: 'Failed to synchronize contacts with the server. Please check your connection.',
      });
    }
  };

  // Handle vCard file upload
  const handleVcfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = parseVCard(content, defaultCountryCode);
      if (parsed.length > 0) {
        handlePerformManualSync(parsed);
      } else {
        setSyncStatus({ type: 'error', message: 'No phone numbers found in the selected vCard (.vcf) file.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Handle Invite
  const handleInviteContact = async (contact: UnregisteredContact) => {
    const res = await shareWhatChatInvite(contact.name);
    showToast(res.message);
  };

  // Filter contacts by search query
  const filteredContacts = contacts.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.displayName && c.displayName.toLowerCase().includes(q)) ||
      (c.username && c.username.toLowerCase().includes(q)) ||
      (c.phoneNumber && c.phoneNumber.includes(q)) ||
      (c.about && c.about.toLowerCase().includes(q))
    );
  });

  // Filter unregistered contacts by search query
  const filteredUnregistered = unregisteredList.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phoneNumber.includes(q);
  });

  // Handle Add Contact Submit
  const handleAddContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDisplayName.trim()) {
      setModalError('Please enter a contact name.');
      return;
    }
    const norm = newPhone.trim() ? normalizePhoneNumber(newPhone.trim(), defaultCountryCode) : undefined;
    setModalError('');
    setIsSubmitting(true);
    try {
      await addContact({
        displayName: newDisplayName.trim(),
        phoneNumber: norm || undefined,
        username: newUsername.trim() || undefined,
        about: newAbout.trim() || 'Hey there! I am using WhatChat.',
      });
      setIsAddModalOpen(false);
      setNewDisplayName('');
      setNewPhone('');
      setNewUsername('');
      setNewAbout('Hey there! I am using WhatChat.');
      showToast('Contact added successfully!');
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Failed to save contact.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Quick Add from Discover list
  const handleQuickAdd = async (targetUser: { id: string; fullName: string; username?: string; about?: string }) => {
    try {
      await addContact({
        displayName: targetUser.fullName,
        username: targetUser.username,
        contactUserId: targetUser.id,
        about: targetUser.about || 'Hey there! I am using WhatChat.',
      });
      setAddedUserIds((prev) => new Set([...prev, targetUser.id]));
      showToast(`Added ${targetUser.fullName} to contacts`);
    } catch (err) {
      console.error('Failed to add contact:', err);
    }
  };

  // Handle Start Chat with a contact or discovered user
  const handleStartChat = async (targetUserId: string, displayName: string, avatarUrl?: string) => {
    try {
      setStartingChatUserId(targetUserId);
      await startDirectChat(targetUserId, displayName, avatarUrl);
    } catch (err) {
      console.error('Unable to open chat:', err);
    } finally {
      setStartingChatUserId(null);
    }
  };

  // Avatar helper
  const getAvatarColor = (name: string) => {
    const colors = [
      'from-purple-500 to-indigo-600',
      'from-pink-500 to-rose-600',
      'from-blue-500 to-cyan-600',
      'from-emerald-500 to-teal-600',
      'from-amber-500 to-orange-600',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  // 1. IF CONTACTS ARE NOT LINKED WITH DEVICE -> SHOW SECURE LOCKED SCREEN (NO CONTACTS OPEN)
  if (!isDeviceContactsLinked) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center aesthetic-chat-bg p-6 text-center select-none overflow-y-auto">
        <section className="max-w-md w-full bg-white/95 backdrop-blur-md border border-[#ede7f6] rounded-[28px] p-8 md:p-10 shadow-[0_6px_25px_rgba(128,100,181,0.06)] flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-[22px] bg-[#ece2f9] text-[#8064b5] grid place-items-center shadow-xs border border-[#ddcdfa]">
              <Smartphone size={36} />
            </div>
            <span className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-xs border border-[#ede7f6]">
              <Lock size={14} className="text-[#8064b5]" />
            </span>
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-[#111b21] tracking-tight">
            Sync Phone Contacts
          </h1>

          <p className="mt-3 text-xs md:text-sm text-[#777181] leading-relaxed">
            Contacts are only showed on screen when your device contacts are linked with WhatChat. Till then, your contacts are protected and no contacts will be opened.
          </p>

          <div className="mt-6 w-full bg-[#f8f5fc] border border-[#ede7f6] rounded-2xl p-4 text-left space-y-3">
            <div className="flex items-center gap-3 text-xs text-[#292333]">
              <ShieldCheck className="w-4 h-4 text-[#8064b5] shrink-0" />
              <span>Only contacts linked with this device will be visible</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#292333]">
              <Link2 className="w-4 h-4 text-[#8064b5] shrink-0" />
              <span>Finds friends already on WhatChat using E.164 phone matching</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#292333]">
              <Lock className="w-4 h-4 text-[#8064b5] shrink-0" />
              <span>Never sends automated SMS without your explicit choice</span>
            </div>
          </div>

          {syncStatus.message && (
            <div
              className={`mt-4 p-3 rounded-2xl text-xs flex items-center gap-2 w-full text-left ${
                syncStatus.type === 'denied'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : syncStatus.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <div className="flex-1">{syncStatus.message}</div>
            </div>
          )}

          <div className="mt-6 w-full space-y-2">
            <button
              onClick={handleInitiateSync}
              disabled={isSyncing}
              className="btn-aesthetic-primary w-full py-3.5 px-4 text-xs md:text-sm flex items-center justify-center gap-2"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Syncing contacts...</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4" />
                  <span>Sync Phone Contacts</span>
                </>
              )}
            </button>

            {syncStatus.type === 'denied' && (
              <button
                onClick={() => setShowManualSyncModal(true)}
                className="w-full py-2 px-3 text-xs text-[#8064b5] hover:underline font-semibold"
              >
                Or enter/import phone numbers manually
              </button>
            )}
          </div>
        </section>

        {/* Permission Explanation Modal */}
        {showPermissionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 border border-[#eae5f1] shadow-2xl text-left space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-12 h-12 rounded-2xl bg-[#e9ddfb] text-[#8064b5] grid place-items-center">
                <ShieldCheck size={26} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#111b21]">Why WhatChat needs contact access</h3>
                <p className="text-xs text-[#777181] mt-1">
                  We use your contacts to help you connect with friends who are already on WhatChat.
                </p>
              </div>

              <div className="space-y-3 bg-[#f8f5fc] p-4 rounded-2xl border border-[#eae5f1] text-xs text-[#292333]">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>E.164 Matching:</strong> Phone numbers are formatted and matched securely with registered accounts.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Device Privacy:</strong> Your address book is only accessed after your explicit permission.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>No Spam:</strong> We never send SMS messages or contact your friends automatically.
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPermissionModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#716a5b] hover:bg-[#f7f4ec] rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleProceedWithSync}
                  className="btn-aesthetic-primary px-5 py-2.5 text-xs font-semibold"
                >
                  Allow & Sync Contacts
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manual Phone Number Sync Dialog (for desktop or manual vCard import) */}
        {showManualSyncModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 border border-[#eae5f1] shadow-2xl text-left space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#e9ddfb] text-[#8064b5]">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#111b21]">Sync Phone Contacts</h3>
                    <p className="text-[11px] text-[#777181]">
                      Paste phone numbers or upload a contact book export (.vcf)
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowManualSyncModal(false)} className="text-[#8a8494] hover:text-[#111b21]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs text-[#777181] bg-[#f8f5fc] p-3 rounded-xl border border-[#eae5f1]">
                <strong>Browser Note:</strong> The automated Contact Picker API is only available on supported mobile browsers. On desktop, enter or paste contacts below to match registered users.
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#111b21] mb-1">
                    Default Country Code
                  </label>
                  <input
                    type="text"
                    value={defaultCountryCode}
                    onChange={(e) => setDefaultCountryCode(e.target.value)}
                    placeholder="+91"
                    className="w-32 bg-[#f8f5fc] border border-[#eae5f1] rounded-lg px-3 py-1.5 text-xs text-[#111b21] focus:bg-white focus:outline-hidden focus:border-[#8064b5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111b21] mb-1">
                    Paste Contacts or Phone Numbers
                  </label>
                  <textarea
                    rows={4}
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder={`Rahul, +91 98765 43210\nPriya: +919876543211\n+919876543212`}
                    className="w-full bg-[#f8f5fc] border border-[#eae5f1] rounded-xl p-3 text-xs text-[#111b21] focus:bg-white focus:outline-hidden focus:border-[#8064b5]"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-[#eae5f1] pt-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={vcfInputRef}
                      onChange={handleVcfUpload}
                      accept=".vcf,text/vcard"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => vcfInputRef.current?.click()}
                      className="btn-aesthetic-soft flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold"
                    >
                      <FileUp className="w-3.5 h-3.5" />
                      <span>Import .VCF file</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowManualSyncModal(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-[#716a5b] hover:bg-[#f7f4ec] rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePerformManualSync(parseManualContacts(manualText, defaultCountryCode))}
                      disabled={isSyncing || !manualText.trim()}
                      className="btn-aesthetic-primary px-5 py-2.5 text-xs font-semibold"
                    >
                      {isSyncing ? 'Matching...' : 'Sync & Match'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }

  // 2. CONTACTS ARE LINKED WITH DEVICE -> SHOW CONTACTS ON SCREEN
  return (
    <main className="flex-1 flex flex-col h-full bg-[#f8f5fc] overflow-hidden relative">
      {/* Toast message popup */}
      {toastMessage && (
        <div className="absolute top-4 right-4 z-50 bg-[#111b21] text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#ede7f6] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10 shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#111b21]">Contacts</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f1ebfa] text-[#8064b5] border border-[#ede7f6]">
              {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'}
            </span>
          </div>
          <p className="text-xs text-[#777181] mt-0.5">
            Contacts synchronized with this device.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Tabs */}
          <div className="flex items-center bg-[#f8f5fc] p-1 rounded-[16px] border border-[#eae5f1]">
            <button
              onClick={() => setActiveTab('contacts')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-[12px] transition-all ${
                activeTab === 'contacts'
                  ? 'bg-[#8064b5] text-white shadow-2xs font-semibold'
                  : 'text-[#777181] hover:text-[#8064b5]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>WhatChat Contacts</span>
            </button>
            <button
              onClick={() => setActiveTab('unregistered')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-[12px] transition-all ${
                activeTab === 'unregistered'
                  ? 'bg-[#8064b5] text-white shadow-2xs font-semibold'
                  : 'text-[#777181] hover:text-[#8064b5]'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Invite Friends ({unregisteredList.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-[12px] transition-all ${
                activeTab === 'discover'
                  ? 'bg-[#8064b5] text-white shadow-2xs font-semibold'
                  : 'text-[#777181] hover:text-[#8064b5]'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Directory</span>
            </button>
          </div>

          {/* Sync / Refresh Contacts Button (Aesthetic Purple Squircle) */}
          <button
            onClick={handleInitiateSync}
            disabled={isSyncing}
            className="btn-aesthetic-primary flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold"
            title="Sync Phone Contacts"
          >
            {isSyncing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span>Sync Contacts</span>
          </button>

          {/* Add Contact Button (Aesthetic Purple Squircle) */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-aesthetic-primary flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Device Linked Status Banner */}
          <div className="flex items-center justify-between bg-white border border-[#eae5f1] rounded-2xl p-3.5 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#111b21] flex items-center gap-1.5">
                  <span>Linked with this device</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </p>
                <p className="text-[11px] text-[#777181]">
                  Contacts are synchronized and displayed using E.164 international standard matching.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleInitiateSync}
                className="btn-aesthetic-primary px-3 py-1.5 text-xs font-semibold"
              >
                Resync
              </button>
              <button
                onClick={unlinkDeviceContacts}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] bg-[#fce5da] text-[#9e4726] hover:bg-[#f8d5c4] text-xs font-semibold transition-all active:scale-95"
                title="Unlink device contacts and close contacts screen"
              >
                <Unlink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Unlink Device</span>
              </button>
            </div>
          </div>

          {/* Sync notification message banner if present */}
          {syncStatus.message && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center justify-between gap-2 shadow-2xs ${
                syncStatus.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{syncStatus.message}</span>
              </div>
              <button
                onClick={() => setSyncStatus({ type: null, message: '' })}
                className="text-gray-500 hover:text-black p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* TAB 1: REGISTERED WHATCHAT CONTACTS */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#8a8494] absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search contacts by name, username or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#eae5f1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#111b21] placeholder-[#8a8494] focus:outline-hidden focus:border-[#8064b5] shadow-2xs transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-3 text-[#8a8494] hover:text-[#111b21]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Contacts List or Empty State */}
              {filteredContacts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#eae5f1] p-10 text-center shadow-xs">
                  <div className="w-16 h-16 rounded-2xl bg-[#e9ddfb] text-[#8064b5] grid place-items-center mx-auto mb-4">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-semibold text-[#111b21]">
                    {searchQuery ? 'No contacts match your search' : 'No contacts found'}
                  </h3>
                  <p className="text-sm text-[#777181] mt-1 max-w-sm mx-auto">
                    {searchQuery
                      ? 'Try another search query.'
                      : 'Sync your phone contacts or add a contact manually to chat with people on WhatChat.'}
                  </p>
                  <div className="flex items-center justify-center gap-3 mt-6">
                    <button
                      onClick={handleInitiateSync}
                      className="px-4 py-2 rounded-xl bg-[#8064b5] hover:bg-[#6e53a2] text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      Sync Phone Contacts
                    </button>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-[#f8f5fc] hover:bg-[#eae5f1] text-[#8064b5] text-xs font-semibold transition-colors"
                    >
                      Add Contact
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="bg-white rounded-xl border border-[#eae5f1] p-4 flex items-center justify-between gap-3 shadow-xs hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Avatar (Aesthetic Squircle in Purple) */}
                        <div className="relative shrink-0">
                          {contact.avatarUrl ? (
                            <img
                              src={contact.avatarUrl}
                              alt={contact.displayName}
                              className="w-12 h-12 rounded-[16px] object-cover border border-[#ede7f6] shadow-2xs"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-[16px] bg-[#ece2f9] text-[#7050a6] font-bold flex items-center justify-center text-sm shadow-2xs border border-[#ddcdfa]">
                              {contact.displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#8064b5] rounded-full border-2 border-white shadow-2xs" />
                        </div>

                        {/* Info */}
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-[#111b21] truncate">
                            {contact.displayName}
                          </h4>
                          {contact.phoneNumber && (
                            <p className="text-xs text-[#777181] truncate">
                              {formatDisplayPhone(contact.phoneNumber)}
                            </p>
                          )}
                          {contact.username && (
                            <p className="text-[11px] text-[#8064b5] font-medium truncate">
                              @{contact.username}
                            </p>
                          )}
                          <p className="text-[11px] text-[#777181] truncate mt-0.5">
                            {contact.about || 'Hey there! I am using WhatChat.'}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() =>
                            handleStartChat(
                              contact.contactUserId || contact.id,
                              contact.displayName,
                              contact.avatarUrl
                            )
                          }
                          disabled={startingChatUserId === (contact.contactUserId || contact.id)}
                          className="btn-aesthetic-primary flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold"
                          title="Message this contact"
                        >
                          {startingChatUserId === (contact.contactUserId || contact.id) ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <MessageSquare className="w-3.5 h-3.5" />
                          )}
                          <span>Chat</span>
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Delete ${contact.displayName} from contacts?`)) {
                              removeContact(contact.id);
                              showToast('Contact deleted');
                            }
                          }}
                          className="p-1.5 rounded-lg text-[#8a8494] hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-70 group-hover:opacity-100"
                          title="Remove contact"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UNREGISTERED CONTACTS (INVITE TO WHATCHAT) */}
          {activeTab === 'unregistered' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#eae5f1] rounded-2xl p-4 flex items-center justify-between gap-3 shadow-2xs">
                <div>
                  <h3 className="text-sm font-bold text-[#111b21]">Invite Friends to WhatChat</h3>
                  <p className="text-xs text-[#777181] mt-0.5">
                    These contacts from your device address book are not yet registered on WhatChat. Share an invite link with them.
                  </p>
                </div>
                <button
                  onClick={() => handleInviteContact({ name: 'Friends', phoneNumber: '', isRegistered: false })}
                  className="btn-aesthetic-primary flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Link</span>
                </button>
              </div>

              {filteredUnregistered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#eae5f1] p-10 text-center shadow-xs">
                  <Share2 className="w-10 h-10 text-[#8a8494] mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-[#111b21]">No unregistered contacts</h3>
                  <p className="text-sm text-[#777181] mt-1 max-w-sm mx-auto">
                    When you sync your phone contacts, any contacts who haven't joined WhatChat will appear here so you can invite them.
                  </p>
                  <button
                    onClick={handleInitiateSync}
                    className="btn-aesthetic-primary mt-5 px-4 py-2 text-xs font-semibold"
                  >
                    Sync Phone Contacts Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredUnregistered.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-xl border border-[#eae5f1] p-3.5 flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-[14px] bg-[#f1ebfa] text-[#8064b5] font-bold flex items-center justify-center text-xs shrink-0 border border-[#ede7f6] shadow-2xs">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#111b21] truncate">{item.name}</p>
                          <p className="text-[11px] text-[#777181] truncate">
                            {formatDisplayPhone(item.phoneNumber)}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleInviteContact(item)}
                        className="btn-aesthetic-primary flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold shrink-0"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Invite</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REGISTERED USERS DIRECTORY */}
          {activeTab === 'discover' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#8a8494] absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search registered WhatChat users by name or username..."
                  value={discoverQuery}
                  onChange={(e) => setDiscoverQuery(e.target.value)}
                  className="w-full bg-white border border-[#eae5f1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#111b21] placeholder-[#8a8494] focus:outline-hidden focus:border-[#8064b5] shadow-2xs transition-all"
                />
                {isSearchingUsers && (
                  <Loader2 className="w-4 h-4 text-[#8064b5] animate-spin absolute right-3.5 top-3" />
                )}
              </div>

              {/* Directory list */}
              {discoveredUsers.length === 0 && !isSearchingUsers ? (
                <div className="bg-white rounded-2xl border border-[#eae5f1] p-10 text-center shadow-xs">
                  <Globe className="w-10 h-10 text-[#8a8494] mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-[#111b21]">No users found</h3>
                  <p className="text-sm text-[#777181] mt-1">
                    Try searching with another name or username.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {discoveredUsers.map((person) => {
                    const isAlreadyContact =
                      contacts.some(
                        (c) => c.contactUserId === person.id || (person.username && c.username === person.username)
                      ) || addedUserIds.has(person.id);

                    return (
                      <div
                        key={person.id}
                        className="bg-white rounded-xl border border-[#eae5f1] p-4 flex items-center justify-between gap-3 shadow-xs hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className={`w-12 h-12 rounded-full bg-gradient-to-tr ${getAvatarColor(
                              person.fullName
                            )} text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0`}
                          >
                            {person.fullName.charAt(0).toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-[#111b21] truncate">
                              {person.fullName}
                            </h4>
                            {person.username && (
                              <p className="text-xs text-[#8064b5] font-medium truncate">
                                @{person.username}
                              </p>
                            )}
                            <p className="text-xs text-[#777181] truncate mt-0.5">
                              {person.about || 'Hey there! I am using WhatChat.'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isAlreadyContact ? (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                              <Check className="w-3 h-3" />
                              <span>Linked</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleQuickAdd(person)}
                              className="p-1.5 rounded-lg bg-[#f8f5fc] hover:bg-[#eae5f1] text-[#8064b5] text-xs font-medium transition-colors"
                              title="Link to device contacts"
                            >
                              <UserPlus className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleStartChat(person.id, person.fullName)}
                            disabled={startingChatUserId === person.id}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#8064b5] hover:bg-[#6e53a2] text-white text-xs font-semibold shadow-2xs transition-colors"
                            title="Start chat"
                          >
                            {startingChatUserId === person.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <MessageSquare className="w-3.5 h-3.5" />
                            )}
                            <span>Chat</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Permission Explainer Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 border border-[#eae5f1] shadow-2xl text-left space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-[#e9ddfb] text-[#8064b5] grid place-items-center">
              <ShieldCheck size={26} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#111b21]">Why WhatChat needs contact access</h3>
              <p className="text-xs text-[#777181] mt-1">
                We use your contacts to help you find friends who are already on WhatChat.
              </p>
            </div>

            <div className="space-y-3 bg-[#f8f5fc] p-4 rounded-2xl border border-[#eae5f1] text-xs text-[#292333]">
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>E.164 Matching:</strong> Phone numbers are normalized and matched securely with registered accounts.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Device Privacy:</strong> Your address book is only accessed after your explicit permission.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>No Spam:</strong> We never send automated SMS or share your contacts with anyone.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowPermissionModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#777181] hover:bg-[#f8f5fc] rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProceedWithSync}
                className="px-5 py-2.5 text-xs font-semibold bg-[#8064b5] hover:bg-[#6e53a2] text-white rounded-xl shadow-xs transition-colors"
              >
                Allow & Sync Contacts
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Phone Number Sync Dialog (for desktop or vCard import) */}
      {showManualSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 border border-[#eae5f1] shadow-2xl text-left space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#e9ddfb] text-[#8064b5]">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111b21]">Sync Phone Contacts</h3>
                  <p className="text-[11px] text-[#777181]">
                    Paste phone numbers or upload a contact book (.vcf)
                  </p>
                </div>
              </div>
              <button onClick={() => setShowManualSyncModal(false)} className="text-[#8a8494] hover:text-[#111b21]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-[#777181] bg-[#f8f5fc] p-3 rounded-xl border border-[#eae5f1]">
              <strong>Browser Note:</strong> The automated Contact Picker API is only available on supported mobile browsers. On desktop, enter or paste contacts below to match registered users.
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#111b21] mb-1">
                  Default Country Code
                </label>
                <input
                  type="text"
                  value={defaultCountryCode}
                  onChange={(e) => setDefaultCountryCode(e.target.value)}
                  placeholder="+91"
                  className="w-32 bg-[#f8f5fc] border border-[#eae5f1] rounded-lg px-3 py-1.5 text-xs text-[#111b21] focus:bg-white focus:outline-hidden focus:border-[#8064b5]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111b21] mb-1">
                  Paste Contacts or Phone Numbers
                </label>
                <textarea
                  rows={4}
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder={`Rahul, +91 98765 43210\nPriya: +919876543211\n+919876543212`}
                  className="w-full bg-[#f8f5fc] border border-[#eae5f1] rounded-xl p-3 text-xs text-[#111b21] focus:bg-white focus:outline-hidden focus:border-[#8064b5]"
                />
              </div>

              <div className="flex items-center justify-between border-t border-[#eae5f1] pt-3">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={vcfInputRef}
                    onChange={handleVcfUpload}
                    accept=".vcf,text/vcard"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => vcfInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#8064b5] bg-[#f8f5fc] hover:bg-[#eae5f1] rounded-lg transition-colors"
                  >
                    <FileUp className="w-3.5 h-3.5" />
                    <span>Import .VCF file</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowManualSyncModal(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-[#777181] hover:bg-[#f8f5fc] rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePerformManualSync(parseManualContacts(manualText, defaultCountryCode))}
                    disabled={isSyncing || !manualText.trim()}
                    className="px-4 py-2 text-xs font-semibold bg-[#8064b5] hover:bg-[#6e53a2] text-white rounded-xl shadow-xs disabled:opacity-50 transition-colors"
                  >
                    {isSyncing ? 'Matching...' : 'Sync & Match'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Single Contact Modal Dialog */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#eae5f1] shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between p-4 border-b border-[#eae5f1]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#e9ddfb] text-[#8064b5]">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#111b21]">Add New Contact</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#8a8494] hover:text-[#111b21] p-1 rounded-lg hover:bg-[#f8f5fc]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddContactSubmit} className="p-5 space-y-4">
              {modalError && (
                <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#111b21] mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  className="w-full bg-[#f8f5fc] border border-[#eae5f1] rounded-lg px-3 py-2 text-xs text-[#111b21] focus:bg-white focus:outline-hidden focus:border-[#8064b5] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111b21] mb-1">
                  Phone Number <span className="text-gray-400 font-normal">(e.g. +91 98765 43210)</span>
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-[#f8f5fc] border border-[#eae5f1] rounded-lg px-3 py-2 text-xs text-[#111b21] focus:bg-white focus:outline-hidden focus:border-[#8064b5] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111b21] mb-1">
                  Username <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. sarahj"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-[#f8f5fc] border border-[#eae5f1] rounded-lg px-3 py-2 text-xs text-[#111b21] focus:bg-white focus:outline-hidden focus:border-[#8064b5] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111b21] mb-1">
                  About / Status Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hey there! I am using WhatChat."
                  value={newAbout}
                  onChange={(e) => setNewAbout(e.target.value)}
                  className="w-full bg-[#f8f5fc] border border-[#eae5f1] rounded-lg px-3 py-2 text-xs text-[#111b21] focus:bg-white focus:outline-hidden focus:border-[#8064b5] transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eae5f1]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#667781] hover:bg-[#f8f5fc]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#8064b5] hover:bg-[#6e53a2] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Save Contact</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
