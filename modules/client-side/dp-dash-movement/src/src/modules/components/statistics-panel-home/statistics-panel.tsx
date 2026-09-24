import QuickLinksPanel from "./panels/quick-links-panel";

export default function StatisticsPanel() {
    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex justify-end items-center flex-1 w-full">
                <QuickLinksPanel />
            </div>
        </div>
    );
}