"use client";

import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export interface SimpleDialogProps {
    title: string | React.ReactNode;
    children?: React.ReactNode;
    actionButtons?: React.ReactNode;
    dialogType?: "modal" | "alert" | "action";
    dialogSize?: "sm" | "md" | "lg" | "xl";
    bodyPadding?: "default" | "none";
    dialogStyle?: "default" | "rounded";
    onClose: () => void;
}

export const SimpleDialog = (props: SimpleDialogProps) => {
    const { onClose, dialogType = "alert", title = "", dialogSize = "md", bodyPadding = "default", dialogStyle = "default" } = props;
    const [open, setOpen] = useState(false);
    const dialogSizes = {
        sm: "max-w-[600px]",
        md: "max-w-[800px]",
        lg: "max-w-[1024px]",
        xl: "max-w-[1280px]",
    };

    const bodyPaddingClasses = {
        default: "px-4 pt-5 pb-4 sm:p-6 sm:pb-4",
        none: ""
    };

    const handleClose = () => {
        setOpen(false);
        setTimeout(() => {
            onClose();
        }, 100); // Delay to allow the dialog to close smoothly
    };

    useEffect(() => {
        setTimeout(() => {
            setOpen(true);
        }, 100); // Delay to allow the dialog to open smoothly
    }, []);

    const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
        var dialogElement = document.getElementById('modal-dialog');
        // Check if clicked element is closest to the dialog
        // If the click is outside the dialog, close it
        const isClickInsideDialog = dialogElement && dialogElement.contains(e.target as Node);
        if (!isClickInsideDialog) {
            handleClose();
        }
    };

    return (
        <div className={`fixed top-0 bottom-0 left-0 right-0 z-[5000] transition-all duration-300 bg-black/75 flex items-center justify-center 
            ${open ? "opacity-100" : "opacity-0"}`} aria-labelledby="dialog-title" role="dialog" aria-modal="true" onClick={handleClickOutside}
        >

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div id='modal-dialog'
                        onClick={(e) => e.stopPropagation()}
                        className={`
                            relative transform overflow-hidden bg-white text-left shadow-xl transition-all sm:my-8
                            w-full ${dialogSizes[dialogSize]}
                            ${dialogStyle === "rounded" ? "rounded-lg" : "rounded-none"}
                            ${open ? "scale-100" : "scale-95"}
                        `}>
                        <div className="flex items-center justify-between pl-5 pr-2 py-2">
                            <h1 className="text-lg font-semibold">{title}</h1>
                            {dialogType === "alert" && (
                                <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 cursor-pointer">
                                    <X />
                                </button>
                            )}
                        </div>
                        <div className={`
                            bg-white ${bodyPaddingClasses[bodyPadding]}
                        `}>
                            {props.children}
                        </div>
                        {props.actionButtons && (
                            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-slate-300">
                                {props.actionButtons}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}