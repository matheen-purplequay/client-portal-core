import type { StatusCount } from "../../../core/models/movement";

export type LegendFilter = "client" | "carisma" | null;

// The client-company legend pill is rendered bg-yellow-100 (see progress-panel.tsx),
// so "client" maps to the yellow-tagged statuses and "carisma" to the plain/white ones.
function isYellowStatus(className?: string): boolean {
    return !!className && className.includes("bg-yellow-100");
}

function isWhiteStatus(className?: string): boolean {
    return !isYellowStatus(className) && !(className ?? "").includes("bg-green-100");
}

export function filterStatusCountByLegend(statusCount: StatusCount[], legend: LegendFilter): StatusCount[] {
    if (!legend) return statusCount;
    return statusCount.filter((status) =>
        legend === "client" ? isYellowStatus(status.className) : isWhiteStatus(status.className)
    );
}

export function filterRowsByLegend<T extends { StatusId: number }>(
    rows: T[],
    statusCount: StatusCount[],
    legend: LegendFilter
): T[] {
    if (!legend) return rows;
    const matchingIds = new Set(filterStatusCountByLegend(statusCount, legend).map((status) => status.id));
    return rows.filter((row) => matchingIds.has(row.StatusId));
}
