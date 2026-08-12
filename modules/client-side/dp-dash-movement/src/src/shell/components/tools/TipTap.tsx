// src/Tiptap.tsx
import { useEditor, EditorContent, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TableKit } from '@tiptap/extension-table'
import { Bold, Italic, Strikethrough, List, ListOrdered, Quote, Undo, Redo, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import { cloneElement, useEffect, type ReactElement } from 'react';
import { Table } from 'lucide-react';
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
    onChange?: (content: string) => void;
    onBlur?: (content: string) => void;
}

interface ToolbarButtonProps {
    onClick: () => void;
    icon: ReactElement<any>;
    addSeparator?: boolean;
}

const editorClasses = `
    min-h-[300px] max-h-[500px] p-2 overflow-y-auto [&_.ProseMirror]:min-h-[300px] [&_.ProseMirror]:max-h-[500px] [&_.ProseMirror]:overflow-y-auto [&_.ProseMirror]:outline-0 [&_.ProseMirror]:border-none
    [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6
    [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:ml-2 [&_.ProseMirror_blockquote]:text-slate-600 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:border-slate-300
`;

const Tiptap = ({ content, onChange, onBlur }: TipTapProps) => {
    const editor = useEditor({
        extensions,
        content,
    })

    // Read the current editor's state, and re-render the component when it changes
    const editorState = useEditorState({
        editor,
        selector: ctx => {
            return {
                isBold: ctx.editor.isActive('bold'),
                canBold: ctx.editor.can().chain().focus().toggleBold().run(),
                isItalic: ctx.editor.isActive('italic'),
                canItalic: ctx.editor.can().chain().focus().toggleItalic().run(),
                isStrike: ctx.editor.isActive('strike'),
                canStrike: ctx.editor.can().chain().focus().toggleStrike().run(),
                isCode: ctx.editor.isActive('code'),
                canCode: ctx.editor.can().chain().focus().toggleCode().run(),
                canClearMarks: ctx.editor.can().chain().focus().unsetAllMarks().run(),
                isParagraph: ctx.editor.isActive('paragraph'),
                isHeading1: ctx.editor.isActive('heading', { level: 1 }),
                isHeading2: ctx.editor.isActive('heading', { level: 2 }),
                isHeading3: ctx.editor.isActive('heading', { level: 3 }),
                isHeading4: ctx.editor.isActive('heading', { level: 4 }),
                isHeading5: ctx.editor.isActive('heading', { level: 5 }),
                isHeading6: ctx.editor.isActive('heading', { level: 6 }),
                isBulletList: ctx.editor.isActive('bulletList'),
                isOrderedList: ctx.editor.isActive('orderedList'),
                isCodeBlock: ctx.editor.isActive('codeBlock'),
                isBlockquote: ctx.editor.isActive('blockquote'),
                canUndo: ctx.editor.can().chain().focus().undo().run(),
                canRedo: ctx.editor.can().chain().focus().redo().run(),
            }
        },
    });

    const toolbarButtons: ToolbarButtonProps[] = [
        { onClick: () => editor.chain().focus().toggleBold().run(), icon: <Bold strokeWidth={1.5} /> },
        { onClick: () => editor.chain().focus().toggleItalic().run(), icon: <Italic strokeWidth={1.5} /> },
        { onClick: () => editor.chain().focus().toggleStrike().run(), icon: <Strikethrough strokeWidth={1.5} />, addSeparator: true },
        { onClick: () => editor.chain().focus().setTextAlign('left').run(), icon: <AlignLeft strokeWidth={1.5} /> },
        { onClick: () => editor.chain().focus().setTextAlign('center').run(), icon: <AlignCenter strokeWidth={1.5} /> },
        { onClick: () => editor.chain().focus().setTextAlign('right').run(), icon: <AlignRight strokeWidth={1.5} />, addSeparator: true },
        { onClick: () => editor.chain().focus().toggleBulletList().run(), icon: <List strokeWidth={1.5} /> },
        { onClick: () => editor.chain().focus().toggleOrderedList().run(), icon: <ListOrdered strokeWidth={1.5} /> },
        { onClick: () => editor.chain().focus().toggleBlockquote().run(), icon: <Quote strokeWidth={1.5} />},
        { onClick: () => editor.chain().focus().insertTable({ rows: 3, cols: 2 }).run(), icon: <Table strokeWidth={1.5} />, addSeparator: true },
        { onClick: () => editor.chain().focus().undo().run(), icon: <Undo strokeWidth={1.5} /> },
        { onClick: () => editor.chain().focus().redo().run(), icon: <Redo strokeWidth={1.5} /> },
    ];

    useEffect(() => {
        console.log(editorState);
        onChange?.(editor.getHTML());
    }, [editorState]);

    useEffect(() => {
        onBlur?.(editor.getHTML());
    }, [editorState]);

    return (
        <div className='border border-slate-300 focus-within:border-primary focus-within:shadow-lg transition-all duration-300'>
            <div className="flex items-center bg-slate-100 border-b border-slate-300 py-1 px-2">
                {toolbarButtons.map((button, index) => 
                    <>
                        <ToolbarButton
                            key={index}
                            onClick={button.onClick}
                            icon={button.icon}
                        />
                        {button.addSeparator && <div className='px-4'><HorizontalDivider /></div>}
                    </>
                )}
            </div>
            <EditorContent 
                editor={editor} 
                onBlur={() => onBlur?.(editor.getHTML())}
                className={editorClasses} 
            />
        </div>
    )
};

const ToolbarButton = ({ onClick, icon }: ToolbarButtonProps) => {
    return (
        <button onClick={onClick} className='cursor-pointer hover:bg-slate-300 transition-all duration-100 p-2 ease-out rounded'>
            {cloneElement(icon, { className: "text-slate-900 aspect-square", size: 18, strokeWidth: 1.5 })}
        </button>
    )
};

export default Tiptap