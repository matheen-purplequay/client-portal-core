import { AlertCircle, Paperclip } from "lucide-react";
import type { Template } from "../../../../../../../core/models/template";
import { Button } from "../../../../../../../shell/components/atoms/buttons";


interface PreviewNewQueriesProps {
    template: Template
}

export const PreviewNewQueries = ({ template }: PreviewNewQueriesProps) => {
    return (
        <div className={`space-y-8 pb-4 max-w-[80vw] mx-auto`}>
            <div className="space-y-4">
                <h1 className="text-lg font-semibold text-slate-500">Preview Queries</h1>
                <div className="text-xl font-medium">{template?.title}</div>

                <div className="my-4 py-3 mb-6 grid grid-cols-3 gap-2 border-b border-slate-300">
                    <div className="text-sm font-medium flex flex-col">
                        <div className="text-slate-500 font-semibold">Category</div>
                        <div>{template?.category_name}</div>
                    </div>
                    <div className="text-sm font-medium flex flex-col">
                        <div className="text-slate-500 font-semibold">Sub Category</div>
                        <div>{template?.sub_category_name}</div>
                    </div>
                    <div className="text-sm font-medium flex flex-col">
                        <div className="text-slate-500 font-semibold">Criticality</div>
                        <div>{template?.criticality_name}</div>
                    </div>
                </div>
                <div className={`grid gap-4 ${template.response_attachments.length > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    <div>
                        <div className="text-sm font-semibold text-slate-500">Query</div>
                        <p className="border border-slate-300 p-2" dangerouslySetInnerHTML={{ __html: template?.query }}></p>
                        <div className="my-4 border bg-yellow-100 border-yellow-700 p-2 text-yellow-900 flex items-center gap-2">
                            <AlertCircle strokeWidth={1.5} />
                            <div>Warning: This query may not be accurate</div>
                        </div>
                    </div>

                    {template.response_attachments.length > 0 &&
                        <div>
                            <div className="text-sm font-semibold text-slate-500">Required Documents ({template.response_attachments.length + 1})</div>
                            <div className="border border-slate-300">
                                {template.response_attachments.map((attachment, index) => (
                                    <div key={index} className="py-3 px-4 border-b last:border-0 border-slate-300 flex gap-2 items-center">
                                        <Paperclip strokeWidth={1.5} size={18} />
                                        <span>{index + 1}. {attachment.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    }
                </div>
            </div>

            <div className="flex gap-2 items-center justify-end">
                <Button theme="primary">Send Queries</Button>
            </div>
        </div>
    );
};