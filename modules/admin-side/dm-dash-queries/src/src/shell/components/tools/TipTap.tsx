// src/Tiptap.tsx
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TableKit } from '@tiptap/extension-table'
import {
    Bold, Italic, Strikethrough, List, ListOrdered, Quote, Undo, Redo,
    AlignLeft, AlignCenter, AlignRight, Table,
    ArrowUpFromLine, ArrowDownFromLine, ArrowLeftFromLine, ArrowRightFromLine,
    Trash2, Merge, Split,
    TableRowsSplit,
    TableColumnsSplit
} from 'lucide-react'
import React, { cloneElement, useState, useEffect, type ReactElement } from 'react';
import TextAlign from '@tiptap/extension-text-align';
import { HorizontalDivider } from '../atoms/divider';

// define your extension array
const extensions = [
    StarterKit,
    TableKit.configure({
        table: { resizable: true },
    }),
    TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'right', 'center', 'justify'],
        defaultAlignment: 'left',
    })
]

interface TipTapProps {
    content: string;
    onChange?: (content: string, isEmpty?: boolean) => void;
    onBlur?: (content: string, isEmpty?: boolean) => void;
    editorClassName?: string;
    containerClassName?: string;
}

interface ToolbarButtonProps {
    onClick: () => void;
    icon: ReactElement<any>;
    addSeparator?: boolean;
    title?: string;
}

const editorClasses = `
    min-h-[300px] max-h-[500px] p-2 overflow-y-auto [&_.ProseMirror]:min-h-[300px] [&_.ProseMirror]:max-h-[500px] [&_.ProseMirror]:overflow-y-auto [&_.ProseMirror]:outline-0 [&_.ProseMirror]:border-none
    [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6
    [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:ml-2 [&_.ProseMirror_blockquote]:text-slate-600 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:border-slate-300
`;

