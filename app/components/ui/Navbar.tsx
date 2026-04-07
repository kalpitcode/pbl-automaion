import Link from 'next/link';
import React from 'react';

export function Navbar() {
  return (
    <nav className="px-10 py-6 flex flex-col md:flex-row justify-between items-center w-full bg-[var(--background)]">
      <Link href="/" className="font-serif text-2xl font-bold text-[#8B5A33] hover:opacity-80 transition-opacity">
        PBL Portal
      </Link>
      <div className="flex gap-6 items-center text-xs font-bold tracking-widest text-[#777] uppercase mt-4 md:mt-0">
        <Link href="/" className="hover:text-[#A06B40] transition-colors">Login</Link>
        <Link href="/student-signup" className="hover:text-[#A06B40] transition-colors">Student Signup</Link>
        <Link href="/supervisor-signup" className="hover:text-[#A06B40] transition-colors">Supervisor Signup</Link>
      </div>
    </nav>
  );
}
