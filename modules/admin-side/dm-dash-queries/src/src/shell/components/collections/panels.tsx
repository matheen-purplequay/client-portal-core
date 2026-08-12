import { Button } from "../atoms/buttons";
import { Minus, UnfoldVertical, X } from "lucide-react";
import { useEffect, useState } from "react";

interface BottomPanelProps {
    title: string;
    showSidePanel: boolean;
    setShowSidePanel: (show: boolean) => void;
    children: React.ReactNode;
}

export const BottomPanel = ({ title = "Help", showSidePanel, setShowSidePanel, children }: BottomPanelProps) => {
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        if(showSidePanel && isMinimized) setIsMinimized(false);
    }, [showSidePanel]);

    const handleClose = () => {
        setShowSidePanel(false);
        setTimeout(() => setIsMinimized(false), 300);
    };

    return (
        <div className={`
            fixed inset-0 z-[9999] top-auto left-auto w-[300px] bg-white shadow-2xl rounded-lg border overflow-y-auto smooth-animation transition-all duration-300 
            ${showSidePanel ? 'opacity-100 translate-y-0' : `opacity-0 translate-y-full pointer-events-none`}   
            ${isMinimized ? 'border-slate-200' : 'border-primary' }
        `}>
            <div className={`flex items-center justify-between p-2 select-none cursor-default border-b transition-colors duration-200 ${isMinimized ? 'bg-primary text-slate-100 border-primary' : 'bg-slate-100 text-slate-700 border-slate-300'}`} 
                onClick={() => {
                    if(isMinimized) setIsMinimized(false);
                    else return;
                }}
            >
                <div className="text-sm font-semibold">{title}</div>
                <div className="flex items-center gap-2">
                    <Button theme="light_primary" className="font-medium px-1 aspect-square" shape="circle" onClick={() => setIsMinimized(!isMinimized)}>
                        {!isMinimized && <Minus size={18} strokeWidth={2} />}
                        {isMinimized && <UnfoldVertical size={18} strokeWidth={2} />}
                    </Button>
                    <Button theme="light_primary" className="font-medium px-1 aspect-square" shape="circle" onClick={(e) => { e.stopPropagation(); handleClose(); }}><X size={18} strokeWidth={2} /></Button>
                </div>
            </div>
            <div className={`space-y-4 smooth-animation transition-all duration-300 overflow-y-auto ${isMinimized ? 'h-0 ' : 'h-[50vh]'}`}>{children}</div>
        </div>
    );
}