import React from 'react';

export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white px-8 py-10 shadow-sm border border-gray-100 max-w-md w-full rounded-sm">
      {children}
    </div>
  );
}
