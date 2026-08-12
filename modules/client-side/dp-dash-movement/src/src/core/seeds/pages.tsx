import { Briefcase, ChartBar, Table } from "lucide-react";

interface Page {
    id: string;
    title: string;
    description?: string | string[];
    icon?: any;
    isActive: boolean;
    message?: string;
}

export const availablePages: { [key: string]: Page } = {
    movement: { 
        id: 'movement', 
        title: 'Job Status', 
        description: 'Use SHIFT + Click to open job details in background tab', 
        icon: <Briefcase strokeWidth={2} size={16} />, 
        isActive: true 
    },
    dashboard: { 
        id: 'dashboard', 
        title: 'Dashboard', 
        description: 'Comprehensive job statistics for One Business Service', 
        icon: <ChartBar strokeWidth={2} size={16} />, 
        isActive: true 
    },
    reports: { 
        id: 'reports', 
        title: 'Reports', 
        description: 'Detailed report generation for One Business Service', 
        icon: <Table strokeWidth={2} size={16} />, 
        isActive: true, 
        message: 'Coming soon...' 
    },
};