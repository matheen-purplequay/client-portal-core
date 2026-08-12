import { ArrowLeft, ArrowLeftToLineIcon, ArrowRight, ArrowRightToLine, Bookmark, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../atoms/buttons";
 
interface TableRowDataProps {
    children: React.ReactNode;
    className?: string;
    colSpan?: number;
    verticalAlign?: "top" | "bottom" | "middle";
}
 
interface TableBodyProps {
    children: React.ReactNode;
    className?: string;
}
 
interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    children: React.ReactNode;
    className?: string;
    noHover?: boolean;
}
 
interface TableHeadProps {
    children: React.ReactNode;
    className?: string;
}
 
interface TableHeadCellProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}
 
interface TableHeadRowProps {
    children: React.ReactNode;
    className?: string;
}
 
interface TableProps {
    children: React.ReactNode;
    className?: string;
}
 
export const Table = ({ children, className }: TableProps) => {
    return (<table className={`w-full ${className}`}>{children}</table>);
};
 
export const TableRowData = ({ children, className, colSpan, verticalAlign }: TableRowDataProps) => {
    return (<td className={`px-4 py-2 text-sm ${className}`} valign={verticalAlign} colSpan={colSpan}>{children}</td>);
};
 
export const TableRow = ({ children, className, noHover, ...props }: TableRowProps) => {
    return (<tr className={`${!className?.includes('bg-') ? 'even:bg-slate-50' : ''} ${noHover ? '' : ' hover:bg-primary-50/50'} ${!className?.includes('border-') ? 'border-b border-slate-200' : ''}  ${className} ${props.onClick ? 'cursor-pointer' : ''}`} {...props}>{children}</tr>);
};
 
export const TableHead = ({ children, className }: TableHeadProps) => {
    return (
        <thead
            className={`
            px-4 py-2 ${className} text-sm font-semibold text-slate-700 sticky top-0 border-b border-slate-300
            ${className?.includes('bg-') ? '' : 'bg-slate-100'}
            ${className?.includes('text-center') || className?.includes('text-left') || className?.includes('text-right') ? '' : 'text-left'}
        `}>
            {children}
        </thead>);
};
 
export const TableHeadCell = ({ children, className, onClick }: TableHeadCellProps) => {
    return (<th className={`px-4 py-2 text-xs ${className}`} onClick={onClick}>{children}</th>);
};
 
export const TableHeadRow = ({ children, className }: TableHeadRowProps) => {
    return (<tr className={`px-4 py-2 ${className}`}>{children}</tr>);
};
 
export const TableBody = ({ children, className }: TableBodyProps) => {
    return (<tbody className={`px-4 py-2 ${className}`}>{children}</tbody>);
};
 
 
interface PaginationProp {
    rowsPerPage: number;
    handleRowsPerPageChange: (rowsPerPage: number) => void;
    page: number;
    setPage: (page: number) => void;
    filteredRows: any[];
    paginationStyle?: "default" | "simple";
}
 
