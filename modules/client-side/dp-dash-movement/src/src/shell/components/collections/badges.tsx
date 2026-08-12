import { Trash } from "lucide-react";

interface BadgeProps {
    icon?: any;
    title: string;
    value: string;
    onRemove: () => void;
}

export default function FilterBadge({ icon, title, value, onRemove }: BadgeProps) {
    return (
        <div className='flex items-stretch bg-slate-50 rounded-full border border-slate-300 shadow-lg shadow-slate-100 text-xs h-full'>
            <div className="flex items-center">
                {icon && <div className='py-2 pl-2 text-slate-500'>{icon}</div>}
                <div className='py-2 px-2 border-r border-slate-200'>
                    <div className='text-xs text-slate-700'>{title}</div>
                    <div className='font-semibold text-slate-700'>{value}</div>
                </div>
            </div>
            <button className='border-0 cursor-pointer aspect-square pl-2 pr-3 py-1 text-primary hover:bg-red-200 rounded-r-full' onClick={() => onRemove()}><Trash size={14} /></button>
        </div>
    );
}