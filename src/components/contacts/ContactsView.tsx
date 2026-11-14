import { Users } from 'lucide-react';

export function ContactsView() {
  return (
    <main className="flex-1 grid place-items-center overflow-y-auto bg-[#f8f5fc] p-6">
      <section className="max-w-sm text-center">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[#e9ddfb] text-[#8064b5]">
          <Users size={25} />
        </div>
        <h1 className="text-xl font-semibold text-[#292333]">Contacts</h1>
        <p className="mt-2 text-sm leading-6 text-[#777181]">Find people and start a conversation.</p>
        <p className="mt-3 text-xs leading-5 text-[#9994a1]">Contact discovery will be available when the WhatChat contacts service is connected.</p>
      </section>
    </main>
  );
}
