import { usePageContext } from "../../../../core/utils/stores/PageContext";
import { availablePages } from "../../../../core/seeds/pages";
import { useState } from "react";
import React from "react";

export default function QuickLinksPanel() {
    const { page, setPage } = usePageContext() || {};
    const pages = availablePages;
    const [activePage, setActivePage] = useState(page);

    const handleSetPage = (page: string) => {
        if(pages[page].isActive) {
            setActivePage(page);
            setPage?.(page);
        }
    }

    return (
        <div className="flex items-center justify-center">
            {pages && Object.keys(pages).length > 0 && (
                <>                
                    { Object.keys(pages).map((page: string, index: number) => (
                        <React.Fragment key={index}>
                            <div 
                                className={`
                                    hover:text-secondary cursor-pointer group
                                    border border-slate-400 first:rounded-l-lg last:rounded-r-lg transition-all duration-100
                                    ${!pages[page].isActive && 'pointer-events-none opacity-75 bg-slate-100'}
                                    ${page == activePage ? 'bg-slate-200 text-secondary shadow-inner shadow-slate-400 border-t-3 link-active' : 'bg-gradient-to-b from-white via-slate-100 to-slate-200 from-70% via-90% text-secondary shadow-xl border-b-3'}
                                `}
                                onClick={() => handleSetPage(page)}
                            >
                                <div className="px-3 py-1 flex gap-1 items-center h-full">
                                    {!pages[page].isActive && <div className="text-sm text-slate-500 leading-none">{pages[page].message}</div>}
                                    {pages[page].isActive && pages[page].icon}
                                    <div className={`text-sm ${!pages[page].isActive && 'text-slate-500'}`}>{pages[page].title}</div>
                                </div>
                            </div>
                        </React.Fragment>
                    )) }
                </>                
            )}
        </div>
    );
}