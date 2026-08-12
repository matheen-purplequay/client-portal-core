import PanelCard from "../components/panel-card";
import PanelContainer from "../components/panel-container";
import { useState, useEffect } from "react";
import { apiRoutes } from "../../../../config/api-routes";
import { getPostData } from "../../../../core/utils/helpers/fetch";
import { useAppContext } from "../../../../core/utils/stores/AppContext";
import { Briefcase, Clock, TriangleAlert } from "lucide-react";
import { useClientSelection } from "../../../../core/utils/stores/ClientSelectionContext";

interface PanelData {
    key: string;
    title: string;
    value: number;
    titleClass?: string;
    valueClass?: string;
    className?: string;
    style?: React.CSSProperties;
}

interface Statistics {
    code: string;
    count: number;
    label: string;
    meta_Data?: string;
}

export default function ProgressPanel() {
    const context = useAppContext();
    const { selectedClientIds, isLoading: isClientLoading } = useClientSelection();
    const [statusCount, setStatusCount] = useState<PanelData[]>([]);
    const [agingCount, setAgingCount] = useState<PanelData[]>([]);
    const [criticalityCount, setCriticalityCount] = useState<PanelData[]>([]);
    const [firstTimeLoad, setFirstTimeLoad] = useState(false);

    useEffect(() => {
        if (!firstTimeLoad) {
            setFirstTimeLoad(true);
        }
    }, []);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const body = {
                    project_id: selectedClientIds,
                    user_id: context?.userData?.staff_id
                };
                const data = await getPostData(apiRoutes.queries.get.getQueryStatistics, body);

                if (data?.status && data?.aging && data?.criticality && data?.status) {
                    const transformedStatus = data.status.map((status: Statistics) => ({
                        key: status.code,
                        title: status.label,
                        value: Number(status.count),
                        titleClass: `text-slate-700 flex-1`,
                        valueClass: `text-slate-700 flex flex-col`,
                        className: `flex flex-col h-full ${JSON.parse(status.meta_Data || '').twClass ?? ''}`
                    }));
                    const transformedAging = data.aging.map((aging: Statistics) => ({
                        key: aging.code,
                        title: aging.label,
                        value: Number(aging.count),
                        titleClass: `text-slate-700 flex-1`,
                        valueClass: `text-slate-700 flex flex-col`,
                        className: `flex flex-col h-full`
                    }));
                    const transformedCriticality = data.criticality.map((criticality: Statistics) => ({
                        key: criticality.code,
                        title: criticality.label,
                        value: Number(criticality.count),
                        titleClass: `text-slate-700 flex-1`,
                        valueClass: `text-slate-700 flex flex-col`,
                        className: `flex flex-col h-full ${JSON.parse(criticality.meta_Data || '').twClass ?? ''}`,
                    }));

                    setStatusCount(transformedStatus);
                    setAgingCount(transformedAging);
                    setCriticalityCount(transformedCriticality);
                }
            } catch (err) {
                console.log("Error fetching job status count:", err);
            }
        };

        // Only fetch when client loading is complete and we have valid client IDs
        if (firstTimeLoad && !isClientLoading && selectedClientIds) {
            setTimeout(() => {
                fetchCounts();
            }, 1000);
        }
    }, [firstTimeLoad, isClientLoading, selectedClientIds, context?.userData?.staff_id]);

    // const parseStyle = (meta?: string): React.CSSProperties | undefined => {
    //     try {
    //       const parsed = JSON.parse(meta ?? "{}");
    //       if (parsed.style && typeof parsed.style === "string") {
    //         return parsed.style.split(";").reduce((acc: any, rule: string) => {
    //           const [prop, val] = rule.split(":").map(s => s.trim());
    //           if (prop && val) {
    //             const jsProp = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase()); // border-bottom → borderBottom
    //             acc[jsProp] = val;
    //           }
    //           return acc;
    //         }, {});
    //       }
    //       return parsed.style;
    //     } catch {
    //         console.log("Error parsing style");
    //       return undefined;
    //     }
    //   };


    return (
        <div className="w-full overflow-x-auto">
            <p className="text-xs font-semibold text-slate-500 mb-2 text-center">Your Query Summary</p>
            <div className="flex items-center justify-between gap-4">
                <PanelModule icon={<Briefcase strokeWidth={2} size={16} />} containerName="Status" statusCount={statusCount} containerStyle="simple" containerClass="bg-white border border-stone-200 shadow-sm hover:shadow-lg hover:shadow-secondary-100 hover:border-secondary transition-all duraiton-200" />
                <PanelModule icon={<Clock strokeWidth={2} size={16} />} containerName="Aging" statusCount={agingCount} containerStyle="simple" containerClass="bg-white border border-stone-200 shadow-sm hover:shadow-lg hover:border-primary hover:shadow-primary-100 transition-all duraiton-200" />
                <PanelModule icon={<TriangleAlert strokeWidth={2} size={16} />} containerName="Criticality" statusCount={criticalityCount} containerStyle="simple" containerClass="bg-white border border-stone-200 shadow-sm hover:shadow-lg hover:border-stone-800 transition-all duraiton-200" />
            </div>
        </div>

    );
}


interface PanelModule {
    containerName?: string;
    icon?: React.ReactNode;
    title?: string;
    statusCount: PanelData[];
    className?: string;
    containerStyle?: "default" | "primary" | "secondary" | "gray" | "simple";
    containerClass?: string;
}

const PanelModule = ({ icon, title, statusCount, className, containerStyle, containerClass, containerName }: PanelModule) => {
    return (
        <PanelContainer style={containerStyle} containerClass={containerClass} label={containerName}>
            {title &&
                <PanelCard
                    title={icon ?? ''}
                    value={title ?? ''}
                    titleClass="text-slate-700 flex-1"
                    valueClass="text-slate-700 flex flex-col"
                    className={`last:border-0 flex flex-col h-full ${className}`}
                />
            }
            {statusCount.length > 0 &&
                statusCount.map((status, index) => (
                    <PanelCard
                        key={index}
                        title={status.title}
                        value={status.value.toString()}
                        titleClass={status.titleClass}
                        valueClass={status.valueClass}
                        className={status.className}
                        style={status.style}
                    />
                ))
            }
            <PanelCard
                title={<div className="font-bold">Total</div>}
                value={statusCount.reduce((total, job) => total + job.value, 0).toString()}
                titleClass="text-slate-700 flex-1"
                valueClass="text-slate-700 flex flex-col"
                className="last:border-0 flex flex-col h-full bg-stone-50"
            />
        </PanelContainer>
    );
};