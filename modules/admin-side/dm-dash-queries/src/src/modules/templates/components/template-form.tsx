import { useEffect, useState } from "react";
import type { QueryTemplate } from "../../../core/models/query";
import type { MasterData, MasterItem } from "../../../core/models/master";
import { ProDropDown } from "../../../shell/components/atoms/dropdowns";
import TipTap from "../../../shell/components/tools/TipTap";
import { Button } from "../../../shell/components/atoms/buttons";
import type { QueryClient } from "../templates-home";
import * as XLSX from "xlsx";
import { CloudUpload, X, AlertCircle, FileSpreadsheet, Plus, CheckCircle, Loader2 } from "lucide-react";
import { postData } from "../../../core/utils/helpers/fetch";
import { apiRoutes } from "../../../config/api-routes";

interface TemplateForm {
    selectedClient: QueryClient;
    masterData: MasterData | null;
    selectedTemplate: QueryTemplate | null;
    isNewTemplate: boolean;
    onSaveNewQueryTemplate: (newQueryTemplate: QueryTemplate) => void;
    onUpdateQueryTemplate: (template: QueryTemplate) => void;
    onCancel: () => void;
    onSuccess?: () => void;
}

export default function TemplateForm({ selectedClient, masterData, selectedTemplate, isNewTemplate, onSaveNewQueryTemplate, onUpdateQueryTemplate, onCancel, onSuccess }: TemplateForm) {
    const [template, setTemplate] = useState<QueryTemplate | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<MasterItem | null>(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState<MasterItem | null>(null);
    const [selectedCriticality, setSelectedCriticality] = useState<MasterItem | null>(null);
    const [selectedResponseType, setSelectedResponseType] = useState<MasterItem | null>(null);

    // Excel Upload State
    const [excelData, setExcelData] = useState<any[]>([]);
    const [validationResults, setValidationResults] = useState<any[]>([]);
    const [unrecognizedColumns, setUnrecognizedColumns] = useState<string[]>([]);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isAddingMaster, setIsAddingMaster] = useState<string | null>(null);
    const [isSavingAll, setIsSavingAll] = useState(false);
    const [saveProgress, setSaveProgress] = useState({ current: 0, total: 0 });

    const requiredColumns = ["title", "query", "category", "sub_category"];

    useEffect(() => {
        if (isNewTemplate) {
            setTemplate({} as QueryTemplate);
        } else {
            setTemplate(selectedTemplate);
        }
        console.log('selectedTemplate ', template);
    }, [selectedTemplate]);

    // --------------------------
    // Update selected template
    // --------------------------

    const updateSelectedTemplate = (key: keyof QueryTemplate, value: any) => {
        setTemplate((prev) => {
            console.log('updateSelectedTemplate ', prev, key, value);
            if (!prev) return null;
            return {
                ...prev,
                [key]: value,
            };
        });
    };

    // --------------------------
    // Sync dropdowns when template changes
    // --------------------------

    useEffect(() => {
        if (!selectedTemplate || !masterData) return;

        // Match category
        const category = masterData.categories.find(
            (c) => c.id === selectedTemplate.category_id
        );
        if (category) setSelectedCategory(category);

        // Match subcategory
        const subcategory = category?.sub_category?.find(
            (s) => s.id === selectedTemplate.sub_category_id
        );
        if (subcategory) setSelectedSubCategory(subcategory);

        // Match criticality
        const criticality = masterData.criticalities.find(
            (c) => c.id === selectedTemplate.criticality_id
        );
        if (criticality) setSelectedCriticality(criticality);

        // Match response type
        const responseType = masterData.response_types.find(
            (r) => r.master_code === selectedTemplate.response_type
        );
        if (responseType) setSelectedResponseType(responseType);
    }, [selectedTemplate, masterData]);

    // --------------------------
    // Derived Data
    // --------------------------

    const subCategories =
        selectedCategory?.sub_category && selectedCategory.sub_category.length > 0
            ? selectedCategory.sub_category
            : [];

    // --------------------------
    // Excel Parsing Logic
    // --------------------------

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadedFile(file);
        const reader = new FileReader();
        reader.onload = (event) => {
            const data = event.target?.result;
            // Read with cellHTML to get rich text as HTML
            const workbook = XLSX.read(data, { type: "binary", cellHTML: true });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            
            // Get standard JSON data
            const parsedData = XLSX.utils.sheet_to_json(sheet) as any[];

            if (parsedData.length > 0) {
                const range = XLSX.utils.decode_range(sheet['!ref']!);
                
                // Find headers to map back to cells for HTML extraction
                const headers: string[] = [];
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const cell = sheet[XLSX.utils.encode_cell({ r: range.s.r, c: C })];
                    headers[C] = cell ? String(cell.v).toLowerCase().trim() : "";
                }

                // Map HTML content for 'query' column
                const enrichedData = parsedData.map((row, R_idx) => {
                    const R = R_idx + range.s.r + 1; // 1-indexed row in sheet (skipping header)
                    const newRow = { ...row };
                    
                    for (let C = range.s.c; C <= range.e.c; ++C) {
                        const header = headers[C];
                        if (header === 'query') {
                            const cell = sheet[XLSX.utils.encode_cell({ r: R, c: C })];
                            // Use cell.h (HTML) if available, otherwise fallback to cell.v or row value
                            if (cell && cell.h) {
                                newRow['query'] = cell.h;
                            }
                        }
                    }
                    return newRow;
                });

                const columns = Object.keys(parsedData[0]);
                const missing = requiredColumns.filter(col => !columns.includes(col));
                setUnrecognizedColumns(missing);
                setExcelData(enrichedData);
                setShowPreview(true);
                
                if (missing.length === 0) {
                    validateMasters(enrichedData);
                }
            }
        };
        reader.readAsBinaryString(file);
    };

    const validateMasters = async (data: any[]) => {
        setIsValidating(true);
        try {
            const response = await postData(apiRoutes.master.checkExcelMasters, { data });
            if (response.status) {
                setValidationResults(response.validation);
            }
        } catch (error) {
            console.error("Validation error:", error);
        } finally {
            setIsValidating(false);
        }
    };

    const handleAddMaster = async (name: string, group: string, parentId: number = 0, index: number) => {
        setIsAddingMaster(`${group}-${index}`);
        try {
            const response = await postData(apiRoutes.master.addMasterData, {
                master_name: name,
                master_group: group,
                parent_master_id: parentId
            });
            if (response.status) {
                // Re-validate to update indices and IDs
                await validateMasters(excelData);
            } else {
                alert(response.message || "Failed to add master data");
            }
        } catch (error) {
            console.error("Add master error:", error);
        } finally {
            setIsAddingMaster(null);
        }
    };

    const clearUpload = () => {
        setUploadedFile(null);
        setExcelData([]);
        setValidationResults([]);
        setUnrecognizedColumns([]);
        setShowPreview(false);
    };

    const isUploadDisabled = isValidating || validationResults.length === 0 || validationResults.some(r => !r.category_id || !r.sub_category_id);

    return (
        <div className="bg-slate-50 border border-slate-300">
            <div className="py-2 px-3 flex items-center justify-between">
                <div className="text-slate-700 font-semibold">
                    <div className="text-xs text-slate-500">{isNewTemplate ? 'Create new template for' : 'Edit template for'}</div>
                    <div className="text-sm text-slate-700">{selectedClient.name ?? ''}</div>
                </div>

                <div className="flex items-center gap-2">
                    {isNewTemplate && !showPreview && (
                        <div className="relative">
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileUpload}
                            />
                            <Button theme="light" className="flex gap-1 items-center">
                                <CloudUpload size={16} /> Bulk Upload
                            </Button>
                        </div>
                    )}

                    <Button theme="light" className="flex gap-1 items-center" onClick={() => onCancel()}>Cancel</Button>

                    <Button 
                        theme="primary" 
                        className="flex gap-1 items-center" 
                        props={{ disabled: (showPreview && isUploadDisabled) || isUploading }}
                        onClick={() => {
                            console.log('saving template button clicked ... ', template);
                            if (showPreview && uploadedFile) {
                                if (unrecognizedColumns.length > 0) {
                                    alert("Please fix the column errors before uploading.");
                                    return;
                                }
                                setIsUploading(true);
                                setIsSavingAll(true);
                                setSaveProgress({ current: 0, total: excelData.length });

                                // Sequential save to avoid overwhelming backend and maintain order
                                const saveTemplates = async () => {
                                    for (let i = 0; i < excelData.length; i++) {
                                        const row = excelData[i];
                                        const validation = validationResults[i];
                                        
                                        setSaveProgress(prev => ({ ...prev, current: i + 1 }));

                                        try {
                                            await postData(apiRoutes.templates.insert.insertQueryTemplate, {
                                                title: row.title,
                                                query: row.query,
                                                category_id: validation.category_id,
                                                sub_category_id: validation.sub_category_id,
                                                project_id: selectedClient.works_manager_client_id,
                                                criticality_id: 1, // Defaulting to Low as seen in preview
                                                response_type: 'confirmation' // Defaulting to confirmation as seen in preview
                                            });
                                        } catch (err) {
                                            console.error(`Error saving row ${i + 1}:`, err);
                                        }
                                    }

                                    alert("Bulk upload completed successfully.");
                                    clearUpload();
                                    if (onSuccess) onSuccess();
                                    onCancel();
                                    setIsUploading(false);
                                    setIsSavingAll(false);
                                };

                                saveTemplates();
                            } else {
                                isNewTemplate ? onSaveNewQueryTemplate(template!) : onUpdateQueryTemplate(template!)
                            }
                        }}
                    >
                        {isValidating ? (
                            <><Loader2 size={16} className="animate-spin" /> Validating...</>
                        ) : isSavingAll ? (
                            <><Loader2 size={16} className="animate-spin" /> {saveProgress.current}/{saveProgress.total} Saved</>
                        ) : isUploading ? (
                            <><Loader2 size={16} className="animate-spin" /> Uploading...</>
                        ) : (
                            showPreview ? 'Process Upload' : (isNewTemplate ? 'Create Template' : 'Update Template')
                        )}
                    </Button>
                </div>
            </div>

            {showPreview && (
                <div className="p-4 bg-white border-t border-slate-300 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-700 font-semibold">
                            <FileSpreadsheet size={20} className="text-green-600" />
                            Excel Data Preview ({excelData.length} rows)
                        </div>
                        <button onClick={clearUpload} className="text-slate-400 hover:text-red-500">
                            <X size={20} />
                        </button>
                    </div>

                    {unrecognizedColumns.length > 0 && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm flex gap-2 items-start">
                            <AlertCircle size={18} className="shrink-0" />
                            <div>
                                <strong>Missing/Unrecognized Columns:</strong>
                                <ul className="list-disc list-inside mt-1">
                                    {unrecognizedColumns.map(col => <li key={col}>{col}</li>)}
                                </ul>
                                <p className="mt-1">Please ensure your Excel file has standard headers: {requiredColumns.join(", ")}</p>
                            </div>
                        </div>
                    )}

                    <div className="overflow-x-auto border border-slate-200 rounded">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                                <tr>
                                    <th className="px-3 py-2">Title</th>
                                    <th className="px-3 py-2">Query</th>
                                    <th className="px-3 py-2">Category</th>
                                    <th className="px-3 py-2">Sub Category</th>
                                    <th className="px-3 py-2 text-slate-400">Criticality</th>
                                    <th className="px-3 py-2 text-slate-400">Response</th>
                                    <th className="px-3 py-2 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {excelData.map((row, idx) => {
                                    const validation = validationResults[idx];
                                    const isCatMissing = validation && !validation.category_id;
                                    const isSubMissing = validation && validation.category_id && !validation.sub_category_id;
                                    
                                    return (
                                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="px-3 py-2">{row.title || "-"}</td>
                                            <td className="px-3 py-2 truncate max-w-xs text-xs">
                                                <div dangerouslySetInnerHTML={{ __html: row.query || "-" }} />
                                            </td>
                                            <td className={`px-3 py-2 ${isCatMissing ? 'text-red-500 font-medium' : ''}`}>
                                                {row.category || "-"}
                                                {isCatMissing && <span className="text-[10px] ml-1 opacity-70">(Missing)</span>}
                                            </td>
                                            <td className={`px-3 py-2 ${isSubMissing ? 'text-red-500 font-medium' : ''}`}>
                                                {row.sub_category || "-"}
                                                {isSubMissing && <span className="text-[10px] ml-1 opacity-70">(Missing)</span>}
                                            </td>
                                            <td className="px-3 py-2 text-slate-400 italic">low</td>
                                            <td className="px-3 py-2 text-slate-400 italic">confirmation</td>
                                            <td className="px-3 py-2 text-right">
                                                <div className="flex justify-end gap-1">
                                                    {isCatMissing ? (
                                                        <button 
                                                            onClick={() => handleAddMaster(row.category, 'category', 0, idx)}
                                                            disabled={isAddingMaster === `category-${idx}`}
                                                            className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 title='Add Category'"
                                                        >
                                                            {isAddingMaster === `category-${idx}` ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                                        </button>
                                                    ) : isSubMissing ? (
                                                        <button 
                                                            onClick={() => handleAddMaster(row.sub_category, 'sub_category', validation.category_id, idx)}
                                                            disabled={isAddingMaster === `sub_category-${idx}`}
                                                            className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 title='Add Sub Category'"
                                                        >
                                                            {isAddingMaster === `sub_category-${idx}` ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                                        </button>
                                                    ) : validation ? (
                                                        <CheckCircle size={16} className="text-green-500" />
                                                    ) : null}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!showPreview && (
                <div className="space-y-4 py-2 px-3">
                    <div>
                        <input
                            className="w-full bg-white border border-slate-300 px-2 py-1 outline-0"
                            placeholder="Query Title"
                            type="text"
                            value={template?.title || ""}
                            onChange={(e) =>
                                updateSelectedTemplate("title", e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <TipTap
                            content={template?.query || ""}
                            onChange={(content) => updateSelectedTemplate("query", content)}
                            containerClassName="overflow-hidden bg-white"
                        />
                    </div>

                    {/* Dropdowns section */}
                    <div className="grid grid-cols-3 gap-4">
                        {/* Category Dropdown */}
                        <div className="flex flex-col gap-4 w-full max-w-md">
                            {masterData && (
                                <ProDropDown
                                    title="Category"
                                    items={masterData.categories}
                                    idKey="id"
                                    displayKey="master_name"
                                    selectedValue={selectedCategory?.id ?? ""}
                                    onValueChange={(item) => {
                                        setSelectedCategory(item);
                                        setSelectedSubCategory(null);
                                        updateSelectedTemplate("category_id", item.id);
                                    }}
                                    width="full"
                                />
                            )}
                        </div>

                        {/* Subcategory Dropdown */}
                        <div className="flex flex-col gap-4 w-full max-w-md">
                            {selectedCategory && (
                                <ProDropDown
                                    title="Sub Category"
                                    items={subCategories}
                                    idKey="id"
                                    displayKey="master_name"
                                    selectedValue={selectedSubCategory?.id ?? ""}
                                    onValueChange={(item) => {
                                        setSelectedSubCategory(item);
                                        updateSelectedTemplate("sub_category_id", item.id);
                                    }}
                                    width="full"
                                />
                            )}
                        </div>

                        {/* Criticality Dropdown */}
                        <div className="flex flex-col gap-4 w-full max-w-md">
                            {masterData && (
                                <ProDropDown
                                    title="Criticality"
                                    items={masterData.criticalities}
                                    idKey="id"
                                    displayKey="master_name"
                                    selectedValue={selectedCriticality?.id ?? ""}
                                    onValueChange={(item) => {
                                        setSelectedCriticality(item);
                                        updateSelectedTemplate("criticality_id", item.id);
                                    }}
                                    width="full"
                                />
                            )}
                        </div>
                    </div>

                    {/* Response Type Section */}
                    <div>
                        {masterData && (
                            <ProDropDown
                                title="Response Type"
                                items={masterData.response_types}
                                idKey="id"
                                displayKey="master_name"
                                selectedValue={selectedResponseType?.id ?? ""}
                                onValueChange={(item) => {
                                    setSelectedResponseType(item);
                                    updateSelectedTemplate("response_type", item.master_code);
                                }}
                                width="full"
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}