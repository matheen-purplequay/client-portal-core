import type { JobTitle, StatusCount } from "../../../core/models/movement";

type RawStatusCountRow = {
    StatusName: string;
    TotalCount: number;
    StatusId: number;
    color?: string;
};

export function transformStatusCounts(
    apiData: RawStatusCountRow[],
    jobTitles: JobTitle[],
): StatusCount[] {
    const lookup: Record<string, { count: number; id: number; color?: string }> = {};
    apiData.forEach((row) => {
        lookup[row.StatusName] = {
            count: row.TotalCount,
            id: row.StatusId,
            color: row.color,
        };
    });

    return jobTitles.map((jobTitle) => ({
        id: lookup[jobTitle.key]?.id ?? jobTitle.id,
        key: jobTitle.key,
        title: jobTitle.title,
        value: Number(lookup[jobTitle.key]?.count ?? 0),
        titleClass: `flex-1 ${jobTitle.titleClass ?? ""}`,
        valueClass: `flex flex-col ${jobTitle.valueClass ?? ""}`,
        className: `flex flex-col ${jobTitle.className ?? ""}`,
    }));
}
