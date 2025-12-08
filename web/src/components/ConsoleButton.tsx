'use client';

import { PropsWithChildren } from 'react';

export type ConsoleButtonProps = PropsWithChildren<{
  disabled?: boolean;
  onClick?: () => void;
}>;

export function ConsoleButton({ children, disabled, onClick }: ConsoleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
        disabled
          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
          : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow'
      }`}
    >
      {children}
    </button>
  );
}

export default ConsoleButton;
