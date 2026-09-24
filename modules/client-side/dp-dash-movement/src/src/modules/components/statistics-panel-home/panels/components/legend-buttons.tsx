import { decryptData } from "../../../../../core/utils/helpers/localStorage";
import { Button } from "../../../../../shell/components/atoms/buttons";
import type { LegendFilter } from "../../../../movement-home/helpers/legend-filter";
import QuickLinksPanel from "../quick-links-panel";

interface LegendButtonsProps {
    legendFilter?: LegendFilter;
    setLegendFilter?: (legend: LegendFilter) => void;
    // Manager View isn't scoped by legend, so it hides the pills — but
    // QuickLinksPanel (the vertical selector) must stay mounted regardless,
    // or switching views would re-trigger its verticals API call every time.
    showPills?: boolean;
}

export default function LegendButtons({ legendFilter, setLegendFilter, showPills = true }: LegendButtonsProps) {
    const userdata = JSON.parse(decryptData(localStorage.getItem('userdata')));

    return (
        <div className="py-1 flex items-center justify-between gap-4 flex-wrap">
            {showPills ? (
                <div className="flex gap-2 items-center font-medium">
                    <span className="text-xs opacity-80">Legends</span>
                    <Button
                        shape="pill"
                        onClick={() => setLegendFilter?.(null)}
                        className={`bg-stone-50 text-sm shadow ${!legendFilter ? 'ring-2 ring-primary text-primary' : 'text-slate-700'}`}
                    >
                        All Jobs
                    </Button>
                    <Button
                        shape="pill"
                        onClick={() => setLegendFilter?.(legendFilter === 'client' ? null : 'client')}
                        className={`bg-yellow-100 text-sm shadow font-semibold ${legendFilter === 'client' ? 'ring-2 ring-primary text-primary' : 'text-yellow-700'}`}
                    >
                        Jobs with {userdata.company_name}
                    </Button>
                    <Button
                        shape="pill"
                        onClick={() => setLegendFilter?.(legendFilter === 'carisma' ? null : 'carisma')}
                        className={`bg-blue-50 text-sm shadow font-semibold ${legendFilter === 'carisma' ? 'ring-2 ring-primary text-primary' : 'text-blue-800'}`}
                    >
                        Jobs with Carisma
                    </Button>
                </div>
            ) : <div />}
            <QuickLinksPanel />
        </div>
    );
}
