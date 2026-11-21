import React from 'react';

export type AdPlacementZone =
  | 'post-intro'
  | 'post-results'
  | 'mid-editorial'
  | 'pre-related'
  | 'sidebar-rectangle';

interface Props {
  format?: 'leaderboard' | 'rectangle' | 'in-feed' | 'responsive';
  placement?: AdPlacementZone;
  className?: string;
  slotId?: string;
}

const ENV_SLOT_MAP: Record<AdPlacementZone, string | undefined> = {
  'post-intro': import.meta.env.VITE_ADSENSE_SLOT_POST_INTRO,
  'post-results': import.meta.env.VITE_ADSENSE_SLOT_POST_RESULTS,
  'mid-editorial': import.meta.env.VITE_ADSENSE_SLOT_MID_EDITORIAL,
  'pre-related': import.meta.env.VITE_ADSENSE_SLOT_PRE_RELATED,
  'sidebar-rectangle': import.meta.env.VITE_ADSENSE_SLOT_SIDEBAR,
};

export const AdSlot: React.FC<Props> = ({
  format = 'responsive',
  placement = 'post-results',
  className = '',
  slotId,
}) => {
  const adsenseClient = import.meta.env.VITE_ADSENSE_CLIENT?.trim();
  const resolvedSlotId = (slotId ?? ENV_SLOT_MAP[placement])?.trim();

  // Only render active ad units when both publisher client ID and explicit zone slot ID are configured
  if (!adsenseClient || !resolvedSlotId) {
    return null;
  }

  return (
    <aside
      data-ad-placement={placement}
      className={`my-10 mx-auto flex flex-col items-center justify-center overflow-hidden border border-slate-200/70 dark:border-slate-800/70 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 py-3 px-4 ${className}`}
      aria-label="Advertisement"
    >
      <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold mb-2 select-none">
        Advertisement
      </span>
      <div
        className={
          format === 'leaderboard'
            ? 'w-full max-w-[728px] min-h-[90px] flex items-center justify-center'
            : format === 'rectangle'
              ? 'w-full max-w-[336px] min-h-[250px] flex items-center justify-center'
              : 'w-full min-h-[90px] flex items-center justify-center'
        }
      >
        <ins
          className="adsbygoogle block"
          style={{ display: 'block' }}
          data-ad-client={adsenseClient}
          data-ad-slot={resolvedSlotId}
          data-ad-format={format === 'responsive' ? 'auto' : undefined}
          data-full-width-responsive={format === 'responsive' ? 'true' : undefined}
        />
      </div>
    </aside>
  );
};
