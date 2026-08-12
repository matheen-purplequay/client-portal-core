import { SearchBox } from "../atoms/inputs";
import { useState, useEffect } from "react";

interface CardProps {
    id?: string;
    children: React.ReactNode;
    className?: string;
    bodyClass?: string;
    title?: string;
    subtitle?: string;
    enableSearch?: boolean;
    searchPlaceholder?: string;
    searchValue?: string;
    footer?: React.ReactNode;
    footerClass?: string;
    onSearchChange?: (value: string) => void;
}

export default function Card({ children, className, bodyClass, title, id, enableSearch, subtitle, searchPlaceholder, searchValue, footer, footerClass, onSearchChange }: CardProps) {
    const [search, setSearch] = useState(searchValue!);

    useEffect(() => {
        onSearchChange?.(search);
    }, [search]);
    
    return (
        <div className={`${className}`} id={id}>
            <div className="flex px-3 py-2 items-center justify-between">
                <div className="flex flex-col leading-none items-start">
                    {title && <div className="text-lg font-semibold text-slate-600">{title}</div>}
                    {subtitle && <div className="text-xs font-medium text-slate-600">{subtitle}</div>}
                </div>
                {enableSearch && <SearchBox placeholder={searchPlaceholder} searchBoxStyle="default" value={searchValue!} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch("")} />}
            </div>
            <div className={`${bodyClass} ${bodyClass?.includes("bg-white") ? "" : "bg-white"} shadow overflow-auto max-h-[400px] max-w-full`}>
                {children}
            </div>
            {footer && <div className={footerClass}>{footer}</div>}
        </div>
    );
}