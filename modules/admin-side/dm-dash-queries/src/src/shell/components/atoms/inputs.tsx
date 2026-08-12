"use client";

import { Delete, Info, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

interface InputProps {
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    inputStyle?: "default" | "minimal" | "sharp";
    [key: string]: any;
    className?: string;
    containerClassName?: string;
    dataList?: string[];
    label?: string;
    required?: boolean;
    isValid?: boolean;
}

export const SearchBox = ({ value, onChange, placeholder, onClear, searchBoxStyle = "default", className }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    onClear: () => void;
    searchBoxStyle?: "default" | "minimal";
    className?: string;
}) => {
    const [inputHasFocus, setInputHasFocus] = useState(false);

    const searchBoxStyles = {
        default: `bg-white rounded-full flex items-center gap-1 px-2 border-2`,
        minimal: "bg-transparent flex items-center gap-1 px-2 border-b"
    };

    const handleOnClear = () => {
        value = '';
        onClear();
    };

    return (
        <div 
            className={`
                ${className}
                ${searchBoxStyles[searchBoxStyle]}
                ${inputHasFocus ? 'border-primary' : value ? 'border-secondary' : 'border-slate-300'}
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
                className={`border-0 w-full px-3 py-2 font-medium text-sm text-gray-700 placeholder-gray-400 bg-transparent`}
                style={{ outline: 'none' }}
            />
            <Delete className={`cursor-pointer ${value ? 'opacity-100' : 'opacity-0'} transition-all duration-300`} onClick={handleOnClear} />
        </div>
    );
}

export const Input = ({ value, onChange, placeholder, inputStyle = "default", className, containerClassName, dataList, label, required, isValid, ...props }: InputProps) => {
    const [inputHasFocus, setInputHasFocus] = useState(false);

    const inputBorderColor = useMemo(() => {
        if (required && !isValid) {
            return "border-red-500";
        }
        return "border-slate-300";
    }, [required, isValid]);

    const inputStyles = {
        default: "bg-white rounded flex items-center gap-1 px-2 border",
        minimal: "bg-transparent flex items-center gap-1 px-2 border-b",
        sharp: "bg-white flex items-center gap-1 px-2 border"
    };

    return (
        <div className={`space-y-2 ${containerClassName}`}>
            {label && <label className="text-sm font-semibold text-slate-500">{label}</label>}
            <div
                className={`
                    ${inputStyles[inputStyle]} focus-within:shadow-lg transition-all duration-300
                    ${inputHasFocus ? 'border-primary' : inputBorderColor}
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

            {required && !isValid && (
                <div className="text-red-500 text-xs font-medium flex items-center gap-1"><Info size={12} /> Field is required</div>
            )}
        </div>
    );
}