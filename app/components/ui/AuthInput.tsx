import React, { InputHTMLAttributes } from 'react';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  rightElement?: React.ReactNode;
}

export function AuthInput({ label, rightElement, ...props }: AuthInputProps) {
  return (
    <div className="flex flex-col gap-2 mb-6 w-full">
      <div className="flex justify-between items-center text-[0.65rem] font-bold tracking-widest text-[#888888] uppercase">
        <label htmlFor={props.id}>{label}</label>
        {rightElement && <span>{rightElement}</span>}
      </div>
      <input
        {...props}
        className={`w-full pb-2 text-sm text-[var(--foreground)] border-b border-[#cccccc] focus:outline-none focus:border-[var(--primary)] transition-colors bg-transparent placeholder-[#cccccc] ${props.className || ''}`}
      />
    </div>
  );
}
