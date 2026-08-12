interface ToolbarProps {
    children: React.ReactNode;
    layout?: "default" | "split";
    theme?: "default" | "primary" | "primary-light" | "secondary" | "light" | "light-gradient" | "white";
    className?: string;
}   

export const Toolbar = ({ children, layout = "default", theme = "default", className }: ToolbarProps) => {
    const toolbarStyles = {
        default: "p-2 flex gap-2 items-center justify-start bg-gray-100",
        split: `${layout} flex gap-2 ${className?.includes('justify-') ? '' : 'justify-between'} ${className?.includes('items-') ? '' : 'items-center'}`
    };
    return (
        <div className={` ${className}
            ${toolbarStyles[layout]} 
            ${theme === "primary" && "bg-primary text-white"}
            ${theme === "primary-light" && "bg-primary-50/50"}
            ${theme === "secondary" && "bg-secondary text-white"}
            ${theme === "light" && "bg-slate-50"}
            ${theme === "light-gradient" && "bg-gradient-to-b from-white to-slate-100"}
            ${theme === "white" && "bg-white"}
        `}>
            {children}
        </div>
    );
};