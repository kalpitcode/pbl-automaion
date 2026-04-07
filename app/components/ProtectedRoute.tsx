"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMeAPI } from '../lib/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user } = await getMeAPI();
        if (allowedRoles && !allowedRoles.includes(user.role)) {
          router.push('/dashboard');
        } else {
          setIsAuthorized(true);
        }
      } catch (err) {
        // fetchWithAuth will automatically redirect to '/' on 401
      }
    };
    checkAuth();
  }, [router, allowedRoles]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex text-center justify-center items-center font-serif text-[#A06B40] text-xl bg-[var(--background)]">
        Verifying session...
      </div>
    );
  }

  return <>{children}</>;
}
