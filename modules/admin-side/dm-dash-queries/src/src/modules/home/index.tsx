import { usePageContext } from "../../core/utils/stores/PageContext";
import { availablePages } from "../../core/seeds/pages";
import QueriesInbox from "../inbox/inbox";
import { useQueryMasterContext } from "../../core/utils/stores/QueryMasterContext";
import { useState, useEffect } from "react";
import type { QueryMaster } from "../../core/models/master";
import { defaultQueryMaster } from "../../core/models/master";
import { getPostData } from "../../core/utils/helpers/fetch";
import { apiRoutes } from "../../config/api-routes";
import { Blocks } from "lucide-react";
import DraftQueries from "../draft-queries/draft-queries";
import RejectedQueries from "../rejected-queries/rejected-queries";
import TemplatesHome from "../templates/templates-home";
import ReportsHome from "../reports/reports-home";

export default function Home() {
    const { page } = usePageContext();
    const pages = availablePages;
    const queryContext = useQueryMasterContext();
    const [queryMasters, setQueryMasters] = useState<QueryMaster>(defaultQueryMaster);

    const version = import.meta.env.VITE_APP_VERSION;

    useEffect(() => {
        queryContext?.setQueryMasters?.(queryMasters);
    }, [queryMasters]);

    const getMasters = () => {
        getPostData(apiRoutes.master.getAllMasters, ['category', 'sub_category', 'criticality', 'response_type']).then((data) => {
            const sortedMasters = {
                ...data.masters,
                sub_category: [...(data.masters.sub_category || [])].sort((a: any, b: any) => 
                    a.master_name.localeCompare(b.master_name)
                )
            };
            setQueryMasters(sortedMasters);
        });
    };

    useEffect(() => {
        getMasters();
    }, []);


    return (
        <div>
            <div className={`${page == pages.inbox.id ? 'block' : 'hidden'}`}><QueriesInbox /></div>
            <div className={`${page == pages.query_reports.id ? 'block' : 'hidden'}`}><DraftQueries /></div>
            <div className={`${page == pages.rejected.id ? 'block' : 'hidden'}`}><RejectedQueries /></div>
            <div className={`${page == pages.query_reports.id ? 'block' : 'hidden'}`}><ReportsHome /></div>
            <div className={`${page == pages.templates.id ? 'block' : 'hidden'}`}><TemplatesHome /></div>

            <div className="py-5 text-slate-400 text-xs text-center flex gap-2 flex-col items-center justify-center">
                <Blocks size={32} strokeWidth={1} className="text-slate-300"/>
                <p>Queries module {version && 'v' + version}</p>
            </div>
        </div>
    );
}