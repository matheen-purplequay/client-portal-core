
interface PanelContainerProps {
    children: React.ReactNode;
    containerClass?: string;
    style?: "default" | "primary" | "secondary" | "gray" | "simple";
    label?: string | React.ReactNode;
    className?: string;
}

export default function PanelContainer({ children, containerClass, style, label, className }: PanelContainerProps) {

    const containerStyles = {
        default: "border border-slate-200 shadow bg-white",
        primary: "border border-primary shadow bg-white",
        secondary: "border border-secondary shadow bg-white",
        gray: "border border-slate-300 shadow bg-white",
        simple: "border-0 shadow-none"
    };

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div className={`${!containerClass?.includes('rounded-') && 'rounded-xl'} ${containerStyles[style || "default"]} ${containerClass} overflow-x-auto max-w-full`}>
                <div className="flex items-stretch h-full">
                    {children}
                </div>
            </div>
            {label && <label className="bg-transparent text-slate-800text-xs font-medium px-3 py-[2px] rounded-b-lg">{label}</label>}
        </div>
    );
}