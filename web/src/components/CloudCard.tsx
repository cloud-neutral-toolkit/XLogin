'use client';

import AccountRoleSelector, { AccountWithRoles } from './AccountRoleSelector';
import ConsoleButton from './ConsoleButton';
import { ProviderSummary } from '@/lib/api';

export type CloudCardProps = {
  provider: ProviderSummary;
  accounts: AccountWithRoles[];
  selected?: { target: string; roleKey: string };
  onSelectionChange: (target: string, roleKey: string) => void;
  onLaunchConsole: () => void;
  disabled?: boolean;
};

export function CloudCard({
  provider,
  accounts,
  selected,
  onSelectionChange,
  onLaunchConsole,
  disabled,
}: CloudCardProps) {
  const badge = provider.regions?.length ? provider.regions.join(', ') : 'multi-region';

  return (
    <section className="border border-gray-800 rounded-lg p-5 bg-gray-950/60 shadow-lg space-y-4">
      <header className="flex justify-between items-start gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-indigo-300">{badge}</p>
          <h2 className="text-xl font-semibold text-white">{provider.name}</h2>
          {provider.description ? (
            <p className="text-gray-400 text-sm mt-1">{provider.description}</p>
          ) : null}
        </div>
        <span className="px-3 py-1 rounded-full text-xs bg-indigo-500/20 text-indigo-200 border border-indigo-500/40">
          {provider.id}
        </span>
      </header>

      <AccountRoleSelector
        accounts={accounts}
        selectedTarget={selected?.target}
        selectedRoleKey={selected?.roleKey}
        onSelectionChange={onSelectionChange}
      />

      <div className="flex justify-between items-center">
        {provider.consoleUrlExample ? (
          <p className="text-xs text-gray-500">Example URL: {provider.consoleUrlExample}</p>
        ) : (
          <p className="text-xs text-gray-500">Generate a short-lived console URL for this provider.</p>
        )}
        <ConsoleButton disabled={disabled} onClick={onLaunchConsole}>
          Launch console
        </ConsoleButton>
      </div>
    </section>
  );
}

export default CloudCard;
