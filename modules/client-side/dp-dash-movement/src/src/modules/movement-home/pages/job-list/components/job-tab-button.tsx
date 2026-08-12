import { X } from "lucide-react";
import { Button } from "../../../../../shell/components/atoms/buttons";

interface JobTabButtonProps {
    id: number;
    index: number;
    title: string;
    description?: string | React.ReactNode;
    onClose: (id: number) => void;
    onClick: (id: number) => void;
    isSelected?: boolean;
    theme?: "primary" | "secondary";
    titleClass?: string;
    descriptionClass?: string;
}

export const JobTabButton = ({ id, index, title, description, onClose, onClick, isSelected = false, theme = "primary", titleClass, descriptionClass }: JobTabButtonProps) => {
    return (
        <div
            data-job-id={id}
            className={`
                cursor-pointer  rounded-t-lg flex items-start gap-2 transition-all duration-200
                pl-3 pr-2 pt-2 pb-2
                ${isSelected ? `bg-${theme} text-white translate-y-0 shadow-xl` : "bg-slate-200 text-slate-700 translate-y-3"}
            `}
            onClick={() => onClick(id)}
        >
            <div className={`text-xs whitespace-nowrap overflow-hidden text-ellipsis w-[150px]`}>
                <div className="flex items-start gap-1 font-semibold">
                    <div>{index > -1 && `${index + 1}. `} </div>
                    <div>
                        <div className={`whitespace-nowrap overflow-x-hidden text-ellipsis w-[140px] ${titleClass}`}>{title}</div>
                        <div className={`
                                text-xs whitespace-nowrap overflow-hidden font-semibold text-ellipsis w-[150px] smooth-animation transition-all duration-300
                                ${isSelected ? "opacity-80 translate-y-0" : "opacity-50 translate-y-full"}
                                ${descriptionClass}
                            `}
                        >
                            {description}
                        </div>
                    </div>
                </div>
            </div>
            {index !== -1 &&
                <Button
                    theme="simple"
                    className={`p-0 ${isSelected ? "text-white" : "text-slate-700"}`}
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); onClose(id) }}
                >
                    <X size={16} />
                </Button>
            }
        </div>
    );
};