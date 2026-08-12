import { useEffect, useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { apiRoutes } from "../../../../config/api-routes";
import { decryptData } from "../../../../core/utils/helpers/localStorage";
import { useEngagementVerticalContext } from "../../../../core/utils/stores/EngagementVerticalContext";
import { Pagination } from "../../../../shell/components/collections/table";
import { Toolbar } from "../../../../shell/components/collections/toolbar";
import { SearchBox } from "../../../../shell/components/atoms/inputs";
import { LoaderCircle } from "lucide-react";

interface Lodgement {
    TotalJobs: number,
    MovedJobs: number,
    OnshoreJobs: number,
    CarismaLodgement: number,
    OnshoreLodgement: number,
    BalanceJobs: number,
    MovedPercentage: string,
    OnshorePercentage: string,
    LodgementPercentage: string
}

interface LodgementTable {
    Id: number,
    JobName: string,
    GroupJobName: string,
    Partner: string,
    ReceivedFrom: string,
    Director: string,
    FinancialYear: string,
    Clientname: string,
    Natureofjob: string
}

const views = {
    chart: 'chart',
    table: 'table'
};

export const LodgementView = () => {
    const verticalContext = useEngagementVerticalContext();
    const [isFetchingLodgement, setIsFetchingLodgement] = useState(false);
    const [isFetchingLodgementTable, setIsFetchingLodgementTable] = useState(false);
    const [lodgement, setLodgement] = useState<Lodgement | null>(null);
    const [lodgementTable, setLodgementTable] = useState<LodgementTable[]>([]);
    const [originalLodgementTable, setOriginalLodgementTable] = useState<LodgementTable[]>([]);
    const [baseView, setBaseView] = useState<keyof typeof views>('chart');
    const [statusCode, setStatusCode] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState('');

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        if(originalLodgementTable) {
            // Added an empty condition for build
        }
        fetchLodgement();
    }, []);

    const fetchLodgement = async () => {
        setIsFetchingLodgement(true);
        const vertical_id = verticalContext.vertical?.wm_vertical_id ?? 0;
        if(vertical_id === 0) return;

        const body = {
            project_id: JSON.parse(decryptData(localStorage.getItem('userdata')))?.project_id ?? 0,
            service_id: vertical_id,
            year: new Date().getFullYear()
        };

        const response = await fetch(apiRoutes.lodgement.getLodgement, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });
        const data = await response.json();

        if(data.status) setLodgement(data.data);

        setIsFetchingLodgement(false);
        fetchLodgementTable(1);
    };

    const fetchLodgementTable = async (status_code: number) => {
        if(isFetchingLodgementTable) return;
        if(statusCode === status_code) return;

        setStatusCode(status_code);
        setIsFetchingLodgementTable(true);
        setPage(0);
        const vertical_id = verticalContext.vertical?.wm_vertical_id ?? 0;
        if(vertical_id === 0) return;

        const body = {
            status_code: status_code,
            project_id: JSON.parse(decryptData(localStorage.getItem('userdata')))?.project_id ?? 0,
            service_id: vertical_id,
            year: new Date().getFullYear()
        };

        const response = await fetch(apiRoutes.lodgement.getLodgementTable, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });
        const data = await response.json();

        if(data.status) {
            setLodgementTable(data.data);
            setOriginalLodgementTable(data.data);
        }

        setIsFetchingLodgementTable(false);
    };

    const filteredRows = useMemo(() => {
        if(!searchTerm) return lodgementTable;
        return lodgementTable.filter(row => 
            Object.values(row).some(val =>
                String(val).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [lodgementTable, searchTerm]);

    const handleViewChange = (view: keyof typeof views) => {
        setBaseView(view);
    };

    const handleRowsPerPageChange = (rowsPerPage: number) => {
        if(filteredRows) {
            // added empty row for build
        }
        setRowsPerPage(rowsPerPage);
        setPage(0);
    };

    const paginatedRows = useMemo(() => {
        const start = page * rowsPerPage;
        const end = start + rowsPerPage;
        return lodgementTable.slice(start, end);
    }, [lodgementTable, page, rowsPerPage]);


    return (
        <div className={`bg-white rounded-lg shadow-sm p-4`}>
            <div className="mb-2 flex items-center justify-between gap-2">
                <div className="text-lg font-semibold">Lodgement</div>

                <div>
                    <button className={`px-2 py-1 cursor-pointer ${baseView === 'chart' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => handleViewChange('chart')}>Chart</button>
                    <button className={`px-2 py-1 cursor-pointer ${baseView === 'table' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => handleViewChange('table')}>Table</button>
                </div>
            </div>
            {lodgement ? (
                <div>
                    <div className="flex border border-gray-200 rounded-lg overflow-hidden mb-6">
                        {[
                            { label: "Total Jobs", value: lodgement.TotalJobs },
                            { label: "Moved Jobs", value: lodgement.MovedJobs },
                            { label: "Onshore Jobs", value: lodgement.OnshoreJobs },
                            { label: "Carisma Lodgement", value: lodgement.CarismaLodgement },
                            { label: "Onshore Lodgement", value: lodgement.OnshoreLodgement },
                            { label: "Balance Jobs", value: lodgement.BalanceJobs },
                        ].map((item, index) => (
                            <div key={item.label} 
                                className={`cursor-pointer flex-1 flex flex-col text-center border-r border-gray-200 last:border-r-0 py-2 px-1 ${statusCode === index + 1 ? 'bg-gray-100' : ''} ${isFetchingLodgementTable && 'pointer-events-none opacity-70'}`}
                                onClick={ () => {
                                    handleViewChange('table');
                                    fetchLodgementTable(index + 1);
                                } }    
                            >
                                <div className={`text-xs font-medium flex-1 ${statusCode === index + 1 ? 'text-primary' : 'text-gray-500'}`}>{item.label}</div>
                                <div className={`text-lg font-semibold mt-1 ${statusCode === index + 1 ? 'text-primary' : 'text-gray-700'}`}>{item.value}</div>
                            </div>
                        ))}
                    </div>


                    <div className="w-full border border-primary rounded-xl shadow-sm overflow-hidden bg-white">
                        {baseView == 'table' && 
                            <div className="flex flex-col">
                                <Toolbar theme='white'>
                                    <div className="w-full flex-1 flex items-center gap-4 select-none">
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {isFetchingLodgementTable && <><LoaderCircle size={16} className='text-primary animate-spin' /> <label>Getting jobs...</label></>}
                                    </div>
                                    <SearchBox value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onClear={() => setSearchTerm('')} />
                                </Toolbar>

                                <table className="min-w-full border-t border-gray-300 text-sm select-none">
                                    <thead className="bg-slate-100 text-slate-700">
                                        <tr>
                                            <th className="text-left px-4 py-2 font-semibold cursor-pointer select-none whitespace-nowrap">Job Name</th>
                                            <th className="text-left px-4 py-2 font-semibold cursor-pointer select-none whitespace-nowrap">Group Job Name</th>
                                            <th className="text-left px-4 py-2 font-semibold cursor-pointer select-none whitespace-nowrap">Partner</th>
                                            <th className="text-left px-4 py-2 font-semibold cursor-pointer select-none whitespace-nowrap">Received From</th>
                                            <th className="text-left px-4 py-2 font-semibold cursor-pointer select-none whitespace-nowrap">Director</th>
                                            <th className="text-left px-4 py-2 font-semibold cursor-pointer select-none whitespace-nowrap">Financial Year</th>
                                            <th className="text-left px-4 py-2 font-semibold cursor-pointer select-none whitespace-nowrap">Client Name</th>
                                            <th className="text-left px-4 py-2 font-semibold cursor-pointer select-none whitespace-nowrap">Nature of Job</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isFetchingLodgementTable ? (
                                            <tr>
                                                <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                                                    Loading...
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedRows && paginatedRows.length > 0 ? paginatedRows.map((item, idx) => (
                                                <tr key={item.Id} className={`hover:bg-primary-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`}>
                                                    <td className="px-4 py-2 max-w-[200px] text-ellipsis whitespace-nowrap overflow-hidden text-slate-700 font-medium">{item.JobName}</td>
                                                    <td className="px-4 py-2 max-w-[200px] text-ellipsis whitespace-nowrap overflow-hidden text-slate-700">{item.GroupJobName}</td>
                                                    <td className="px-4 py-2 max-w-[200px] text-ellipsis whitespace-nowrap overflow-hidden text-slate-700">{item.Partner}</td>
                                                    <td className="px-4 py-2 max-w-[200px] text-ellipsis whitespace-nowrap overflow-hidden text-slate-700">{item.ReceivedFrom}</td>
                                                    <td className="px-4 py-2 max-w-[200px] text-ellipsis whitespace-nowrap overflow-hidden text-slate-700">{item.Director}</td>
                                                    <td className="px-4 py-2 max-w-[100px] text-ellipsis whitespace-nowrap overflow-hidden text-slate-700">{item.FinancialYear}</td>
                                                    <td className="px-4 py-2 max-w-[200px] text-ellipsis whitespace-nowrap overflow-hidden text-slate-700">{item.Clientname}</td>
                                                    <td className="px-4 py-2 max-w-[200px] text-ellipsis whitespace-nowrap overflow-hidden text-slate-700">{item.Natureofjob}</td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                                                        No jobs found
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        }
                        {baseView == 'table' && lodgementTable && lodgementTable.length > 0 &&
                            <Pagination
                                rowsPerPage={rowsPerPage}
                                handleRowsPerPageChange={handleRowsPerPageChange}
                                page={page}
                                setPage={setPage}
                                filteredRows={lodgementTable}
                            />
                        }
                    </div>
                    {baseView == 'chart' &&
                        <div className="w-full flex items-center justify-center">
                            <ResponsiveContainer width={500} height={300}>
                                <BarChart data={[
                                    { name: 'Moved', value: lodgement.MovedJobs, color: '#4caf50' },
                                    { name: 'Onshore', value: lodgement.OnshoreJobs, color: '#2196f3' },
                                    { name: 'Balance', value: lodgement.BalanceJobs, color: '#ff9800' },
                                ]}>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]} shape={(props: any) => {
                                        const { x, y, width, height, color } = props;
                                        return <rect x={x} y={y} width={width} height={height} fill={color} rx={4} ry={4} />;
                                    }} />
                                </BarChart>
                            </ResponsiveContainer>                    
                        </div>
                    }
                </div>
            ) : (
                isFetchingLodgement ? (
                    <div className="text-sm text-gray-400 text-center py-8">Loading lodgement data...</div>
                ) : (
                    <div className="text-sm text-gray-400 text-center py-8">No lodgement data available</div>
                )
            )}
        </div>
    );
};