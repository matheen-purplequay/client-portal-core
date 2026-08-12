import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useEffect } from "react";

interface ToastProps {
    message: string;
    type?: "success" | "error" | "warning" | "info" | "default";
    duration?: number;
    show: boolean;
    setShow?: (show: boolean) => void;
}

export default function Toast({ 
    message, 
    type = "default", 
    duration = 3000, 
    show, 
    setShow 
}: ToastProps) {

    const typeStyles = {
        success: "bg-green-100 text-green-700",
        error: "bg-red-100 text-red-700",
        warning: "bg-yellow-100 text-yellow-700",
        info: "bg-blue-100 text-blue-700",
        default: "bg-slate-900 text-slate-100"
    };

    useEffect(() => {
        if (!show) return;
        const timer = setTimeout(() => {
            setShow?.(false);
        }, duration);
        return () => clearTimeout(timer);
    }, [show, duration, setShow]);

    return (
        <div
            className={`
                fixed top-4 right-4 pl-2 pr-4 py-2 rounded-lg shadow-lg flex gap-2 items-center transition-all duration-300 smooth-animation z-[9999]
                ${typeStyles[type]}
                ${show ? "translate-y-0 opacity-100" : "opacity-0 pointer-events-none -translate-y-full"}
            `}
        >
            {type === "default" && <AlertCircle size={20} />}
            {type === "success" && <CheckCircle size={20} />}
            {type === "error" && <XCircle size={20} />}
            {type === "warning" && <AlertCircle size={20} />}
            {type === "info" && <AlertCircle size={20} />}
            <p>{message}</p>
        </div>
    );
}
