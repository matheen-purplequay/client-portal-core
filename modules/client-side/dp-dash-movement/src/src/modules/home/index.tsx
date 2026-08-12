import { MovementHome } from "../movement-home/movement-home";
import { usePageContext } from "../../core/utils/stores/PageContext";
import { availablePages } from "../../core/seeds/pages";
import { Blocks } from "lucide-react";
declare const __APP_VERSION__: string;

export default function Home() {
    const { page } = usePageContext();
    const pages = availablePages;
    const version = __APP_VERSION__;

    return (
        <div>
            <div className={`${page == pages.movement.id ? 'block' : 'hidden'}`}>
                <MovementHome />
            </div>

            <div className="py-5 text-slate-400 text-xs text-center flex gap-2 flex-col items-center justify-center">
                <Blocks size={32} strokeWidth={1} className="text-slate-300"/>
                <p>Dashboard module v{version}</p>
            </div>
        </div>
    );
}