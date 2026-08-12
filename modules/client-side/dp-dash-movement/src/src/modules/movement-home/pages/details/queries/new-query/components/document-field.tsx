import { Input } from "../../../../../../../shell/components/atoms/inputs";
import { Button } from "../../../../../../../shell/components/atoms/buttons";
import { useState } from "react";
import { Trash } from "lucide-react";

interface DocumentFieldProps {
    documentID: number;
    title: string;
    placeholder?: string;
    onAddDocument: (document: string) => void;
    onRemoveDocument: (documentID: number) => void;
}

export const DocumentField = ({ documentID, title, placeholder, onRemoveDocument }: DocumentFieldProps) => {
    const [documentLink, setDocumentLink] = useState<string>("");

    return (
        <div data-document-id={documentID} className="flex items-end gap-2">
            <div className="flex-1 w-full">
                <Input 
                    label={title}
                    value={documentLink} 
                    onChange={(e) => setDocumentLink(e.target.value)} 
                    placeholder={placeholder || "Document"} 
                    inputStyle="sharp" />
            </div>

            <Button theme="light" shape="pill" className="p-2" onClick={() => onRemoveDocument(documentID)}><Trash strokeWidth={1.5} size={18} /></Button>
        </div>
    );
};