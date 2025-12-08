'use client';

import { useMemo } from 'react';
import { AllowedRole } from '@/lib/api';

export type AccountWithRoles = {
  target: string;
  roles: AllowedRole[];
};

export type AccountRoleSelectorProps = {
  accounts: AccountWithRoles[];
  selectedTarget?: string;
  selectedRoleKey?: string;
  onSelectionChange: (target: string, roleKey: string) => void;
};

const optionLabel = (role: AllowedRole) => role.roleName ?? role.roleKey;

export function AccountRoleSelector({
  accounts,
  selectedTarget,
  selectedRoleKey,
  onSelectionChange,
}: AccountRoleSelectorProps) {
  if (accounts.length === 0) {
    return <p className="text-sm text-gray-500">No account mappings were returned.</p>;
  }

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.target === selectedTarget) ?? accounts[0],
    [accounts, selectedTarget],
  );

  const activeTarget = selectedAccount?.target ?? '';
  const activeRoleKey = selectedRoleKey ?? selectedAccount?.roles[0]?.roleKey ?? '';

  return (
    <div className="flex gap-3 items-end">
      <label className="flex flex-col text-sm text-gray-300">
        Account / Project
        <select
          className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-100"
          value={activeTarget}
          onChange={(event) => {
            const nextAccount = accounts.find((account) => account.target === event.target.value);
            const nextRole = nextAccount?.roles[0]?.roleKey ?? '';
            onSelectionChange(event.target.value, nextRole);
          }}
        >
          {accounts.map((account) => (
            <option key={account.target} value={account.target}>
              {account.target}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col text-sm text-gray-300">
        Role
        <select
          className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-100"
          value={activeRoleKey}
          onChange={(event) => onSelectionChange(activeTarget, event.target.value)}
        >
          {(selectedAccount?.roles ?? []).map((role) => (
            <option key={`${selectedAccount?.target}-${role.roleKey}`} value={role.roleKey}>
              {optionLabel(role)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export default AccountRoleSelector;
