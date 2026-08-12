export interface PanelCardProps {
    title: string | React.ReactNode;
    value: string;
    titleClass?: string;
    valueClass?: string;
    onClick?: () => void;
    className?: string;
    style?: React.CSSProperties;
}

export default function PanelCard({ title, value, titleClass, valueClass, onClick, className, style }: PanelCardProps) {
    return (
        <div className={`last:border-0 border-r border-slate-200`} onClick={onClick}>
            <div className={`px-4 py-2 ${className}`} style={style}>
                <div className={`text-xs ${titleClass}`}>{title}</div>
                <div className={`font-semibold text-right ${valueClass}`}>{value}</div>
            </div>
        </div>
    );
}