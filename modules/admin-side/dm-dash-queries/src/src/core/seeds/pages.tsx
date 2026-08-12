import { ChartLine, FileX2, Inbox, Ruler } from "lucide-react";
import InboxFAQs from "./faqs/inbox";

interface Page {
  id: string;
  title: string;
  description?: string | string[];
  helperText?: string | React.ReactNode | null;
  helperTitle?: string;
  icon?: any;
  isActive: boolean;
  message?: string;
}

export const availablePages: { [key: string]: Page } = {
  inbox: {
    id: "inbox",
    title: "Query Inbox",
    description: "Queries inbox",
    helperText: <InboxFAQs />,
    helperTitle: "Inbox FAQ",
    icon: <Inbox strokeWidth={2} size={16} />,
    isActive: true,
  },
  rejected: {
    id: "rejected",
    title: "Rejected Queries",
    description: "Rejected draft queries",
    helperText: (
      <div className="text-slate-500 text-center p-5">
        Rejected draft queries FAQs coming soon...
      </div>
    ),
    helperTitle: "Rejected Queries FAQ",
    icon: <FileX2 strokeWidth={2} size={16} />,
    isActive: true,
  },
  query_reports: {
    id: "query_reports",
    title: "Query Reports",
    description: "Query reports",
    helperText: (
      <div className="text-slate-500 text-center p-5">
        Query reports FAQs coming soon...
      </div>
    ),
    helperTitle: "Query Reports FAQ",
    icon: <ChartLine strokeWidth={2} size={16} />,
    isActive: true,
  },
  templates: {
    id: "templates",
    title: "Query Templates",
    description: "Query templates",
    helperText: (
      <div className="text-slate-500 text-center p-5">
        Query templates FAQs coming soon...
      </div>
    ),
    helperTitle: "Query Templates FAQ",
    icon: <Ruler strokeWidth={2} size={16} />,
    isActive: true,
  },
};
