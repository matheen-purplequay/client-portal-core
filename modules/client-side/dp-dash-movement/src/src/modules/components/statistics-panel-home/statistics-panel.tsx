import { usePageContext } from "../../../core/utils/stores/PageContext";
import QuickLinksPanel from "./panels/quick-links-panel";
import { availablePages } from "../../../core/seeds/pages";
import React from "react";

export default function StatisticsPanel() {
    const { page } = usePageContext();
    const pages = availablePages;

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="grid grid-cols-2 gap-8 items-center flex-1 w-full">
                <div>
                    {page && pages[page] &&
                        <div className="flex gap-4 items-center">
                            {pages[page].icon && React.cloneElement(pages[page].icon, { size: 38, strokeWidth: 1, className: "text-slate-700" })}
                            <div className="flex flex-col leading-none gap-1">
                                <h2 className="text-lg font-semibold leading-none text-slate-700">{pages[page].title}</h2>
                                <p className="text-xs font-medium leading-none text-slate-500">{pages[page].description}</p>
                            </div>
                        </div>
                    }
                </div>
                <QuickLinksPanel />
            </div>
        </div>
    );
}