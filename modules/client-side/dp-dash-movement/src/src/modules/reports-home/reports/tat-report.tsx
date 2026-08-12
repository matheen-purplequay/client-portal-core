import { useEffect, useState } from "react";
import { Table, TableBody, TableHead, TableHeadCell, TableHeadRow, TableRow, TableRowData } from "../../../shell/components/collections/table";
import { LoaderCircle } from "lucide-react";
import { apiRoutes } from "../../../config/api-routes";
import { verticals } from "../../../core/seeds/verticals";
import { useAppContext } from "../../../core/utils/stores/AppContext";

interface TATReportProps {
    verticalId?: number;
    periodType?: 'Month' | 'Year';
    customMonth?: string;
    selectedYear?: string;
    isTestMode?: boolean;
    onRefresh?: () => void;
}

export const TATReport = ({
    verticalId = verticals.obs,
    periodType = 'Month',
    customMonth = '',
    selectedYear = '',
    isTestMode = true,
}: TATReportProps) => {
    const context = useAppContext();
    const [tatReportData, setTatReportData] = useState<any[]>([]);
    const [isReportLoading, setIsReportLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState('');

    useEffect(() => {
        fetchTatReport();
    }, [selectedMonth, isTestMode, periodType, customMonth, selectedYear, verticalId]);

    useEffect(() => {
        setSelectedMonth(getCurrentMonthYear());
    }, []);

    const getCurrentMonthYear = () => {
        const date = new Date();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 01 - 12
        const year = date.getFullYear(); // e.g. 2025
        return `${year}-${month}`; // <-- Correct format
    };

    const fetchTatReport = async () => {
        try {
            setIsReportLoading(true);

            let body: any = {
                test_mode: true,
                period_type: periodType,
                month: periodType === 'Month' ? convertToPHPFormat(customMonth) : selectedYear,
                from_date: null,
                to_date: null,
                year: periodType === 'Month' ? null : selectedYear,
                project_id: context?.userData?.project_id.toString(),
                service_id: verticalId.toString(),
            };

            const response = await fetch(apiRoutes.reports.tatReport, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error("Network response was not ok");

            const data = await response.json();
            console.log("log for tat report data", data);

            const unwantedKeys = ["DDD", "Job Efforts", "PDRE", "PDRE Time", "COPQ"];
            const cleanData = removeKeys(data.data, unwantedKeys);

            setTatReportData(cleanData);

            // setTatReportData(data.data);
            setIsReportLoading(false);
        } catch (e) {
            console.log("Error:", e);
            setIsReportLoading(false);
        }
    };

    const convertToPHPFormat = (value: string) => {
        // "2025-07" → ["2025", "07"]
        const [year, month] = value.split("-");
        return `${month}-${year}`;  // "07-2025"
    };


    const removeKeys = (dataArray: any[], keysToRemove: string[]) => {
        return dataArray.map(item => {
            keysToRemove.forEach(key => delete item[key]);
            return item;
        });
    };

    return (
        <div className="space-y-4">
            <div className="relative bg-slate-100 min-h-[400px] rounded-lg overflow-hidden border border-slate-200">
                {isReportLoading && (
                    <div className='absolute bg-white/60 backdrop-blur-sm w-full h-full overflow-clip top-0 left-0 flex flex-col items-center justify-center z-50 transition-all'>
                        <div role="status" className='flex flex-col items-center gap-4 bg-white p-8 rounded-2xl shadow-xl border border-slate-100'>
                            <LoaderCircle className='text-primary animate-spin' size={48} />
                            <span className="font-semibold text-slate-700">Generating TAT Report...</span>
                        </div>
                    </div>
                )}
                <div className='relative overflow-x-auto max-h-[600px] overflow-y-auto'>
                    <Table>
                        {tatReportData && tatReportData.length > 0 ? (
                            <TableHead >
                                <TableHeadRow className='bg-slate-200'>
                                    {Object.keys(tatReportData[0]).map((key) => (
                                        <TableHeadCell key={key} className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-50 border-b border-slate-200 min-w-[150px]">{key}</TableHeadCell>
                                    ))}
                                </TableHeadRow>
                            </TableHead>
                        ) : (
                            <TableHead>
                                <TableHeadRow>
                                    <TableHeadCell className="px-6 py-10 text-center bg-white text-slate-400 font-medium">No Data Available. Adjust filters and refresh.</TableHeadCell>
                                </TableHeadRow>
                            </TableHead>
                        )}
                        <TableBody className="bg-white divide-y divide-slate-100">
                            {tatReportData && tatReportData.map((row, index) => (
                                <TableRow key={index} className="hover:bg-slate-50 transition-colors">
                                    {Object.values(row).map((value, idx) => (
                                        <TableRowData key={idx} className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                                            {value === null || value === undefined ? '-' : typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                        </TableRowData>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
};