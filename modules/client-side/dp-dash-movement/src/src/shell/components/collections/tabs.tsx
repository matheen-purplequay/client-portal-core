export interface Tab {
    id: number;
    label: string | React.ReactNode;
}

interface TabsProps {
    tabs: Tab[];
    tabsSelected: (tab: Tab) => void;
    selectedTab: Tab;
    className?: string;
    tabClassName?: string;
    theme?: "default" | "primary" | "light" | "secondary";
    tabStyle?: "default" | "minimal";
    size?: "default" | "small";
}

export const Tabs = ({ tabs, tabsSelected, selectedTab, className, theme = "default", tabStyle = "default", size = "default", tabClassName }: TabsProps) => {

    const themes = {
        default: {
            selected: tabStyle == "default" ? "bg-primary text-white" : "border-b-2 border-primary",
            unselected: tabStyle == "default" ? "bg-transparent text-gray-500" : "border-b-2 border-transparent"
        },
        primary: {
            selected: tabStyle == "default" ? "bg-primary text-white" : "border-b-2 border-primary text-primary",
            unselected: tabStyle == "default" ? "bg-transparent text-slate-700" : ""
        },
        light: {
            selected: tabStyle == "default" ? "bg-white text-primary" : "border-b-2 border-white",
            unselected: tabStyle == "default" ? "bg-transparent text-white" : "border-b-2 border-transparent"
        },
        secondary: {
            selected: tabStyle == "default" ? "bg-secondary text-white" : "border-b-2 border-secondary text-secondary",
            unselected: tabStyle == "default" ? "bg-transparent text-secondary" : "border-b-2 border-transparent"
        }
    };

    return (
        <div className={className}>
            <div className="flex gap-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => tabsSelected(tab)}
                        className={`
                            font-semibold cursor-pointer ${tabClassName}
                            ${tabStyle === "default" ? "rounded" : ""}
                            ${size === "small" ? "px-2 py-0" : "px-4 py-1"} 
                            ${selectedTab.id === tab.id ? themes[theme].selected : themes[theme].unselected}
                        `}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
};