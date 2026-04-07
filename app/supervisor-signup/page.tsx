"use client";
import React, { useState } from 'react';
import { AuthCard } from '../components/ui/AuthCard';
import { AuthInput } from '../components/ui/AuthInput';
import { AuthButton } from '../components/ui/AuthButton';
import { teacherSignupAPI } from '../lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '../components/ui/Navbar';

export default function SupervisorSignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const res = await teacherSignupAPI({ name, email, password, inviteCode });
      if (res && res.token) {
        localStorage.setItem('token', res.token);
      }
      router.push('/dashboard/supervisor');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white md:bg-[var(--background)]">
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 w-full h-full pb-6 mt-10 md:mt-4">
        <AuthCard>
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-[#f4ece3] rounded flex items-center justify-center text-[#A06B40]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h2 className="font-serif text-[1.75rem] text-center text-[var(--foreground)] mb-2 tracking-tight">Supervisor Registration</h2>
          <p className="text-center text-gray-500 mb-10 text-[15px]">Access and evaluate assigned student projects.</p>

          <form onSubmit={handleSignup} className="flex flex-col w-full">
            <AuthInput
              id="name"
              label="Full Name"
              placeholder="Dr. Julian Thorne"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <AuthInput
              id="email"
              label="College Email"
              placeholder="j.thorne@academic-pbl.edu"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="flex gap-6 w-full">
              <div className="flex-1">
                <AuthInput
                  id="password"
                  label="Password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex-1">
                <AuthInput
                  id="confirmPassword"
                  label="Confirm"
                  placeholder="••••••••"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-2">
              <AuthInput
                id="inviteCode"
                label="Supervisor Access Code"
                placeholder="AUTH-XXXX-XXXX"
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                required
                rightElement={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-[var(--primary)] -mt-1">
                    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                  </svg>
                }
              />
              <div className="text-[9px] uppercase tracking-widest text-[#3a6d8c] italic mb-6 -mt-4">Requires institutional verification.</div>
            </div>

            {error && <p className="text-red-500 text-xs text-center mb-4">{error}</p>}

            <AuthButton type="submit" isLoading={isLoading} className="text-sm px-6 mt-0">
              Create Supervisor Account
            </AuthButton>
          </form>

          <div className="mt-10 flex flex-col justify-center items-center gap-4 text-[11px] font-bold tracking-widest text-[#999] pt-2">
            <div>
              Already have access? <Link href="/" className="text-[#A06B40] hover:underline transition-colors uppercase ml-1">Login</Link>
            </div>
            <div className="uppercase tracking-widest text-[10px]">
              Are you a student? <Link href="/student-signup" className="text-[#0e5c70] hover:underline transition-colors font-extrabold ml-1">Student Signup</Link>
            </div>
          </div>
        </AuthCard>
      </main>

      <div className="flex justify-center -mb-4 relative z-10 w-full text-center items-center gap-6 mt-6 md:mt-2">
        <div className="h-px bg-[#e5dfd5] w-12"></div>
        <p className="text-[#A06B40] text-sm font-serif italic text-center">Office of Academic Affairs</p>
        <div className="h-px bg-[#e5dfd5] w-12"></div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-[#EAE5DF] text-[10px] font-bold tracking-widest text-[#666] uppercase px-10 py-10 flex justify-center items-center text-center pb-12 mt-4 md:mt-0">
        <div className="flex flex-wrap justify-center gap-8">
          <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Academic Integrity</a>
        </div>
      </footer>
    </div>
  );
}
