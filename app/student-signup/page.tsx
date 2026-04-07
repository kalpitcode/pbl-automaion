"use client";
import React, { useState } from 'react';
import { AuthCard } from '../components/ui/AuthCard';
import { AuthInput } from '../components/ui/AuthInput';
import { AuthButton } from '../components/ui/AuthButton';
import { studentSignupAPI } from '../lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '../components/ui/Navbar';

export default function StudentSignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      const res = await studentSignupAPI({ name, email, password });
      if (res && res.token) {
        localStorage.setItem('token', res.token);
      }
      router.push('/dashboard/student');
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
      <main className="flex-1 flex flex-col justify-center items-center px-4 w-full h-full pb-10 mt-6 md:mt-0">
        <AuthCard>
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-[#f4ece3] rounded flex items-center justify-center text-[#A06B40]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 0 0 4.25 22.5h15.5a1.875 1.875 0 0 0 1.865-2.071l-1.263-12a1.875 1.875 0 0 0-1.865-1.679H16.5V6a4.5 4.5 0 1 0-9 0ZM12 3a3 3 0 0 0-3 3v.75h6V6a3 3 0 0 0-3-3Zm-3 8.25a3 3 0 1 0 6 0v-.75a.75.75 0 0 1 1.5 0v.75a4.5 4.5 0 1 1-9 0v-.75a.75.75 0 0 1 1.5 0v.75Z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h2 className="font-serif text-[1.75rem] text-center text-[var(--foreground)] mb-2 tracking-tight">Student Registration</h2>
          <p className="text-center text-gray-500 mb-10 text-[15px]">Join your project workspace and track weekly progress.</p>

          <form onSubmit={handleSignup} className="flex flex-col w-full">
            <AuthInput 
              id="name"
              label="Full Name" 
              placeholder="e.g., Julian Thorne" 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <AuthInput 
              id="email"
              label="Institutional Email (College Email)" 
              placeholder="j.thorne@university.edu" 
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
                  label="Confirm Password" 
                  placeholder="••••••••" 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            {error && <p className="text-red-500 text-xs text-center mb-4">{error}</p>}

            <AuthButton type="submit" isLoading={isLoading} className="mt-2 text-sm px-6">
              Create Student Account
            </AuthButton>
          </form>

          <div className="mt-10 flex flex-col justify-center items-center gap-4 text-[11px] font-bold tracking-widest text-[#999] pt-2">
            <div>
              Already registered? <Link href="/" className="text-[#A06B40] hover:underline transition-colors uppercase ml-1">Login</Link>
            </div>
            <div className="text-[8px] text-[#ddd]">●</div>
            <div className="uppercase">
              Educator access? <Link href="/supervisor-signup" className="text-[#A06B40] hover:underline transition-colors ml-1">Supervisor Signup</Link>
            </div>
          </div>
        </AuthCard>
      </main>
      
      {/* Footer */}
      <footer className="w-full bg-[#EAE5DF] text-[10px] font-bold tracking-widest text-[#666] uppercase px-10 py-10 flex justify-center items-center text-center">
        <div className="flex flex-wrap justify-center gap-8">
            <a href="#" className="hover:text-gray-900 border-b border-[#aaa] transition-colors pb-0.5">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900 border-b border-[#aaa] transition-colors pb-0.5">Terms of Service</a>
            <a href="#" className="hover:text-gray-900 border-b border-[#aaa] transition-colors pb-0.5">Institutional Access</a>
            <a href="#" className="hover:text-gray-900 border-b border-[#aaa] transition-colors pb-0.5">Contact Support</a>
        </div>
      </footer>
    </div>
  );
}
