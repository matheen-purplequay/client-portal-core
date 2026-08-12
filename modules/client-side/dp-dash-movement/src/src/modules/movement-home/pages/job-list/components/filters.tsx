import { useState } from "react";
import { HorizontalDivider } from "../../../../../shell/components/atoms/divider";
import SimpleDropDown from "../../../../../shell/components/atoms/dropdowns";
import { jobTypeFilters, jobStatusFilters, minHoursFilter, maxHoursFilter } from "../bs-job-table/constants/job-filters";

interface FiltersProps {
    filterStyle?: "default" | "simple";
}

export const Filters = ({ filterStyle = 'simple' }: FiltersProps) => {

    const [selectedJobType, setSelectedJobType] = useState<string>(jobTypeFilters[0]);
    const [selectedJobStatus, setSelectedJobStatus] = useState<string>(jobStatusFilters[0]);
    const [selectedMinHours, setSelectedMinHours] = useState<string>(minHoursFilter[0]);
    const [selectedMaxHours, setSelectedMaxHours] = useState<string>(maxHoursFilter[0]);

    return (
        <div className="flex items-stretch gap-4 flex-1 px-3">
            <SimpleDropDown
                containerClass="flex-1"
                title="Job Type"
                dropdownStyle={filterStyle}
                selectedValue={selectedJobType}
                onValueChange={setSelectedJobType}
                items={jobTypeFilters} 
            />
            <HorizontalDivider />
            <SimpleDropDown 
                containerClass="flex-1"
                title="Job Status"
                dropdownStyle={filterStyle}
                selectedValue={selectedJobStatus}
                onValueChange={setSelectedJobStatus}
                items={jobStatusFilters} 
            />
            <HorizontalDivider />
            <SimpleDropDown 
                containerClass="flex-1"
                title="Min Hours"
                dropdownStyle={filterStyle}
                selectedValue={selectedMinHours}
                onValueChange={setSelectedMinHours}
                items={minHoursFilter} 
            />
            <SimpleDropDown 
                containerClass="flex-1"
                title="Max Hours"
                dropdownStyle={filterStyle}
                selectedValue={selectedMaxHours}
                onValueChange={setSelectedMaxHours}
                items={maxHoursFilter} 
            />
        </div>
    );
};