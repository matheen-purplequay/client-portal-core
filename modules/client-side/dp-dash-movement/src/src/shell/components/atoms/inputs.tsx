"use client";

import { Delete, Search } from 'lucide-react';
import { useState } from 'react';

interface InputProps {
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    inputStyle?: "default" | "minimal" | "sharp" | "rounded" | "simple";
    [key: string]: any;
    className?: string;
    containerClassName?: string;
    dataList?: string[];
    label?: string;
}

export const SearchBox = ({ value, onChange, placeholder, onClear, searchBoxStyle = "default" }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    onClear: () => void;
    searchBoxStyle?: "default" | "minimal";
}) => {
    const [inputHasFocus, setInputHasFocus] = useState(false);

    const searchBoxStyles = {
        default: `bg-white rounded-full flex items-center gap-1 px-2 border`,
        minimal: "bg-transparent flex items-center gap-1 px-2 border-b"
    };

    const handleOnClear = () => {
        value = '';
        onClear();
    };

    return (
        <div 
            className={`
                ${searchBoxStyles[searchBoxStyle]}
                ${inputHasFocus ? 'border-primary-700' : value ? 'border-primary' : 'border-slate-300'}
            `}
        >
            <Search />
            <input
                type="text"
                value={value}
                onFocus={() => setInputHasFocus(true)}
                onBlur={() => setInputHasFocus(false)}
                onChange={onChange}
                placeholder={placeholder || "Search..."}
                className="border-0 w-full px-3 py-2 font-medium text-sm text-gray-700 placeholder-gray-400 bg-transparent"
                style={{ outline: 'none' }}
            />
            <Delete className={`cursor-pointer ${value ? 'opacity-100' : 'opacity-0'} transition-all duration-300`} onClick={handleOnClear} />
        </div>
    );
}

export const Input = ({ value, onChange, placeholder, inputStyle = "default", className, containerClassName, dataList, label, ...props }: InputProps) => {
    const [inputHasFocus, setInputHasFocus] = useState(false);

    const inputStyles = {
        default: "bg-white rounded flex items-center gap-1 px-2 border focus-within:shadow-lg",
        minimal: "bg-transparent flex items-center gap-1 px-2 border-b focus-within:shadow-lg",
        sharp: "bg-white flex items-center gap-1 px-2 border focus-within:shadow-lg",
        rounded: `bg-white rounded-full flex items-center gap-1 px-2 border ${!className?.includes('shadow-') && 'focus-within:shadow-lg'}`,
        simple: "bg-transparent flex items-center gap-1 px-2"
    };

    return (
        <div className={`space-y-2 ${containerClassName}`}>
            {label && <label className="text-sm font-semibold text-slate-500">{label}</label>}
            <div
                className={`
                    ${inputStyles[inputStyle]} transition-all duration-300
                    ${inputHasFocus ? 'border-primary' : 'border-slate-300'}
                `}
            >
                <input
                    type="text"
                    list="dtl-instruction-codes"
                    value={value}
                    onFocus={() => setInputHasFocus(true)}
                    onBlur={() => setInputHasFocus(false)}
                    onChange={onChange}
                    placeholder={placeholder || "Search..."}
                    className={`border-0 w-full px-1 py-2 font-medium placeholder-gray-400 bg-transparent ${className}`}
                    style={{ outline: 'none' }}
                    {...props}
                />

                {dataList && (
                    <datalist id='dtl-instruction-codes'>
                        {dataList?.map((item, index) => (
                            <option key={index} value={item} />
                        ))}
                    </datalist>
                )}
            </div>
        </div>
    );
}