export const Pagination = ({ rowsPerPage, handleRowsPerPageChange, page, setPage, filteredRows, paginationStyle = "default" }: PaginationProp) => {
 
    const goPrevious = () => setPage(Math.max(0, page - 1));
    const goNext = () => setPage(Math.min(Math.ceil(filteredRows.length / rowsPerPage) - 1, page + 1));
    const goToPage = (page: number) => setPage(page);
 
    const paginationStyles = {
        default: "flex justify-between items-center p-2 border-t border-slate-300 text-sm",
        simple: "flex justify-between items-center p-2 text-sm"
    };
 
    const paginationButtonStyles = {
        first: {
            default: "px-3 py-1 bg-slate-200 hover:bg-slate-300 cursor-pointer rounded disabled:opacity-50 disabled:pointer-events-none rounded-full border border-slate-300",
            simple: "px-2 py-1 bg-transparent font-medium hover:underline text-slate-800 hover:text-primary cursor-pointer rounded disabled:opacity-50 disabled:pointer-events-none"
        },
        previous: {
            default: "pl-3 pr-5 py-1 bg-slate-200 hover:bg-slate-300 cursor-pointer rounded disabled:opacity-50 disabled:pointer-events-none rounded-l-full rounded-r -mr-5 relative border-l border-t border-b border-slate-300",
            simple: "px-2 py-1 bg-transparent font-medium hover:underline text-slate-800 hover:text-primary cursor-pointer rounded disabled:opacity-50 disabled:pointer-events-none"
        },
        page: {
            default: "px-2 py-1 bg-secondary-50 text-secondary group-hover:bg-secondary group-hover:text-white group-hover:shadow-lg shadow cursor-pointer rounded disabled:opacity-50 disabled:pointer-events-none rounded-full border-2 border-white relative z-10",
            simple: "px-2 py-1 bg-transparent font-medium hover:underline text-slate-800 hover:text-primary cursor-pointer rounded disabled:opacity-50 disabled:pointer-events-none"
        },
        next: {
            default: "pl-5 pr-3 py-1 bg-slate-200 hover:bg-slate-300 cursor-pointer rounded disabled:opacity-50 disabled:pointer-events-none rounded-l rounded-r-full -ml-5 relative border-r border-t border-b border-slate-300",
            simple: "px-2 py-1 bg-transparent font-medium hover:underline text-slate-800 hover:text-primary cursor-pointer rounded disabled:opacity-50 disabled:pointer-events-none"
        },
        last: {
            default: "px-3 py-1 bg-slate-200 hover:bg-slate-300 cursor-pointer rounded disabled:opacity-50 disabled:pointer-events-none rounded-full border border-slate-300",
            simple: "px-2 py-1 bg-transparent font-medium hover:underline text-slate-800 hover:text-primary cursor-pointer rounded disabled:opacity-50 disabled:pointer-events-none"
        },
 
    };
 
    return (
        <div className={paginationStyles[paginationStyle || "default"]}>
            <div className='flex gap-4 items-center'>
                <div className={`flex gap-2 items-center ${filteredRows.length < 10 && 'opacity-50 pointer-events-none'}`}>
                    <div className={`px-2 py-1 aspect-square flex items-center justify-center cursor-pointer rounded-full ${rowsPerPage === 10 ? 'bg-primary text-white' : 'bg-slate-200'}`} onClick={() => handleRowsPerPageChange(10)}>10</div>
                    <div className={`px-2 py-1 aspect-square flex items-center justify-center cursor-pointer rounded-full ${rowsPerPage === 20 ? 'bg-primary text-white' : 'bg-slate-200'}`} onClick={() => handleRowsPerPageChange(20)}>20</div>
                    <div className={`px-2 py-1 aspect-square flex items-center justify-center cursor-pointer rounded-full ${rowsPerPage === 30 ? 'bg-primary text-white' : 'bg-slate-200'}`} onClick={() => handleRowsPerPageChange(30)}>30</div>
                </div>
                <div>
                    Showing {page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, filteredRows.length)} of {filteredRows.length}
                </div>
            </div>
            <div className="flex items-center gap-2 group">
                <div className={`flex items-center gap-1 ${filteredRows.length <= rowsPerPage ? 'opacity-50 pointer-events-none' : ''}`}>
                    <PageBookmark page={page} setPage={setPage} />
                </div>
                <button
                    onClick={() => setPage(0)}
                    disabled={page === 0}
                    className={`${paginationButtonStyles.first[paginationStyle || "default"]} flex items-center gap-1`}
                >
                    <ArrowLeftToLineIcon strokeWidth={1.5} size={16} />
                </button>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => goPrevious()}
                        disabled={page === 0}
                        className={`${paginationButtonStyles.previous[paginationStyle || "default"]} flex items-center gap-1`}
                    >
                        <ArrowLeft strokeWidth={1.5} size={16} />
                    </button>
                    <div className={`${paginationButtonStyles.page[paginationStyle || "default"]} flex items-center gap-1 transition-all duration-300 ${filteredRows.length <= rowsPerPage ? 'disabled pointer-events-none' : ''}`}>
                        <NumericEditableDiv value={page + 1} setValue={(value) => goToPage(Number(value) - 1)} max={Math.ceil(filteredRows.length / rowsPerPage)} min={1} />
                    </div>
                    <button
                        onClick={() => goNext()}
                        disabled={page >= Math.ceil(filteredRows.length / rowsPerPage) - 1}
                        className={`${paginationButtonStyles.next[paginationStyle || "default"]} flex items-center gap-1`}
                    >
                        <ArrowRight strokeWidth={1.5} size={16} />
                    </button>
                </div>
                <button
                    onClick={() => setPage(Math.ceil(filteredRows.length / rowsPerPage) - 1)}
                    disabled={page >= Math.ceil(filteredRows.length / rowsPerPage) - 1}
                    className={`${paginationButtonStyles.last[paginationStyle || "default"]} flex items-center gap-1`}
                >
                    <ArrowRightToLine strokeWidth={1.5} size={16} />
                </button>
            </div>
        </div>
    );
};
 
 
interface NumericEditableDivProps {
    value: number;
    max?: number;
    min?: number;
    setValue: (value: number) => void;
}
 
