export const stripInlineStyles = (html: string): string =>
    html.replace(/\sstyle="[^"]*"/gi, "");
