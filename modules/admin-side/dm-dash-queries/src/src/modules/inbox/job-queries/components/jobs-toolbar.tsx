import { SearchBox } from "../../../../shell/components/atoms/inputs";
import { useState } from "react";
import type { Client } from "../../../../core/utils/stores/ClientSelectionContext";
import { MultiSelectDropdown } from "../../../../shell/components/atoms/dropdowns";
import { RotateCw } from "lucide-react";

interface JobToolbarProps {
    containerClass?: string;
    values: {
        clients: Client[];
        selectedClients: Client[];
        showOnlyWithQueries: boolean;
        isRefreshing?: boolean;
    }
    events: {
        onSearch: (searchTerm: string) => void;
        onClientChange: (clients: Client[]) => void;
        onToggleWithQueries: (value: boolean) => void;
        onRefresh: () => void;
    };
}

export default function JobToolbar({ events, values, containerClass }: JobToolbarProps) {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className={`bg-slate-50 border-b rounded-t-xl border-slate-300 flex gap-2 items-center justify-between ${containerClass ? containerClass : ''}`}>
            <div className="flex gap-4 items-center py-2 px-4">
                <MultiSelectDropdown
                    title="Clients"
                    items={values.clients}
                    labelKey="client"
                    dropdownStyle="simple"
                    buttonClassName="text-lg"
                    selectedItems={values.selectedClients}   // directly use parent state
                    onChange={(selected) => {
                        events.onClientChange(selected);
                        events.onSearch('');
                    }}
                />
            </div>
            <div className="flex gap-4 items-center justify-end p-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={values.showOnlyWithQueries}
                        onChange={(e) => events.onToggleWithQueries(e.target.checked)}
                        className="w-4 h-4 cursor-pointer accent-primary"
                    />
                    <span className="text-sm font-medium text-slate-700">Show only jobs with queries</span>
                </label>
                <button 
                    className={`
                        bg-primary/10 text-primary cursor-pointer hover:bg-primary hover:text-white px-4 py-2 rounded-full flex items-center gap-2
                        ${values.isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}    
                    `}
                    disabled={values.isRefreshing}
                    onClick={events.onRefresh}
                >
                    <RotateCw strokeWidth={1.5} size={16} className={`${values.isRefreshing ? 'animate-spin' : ''}`} /> Refresh
                </button>
                <SearchBox placeholder="Search" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); events.onSearch(e.target.value); }} onClear={() => { setSearchTerm(''); events.onSearch(''); }} />
            </div>
        </div >
    );
};