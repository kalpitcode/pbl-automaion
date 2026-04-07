"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMeAPI } from '../lib/api';

export default function DashboardIndex() {
  const router = useRouter();

  useEffect(() => {
    const routeUser = async () => {
      try {
        const { user } = await getMeAPI();
        if (user.role === 'STUDENT') {
          router.push('/dashboard/student');
        } else if (user.role === 'SUPERVISOR') {
          router.push('/dashboard/supervisor');
        }
      } catch (err) {
        // Redirection handled in api.ts fetchWithAuth
      }
    };
    routeUser();
  }, [router]);

  return (
    <div className="min-h-screen flex text-center justify-center items-center font-serif text-[#A06B40] text-xl bg-[var(--background)]">
      Loading workspace...
    </div>
  );
}
