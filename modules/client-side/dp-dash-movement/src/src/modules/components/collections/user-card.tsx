interface InfoCard {
    value: string;
    label: string;
    icon?: React.ReactNode;
}

export const InfoCard = ({ value: name, label: role, icon }: InfoCard) => {
    return (
        <div className="flex items-center gap-2">
            {icon && icon}
            <div className="flex flex-col leading-none gap-1">
                <div className="text-xs font-medium text-slate-600">{role}</div>
                <div className="font-medium text-slate-700">{name}</div>
            </div>
        </div>
    );
};