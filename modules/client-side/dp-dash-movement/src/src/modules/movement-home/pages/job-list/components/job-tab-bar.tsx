import { JobTabButton } from "./job-tab-button";

interface JobTabBarProps<T> {
    tabs: T[];
    selectedTab: any;
    onTabSelect: (tab: any) => void;
    onTabClose: (tab: any) => void;
    vertical: string;
    containerRef: any;
}

export const JobTabBar = <T,>({ tabs, selectedTab, onTabSelect, onTabClose, vertical, containerRef }: JobTabBarProps<T>) => {

    return (
        <div className="flex items-end gap-2 px-5 -z-0 select-none">
            <JobTabButton id={0}
                index={-1}
                title="Jobs List"
                description={vertical}
                onClose={() => onTabClose(null)}
                onClick={() => onTabSelect(null)}
                isSelected={selectedTab === null}
                theme="primary"
            />
            <div className="flex-1 w-full flex items-center gap-2" ref={containerRef}>
                {tabs.map((tab: any, index) => (
                    <JobTabButton
                        index={index}
                        key={tab.Aid}
                        id={Number(tab.Aid)}
                        title={tab.Jobname}
                        description={<div className='flex items-center gap-1'><span>FY {tab.financial_year}</span>     {tab.ReceivedDate && (
                            <>
                                <span>-</span>
                                <span>JY {tab.ReceivedDate.split("-")[2]}</span>
                            </>
                        )}</div>}
                        isSelected={selectedTab?.Aid === tab.Aid}
                        onClose={() => onTabClose(tab)}
                        onClick={() => onTabSelect(tab)}
                        theme="secondary"
                    />
                ))}
            </div>
        </div>
    );
};