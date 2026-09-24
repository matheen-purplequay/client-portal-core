import React from "react";
import type { EngagementVertical } from "../../../../core/models/vertical";
import { useEngagementVerticalContext } from "../../../../core/utils/stores/EngagementVerticalContext";

// The vertical list is fetched once in EngagementVerticalProvider and
// shared via context — this panel used to fetch it itself, which meant
// every job-table tab that renders one (BS/BK/FP/SMSF) fired its own
// redundant /client/get-verticals call on mount.
export default function QuickLinksPanel() {
    const engagementVerticalContext = useEngagementVerticalContext();
    const engagementVerticals = engagementVerticalContext.verticals;
    const selectedVertical = engagementVerticalContext.vertical ?? null;

    const handleSetVertical = (vertical: EngagementVertical) => {
        if(vertical) {
            engagementVerticalContext?.setVertical?.(vertical);
        }
    }

    return (
        <div className="flex items-center justify-end gap-6">
            {engagementVerticals && engagementVerticals.length > 0 && (
                <div className="flex items-center">
                    { engagementVerticals.map((vertical: EngagementVertical, index: number) => (
                        <React.Fragment key={index}>
                            <div
                                className={`
                                    hover:text-secondary cursor-pointer group/buttonDashboard
                                    border border-slate-400 first:rounded-l-lg last:rounded-r-lg transition-all duration-100
                                    ${vertical.id == selectedVertical?.id ? 'bg-slate-200 text-secondary shadow-inner shadow-slate-400 border-t-3' : 'bg-gradient-to-b from-white via-slate-100 to-slate-200 from-70% via-90% text-secondary shadow-xl border-b-3'}
                                `}
                                onClick={() => handleSetVertical(vertical)}
                            >
                                <div className="px-3 py-1 flex gap-1 items-center h-full whitespace-nowrap">
                                    <div className={`text-sm`}>{vertical.title}</div>
                                </div>
                            </div>
                        </React.Fragment>
                    )) }
                </div>
            )}
        </div>
    );
}