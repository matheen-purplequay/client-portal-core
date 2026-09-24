export type JobStatusViewMode = 'status' | 'manager';

interface ManagerViewToggleProps {
    viewMode: JobStatusViewMode;
    setViewMode: (mode: JobStatusViewMode) => void;
}

// Only rendered when the current contact manages more than one secondary
// contact (see get-partner-wise-jobs) — toggles the stat-card area between
// the normal per-status cards and the Partner-Wise breakdown grid.
export default function ManagerViewToggle({ viewMode, setViewMode }: ManagerViewToggleProps) {
    return (
        <div className="flex items-center justify-center">
            <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
                <button
                    type="button"
                    className={`px-4 py-1 text-sm font-semibold rounded-full transition-all duration-150 ${viewMode === 'status' ? 'bg-primary text-white shadow' : 'text-slate-600 hover:text-primary'}`}
                    onClick={() => setViewMode('status')}
                >
                    Status View
                </button>
                <button
                    type="button"
                    className={`px-4 py-1 text-sm font-semibold rounded-full transition-all duration-150 ${viewMode === 'manager' ? 'bg-primary text-white shadow' : 'text-slate-600 hover:text-primary'}`}
                    onClick={() => setViewMode('manager')}
                >
                    Manager View
                </button>
            </div>
        </div>
    );
}
