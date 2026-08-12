import SimpleDropDown from "../../../shell/components/atoms/dropdowns";
import FilterBadge from "../../../shell/components/collections/badges";

interface DashboardFiltersProps {
    title: string;
    selectedValue: any;
    values: any[];
    icon?: any;
    filterSelected?: (option: string | null) => void;
    filterType?: "simple" | "advanced" | "badge";
    disabled?: boolean;
}

export default function DashboardFilter({ title, selectedValue, values, icon, filterSelected, filterType = "simple", disabled }: DashboardFiltersProps) {
    return (
        <div className={`${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
            {selectedValue === undefined || selectedValue === 'All' ?
                <>
                    {filterType == 'simple' && 
                        <SimpleDropDown
                            containerClass='bg-slate-50 rounded-lg border border-slate-100 px-3 py-1'
                            dropdownStyle='simple'
                            title={title}
                            items={values}
                            selectedValue={selectedValue || ""}
                            onValueChange={(option) => filterSelected?.(option)}
                        />
                    }
                </>
                :
                <>
                    <FilterBadge title={title} value={selectedValue || ""} icon={icon} onRemove={() => filterSelected?.(null)} />
                </>
            }
        </div>
    );
}