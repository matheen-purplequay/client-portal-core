import { useEffect, useState } from "react";
import React from "react";
import { apiRoutes } from "../../../../config/api-routes";
import type { EngagementVertical } from "../../../../core/models/vertical";
import { getPostData } from "../../../../core/utils/helpers/fetch";
import { useAppContext } from "../../../../core/utils/stores/AppContext";
import { useEngagementVerticalContext } from "../../../../core/utils/stores/EngagementVerticalContext";
import { decryptData } from "../../../../core/utils/helpers/localStorage";

export default function QuickLinksPanel() {
    const appContext = useAppContext();
    const engagementVerticalContext = useEngagementVerticalContext();
    const [engagementVerticals, setEngagementVerticals] = useState<EngagementVertical[]>([]);
    const [selectedVertical, setSelectedVertical] = useState<EngagementVertical | null>(null);



    const [rules, setRules] = useState<string>('');
    const [isRulesSet, setIsRulesSet] = useState(false);
    const [isFetchingRules, setIsFetchingRules] = useState(true);

    const verticalContext = useEngagementVerticalContext();

    const [isLodgementExists, setIsLodgementExists] = useState(false);

    useEffect(() => {
        const value = getRuleValue(rules, "visibility_lodgement_chart");
        setIsLodgementExists(value);
    }, [rules]);

    useEffect(() => {
        fetchRules();
    }, [verticalContext.vertical]);

    
    const getRuleValue = (ruleString: string, key: string) => {
        try {
            const parsed = JSON.parse(ruleString);
            const match = parsed.find((obj: any) => key in obj);
            return match ? match[key] : null;
        } catch {
            return null;
        }
    };

    const fetchRules = async () => {
        const vertical_id = verticalContext.vertical?.wm_vertical_id ?? 0;
        if(vertical_id === 0) return;

        const body = {
            project_id: JSON.parse(decryptData(localStorage.getItem('userdata')))?.project_id ?? 0,
            vertical_id: vertical_id,
            dashboard_id: 6
        };

        const response = await fetch(apiRoutes.rules.getDashboardRules, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        setIsRulesSet(true);
        // data.data is the object, so data.data.rules is the string. 
        // If data.data.rules is returning the object, we need to extract the string from it.
        const rulesString = typeof data.data.rules === 'string' ? data.data.rules : data.data.rules?.rules;
        setRules(rulesString || '');
        setIsFetchingRules(false);
    };


    const getClientVerticals = () => {
        getPostData(apiRoutes.client.get.getVerticals, {
            client_id: appContext?.userData?.company_id
        }).then((res: any) => {
            if(res.data && res.data.length > 0) {
                const firstVertical = res.data[0];
                setEngagementVerticals(res.data);
                setSelectedVertical(firstVertical);
                engagementVerticalContext?.setVertical?.(firstVertical);
            }
        }).catch((err: any) => {
            console.log(err);
        });
    };

    useEffect(() => {
        getClientVerticals();
    }, []);


    const handleSetVertical = (vertical: EngagementVertical) => {
        console.log('selected vertical ', vertical);
        if(vertical) {
            setSelectedVertical(vertical);
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

            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-sm">
                <button 
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200 ${engagementVerticalContext?.activeView === 'live-data' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    onClick={() => engagementVerticalContext?.setActiveView('live-data')}
                >
                    Live Data
                </button>
                {isLodgementExists && !isFetchingRules && isRulesSet &&                 
                    <button 
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200 ${engagementVerticalContext?.activeView === 'lodgement' ? 'bg-secondary text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => engagementVerticalContext?.setActiveView('lodgement')}
                    >
                        Lodgement
                    </button>
                }
                <button 
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200 ${engagementVerticalContext?.activeView === 'reports' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    onClick={() => engagementVerticalContext?.setActiveView('reports')}
                >
                    Report
                </button>
            </div>
        </div>
    );
}