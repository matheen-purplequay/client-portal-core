interface UserCard {
    name: string;
    role: string;
    icon: React.ReactNode;
}

export const UserCard = ({ name, role, icon }: UserCard) => {
    return (
        <div className="flex items-center gap-2">
            {icon}
            <div className="flex flex-col leading-none gap-1">
                <div className="text-xs font-medium text-slate-600">{role}</div>
                <div className="font-medium text-slate-700">{name}</div>
            </div>
        </div>
    );
};