import PanelCard from "../components/panel-card";
import PanelContainer from "../components/panel-container";

interface AssociateStatus {
    title: string;
    value: string;
    titleClass?: string;
    valueClass?: string;
}

export default function AssociateStatusPanel() {
    const statistics: AssociateStatus[] = [
        { title: "Mohan", value: "80", titleClass: 'text-slate-700', valueClass: 'text-slate-700' },
        { title: "Kumar", value: "15", titleClass: 'text-yellow-700', valueClass: 'text-yellow-700' },
        { title: "Rathna", value: "15", titleClass: 'text-yellow-700', valueClass: 'text-yellow-700' },
    ];

    return (
        <PanelContainer label="Associate Status">
            {statistics.map((statistic, index) => (
                <PanelCard key={index} title={statistic.title} value={statistic.value} titleClass={statistic.titleClass} valueClass={statistic.valueClass} />
            ))}
        </PanelContainer>
    );
}