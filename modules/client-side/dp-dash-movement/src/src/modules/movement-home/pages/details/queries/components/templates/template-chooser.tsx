import { getQueryTemplates } from "../../helpers/templates";
import { useEffect, useState } from "react";
import type { Template } from "../../../../../../../core/models/template";
import { CircleArrowLeft, CircleCheckBig, FileText } from "lucide-react";
import { Button } from "../../../../../../../shell/components/atoms/buttons";

interface TemplateChooserProps {
    templateChoosed: (template: Template) => void;
}

export const TemplateChooser = ({ templateChoosed }: TemplateChooserProps) => {

    const [templates, setTemplates] = useState<Template[]>([]);
    const [chosenTemplate, setChosenTemplate] = useState<Template | null>(null);

    useEffect(() => {
        if (!templates || templates.length === 0) {
            getQueryTemplates().then((data) => {
                if (data.status) setTemplates(data.templates)
            });
        }
    }, [templates]);

    const handleChooseTemplate = (template: Template) => {
        setChosenTemplate(template);
    };

    return (
        <div data-templates={templates.length} className="h-full overflow-y-auto grid grid-cols-2">
            <div className="border-t border-r border-slate-300 h-[50vh] overflow-y-auto">
                {templates && templates.length > 0 && templates.map((template, idx) => (
                    <div key={idx}
                        className={`
                        px-5 py-2 cursor-pointer border-b border-slate-300
                        ${chosenTemplate?.id === template.id ? "bg-primary text-white hover:bg-primary hover:text-white" : "bg-transparent hover:bg-primary-50 hover:text-primary"}
                    `}
                        onClick={() => handleChooseTemplate(template)}
                    >
                        <div className="text-xs font-semibold">{template.category_name}</div>
                        <p>{template.title}</p>
                    </div>
                ))}
            </div>
            <div className="px-4 h-[50vh] overflow-y-auto">
                {!chosenTemplate &&
                    <div className="h-full flex items-center justify-center text-center text-slate-500 text-sm flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <CircleArrowLeft strokeWidth={1} size={48} />
                            <FileText strokeWidth={1} size={48} />
                        </div>
                        Choose a template to preview everything.
                    </div>
                }
                {chosenTemplate && (
                    <div className="py-4 space-y-4 h-full flex flex-col justify-center">
                        <div className="flex-1">
                            <h1 className="font-bold text-lg">Template Preview</h1>
                            <div className="grid grid-cols-2 grid-rows-2 gap-2 mb-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500">Category</label>
                                    <p className="text-sm text-slate-700">{chosenTemplate.category_name}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500">Sub Category</label>
                                    <p className="text-sm text-slate-700">{chosenTemplate.sub_category_name}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500">Criticality</label>
                                    <p className="text-sm text-slate-700">{chosenTemplate.criticality_name}</p>
                                </div>
                            </div>
                            {chosenTemplate.query_template_code.trim() != "C001" && (
                                <div className="border border-slate-300 p-2">
                                    <label className="text-xs font-semibold text-slate-500">Full Query</label>
                                    <p className="text-sm text-slate-700" dangerouslySetInnerHTML={{ __html: chosenTemplate.query }}></p>
                                </div>
                            )}
                        </div>

                        <div className="text-right">
                            <Button theme="primary" className="pl-2 py-2" onClick={() => templateChoosed(chosenTemplate!)}>
                                <div className="flex items-center gap-2">
                                    <CircleCheckBig strokeWidth={1.5} /> Select Template
                                </div>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};