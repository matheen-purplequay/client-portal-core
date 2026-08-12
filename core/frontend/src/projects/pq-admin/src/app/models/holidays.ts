export interface Holiday {
  id?: number;
  month: string;
  month_id: number;
  year: number;
  date: string;
  day: string;
  reason: string;
  type: string;
  iso_country_alpha3_code: string;
  remarks?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export const MONTHS = [
  { id: 1, name: 'January' }, { id: 2, name: 'February' }, { id: 3, name: 'March' },
  { id: 4, name: 'April' }, { id: 5, name: 'May' }, { id: 6, name: 'June' },
  { id: 7, name: 'July' }, { id: 8, name: 'August' }, { id: 9, name: 'September' },
  { id: 10, name: 'October' }, { id: 11, name: 'November' }, { id: 12, name: 'December' }
];

export const HOLIDAY_TYPES = [
  'National', 'Public', 'Restricted', 'Special', 'Wellbeing',
  'VIC', 'TAS', 'WA', 'ACT', 'SA', 'QLD', 'NT', 'NSW', 'MOST STATE'
];

export const DAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];