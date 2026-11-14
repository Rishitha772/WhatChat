import { MessageSquare } from 'lucide-react';

export function ChatView() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center bg-[#f8f5fc] p-8 text-center">
      <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-[#e9ddfb] text-[#8064b5]">
        <MessageSquare size={28} />
      </div>
      <h2 className="text-lg font-semibold text-[#292333]">Your conversations will appear here.</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[#777181]">
        Conversations and messages will be available when the WhatChat messaging API is connected.
      </p>
    </section>
  );
}
