import React from 'react';

interface Props {
  format?: 'leaderboard' | 'rectangle' | 'in-feed' | 'responsive';
  className?: string;
  slotId?: string;
}

export const AdSlot: React.FC<Props> = ({ format = 'responsive', className = '', slotId }) => {
  const adsenseClient = import.meta.env.VITE_ADSENSE_CLIENT?.trim();
  if (!adsenseClient || !slotId) {
    return null;
  }

  return (
    <aside
      className={`my-8 mx-auto flex flex-col items-center justify-center overflow-hidden ${className}`}
      aria-label="Advertisement"
    >
      <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold mb-1.5">
        Advertisement
      </span>
      <div
        className={
          format === 'leaderboard'
            ? 'w-full max-w-[728px] min-h-[90px]'
            : format === 'rectangle'
              ? 'w-full max-w-[336px] min-h-[250px]'
              : 'w-full min-h-[90px]'
        }
      >
        <ins
          className="adsbygoogle block"
          style={{ display: 'block' }}
          data-ad-client={adsenseClient}
          data-ad-slot={slotId}
          data-ad-format={format === 'responsive' ? 'auto' : undefined}
          data-full-width-responsive={format === 'responsive' ? 'true' : undefined}
        />
      </div>
    </aside>
  );
};
