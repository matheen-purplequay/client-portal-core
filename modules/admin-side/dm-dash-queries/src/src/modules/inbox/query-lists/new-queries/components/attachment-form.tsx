// Attachment Form

import { useState } from "react";
import type { Attachment } from "../../../../../core/models/query";
import { Link, Text } from "lucide-react";
import toast from "../../../../../shell/components/collections/toast";
import { Button } from "../../../../../shell/components/atoms/buttons";

declare global {
  interface Window {
    Dropbox: any;
  }
}

interface AttachmentFormProps {
  events: {
    attachmentSet: (attachment: Attachment) => void;
  };
  values: {
    user_id: number;
  };
}

export const AttachmentForm = ({ events, values }: AttachmentFormProps) => {
  // const context = useAppContext();

  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const userId = values?.user_id;
  const [showManualForm, setShowManualForm] = useState(false);

  const handleAttachmentAdd = () => {
    if (title && link) {
      events.attachmentSet({ title: title, link: link, user_id: userId });
      clearLink();
    } else
      toast({
        message: "Title and link are required",
        type: "error",
        show: true,
      });
  };

  const clearLink = () => {
    setTitle("");
    setLink("");
    setShowManualForm(false);
  };

  const openDropboxChooser = () => {
    if (!window.Dropbox) {
      toast({ message: "Dropbox not loaded", type: "error", show: true });
      return;
    }

    window.Dropbox.choose({
      success: (files: any[]) => {
        const file = files[0];
        events.attachmentSet({
          title: file.name,
          link: file.link,
          user_id: userId,
        });
        setShowManualForm(false);
      },
      cancel: () => {
        // user cancelled, do nothing
      },
      linkType: "preview", // or "direct" if you want raw file
      multiselect: false,
      extensions: [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".png", ".jpg"],
    });
  };

  return (
    <div className="space-y-2">
      {!showManualForm && (
        <div className="grid grid-cols-2 gap-2 justify-between">
          <Button
            theme="outline_secondary"
            className="px-2 group"
            onClick={openDropboxChooser}
          >
            <div className="flex gap-2 items-center justify-center">
              <svg
                role="img"
                height={16}
                width={16}
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Dropbox</title>
                <path d="M6 1.807L0 5.629l6 3.822 6.001-3.822L6 1.807zM18 1.807l-6 3.822 6 3.822 6-3.822-6-3.822zM0 13.274l6 3.822 6.001-3.822L6 9.452l-6 3.822zM18 9.452l-6 3.822 6 3.822 6-3.822-6-3.822zM6 18.371l6.001 3.822 6-3.822-6-3.822L6 18.371z" />
              </svg>
              <div>Dropbox</div>
            </div>
          </Button>
          <Button
            theme="outline_secondary"
            className="px-2 w-full flex gap-2 items-center justify-center"
            onClick={() => setShowManualForm(true)}
          >
            <Link size={16} strokeWidth={1.5} />
            Add Link
          </Button>
        </div>
      )}
      {showManualForm && (
        <div className="border border-slate-300 rounded focus-within:border-primary overflow-hidden bg-white">
          <div className="flex gap-1 items-center border-b border-slate-300 pl-2">
            <Text size={14} strokeWidth={1.5} />
            <input
              className="p-2 outline-0 flex-1 w-full"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="flex gap-1 items-center pl-2 border-b border-slate-300">
            <Link size={14} strokeWidth={1.5} />
            <input
              className="p-2 outline-0 flex-1 w-full"
              placeholder="Link"
              value={link}
              onChange={(e) => {
                setLink(e.target.value);
              }}
            />
          </div>
          <div className="flex items-center justify-between p-1 bg-slate-50">
            <Button theme="simple" className="px-2" onClick={clearLink}>
              Cancel
            </Button>
            <Button
              theme="simple_primary"
              className="px-2"
              onClick={handleAttachmentAdd}
            >
              Add Attachment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
