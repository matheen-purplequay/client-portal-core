import { useEffect, useState } from 'react';
import { useEngagementVerticalContext } from "../../core/utils/stores/EngagementVerticalContext";
import type { EngagementVertical } from "../../core/models/vertical";
import { OBSJobTable } from './pages/job-list/bs-job-table/bs-job-table';
import { BKJobTable } from './pages/job-list/bk-job-table/bk-job-table';
import { SMSFJobTable } from './pages/job-list/smsf-job-table/smsf-job-table';
import { FPJobTable } from './pages/job-list/fp-job-table/fp-job-table';
import { Blocks, Calculator, Cog, Construction, Wrench } from 'lucide-react';
import { ReportsView } from './pages/reports-view/reports-view';
import { LodgementView } from './pages/lodgement-view/lodgement-view';

export const MovementHome = () => {
    const [isVerticalLoading, setIsVerticalLoading] = useState(true);
    const [isVerticalLoaded, setIsVerticalLoaded] = useState(false);
    const [isRefreshed, setIsRefreshed] = useState(false);
    const [vertical, setVertical] = useState<EngagementVertical>(
        {
            id: 0,
            service_id: 0,
            engagement_id: 0,
            title: "",
            code: "",
            wm_vertical_id: 0,
            new_service_id: 0,
        }
    );
    const verticalContext = useEngagementVerticalContext();


    useEffect(() => {
        setVertical(verticalContext?.vertical ?? { id: 0, service_id: -1, engagement_id: -1, title: "", code: "", wm_vertical_id: -1, new_service_id: 0 });
        setIsVerticalLoading(false);
        if (vertical.id === -1) return;
    }, [verticalContext]);

    useEffect(() => {
        setIsVerticalLoaded(true);
        if (vertical.id === 0) return;
    }, [vertical]);

    useEffect(() => {
        const timer = setTimeout(() => setIsRefreshed(false), 7000);
        return () => clearTimeout(timer);
    }, [isRefreshed]);

    const { activeView } = useEngagementVerticalContext() || {};

    return (
        <>
            {isVerticalLoading &&
                <div className='flex items-center justify-center p-8 text-slate-700'>Loading dashboard...</div>
            }
            {!isVerticalLoading && isVerticalLoaded && (
                <div className="space-y-4">

                    {/* ====== LIVE DATA VIEW ====== */}
                    {activeView === 'live-data' && (
                        <div>
                            <div className={`${vertical?.wm_vertical_id === 1 ? "block" : "hidden"}`}><OBSJobTable /></div>
                            <div className={`${vertical?.wm_vertical_id === 2 ? "block" : "hidden"}`}><SMSFJobTable /></div>
                            <div className={`${vertical?.wm_vertical_id === 5 ? "block" : "hidden"}`}><FPJobTable /></div>
                            <div className={`${vertical?.wm_vertical_id === 6 ? "block" : "hidden"}`}><BKJobTable /></div>
                            <div className={`${isVerticalLoaded && vertical.new_service_id === 16 ? "block" : "hidden"}`}>
                                <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center gap-4 min-h-[50vh] bg-gradient-to-b from-slate-50 to-white to-80% border shadow-inner border-slate-200 m-4 rounded-lg">
                                    <div className="flex items-end gap-6 drop-shadow-2xl">
                                        <Calculator size={42} strokeWidth={0.5} />
                                        <Wrench size={42} strokeWidth={0.5} />
                                        <Construction size={58} strokeWidth={0.5} />
                                        <Cog size={42} strokeWidth={0.5} />
                                        <Blocks size={42} strokeWidth={0.5} />
                                    </div>
                                    <div className='px-6 py-3'>
                                        <div className='text-lg'>Dashboard under development</div>
                                        <div className='text-sm'>We will ensure you are notified as soon as the latest enhancements and updates are officially released.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ====== REPORTS VIEW ====== */}
                    {activeView === 'reports' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <ReportsView />
                        </div>
                    )}

                    {activeView === 'lodgement' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <LodgementView />
                        </div>
                    )}
                </div>
            )}
        </>
    );
};