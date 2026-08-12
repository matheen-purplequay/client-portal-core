import { useMemo } from "react";

const getStartOfWeek = (date: Date) => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

const getFinancialYearStart = (date: Date) => {
  const year = date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;
  return new Date(year, 3, 1); // 🟢 Apr 1
};

export const useDateFilters = () => {
  return useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // 🔷 CURRENT WEEK
    const startOfWeek = getStartOfWeek(new Date());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    // 🔷 LAST WEEK
    const lastWeekStart = new Date(startOfWeek);
    lastWeekStart.setDate(startOfWeek.getDate() - 7);
    const lastWeekEnd = new Date(lastWeekStart);
    lastWeekEnd.setDate(lastWeekStart.getDate() + 6);

    // 🔷 CURRENT MONTH
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // 🔷 LAST MONTH
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    // 🔷 CURRENT QUARTER (Financial Year: Apr → Mar)
    const quarter = Math.floor((today.getMonth() + 3) / 3);
    const quarterStart = new Date(today.getFullYear(), (quarter - 1) * 3, 1);
    const quarterEnd = new Date(today.getFullYear(), quarter * 3, 0);

    // 🔷 LAST QUARTER
    const lastQuarterStart = new Date(quarterStart);
    lastQuarterStart.setMonth(lastQuarterStart.getMonth() - 3);
    const lastQuarterEnd = new Date(quarterStart);
    lastQuarterEnd.setDate(quarterStart.getDate() - 1);

    // 🔷 CURRENT FINANCIAL YEAR
    const fyStart = getFinancialYearStart(new Date());
    const fyEnd = new Date(fyStart.getFullYear() + 1, 2, 31);

    // 🔷 LAST FINANCIAL YEAR
    const lastFyStart = new Date(fyStart);
    lastFyStart.setFullYear(fyStart.getFullYear() - 1);
    const lastFyEnd = new Date(fyStart);
    lastFyEnd.setDate(fyStart.getDate() - 1);

    return {
      today: { from: today, to: today },
      yesterday: { from: yesterday, to: yesterday },
      currentWeek: { from: startOfWeek, to: endOfWeek },
      lastWeek: { from: lastWeekStart, to: lastWeekEnd },
      currentMonth: { from: startOfMonth, to: endOfMonth },
      lastMonth: { from: lastMonthStart, to: lastMonthEnd },
      currentQuarter: { from: quarterStart, to: quarterEnd },
      lastQuarter: { from: lastQuarterStart, to: lastQuarterEnd },
      currentFinancialYear: { from: fyStart, to: fyEnd },
      lastFinancialYear: { from: lastFyStart, to: lastFyEnd },
    };
  }, []);
};
