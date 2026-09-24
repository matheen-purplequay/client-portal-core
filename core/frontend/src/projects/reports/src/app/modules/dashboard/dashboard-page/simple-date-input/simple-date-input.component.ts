import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// A self-contained date picker (real DOM, own open/close state per instance)
// instead of native <input type="date">. Two adjacent native date inputs
// were causing cross-field focus/value glitches — their popups aren't part
// of the DOM, so outside-click detection can't reliably tell them apart.
// This component owns its own dropdown as an actual child element, so
// document-click-to-close and per-field isolation both work correctly.
@Component({
  selector: 'app-simple-date-input',
  templateUrl: './simple-date-input.component.html',
  styleUrls: ['./simple-date-input.component.scss']
})
export class SimpleDateInputComponent {

  @Input() value = ''; // 'YYYY-MM-DD'
  @Output() valueChange = new EventEmitter<string>();

  isOpen = false;
  viewYear: number;
  viewMonth: number; // 0-11

  weekdayLabels = WEEKDAY_LABELS;

  constructor(private elementRef: ElementRef<HTMLElement>) {
    const now = new Date();
    this.viewYear = now.getFullYear();
    this.viewMonth = now.getMonth();
  }

  get displayValue(): string {
    if (!this.value) return '';
    const [y, m, d] = this.value.split('-').map(Number);
    return `${String(d).padStart(2, '0')}-${String(m).padStart(2, '0')}-${y}`;
  }

  get monthLabel(): string {
    return `${MONTH_NAMES[this.viewMonth]} ${this.viewYear}`;
  }

  get dayCells(): (number | null)[] {
    const firstWeekday = new Date(this.viewYear, this.viewMonth, 1).getDay();
    const daysInMonth = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }

  toggle() {
    if (!this.isOpen && this.value) {
      const [y, m] = this.value.split('-').map(Number);
      this.viewYear = y;
      this.viewMonth = m - 1;
    }
    this.isOpen = !this.isOpen;
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent) {
    if (this.isOpen && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.isOpen = false;
    }
  }

  prevMonth() {
    if (this.viewMonth === 0) {
      this.viewMonth = 11;
      this.viewYear--;
    } else {
      this.viewMonth--;
    }
  }

  nextMonth() {
    if (this.viewMonth === 11) {
      this.viewMonth = 0;
      this.viewYear++;
    } else {
      this.viewMonth++;
    }
  }

  isSelected(day: number): boolean {
    if (!this.value) return false;
    const [y, m, d] = this.value.split('-').map(Number);
    return y === this.viewYear && (m - 1) === this.viewMonth && d === day;
  }

  selectDay(day: number) {
    const iso = `${this.viewYear}-${String(this.viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    this.value = iso;
    this.valueChange.emit(iso);
    this.isOpen = false;
  }

}
