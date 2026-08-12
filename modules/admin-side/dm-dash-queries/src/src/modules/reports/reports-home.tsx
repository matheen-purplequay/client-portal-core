import { ChartColumn, PieChart, TrendingUp } from "lucide-react";

export default function ReportsHome() {
    return (
        <div className="bg-slate-50 border border-slate-300 p-5 flex gap-4 flex-col items-center justify-between text-slate-700">
            <div className="flex items-center gap-6">
                <div><ChartColumn   size={48} strokeWidth={0.5} className="text-slate-400"/></div>
                <div><PieChart      size={64} strokeWidth={0.5} className="text-slate-500"/></div>
                <div><TrendingUp    size={48} strokeWidth={0.5} className="text-slate-400"/></div>
            </div>
            <div className="text-lg text-slate-500">Query reports coming soon...</div>
        </div>
    );
}