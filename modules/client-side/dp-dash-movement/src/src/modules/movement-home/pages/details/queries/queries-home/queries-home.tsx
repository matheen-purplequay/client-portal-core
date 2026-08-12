import { QueriesJobs } from "../queries-jobs/queries-jobs";
import type { OBSJobRowData } from "../../../../../../core/models/movement";
import { useState } from "react";
import { NewQuery } from "../new-query/new-query";
import { Toolbar } from "../../../../../../shell/components/collections/toolbar";
import { Button } from "../../../../../../shell/components/atoms/buttons";
import { Plus, X } from "lucide-react";
import { HorizontalDivider } from "../../../../../../shell/components/atoms/divider";
import { ListFilterPlus } from "lucide-react";
import { useAppContext } from "../../../../../../core/utils/stores/AppContext";
import { Filters } from "../../../job-list/components/filters";

export const QueriesHome = ({ job }: { job: OBSJobRowData }) => {
    const userData = useAppContext()?.userData;
    const activities =  {
        jobQueries: { id: 'job-queries', label: 'Job Queries' },
        newQuery: { id: 'new-query', label: 'New Query' },
        queries: { id: 'queries', label: 'Queries' },
    }
    const [activity, setActivity] = useState(activities.jobQueries);

    return (
        <div>
            <div className="px-2">
                <Toolbar theme="light" layout="split" className="border rounded-lg border-slate-300">
                    <div className="px-2 py-1">
                        {activity.id === 'job-queries' && userData?.role === 'admin' && 
                            <Button theme="primary" shape="pill" className="pl-2" onClick={() => setActivity(activities.newQuery)}>
                                <div className="flex items-center gap-1">
                                    <Plus strokeWidth={1.5} /> New Query
                                </div>
                            </Button>
                        }
                        {activity.id === 'new-query' && 
                            <Button theme="light" shape="pill" className="pl-2 shadow-sm" onClick={() => setActivity(activities.jobQueries)}>
                                <div className="flex items-center gap-1">
                                    <X strokeWidth={1.5} /> Cancel
                                </div>
                            </Button>
                        }
                    </div>
                    <HorizontalDivider />
                    <div className="px-3 py-1 flex-1 w-full flex gap-2 items-center">
                        {activity.id === 'job-queries' && 
                            <>
                                <ListFilterPlus strokeWidth={1.5} className="text-slate-500" />
                                <Filters />
                            </>
                        }
                    </div>
                </Toolbar>
            </div>
            
            {activity.id === 'job-queries' && <QueriesJobs job={job}></QueriesJobs>}
            {activity.id === 'new-query' && <NewQuery></NewQuery>}
        </div>
    );
};