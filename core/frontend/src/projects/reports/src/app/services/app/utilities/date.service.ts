import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateService {

  constructor() { }

  getStartAndEndDate(interval: 'today' | 'currentWeek' | 'lastWeek' | 'currentMonth' | 'lastMonth' | 'currentQuarter' | 'lastQuarter' | 'lastSixMonths' | 'currentYear' | 'lastYear' | 'q1' | 'q2' | 'q3' | 'q4' | string): { startDate: Date, endDate: Date } {
    // console.log('interval ' , interval);
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const quarter = Math.floor((month / 3));

    switch (interval) {
      case 'today':
        return { startDate: today, endDate: today }
      case 'currentWeek':
        return { startDate: this.getFirstDayOfWeek(today), endDate: this.getLastDayOfWeek(today) };
      case 'lastWeek':
        const lastWeekStart = this.getFirstDayOfLastWeek(today);
        const lastWeekEnd = this.getLastDayOfLastWeek(today);
        return { startDate: lastWeekStart, endDate: lastWeekEnd };
      case 'currentMonth':
        return { startDate: new Date(year, month, 1), endDate: new Date(year, month + 1, 0) };
      case 'lastMonth':
        const lastMonth = month === 0 ? 11 : month - 1;
        return { startDate: new Date(year, lastMonth, 1), endDate: new Date(year, month, 0) };
      case 'currentQuarter':
        return { startDate: new Date(year, quarter * 3, 1), endDate: new Date(year, (quarter + 1) * 3, 0) };
      case 'lastQuarter':
        const lastQuarter = quarter === 0 ? 3 : quarter - 1;
        return { startDate: new Date(year, lastQuarter * 3, 1), endDate: new Date(year, quarter * 3, 0) };
      case 'lastSixMonths':
        return { startDate: new Date(year, month - 5, 1), endDate: new Date(year, month + 1, 0) };
      case 'currentYear':
        return { startDate: new Date(year, 0, 1), endDate: new Date(year, 12, 0) };
      case 'previousYear':
        return { startDate: new Date(year - 1, 0, 1), endDate: new Date(year, 0, 0) };
        case 'q1':
          return { startDate: new Date(year, 6, 1), endDate: new Date(year, 8, 30) };
        case 'q2':
          return { startDate: new Date(year, 9, 1), endDate: new Date(year, 11, 31) };
        case 'q3':
          return { startDate: new Date(year + 1, 0, 1), endDate: new Date(year + 1, 2, 31) };
        case 'q4':
          return { startDate: new Date(year + 1, 3, 1), endDate: new Date(year + 1, 5, 30) };        
      default:
        throw new Error('Invalid interval provided');
    }
  }

  // private getFirstDayOfWeek(date: Date): Date {
  //   const firstDay = new Date(date);
  //   const dayOfWeek = firstDay.getDay();
  //   const diff = firstDay.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  //   firstDay.setDate(diff);
  //   firstDay.setHours(0, 0, 0, 0);
  //   return firstDay;
  // }

  private getFirstDayOfWeek(date: Date): Date {
    const dayOfWeek = date.getDay(); // Get the day of the week (0-6)
    const firstDayOfWeek = dayOfWeek === 0 ? 0 : 1; // Sunday is the first day (0), otherwise Monday (1)
    // console.log('inside get first day of week ', date, dayOfWeek, firstDayOfWeek);
  
    // Calculate the number of days to subtract to get to the first day
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - firstDayOfWeek;
  
    const firstDay = new Date(date.getTime()); // Create a copy of the date
    firstDay.setDate(date.getDate() - daysToSubtract); // Set the date to the first day
    firstDay.setHours(0, 0, 0, 0); // Set the time to midnight
  
    return firstDay;
  }

  private getLastDayOfWeek(date: Date): Date {
    const lastDay = new Date(date);
    const dayOfWeek = lastDay.getDay();
    const diff = lastDay.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) + 6;
    lastDay.setDate(diff);
    lastDay.setHours(23, 59, 59, 999);
    return lastDay;
  }

  private getFirstDayOfLastWeek(date: Date): Date {
    const firstDay = this.getFirstDayOfWeek(date);
    firstDay.setDate(firstDay.getDate() - 7);
    return firstDay;
  }

  private getLastDayOfLastWeek(date: Date): Date {
    const lastDay = this.getLastDayOfWeek(date);
    lastDay.setDate(lastDay.getDate() - 7);
    return lastDay;
  }
}
