export const isStringNegativeValue = (str: string): boolean => {
    // Match if string starts with "-" followed by digits (and optional time format)
    const negativePattern = /^-\d+(:\d{2}(:\d{2})?)?$/;
  
    return negativePattern.test(str.trim());
}

export const isNumberNegativeValue = (num: number): boolean => {
    // Match if string starts with "-" followed by digits (and optional time format)
    const negativePattern = /^-\d+(:\d{2}(:\d{2})?)?$/;
  
    return negativePattern.test(num.toString());
}

export const isNumericValue = (str: string) => {
    const numericPattern = /^\d+(:\d{2}(:\d{2})?)?$/;
    const negativeNumericPattern = /^-\d+(:\d{2}(:\d{2})?)?$/;
    return numericPattern.test(str.trim()) || negativeNumericPattern.test(str.trim());
};

export const isDateValue = (str: string) => {
    if (typeof str !== 'string') return false;
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    const datePattern2 = /^\d{2}[-/]\d{2}[-/]\d{4}$/;
    return datePattern.test(str.trim()) || datePattern2.test(str.trim());
};