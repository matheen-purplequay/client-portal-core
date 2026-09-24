import { X } from 'lucide-react';
import { Instructions } from '../../movement-home/pages/details/job-instructions/instructions';

interface QuickInstructionDialogProps {
    job: Record<string, any>;
    onClose: () => void;
}

// Same Instructions card shown inside a job's details, opened straight from the grid row.
export const QuickInstructionDialog = ({ job, onClose }: QuickInstructionDialogProps) => {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl border border-slate-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3">
                    <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-800">Instructions</div>
                        <div className="truncate text-xs text-slate-500" title={job.Jobname}>{job.Jobname}</div>
                    </div>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-4">
                    <Instructions job={job} width="full" />
                </div>
            </div>
        </div>
    );
};
