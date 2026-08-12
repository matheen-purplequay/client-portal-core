
import { useEffect, useState } from "react";
import { Input } from "../../../../../../../shell/components/atoms/inputs";
import { Button } from "../../../../../../../shell/components/atoms/buttons";
import TipTap from "../../../../../../../shell/components/tools/TipTap";
import type { Template } from "../../../../../../../core/models/template";
import { AlertCircle, Trash } from "lucide-react";
import { Toolbar } from "../../../../../../../shell/components/collections/toolbar";
import { useAppContext } from "../../../../../../../core/utils/stores/AppContext";
import { detectDocuments, generateRandomId } from "../../helpers/documents";
import { Filters } from "../../../../job-list/components/filters";

interface ScreenAddQueriesProps {
    template: Template;
    doesRequireDocuments: boolean;
    nextScreen: (template: Template) => void;
    prevScreen: () => void;
}

export const ScreenAddQueries = ({ template, doesRequireDocuments, nextScreen, prevScreen }: ScreenAddQueriesProps) => {
    const [updatedTemplate, setUpdatedTemplate] = useState<Template>(template);
    const userData = useAppContext()?.userData;

    useEffect(() => {
        if (updatedTemplate.query) {
            const documents = detectDocuments(updatedTemplate.query, 0, updatedTemplate, userData);
            if(documents && documents.length > 0) {
                setUpdatedTemplate({ ...updatedTemplate, response_attachments: documents!.map((document) => ({ documentID: generateRandomId(), title: document, link: '', user_id: userData?.user_id })) });
            }
        }
    }, [updatedTemplate.query]);

    useEffect(() => {
        if(updatedTemplate.query) {
            const documents = detectDocuments(updatedTemplate.query, 0, updatedTemplate, userData);
            if(documents && documents.length > 0) {
                setUpdatedTemplate({ ...updatedTemplate, 
                    response_attachments: documents!.map((document) => ({ documentID: generateRandomId(), title: document, link: '', user_id: userData?.user_id })), 
                });
            }
        }
    }, [updatedTemplate.query]);

    const generateEmptyDocument = () => {
        return {
            documentID: generateRandomId(),
            title: 'Document 1',
            link: '',
            user_id: userData?.user_id
        };
    };

    const handleRemoveDocument = (documentID: number) => {
        setUpdatedTemplate({ ...updatedTemplate, response_attachments: updatedTemplate.response_attachments.filter((document) => document.documentID !== documentID) });
        if(updatedTemplate.response_attachments.length === 0) {
            setUpdatedTemplate({ ...updatedTemplate, response_attachments: [generateEmptyDocument()] });
        }
    };

    const handleDocumentChange = (documentID: number, title: string) => {
        setUpdatedTemplate({ ...updatedTemplate, response_attachments: updatedTemplate.response_attachments.map((document) => document.documentID === documentID ? { ...document, title } : document) });
    };

    const hasRequiredDocuments = () => (doesRequireDocuments && updatedTemplate.response_attachments && updatedTemplate.response_attachments.length > 0);

    return (
        <div>
            <div className="space-y-4">
                <Input
                    label="Query Title"
                    value={updatedTemplate.title}
                    onChange={(e) => setUpdatedTemplate({ ...updatedTemplate, title: e.target.value })}
                    placeholder="Query Title"
                    inputStyle="sharp" />

                <div>
                    <Filters></Filters>
                </div>

                <div className={`grid gap-4 ${hasRequiredDocuments() ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    <div>
                        <label className="text-sm font-semibold text-slate-500">Query</label>
                        <TipTap
                            content={updatedTemplate.query}
                            onBlur={(content) => setUpdatedTemplate({ ...updatedTemplate, query: content })} 
                        />
                    </div>
                    {doesRequireDocuments && updatedTemplate.response_attachments && updatedTemplate.response_attachments.length > 0 && 
                        <div>
                            <label className="text-sm font-semibold text-slate-500">Required Documents</label>
                            <div className="border border-slate-300">
                                <Toolbar layout="split" className="py-[11px] px-4 bg-slate-100 border-b border-slate-300">
                                    <div className="text-slate-700 text-sm flex items-center gap-2"><AlertCircle strokeWidth={1.5} size={18} /> To add or remove document, update the list of document names in the query.</div>
                                </Toolbar>
                                <div className="p-4 space-y-2">
                                    {doesRequireDocuments && updatedTemplate.response_attachments && updatedTemplate.response_attachments.length > 0 && updatedTemplate.response_attachments.map((document, index) => (
                                        <div key={document.documentID} className="flex items-end gap-2">
                                            <Input
                                                label={`${index + 1}. Document`}
                                                value={document.title}
                                                placeholder="Document"
                                                inputStyle="sharp"
                                                containerClassName="flex-1 w-full"
                                                onChange={(e) => handleDocumentChange(document.documentID, e.target.value)}
                                            />
                                            <Button theme="light" shape="pill" className="p-2" onClick={() => handleRemoveDocument(document.documentID)}><Trash strokeWidth={1.5} size={18} /></Button>
                                        </div>
                                    ))}

                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>
            <div className="text-right py-4">
                <Button theme="light" onClick={() => prevScreen()}>Choose Template</Button>
                <Button theme="primary" onClick={() => nextScreen(updatedTemplate)}>Preview Queries</Button>
            </div>
        </div>
    );
};