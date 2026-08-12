
import type React from "react";
import { Button } from "../../../shell/components/atoms/buttons";
import Card from "../../../shell/components/collections/card";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

interface SimpleReportFormProps {
    onReportSelect?: (reportId: string) => void;
}

export default function SimpleReportForm({ onReportSelect }: SimpleReportFormProps) {

    return (
        <div className="grid grid-cols-4 gap-4">
            <ReportCard id="tat-report" title="TAT Report" description="Generates Turnaround Time report" longDescription="The Turnaround Time (TAT) Report provides an overview of the time taken to complete accounting jobs from the date received to completion. It helps track job efficiency, monitor budget vs. actual time spent, and identify delays across different job types, accountants, and clients — enabling better workload management and performance analysis." onSelect={onReportSelect} />
            <ReportCard id="coming-soon" title="Coming Soon" description="More reports coming soon..." isDisabled />
        </div>
    );
}

interface ReportCardProps {
    id: string;
    title: string;
    description: string;
    longDescription?: string;
    className?: string;
    isDisabled?: boolean;
    onSelect?: (id: string) => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ id, title, description, longDescription = '', className, isDisabled, onSelect }) => {
    const [showLongDescription, setShowLongDescription] = useState(false);

    return (
        <Card bodyClass="p-3 space-y-3" id={id} className={`${className} ${isDisabled ? 'opacity-60 pointer-events-none' : ''}`}>
            <div className="flex justify-between items-start gap-1">
                <div>
                    <h1>{title}</h1>
                    {!showLongDescription && <p className="text-xs text-slate-500">{description}</p>}
                    {showLongDescription && longDescription.length > 0 && <p className="text-xs text-slate-500">{longDescription}</p>}
                </div>
                {!isDisabled && longDescription.length > 0 && <Button theme="minimal" className="px-0 text-xs font-semibold flex items-center gap-2" onClick={() => setShowLongDescription(!showLongDescription)}><AlertCircle size={16} /></Button>}
            </div>
            <div className="flex justify-end gap-2">
                <Button theme="primary" onClick={() => onSelect?.(id)} className={`${isDisabled ? 'opacity-0 pointer-events-none' : ''} text-xs font-semibold`}>Generate Report</Button>
            </div>
        </Card>
    );
};