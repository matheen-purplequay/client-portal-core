export interface PanelCardProps {
    title: string | React.ReactNode;
    value: string;
    titleClass?: string;
    valueClass?: string;
    onClick?: () => void;
    className?: string;
    containerClass?: string;
    style?: React.CSSProperties;
    isSelected?: boolean;
    isDisabled?: boolean;
    hideIfNoValue?: boolean;
}

export default function PanelCard({ title, value, titleClass, valueClass, onClick, className, containerClass, style, isSelected, isDisabled, hideIfNoValue }: PanelCardProps) {
    
    return (
        <div 
            className={`
                last:border-0 border-r border-slate-200 ${onClick ? 'cursor-pointer' : ''} ${containerClass}
                ${isDisabled ? 'cursor-not-allowed pointer-events-none opacity-75' : ''}
                ${hideIfNoValue && (!value || value === "0") ? 'hidden' : ''}
            `} 
            onClick={isDisabled ? undefined : onClick}
        >
            <div 
                className={`
                    ${!className?.includes('px-') && 'px-2'} ${!className?.includes('py-') && 'py-1'} h-full border-2 transition-all duraiton-200 w-[100px]
                    ${className} 
                    ${isSelected ? 'border-primary' : 'border-transparent'}`} 
                    style={style}
                >
                <div className={`text-xs ${titleClass}`}>{title}</div>
                <div className={`${!valueClass?.includes('text-') && 'text-right'} ${valueClass}`}>{value}</div>
            </div>
        </div>
    );
}