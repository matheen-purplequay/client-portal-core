import StatGridCard from "../components/stat-grid-card";
import { LoaderCircle } from "lucide-react";
import type { JobTitle, StatusCount } from "../../../../core/models/movement";
import { filterStatusCountByLegend, type LegendFilter } from "../../../movement-home/helpers/legend-filter";

interface ProgressPanelPros {
    setSelectedTitle: (jobTitle: JobTitle | null) => void;
    selectedTitle: JobTitle | null;
    statusCount: StatusCount[];
    isRefreshing?: boolean;
    containerClassName?: string;
    hideIfNoValue?: boolean;
    legendFilter?: LegendFilter;
}

// Mirrors the Legends pills exactly (legend-buttons.tsx: bg-yellow-100 for
// the client company, bg-blue-50 for Carisma) and filterStatusCountByLegend
// (legend-filter.ts): each status's job.className already encodes which
// company it "belongs" to — bg-yellow-100 = waiting on the client company,
// bg-green-100 = Job Completed, anything else = with Carisma.
function getStatusColor(className?: string): { bg: string; accent: string; text: string } {
    if (className?.includes('bg-yellow-100')) return { bg: 'bg-yellow-50', accent: 'bg-yellow-400', text: 'text-yellow-800' };
    if (className?.includes('bg-green-100')) return { bg: 'bg-green-50', accent: 'bg-green-500', text: 'text-green-700' };
    return { bg: 'bg-blue-50', accent: 'bg-blue-400', text: 'text-blue-800' };
}

export default function ProgressPanel({ selectedTitle, setSelectedTitle, statusCount, isRefreshing, containerClassName, hideIfNoValue, legendFilter }: ProgressPanelPros) {
    const handleSelectedTitle = (title: JobTitle | null) => {
        if (title && title.id) {
            if (selectedTitle?.id === title.id) {
                setSelectedTitle(null);
            } else {
                setSelectedTitle(title);
            }
        } else {
            setSelectedTitle(null);
        }
    };

    const handleSelectedCount = (status: 0 | -1) => {
        setSelectedTitle({
            id: status,
            key: 'livejobs',
            title: 'Live Jobs',
            titleClass: '',
            valueClass: '',
            className: '',
        });
    };

    return (
        <div className={`flex flex-wrap gap-3 items-stretch ${containerClassName ?? ''}`}>
            {isRefreshing &&
                <StatGridCard
                    title={<div className="flex items-center gap-1"><LoaderCircle size={14} className="animate-spin text-primary" /> Getting</div>}
                    value="Job Statistics"
                    bgColorClass="bg-slate-50"
                    accentColorClass="bg-slate-400"
                    textColorClass="text-slate-700"
                    hideIfNoValue={hideIfNoValue}
                />
            }
            {!isRefreshing &&
                <>
                    {statusCount.length > 0 &&
                        filterStatusCountByLegend(statusCount, legendFilter ?? null).map((job, index) => {
                            const color = getStatusColor(job.className);
                            return (
                                <StatGridCard
                                    key={index}
                                    onClick={() => handleSelectedTitle(job)}
                                    title={job.title}
                                    value={job.value.toString()}
                                    bgColorClass={color.bg}
                                    accentColorClass={color.accent}
                                    textColorClass={color.text}
                                    isSelected={selectedTitle?.id === job.id}
                                    isDisabled={job.id! <= 0}
                                    hideIfNoValue={hideIfNoValue}
                                />
                            );
                        })
                    }
                    {!legendFilter && (
                        <>
                            <StatGridCard
                                title="Total Live Jobs"
                                value={statusCount
                                    .reduce((total, job) => {
                                        // 'jobCompleted'/'cancelled' cover the generic (BS/BK/FP) tables;
                                        // bg-green-100 also excludes SMSF's own "completed" card
                                        // (smsf9 / "9. Moved to Audit"), which uses a different key.
                                        if (job.key === 'jobCompleted' || job.key === 'cancelled' || job.className?.includes('bg-green-100')) return total;
                                        return total + job.value;
                                    }, 0)
                                    .toString()}
                                onClick={() => handleSelectedCount(-1)}
                                isTotal
                                accentColorClass="bg-teal-600"
                                textColorClass="text-teal-700"
                                isSelected={selectedTitle?.id === -1}
                                hideIfNoValue={hideIfNoValue}
                            />
                            <StatGridCard
                                title="Total All Jobs"
                                value={statusCount.reduce((total, job) => total + job.value, 0).toString()}
                                onClick={() => handleSelectedTitle(null)}
                                isTotal
                                accentColorClass="bg-teal-600"
                                textColorClass="text-teal-700"
                                isSelected={selectedTitle?.id === null}
                                hideIfNoValue={hideIfNoValue}
                            />
                        </>
                    )}
                </>
            }
        </div>
    );
}
