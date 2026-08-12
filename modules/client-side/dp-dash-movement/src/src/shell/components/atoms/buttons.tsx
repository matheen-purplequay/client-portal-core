export interface ButtonProps {
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent) => void;
    props?: React.ButtonHTMLAttributes<HTMLButtonElement>;
    shape?: "default" | "circle" | "square" | "pill";
    className?: string;
    theme?: "default" | "primary" | "secondary" | "light" | "light_primary" | "light_success" | "light_gray" | "outline" | "outline_primary" | "outline_secondary" | "simple_border" | "simple" | "simple_primary" | "minimal";
}   

export const Button = ({ children, onClick, props, shape = "default", className, theme = "default" }: ButtonProps) => {

    const buttonShapes = {
        default: `rounded-md`,
        circle: "rounded-full aspect-square p-2",
        square: "rounded-none aspect-square p-2",
        pill: "rounded-full"
    };

    const buttonThemes = {
        default: "bg-slate-300 text-slate-700 hover:shadow-slate-700/50 shadow hover:shadow-lg active:shadow-none",
        primary: "bg-primary text-white hover:shadow-primary-700/50 shadow hover:shadow-lg active:shadow-none",
        secondary: "bg-secondary text-white hover:shadow-secondary-700/50 shadow hover:shadow-lg active:shadow-none",
        light: "bg-white text-primary hover:bg-secondary hover:text-white hover:shadow-lg",
        light_primary: "bg-white text-primary hover:bg-primary hover:text-white hover:shadow-lg",
        light_success: "bg-white text-primary hover:bg-success hover:text-white hover:shadow-lg",
        light_gray: "bg-slate-100 text-primary hover:bg-gray-100 hover:text-slate-900 hover:shadow-lg",
        outline: "bg-transparent text-slate-700 hover:bg-slate-300 hover:text-primary border border-slate-300",
        outline_primary: "bg-transparent text-primary hover:bg-primary hover:text-white border border-primary",
        outline_secondary: "bg-transparent text-secondary hover:bg-secondary hover:text-white border border-secondary",
        simple: `${!className?.includes('text-') && 'text-slate-700'} ${!className?.includes('hover:bg-') && 'hover:bg-slate-300'} ${!className?.includes('hover:text-') && 'hover:text-primary'}`,
        simple_primary: `${!className?.includes('text-') && 'text-primary'} ${!className?.includes('hover:bg-') && 'hover:bg-primary'} ${!className?.includes('hover:text-') && 'hover:text-white'}`,
        simple_border: "rounded-none bg-transparent text-slate-700 hover:bg-slate-300 hover:text-primary border-b-2 border-slate-300 px-2 pt-2 pb-1",
        minimal: "bg-transparent text-slate-700 hover:text-primary"
    };

    const classes = className?.split(" ") ?? [];

    return (
        <button onClick={onClick} {...props} className={`
            cursor-pointer transition-all duration-300
            ${buttonShapes[shape]} ${className} 
            ${classes.some(c => c.startsWith("px-") || c.startsWith("p-") || theme === 'simple_border') ? "" : "px-4"}
            ${classes.some(c => c.startsWith("py-") || c.startsWith("p-") || theme === 'simple_border') ? "" : "py-1"}
            ${buttonThemes[theme]}
        `}>
            {children}
        </button>
    );
};