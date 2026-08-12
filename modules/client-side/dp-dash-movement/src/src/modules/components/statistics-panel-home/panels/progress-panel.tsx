import PanelCard from "../components/panel-card";
import PanelContainer from "../components/panel-container";
import { LoaderCircle } from "lucide-react";
import type { JobTitle, StatusCount } from "../../../../core/models/movement";
import { decryptData } from "../../../../core/utils/helpers/localStorage";

interface ProgressPanelPros {
    setSelectedTitle: (jobTitle: JobTitle | null) => void;
    selectedTitle: JobTitle | null;
    statusCount: StatusCount[];
    isRefreshing?: boolean;
    containerClassName?: string;
    hideIfNoValue?: boolean;
}

export default function ProgressPanel({ selectedTitle, setSelectedTitle, statusCount, isRefreshing, containerClassName, hideIfNoValue }: ProgressPanelPros) {
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

    const userdata = JSON.parse(decryptData(localStorage.getItem('userdata')));

    return (
        <div className="leading-none">
            <PanelContainer className={containerClassName}>
                <PanelCard
                    title="Jobs status as of Today"
                    value={new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'numeric', year: 'numeric' })}
                    titleClass="text-slate-700 flex-1"
                    valueClass="text-slate-700 flex flex-col text-sm pl-3"
                    containerClass={`last:border-0 bg-stone-50 flex items-stretch`}
                    className="h-full flex flex-col px-1"
                    hideIfNoValue={hideIfNoValue}
                />
                {isRefreshing &&
                    <PanelCard
                        title={<div className="flex items-center gap-1"><LoaderCircle size={14} className="animate-spin text-primary" /> Getting</div>}
                        value="Job Statistics"
                        titleClass="text-slate-700 flex-1"
                        valueClass="text-slate-700 flex text-start"
                        containerClass="last:border-0 flex flex-col bg-stone-50"
                        hideIfNoValue={hideIfNoValue}
                    />
                }
                {!isRefreshing &&
                    <>
                        {statusCount.length > 0 &&
                            statusCount.map((job, index) => (
                                <PanelCard
                                    key={index}
                                    onClick={() => handleSelectedTitle(job)}
                                    title={job.title}
                                    value={job.value.toString()}
                                    titleClass={job.titleClass}
                                    valueClass={job.valueClass}
                                    containerClass={job.className}
                                    className={job.className}
                                    isSelected={selectedTitle?.id === job.id}
                                    isDisabled={job.id! <= 0}
                                    hideIfNoValue={hideIfNoValue}
                                />
                            ))
                        }
                        <PanelCard
                            title="Total Live Jobs"
                            value={statusCount
                                .reduce((total, job) => {
                                    if (job.key === 'jobCompleted' || job.key === 'cancelled') return total;
                                    return total + job.value;
                                }, 0)
                                .toString()}
                            onClick={() => handleSelectedCount(-1)}
                            titleClass={`text-slate-700 flex-1 ${selectedTitle?.id === -1 ? 'text-primary' : ''}`}
                            valueClass={`text-slate-700 flex flex-col ${selectedTitle?.id === -1 ? 'text-primary' : ''}`}
                            containerClass={`last:border-0 bg-white flex items-stretch`}
                            className="h-full flex flex-col items-stretch"
                            hideIfNoValue={hideIfNoValue}
                            isSelected={selectedTitle?.id === -1}
                        />
                        <PanelCard
                            title="Total All Jobs"
                            value={statusCount.reduce((total, job) => total + job.value, 0).toString()}
                            onClick={() => handleSelectedTitle(null)}
                            titleClass={`text-slate-700 flex-1 ${selectedTitle?.id === null ? 'text-primary' : ''}`}
                            valueClass={`text-slate-700 flex flex-col ${selectedTitle?.id === null ? 'text-primary' : ''}`}
                            containerClass={`last:border-0 bg-stone-50 flex items-stretch`}
                            className="h-full flex flex-col items-stretch"
                            hideIfNoValue={hideIfNoValue}
                        />
                    </>
                }
            </PanelContainer>
            <div className="text-center py-2 flex items-center justify-center gap-2">
                <div className="flex gap-2 items-center font-medium opacity-80">
                    <span className="text-xs">Legends</span>
                    <span className="bg-yellow-100 border border-slate-300 text-sm py-1 px-4 rounded-full">{userdata.company_name}</span>
                    <span className="bg-white border border-slate-300 text-sm py-1 px-4 rounded-full">Carisma Solutions</span>
                </div>
            </div>
        </div>
    );
}
