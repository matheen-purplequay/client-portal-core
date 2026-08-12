import { useEffect, useState } from "react";
import type { QueryTemplate } from "../../core/models/query";
import { getData, getPostData, postData } from "../../core/utils/helpers/fetch";
import { apiRoutes } from "../../config/api-routes";
import { ProDropDown } from "../../shell/components/atoms/dropdowns";
import { useAppContext } from "../../core/utils/stores/AppContext";
import { Button } from "../../shell/components/atoms/buttons";
import type { MasterData } from "../../core/models/master";
import { FileQuestionMark, MoveLeft } from "lucide-react";
import TemplateForm from "./components/template-form";
import { getQueryTemplatesById } from "../inbox/query-lists/helpers/templates";

export interface QueryClient {
    id: number;
    name: string;
    works_manager_client_id: number;
}

export default function TemplatesHome() {
    const [templates, setTemplates] = useState<QueryTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<QueryTemplate | null>(null);
    const [clients, setClients] = useState<QueryClient[]>([]);
    const [selectedClient, setSelectedClient] = useState<QueryClient | null>(null);
    const context = useAppContext();
    const [masterData, setMasterData] = useState<MasterData | null>(null);
    const [showNewTemplateForm, setShowNewTemplateForm] = useState(false);
    const [isTemplatesLoading, setIsTemplatesLoading] = useState(false);
    const [isClientsLoading, setIsClientsLoading] = useState(false);
    const [, setIsMastersLoading] = useState(false);

    // --------------------------
    // API Calls
    // --------------------------

    const getTemplates = () => {
        setIsTemplatesLoading(true);
        getQueryTemplatesById(selectedClient?.works_manager_client_id!).then((data) => {
            setTemplates(data.templates);
        }).finally(() => {
            setIsTemplatesLoading(false);
        });
    };

    const getClientsFromPortal = () => {
        setIsClientsLoading(true);
        getPostData(apiRoutes.client.get.getClientsFromPortal, {
            staff_id: context?.userData?.staff_id,
        }).then((data) => {
            setClients([
                { id: 0, name: 'Common Templates', works_manager_client_id: 0 },
                ...data.companies
            ]);
        }).finally(() => {
            setIsClientsLoading(false);
        });
    };

    const getMastersByGroup = () => {
        setIsMastersLoading(true);
        getData(apiRoutes.master.getMastersByGroup).then((data) => {
            setMasterData(data);
        }).finally(() => {
            setIsMastersLoading(false);
        });
    };

    useEffect(() => {
        if (selectedClient) {
            getTemplates();
        }
        getClientsFromPortal();
        getMastersByGroup();
    }, []);

    useEffect(() => {
        if (selectedClient) {
            setShowNewTemplateForm(false);
            setSelectedTemplate(null);
            setTemplates([]);
            getTemplates();
        }
    }, [selectedClient]);

    const handleNewTemplate = () => {
        setShowNewTemplateForm(true);
        setSelectedTemplate(null);
    };

    const handleSelectedTemplate = (template: QueryTemplate) => {
        setSelectedTemplate(template);
        setShowNewTemplateForm(false);
    };

    const onSaveNewQueryTemplate = (newQueryTemplate: QueryTemplate) => {
        if (!newQueryTemplate) return;
        newQueryTemplate.project_id = selectedClient?.works_manager_client_id!;
        postData(apiRoutes.templates.insert.insertQueryTemplate, newQueryTemplate).then(() => {
            alert('Template created successfully');
            getTemplates();
            setShowNewTemplateForm(false);
        }).catch(() => {
            alert('Template creation failed');
        });
    };

    const onUpdateQueryTemplate = (template: QueryTemplate) => {
        if (!template) return;
        postData(apiRoutes.templates.update.updateQueryTemplate, template).then(() => {
            alert('Template updated successfully');
            getTemplates();
            setSelectedTemplate(null);
        }).catch(() => {
            alert('Template update failed');
        });
    };

    // --------------------------
    // Render
    // --------------------------

    return (
        <div>
            <div className="grid grid-cols-3 gap-3">
                {/* Left panel: template list */}
                <div className="col-span-1">
                    <div className="bg-slate-50 border border-slate-300">
                        <div className="pl-3 pr-1 py-1 border-b border-slate-300 flex gap-2 items-center">
                            {/* Clients List */}
                            {isClientsLoading && <div className="animate-pulse">Loading clients...</div>}
                            {!isClientsLoading && clients && clients.length > 0 && (
                                <>
                                    <ProDropDown
                                        title="Available Templates for"
                                        items={clients}
                                        idKey="id"
                                        width="full"
                                        containerClass="w-full"
                                        buttonClass="w-full"
                                        displayKey="name"
                                        dropdownStyle="simple"
                                        selectedValue={selectedClient?.id}
                                        onValueChange={(client) => setSelectedClient(client)}
                                    />
                                    <Button theme="simple_primary" className="text-xs text-primary font-semibold whitespace-nowrap py-2" onClick={handleNewTemplate}>New Template</Button>
                                </>
                            )}
                        </div>

                        <div className="max-h-[450px] overflow-y-auto">
                            {isTemplatesLoading && <div className="animate-pulse text-xs text-slate-700 p-3">Loading templates...</div>}
                            {!isTemplatesLoading && templates && templates.length > 0 &&
                                templates.map((template, index) => (
                                    <div
                                        key={template.id}
                                        className={`
                                            py-2 px-3 ${index % 2 === 0 ? "bg-slate-100" : ""} 
                                            cursor-pointer hover:bg-primary-50 transition-all duration-100
                                            ${selectedTemplate?.id === template.id ? "bg-primary-50" : ""}
                                        `}
                                        onClick={() => handleSelectedTemplate(template)}
                                    >
                                        {template.title}
                                    </div>
                                ))
                            }
                            {!isTemplatesLoading && templates && templates.length <= 0 && <div className="text-xs text-slate-700 p-3">No templates available</div>}
                        </div>
                    </div>
                </div>

                {/* Right panel: template editor */}
                <div className="col-span-2 h-full">
                    {/* If new template button is clicked show empty form */}
                    {showNewTemplateForm &&
                        <TemplateForm selectedTemplate={null} selectedClient={selectedClient!} masterData={masterData!} isNewTemplate={true} onSaveNewQueryTemplate={onSaveNewQueryTemplate} onUpdateQueryTemplate={onUpdateQueryTemplate} onCancel={() => setShowNewTemplateForm(false)} onSuccess={getTemplates} />
                    }

                    {/* If template is selected from list show its details */}
                    {!showNewTemplateForm && <>
                        {selectedTemplate ?
                            <TemplateForm selectedTemplate={selectedTemplate} selectedClient={selectedClient!} masterData={masterData!} isNewTemplate={false} onSaveNewQueryTemplate={onSaveNewQueryTemplate} onUpdateQueryTemplate={onUpdateQueryTemplate} onCancel={() => setSelectedTemplate(null)} onSuccess={getTemplates} />
                            :
                            <div className="bg-slate-50 border border-slate-300 p-5">
                                <div className="text-lg text-slate-500 text-center">
                                    {templates && templates.length > 0 && <div className="flex flex-col items-center gap-2"><MoveLeft size={24} strokeWidth={1} className="text-slate-400" /> Select a template from the list</div>}
                                    {!templates || templates.length <= 0 && <div className="flex flex-col items-center gap-2"><FileQuestionMark size={24} strokeWidth={1} className="text-slate-400" /> No templates available</div>}
                                </div>
                            </div>
                        }
                    </>}
                </div>
            </div>
        </div>
    );
}