const Tiptap = ({ content, onChange, onBlur, editorClassName, containerClassName }: TipTapProps) => {
    const [isInTable, setIsInTable] = useState(false);

    const editor = useEditor({
        extensions,
        content,
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML(), editor.isEmpty);
        },
        onBlur: ({ editor }) => {
            onBlur?.(editor.getHTML(), editor.isEmpty);
        },
        onSelectionUpdate: ({ editor }) => {
            setIsInTable(editor.isActive('table'));
        },
        onTransaction: ({ editor }) => {
            setIsInTable(editor.isActive('table'));
        },
    });

    // Sync external content (e.g., template select) into editor
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content, { emitUpdate: false });
            // false = don't trigger onUpdate again (avoids infinite loop)
        }
    }, [content, editor]);

    // Sync initial table state and on editor changes
    useEffect(() => {
        if (editor) {
            setIsInTable(editor.isActive('table'));
        }
    }, [editor]);

    const toolbarButtons: ToolbarButtonProps[] = [
        { onClick: () => editor.chain().focus().toggleBold().run(), icon: <Bold strokeWidth={1.5} />, title: 'Bold' },
        { onClick: () => editor.chain().focus().toggleItalic().run(), icon: <Italic strokeWidth={1.5} />, title: 'Italic' },
        { onClick: () => editor.chain().focus().toggleStrike().run(), icon: <Strikethrough strokeWidth={1.5} />, title: 'Strikethrough', addSeparator: true },
        { onClick: () => editor.chain().focus().setTextAlign('left').run(), icon: <AlignLeft strokeWidth={1.5} />, title: 'Align Left' },
        { onClick: () => editor.chain().focus().setTextAlign('center').run(), icon: <AlignCenter strokeWidth={1.5} />, title: 'Align Center' },
        { onClick: () => editor.chain().focus().setTextAlign('right').run(), icon: <AlignRight strokeWidth={1.5} />, title: 'Align Right', addSeparator: true },
        { onClick: () => editor.chain().focus().toggleBulletList().run(), icon: <List strokeWidth={1.5} />, title: 'Bullet List' },
        { onClick: () => editor.chain().focus().toggleOrderedList().run(), icon: <ListOrdered strokeWidth={1.5} />, title: 'Ordered List' },
        { onClick: () => editor.chain().focus().toggleBlockquote().run(), icon: <Quote strokeWidth={1.5} />, title: 'Blockquote' },
        { onClick: () => editor.chain().focus().insertTable({ rows: 3, cols: 2 }).run(), icon: <Table strokeWidth={1.5} />, title: 'Insert Table', addSeparator: true },
        { onClick: () => editor.chain().focus().undo().run(), icon: <Undo strokeWidth={1.5} />, title: 'Undo' },
        { onClick: () => editor.chain().focus().redo().run(), icon: <Redo strokeWidth={1.5} />, title: 'Redo' },
    ];

    const tableControls: ToolbarButtonProps[] = [
        { onClick: () => editor.chain().focus().addRowBefore().run(), icon: <ArrowUpFromLine strokeWidth={1.5} />, title: 'Add Row Above' },
        { onClick: () => editor.chain().focus().addRowAfter().run(), icon: <ArrowDownFromLine strokeWidth={1.5} />, title: 'Add Row Below' },
        { onClick: () => editor.chain().focus().deleteRow().run(), icon: <TableRowsSplit strokeWidth={1.5} color='red' />, title: 'Delete Row', addSeparator: true },
        { onClick: () => editor.chain().focus().addColumnBefore().run(), icon: <ArrowLeftFromLine strokeWidth={1.5} />, title: 'Add Column Left' },
        { onClick: () => editor.chain().focus().addColumnAfter().run(), icon: <ArrowRightFromLine strokeWidth={1.5} />, title: 'Add Column Right' },
        { onClick: () => editor.chain().focus().deleteColumn().run(), icon: <TableColumnsSplit strokeWidth={1.5} color='red' />, title: 'Delete Column', addSeparator: true },
        { onClick: () => editor.chain().focus().mergeCells().run(), icon: <Merge strokeWidth={1.5} />, title: 'Merge Cells' },
        { onClick: () => editor.chain().focus().splitCell().run(), icon: <Split strokeWidth={1.5} />, title: 'Split Cell', addSeparator: true },
        { onClick: () => editor.chain().focus().deleteTable().run(), icon: <Trash2 strokeWidth={1.5} color='red' />, title: 'Delete Table' },
    ];

    return (
        <div className={`relative border border-slate-300 focus-within:border-primary focus-within:shadow-lg transition-all duration-300 ${containerClassName}`}>
            <div className="flex items-center bg-slate-100 border-b border-slate-300 py-1 px-2">
                {toolbarButtons.map((button, index) =>
                    <React.Fragment key={index}>
                        <ToolbarButton
                            onClick={button.onClick}
                            icon={button.icon}
                            title={button.title}
                        />
                        {button.addSeparator && <div className='px-4'><HorizontalDivider /></div>}
                    </React.Fragment>
                )}
            </div>
            {/* Table Controls - shows when cursor is inside a table */}
            <div className={`bg-white shadow-sm overflow-hidden transition-all duration-200 ease-in-out smooth-animation ${isInTable ? 'max-h-12 opacity-100 h-auto' : 'max-h-0 opacity-50 h-0 pointer-events-none'}`}>
                <div className="flex items-center bg-blue-50 border-b border-slate-300 py-1 px-2 gap-0.5">
                    <span className="text-xs font-medium text-slate-500 pr-2 select-none whitespace-nowrap">Table</span>
                    {tableControls.map((button, index) =>
                        <React.Fragment key={`table-${index}`}>
                            <ToolbarButton
                                onClick={button.onClick}
                                icon={button.icon}
                                title={button.title}
                            />
                            {button.addSeparator && <div className='px-3'><HorizontalDivider /></div>}
                        </React.Fragment>
                    )}
                </div>
            </div>

            <EditorContent
                editor={editor}
                onBlur={() => onBlur?.(editor.getHTML(), editor.isEmpty)}
                className={`${editorClasses} ${editorClassName}`}
            />
        </div>
    )
};

const ToolbarButton = ({ onClick, icon, title }: ToolbarButtonProps) => {
    return (
        <button onClick={onClick} title={title} className='cursor-pointer hover:bg-slate-300 transition-all duration-100 p-2 ease-out rounded'>
            {cloneElement(icon, { className: "text-slate-900 aspect-square", size: 18, strokeWidth: 1.5 })}
        </button>
    )
};

export default Tiptap;

