import { type ReactNode, useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, LoaderCircle } from 'lucide-react';
import { Toolbar } from '../../../shell/components/collections/toolbar';

import { MultiSelectDropdown } from '../../../shell/components/atoms/dropdowns';
import { isDateValue, isNumericValue, isStringNegativeValue } from '../../../core/utils/helpers/validations';
import { Pagination } from '../../../shell/components/collections/table';
import { SearchBox } from '../../../shell/components/atoms/inputs';


interface JobHeader {
    id: string;   // key name in the row
    label: string;
}

interface JobTableProps<T extends Record<string, any>> {
    rows: T[];
    headers: JobHeader[];
    jobSelected: (job: T) => void;
    toolbarContent?: ReactNode;
    isRefreshing?: boolean;
}


export const DashboardTable = <T extends Record<string, any>>({
    rows,
    headers,
    jobSelected,
    toolbarContent,
    isRefreshing
}: JobTableProps<T>) => {

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [orderBy, setOrderBy] = useState<keyof T>(headers[0]?.id as keyof T);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredRows, setFilteredRows] = useState<T[]>([]);
    const [sortedRows, setSortedRows] = useState<T[]>([]);
    const [paginatedRows, setPaginatedRows] = useState<T[]>([]);
    const [selectedHeaders, setSelectedHeaders] = useState<JobHeader[]>(headers);

    useEffect(() => {
        setSelectedHeaders(headers);
    }, [headers]);

    // 1. Filtering
    useEffect(() => {
        if (rows.length > 0) {
            const result = rows.filter(row =>
                Object.values(row).some(val =>
                    String(val).toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
            setFilteredRows(result);
        }
    }, [rows, searchTerm]);

    // 2. Sorting
    useEffect(() => {
        if (filteredRows.length > 0) {
            const sorted = [...filteredRows].sort((a, b) => {
                const aValue = a[orderBy];
                const bValue = b[orderBy];

                // Handle empty values (null, undefined, empty string)
                const isAEmpty = aValue === null || aValue === undefined || aValue === '';
                const isBEmpty = bValue === null || bValue === undefined || bValue === '';

                if (isAEmpty && isBEmpty) return 0;
                if (isAEmpty) return 1;
                if (isBEmpty) return -1;

                const isADate = typeof aValue === 'string' && isDateValue(aValue);
                const isBDate = typeof bValue === 'string' && isDateValue(bValue);

                const parseCustomDate = (val: any) => {
                    if (typeof val !== 'string') return new Date(val).getTime();
                    const trimmed = val.trim();
                    const parts = trimmed.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
                    if (parts) {
                        return new Date(`${parts[3]}-${parts[2]}-${parts[1]}`).getTime();
                    }
                    return new Date(trimmed).getTime();
                };

                if (orderBy.toString().toLowerCase().includes("date") || isADate || isBDate) {
                    // Try parsing as date first
                    const dateA = parseCustomDate(aValue);
                    const dateB = parseCustomDate(bValue);
                    
                    if (!isNaN(dateA) && !isNaN(dateB)) {
                        if (dateA < dateB) return order === 'asc' ? -1 : 1;
                        if (dateA > dateB) return order === 'asc' ? 1 : -1;
                        return 0;
                    }
                }

                if (aValue < bValue) return order === 'asc' ? -1 : 1;
                if (aValue > bValue) return order === 'asc' ? 1 : -1;
                return 0;
            });
            setSortedRows(sorted);
        }
    }, [filteredRows, order, orderBy]);

    // 3. Pagination
    useEffect(() => {
        const start = page * rowsPerPage;
        const end = start + rowsPerPage;
        setPaginatedRows(sortedRows.slice(start, end));
    }, [sortedRows, page, rowsPerPage]);


    const toggleSort = (key: keyof T) => {
        setOrderBy(key);
        setOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    };

    useEffect(() => {
        setPage(0);
    }, [searchTerm]);

    const handleRowsPerPageChange = (rowsPerPage: number) => {
        setRowsPerPage(rowsPerPage);
        setPage(0);
    };

    const handleHeaderSelect = (selected: JobHeader[]) => {
        // keep the same order as headers
        const ordered = headers.filter(h =>
            selected.some(sel => sel.id === h.id)
        );
        setSelectedHeaders(ordered);
    };

    const visibleHeaders = selectedHeaders.filter(h => h.id !== 'Aid');
    const visibleHeaderOptions = headers.filter(h => h.id !== 'Aid');

    return (
        <div className="w-full border border-primary rounded-xl shadow-sm overflow-hidden bg-white">
            <Toolbar theme='white'>
                <div className="w-full flex-1 flex items-center gap-4 select-none">
                    <MultiSelectDropdown
                        title="Show Columns"
                        dropdownStyle="simple"
                        items={visibleHeaderOptions}
                        labelKey="label"
                        selectedItems={selectedHeaders}
                        onChange={(selected) => handleHeaderSelect(selected)}
                    />
                </div>
                {toolbarContent}
                <SearchBox value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onClear={() => setSearchTerm('')} />
            </Toolbar>

            <div className={`overflow-x-auto`}>
				{isRefreshing &&
					<div className='flex flex-col gap-3 p-5 items-center justify-center h-full'>
						<LoaderCircle className='text-primary animate-spin' />
						<p className='text-slate-700'>Getting jobs...</p>
					</div>
				}
                {!isRefreshing && 
                    <table className={`min-w-full border-t border-gray-300 text-sm select-none ${isRefreshing && 'pointer-events-none opacity-50'}`}>
                        {paginatedRows.length > 0 &&
                            <thead className="bg-slate-100 text-slate-700">
                                <tr>
                                    <th className='text-slate-700'>#</th>
                                    {visibleHeaders.map((header) => (
                                        <th
                                            key={header.id}
                                            onClick={() => toggleSort(header.id as keyof T)}
                                            className="text-left px-4 py-2 font-semibold cursor-pointer select-none whitespace-nowrap"
                                        >
                                            <div className='flex items-center gap-2'>
                                                {header.label}
                                                {orderBy === header.id && (order === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                        }
                        <tbody>
                            {rows.length > 0 && paginatedRows.length > 0 ? paginatedRows.map((row, idx) => (
                                <tr key={idx} className={`hover:bg-primary-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`}>
                                    <td className='p-2 text-center text-gray-500'>
                                        {page * rowsPerPage + idx + 1}
                                    </td>
                                    {visibleHeaders.map((header) => (
                                        <td
                                            key={header.id}
                                            onClick={() => jobSelected(row)}
                                            className="px-4 py-2 max-w-[200px] text-ellipsis whitespace-nowrap overflow-hidden cursor-pointer text-slate-700"
                                        >
                                            <div className={`
                                                font-medium 
                                                ${typeof row[header.id as keyof T] === 'string' && isStringNegativeValue(row[header.id as keyof T]) ? 'text-red-700' : ''}
                                                ${typeof row[header.id as keyof T] === 'string' && isNumericValue(row[header.id as keyof T]) ? 'text-right' : ''}
                                                ${typeof row[header.id as keyof T] === 'string' && isDateValue(row[header.id as keyof T]) ? 'text-right' : ''}
                                                ${header.id === 'Jobname' ? 'text-primary font-medium' : ''}
                                            `}>
                                                {row[header.id as keyof T]}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={visibleHeaders.length + 1} className="px-4 py-12 text-center text-slate-500">
                                        No jobs found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                }
            </div>

            {/* Pagination */}
            {filteredRows && filteredRows.length > 0 &&
                <Pagination
                    rowsPerPage={rowsPerPage}
                    handleRowsPerPageChange={handleRowsPerPageChange}
                    page={page}
                    setPage={setPage}
                    filteredRows={filteredRows}
                />
            }
        </div>
    );
};
