import { ChevronRight } from "lucide-react";

export interface StatGridCardProps {
    title: string | React.ReactNode;
    value: string;
    // Passed as literal, whole class names (not built at runtime) so
    // Tailwind's JIT scanner can find them in this file's source.
    bgColorClass?: string;
    accentColorClass?: string;
    textColorClass?: string;
    onClick?: () => void;
    isSelected?: boolean;
    isDisabled?: boolean;
    isTotal?: boolean;
    hideIfNoValue?: boolean;
}

// A tinted card with a colored left accent bar, matching the color each
// status's Legends pill uses (legend-buttons.tsx / legend-filter.ts) —
// tint + accent instead of a plain white card with just a colored border.
// Clickable cards render as a real <button> with the same
// shadow/hover/active language as the app's Button component
// (shell/components/atoms/buttons.tsx), so they read as buttons, not
// just decorated divs.
export default function StatGridCard({ title, value, bgColorClass, accentColorClass, textColorClass, onClick, isSelected, isDisabled, isTotal, hideIfNoValue }: StatGridCardProps) {
    if (hideIfNoValue && (!value || value === "0")) return null;

    const isClickable = !!onClick && !isDisabled;
    // Selected state is a solid fill, not just a light tint of the status's
    // own color — it needs to read as a clearly different state at a
    // glance, not blend in with the yellow/blue/green status coloring.
    const accent = isSelected ? 'bg-primary-700' : (accentColorClass ?? 'bg-slate-300');
    const background = isSelected ? 'bg-[#ddc7cf]' : (isTotal ? 'bg-cyan-50' : (bgColorClass ?? 'bg-white'));
    const valueColor = isSelected ? 'text-primary-900' : (isTotal ? 'text-teal-700' : textColorClass ?? 'text-slate-800');
    const labelColor = isSelected ? 'text-primary-800/80' : (isTotal ? 'text-teal-700' : 'text-slate-500');

    const sharedClassName = `
        group relative overflow-hidden rounded-xl pl-4 pr-3 py-3 text-left h-full w-[210px] flex-none
        transition-all duration-150
        border ${isSelected ? 'border-primary-700' : 'border-black/5'}
        ${background}
        ${isDisabled ? 'cursor-not-allowed pointer-events-none opacity-75 shadow-sm' : ''}
        ${isClickable ? 'cursor-pointer shadow hover:shadow-lg active:shadow-none active:scale-[0.97]' : 'shadow-sm'}
        ${isSelected ? 'shadow-md' : ''}
    `;

    const content = (
        <>
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${accent}`} />
            {isClickable &&
                <ChevronRight
                    size={14}
                    className={`absolute right-2 top-2 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-150 ${isSelected ? 'text-primary-800/60' : 'text-black/20'}`}
                />
            }
            <div className={`text-[11px] uppercase font-semibold tracking-wide mb-1 whitespace-nowrap overflow-hidden text-ellipsis ${labelColor}`}>
                {title}
            </div>
            <div className={`text-2xl font-bold ${valueColor}`}>
                {value}
            </div>
        </>
    );

    if (isClickable) {
        return (
            <button type="button" className={sharedClassName} onClick={onClick}>
                {content}
            </button>
        );
    }

    return (
        <div className={sharedClassName}>
            {content}
        </div>
    );
}
