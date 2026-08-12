import type { Template } from "../../../../../../../core/models/template";
import { TemplateChooser } from "../../components/templates/template-chooser";
import { AlertCircle } from "lucide-react";

interface TemplateChooserPageProps {
    templateChoosed: (template: Template) => void;
}

export const TemplateChooserPage = ({ templateChoosed }: TemplateChooserPageProps) => {
    return (
        <div>
            <div className="px-2 pt-4 pb-2 flex items-center gap-2">
                <AlertCircle strokeWidth={1.5} className="text-slate-500" />
                <h1 className="text-lg font-semibold">
                    Choose a template to create a new query
                </h1>
            </div>
            <TemplateChooser templateChoosed={templateChoosed} />
        </div>
    );
};