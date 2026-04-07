"use client";
import React, { useState } from 'react';
import { AuthCard } from './components/ui/AuthCard';
import { AuthInput } from './components/ui/AuthInput';
import { AuthButton } from './components/ui/AuthButton';
import { loginAPI } from './lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from './components/ui/Navbar';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const data = await loginAPI({ email, password });
      localStorage.setItem('token', data.token);
      if (data.user?.role === 'STUDENT') {
        router.push('/dashboard/student');
      } else if (data.user?.role === 'SUPERVISOR') {
        router.push('/dashboard/supervisor');
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 w-full h-full pb-10 mt-6">
        <AuthCard>
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-[#efe8df] rounded flex items-center justify-center text-[#A06B40]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h2 className="font-serif text-[1.75rem] text-center text-[var(--foreground)] mb-2 tracking-tight">Project Workspace Access</h2>
          <p className="text-center text-gray-500 mb-10 text-[15px]">Track, Submit, and Evaluate Projects</p>

          <form onSubmit={handleLogin} className="flex flex-col w-full">
            <AuthInput 
              id="email"
              label="College Email" 
              placeholder="researcher@institution.edu" 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <AuthInput 
              id="password"
              label="Access Key" 
              placeholder="••••••••••••" 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              rightElement={<button type="button" className="text-[10px] text-[var(--primary)] hover:underline font-extrabold uppercase tracking-widest">Forgot?</button>}
            />
            
            {error && <p className="text-red-500 text-xs text-center mb-4">{error}</p>}

            <AuthButton type="submit" isLoading={isLoading} className="mt-2 text-sm px-6">
              Access Dashboard
            </AuthButton>
          </form>

          <div className="mt-10 flex justify-center items-center gap-10 text-[11px] font-bold tracking-widest uppercase text-gray-500 border-t border-[#eee] pt-8 pb-2">
            <Link href="/student-signup" className="flex items-center hover:text-[#A06B40] transition-colors leading-tight text-center">
              Student<br/>Signup
            </Link>
            <span className="text-[#ccc] text-[8px]">●</span>
            <Link href="/supervisor-signup" className="flex items-center hover:text-[#A06B40] transition-colors leading-tight text-center">
              Supervisor<br/>Access
            </Link>
          </div>
        </AuthCard>

        <p className="max-w-md w-full text-center text-[#5588a3] italic text-xs mt-10 px-8">
          Note: Authorized personnel only. All access attempts are recorded in accordance with institutional Data Ethics and institutional guidelines.
        </p>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#EAE5DF] text-[10px] font-bold tracking-widest text-[#666] uppercase px-10 py-10 flex justify-center items-center text-center">
        <div className="flex flex-wrap justify-center gap-8">
            <a href="#" className="hover:text-gray-900 transition-colors">Institutional Guidelines</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Data Ethics</a>
        </div>
      </footer>
    </div>
  );
}
