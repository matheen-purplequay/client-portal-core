import { useState } from "react";
import { Button } from "../../../../shell/components/atoms/buttons";
import { KVDropDown } from "../../../../shell/components/atoms/dropdowns";
import { useEngagementVerticalContext } from "../../../../core/utils/stores/EngagementVerticalContext";
import { TATReport } from "../../../reports-home/reports/tat-report";
import { verticals } from "../../../../core/seeds/verticals";
import SimpleReportForm from "../../../reports-home/forms/simple-report-form";
import { ArrowLeft } from "lucide-react";

const periodOptions = [
    { key: 'Month', value: 'Month' },
    // { key: 'Year', value: 'Year' }
];

const getYearOptions = () => {
    return Array.from({ length: (new Date().getFullYear()) - 2022 + 1 }, (_, i) => ({
        key: (2022 + i).toString(),
        value: (2022 + i).toString()
    })).reverse();
};

const yearOptions = getYearOptions();

export const ReportsView = () => {
    const { vertical } = useEngagementVerticalContext();
    const [selectedReportType, setSelectedReportType] = useState<string | null>(null);
    
    // Filters state
    const getCurrentMonthYear = () => {
        const date = new Date();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${year}-${month}`;
    };

    const [periodType, setPeriodType] = useState<'Month' | 'Year'>('Month');
    const [customMonth, setCustomMonth] = useState(getCurrentMonthYear());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

    // When no report is selected, show the report cards
    if (!selectedReportType) {
        return (
            <div className="bg-slate-100 rounded-md shadow-md p-4 space-y-4">
                <h2 className="text-lg font-semibold border-b border-slate-200 pb-4">Available Reports</h2>
                <SimpleReportForm onReportSelect={(reportId) => setSelectedReportType(reportId)} />
            </div>
        );
    }

    // When a report is selected, show the report with filters
    return (
        <div className="bg-slate-100 rounded-md shadow-md p-4 space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-4">
                <div className="flex items-center gap-4">
                    <Button
                        onClick={() => setSelectedReportType(null)}
                        theme="simple_primary"
                        className="text-xs font-semibold flex items-center gap-1"
                    >
                        <ArrowLeft size={14} /> Back
                    </Button>
                    <h2 className="text-lg font-semibold whitespace-nowrap">
                        {selectedReportType === 'tat-report' ? 'TAT Report' : 'Report'}
                    </h2>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <KVDropDown
                            title=""
                            items={periodOptions}
                            selectedValue={periodType}
                            onValueChange={(opt) => setPeriodType(opt.key as 'Month' | 'Year')}
                            containerClass="w-32"
                        />

                        {periodType === 'Month' ? (
                            <input
                                className="bg-white rounded-md px-3 py-1.5 text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 h-9"
                                type="month"
                                value={customMonth}
                                onChange={(e) => setCustomMonth(e.target.value)}
                            />
                        ) : (
                            <KVDropDown
                                title=""
                                items={yearOptions}
                                selectedValue={selectedYear}
                                onValueChange={(opt) => setSelectedYear(opt.key)}
                                containerClass="w-32"
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-4">
                {selectedReportType === "tat-report" && (
                    <TATReport 
                        verticalId={vertical?.service_id || verticals.obs}
                        periodType={periodType}
                        customMonth={customMonth}
                        selectedYear={selectedYear}
                        isTestMode={true}
                    />
                )}
            </div>
        </div>
    );
};
