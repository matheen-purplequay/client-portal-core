import { usePageContext } from "../../../core/utils/stores/PageContext";
import QuickLinksPanel from "./panels/quick-links-panel";
import { availablePages } from "../../../core/seeds/pages";
import React from "react";
import { Button } from "../../../shell/components/atoms/buttons";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { BottomPanel } from "../../../shell/components/collections/panels";

export default function StatisticsPanel() {
    const { page } = usePageContext();
    const pages = availablePages;
    const [showSidePanel, setShowSidePanel] = useState(false);

    return (
        <>
            <div className="flex flex-col items-center justify-center gap-4">
                <div className="grid grid-cols-2 gap-8 items-center flex-1 w-full">
                    <div className="flex items-center gap-4">
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
                    </div>
                    <div className="flex gap-4 items-center justify-end">
                        {page && pages[page] && pages[page].helperText &&
                            <div className="text-xs text-slate-500 text-right flex items-center justify-start">
                                <Button theme="outline" className="flex items-center gap-1 pl-1 pr-2 font-medium" shape="pill" onClick={() => setShowSidePanel(!showSidePanel)}><AlertCircle size={16} strokeWidth={2} /> Help</Button>
                            </div>
                        }
                        <QuickLinksPanel />
                    </div>
                </div>
            </div>
            <BottomPanel title={pages[page!].helperTitle!} showSidePanel={showSidePanel} setShowSidePanel={setShowSidePanel}>
                {pages[page!].helperText}
            </BottomPanel>
        </>
    );
}