export const NumericEditableDiv = ({ value, setValue, max, min }: NumericEditableDivProps) => {
    // Need to store old value just in case to revert back to it
    const [oldValue, setOldValue] = useState(value);
 
    useEffect(() => {
        setOldValue(value);
    }, [value]);
 
    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        let text = e.currentTarget.textContent || "";
      
        if (!text) {
          setValue(oldValue);
          e.currentTarget.textContent = String(oldValue); // force update
          return;
        }
      
        const numericOnly = text.replace(/\D/g, "");
      
        if (max && Number(numericOnly) > max) {
          e.currentTarget.textContent = String(oldValue);
          return;
        }
      
        if (min && Number(numericOnly) < min) {
          e.currentTarget.textContent = String(oldValue);
          return;
        }
      
        setValue(Number(numericOnly));
        setOldValue(Number(numericOnly));
      
        if (text !== numericOnly) {
          e.currentTarget.textContent = numericOnly;
          placeCaretAtEnd(e.currentTarget);
        }
      };
      
 
    // Helper to keep caret at the end after correction
    const placeCaretAtEnd = (el: HTMLElement) => {
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(el);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
    };
 
    return (
        <div
        className="px-2 font-semibold"
        contentEditable
        suppressContentEditableWarning
        onBlur={handleInput}
        dangerouslySetInnerHTML={{ __html: String(value) }}
      />
    );
}
 
interface PageBookmarkProps {
    page: number;
    setPage: (page: number) => void;
}
 
const PageBookmark = ({ page, setPage }: PageBookmarkProps) => {
    const [bookmarkedPage, setBookmarkedPage] = useState<number | null>(null);
 
    const handleBookmarkPage = () => {
        if(bookmarkedPage == null) {
            setPage(page);
            setBookmarkedPage(page);
        } else if(bookmarkedPage === page) {
            setPage(bookmarkedPage);
            setBookmarkedPage(null);
        } else {
            setPage(bookmarkedPage);
        }
    };
 
    return (
        <Button onClick={handleBookmarkPage}
            className="flex gap-1 items-center"
            theme={`${bookmarkedPage === null ? "simple" : bookmarkedPage === page ? "light_gray" : "simple_primary"}`} shape="pill"
        >
            {bookmarkedPage === page ? <Trash size={16} strokeWidth={1.5} className="fill-current" /> : <Bookmark size={16} strokeWidth={1.5} />}
            {bookmarkedPage === null ? "Bookmark Page" : bookmarkedPage === page ? "Remove Bookmark" : "Go to bookmark"}
        </Button>
    );
};
 