import { Button } from "../../../shell/components/atoms/buttons";

interface ApplyFilterButtonProps {
    isFilterApplied: boolean;
    onClick: () => void;
}

export default function ApplyFilterButton({ isFilterApplied, onClick }: ApplyFilterButtonProps) {
    return (
        <Button 
            theme="simple_primary" 
            shape='pill' 
            className={`text-xs font-semibold p-2 flex gap-1 items-center ${!isFilterApplied ? 'bg-primary text-white' : 'text-primary'}`} 
            onClick={onClick}>
                {isFilterApplied ? 'Apply Filter' : 'Apply Filter Now'}
        </Button>
    );
}