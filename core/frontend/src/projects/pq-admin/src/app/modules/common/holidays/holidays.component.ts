import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Holiday, MONTHS, HOLIDAY_TYPES, DAYS } from '../../../models/holidays';
import { HolidaysService } from '../../../services/common/holidays.service';
 
@Component({
  selector: 'app-holidays',
  templateUrl: './holidays.component.html',
  styleUrls: ['./holidays.component.scss']
})
export class HolidaysComponent implements OnInit {
holidays: Holiday[] = [];
  filteredHolidays: Holiday[] = [];
  form!: FormGroup;
  filterForm!: FormGroup;
 
  editingId: number | null = null;
  showForm = false;
  isLoading = false;
  isSaving = false;
  isDeleting = false;
  errorMsg = '';
  successMsg = '';
  confirmDeleteId: number | null = null;
 
  readonly months = MONTHS;
  readonly holidayTypes = HOLIDAY_TYPES;
  readonly days = DAYS;
  readonly countries = ['AUS', 'IND'];
 
  constructor(private fb: FormBuilder, private svc: HolidaysService) {}
 
  ngOnInit(): void {
    this.buildForm();
    this.buildFilterForm();
    this.loadHolidays();
  }
 
  // ─── Form Setup ──────────────────────────────────────────────────────────────
 
  buildForm(): void {
    this.form = this.fb.group({
      month:                   ['', Validators.required],
      month_id:                [null, [Validators.required, Validators.min(1), Validators.max(12)]],
      year:                    [new Date().getFullYear(), [Validators.required, Validators.min(2000)]],
      date:                    ['', Validators.required],
      day:                     ['', Validators.required],
      reason:                  ['', Validators.required],
      type:                    ['', Validators.required],
      iso_country_alpha3_code: ['', [Validators.required, Validators.maxLength(5)]],
      remarks:                 [null]
    });
 
    // Auto-fill month name when month_id changes
    this.form.get('month_id')?.valueChanges.subscribe(id => {
      const match = this.months.find(m => m.id === +id);
      if (match) this.form.get('month')?.setValue(match.name, { emitEvent: false });
    });
  }
 
  buildFilterForm(): void {
    this.filterForm = this.fb.group({
      country:  [''],
      year:     [''],
      month_id: ['']
    });
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }
 
  // ─── CRUD ─────────────────────────────────────────────────────────────────────
 
  loadHolidays(): void {
    this.isLoading = true;
    this.svc.getAll().pipe(finalize(() => this.isLoading = false)).subscribe({
      next: data => { this.holidays = Array.isArray(data) ? data : []; this.applyFilters(); },
      error: err  => { this.errorMsg = 'Failed to load holidays.'; }
    });
  }
 
  applyFilters(): void {
    const { country, year, month_id } = this.filterForm.value;
    this.filteredHolidays = this.holidays.filter(h =>
      (!country  || h.iso_country_alpha3_code === country) &&
      (!year     || h.year === +year) &&
      (!month_id || h.month_id === +month_id)
    );
  }
 
  openCreate(): void {
    this.editingId = null;
    this.form.reset({ year: new Date().getFullYear() });
    this.showForm = true;
    this.clearMessages();
  }
 
  openEdit(holiday: Holiday): void {
    this.editingId = holiday.id!;
    this.form.patchValue(holiday);
    this.showForm = true;
    this.clearMessages();
  }
 
  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.isSaving = true;
    const payload: Holiday = this.form.value;

    const req$ = this.editingId
      ? this.svc.update(this.editingId, payload)
      : this.svc.create(payload);

    req$.pipe(finalize(() => this.isSaving = false)).subscribe({
      next: saved => {
        if (this.editingId) {
          this.loadHolidays();
        } else {
          this.holidays.push(saved);
          this.applyFilters();
        }
        this.showForm = false;
        this.successMsg = `Holiday ${this.editingId ? 'updated' : 'created'} successfully.`;
        this.editingId = null;
      },
      error: () => { this.errorMsg = 'Save failed. Please try again.'; }
    });
  }

  confirmDelete(id: number): void {
    this.confirmDeleteId = id;
  }

  deleteConfirmed(): void {
    if (this.confirmDeleteId == null) return;
    this.isDeleting = true;
    const id = this.confirmDeleteId;
    this.svc.delete(id).pipe(finalize(() => this.isDeleting = false)).subscribe({
      next: () => {
        // this.holidays = this.holidays.filter(h => h.id !== id);
        this.loadHolidays(); // Reload to ensure consistencys
        this.applyFilters();
        this.successMsg = 'Holiday deleted.';
        this.confirmDeleteId = null;
      },
      error: () => { this.errorMsg = 'Delete failed.'; this.confirmDeleteId = null; }
    });
  }
 
  cancelDelete(): void { this.confirmDeleteId = null; }
 
  cancelForm(): void { this.showForm = false; this.editingId = null; this.clearMessages(); }
 
  clearMessages(): void { this.errorMsg = ''; this.successMsg = ''; }
 
  // ─── Helpers ──────────────────────────────────────────────────────────────────
 
  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }
 
  trackById(_: number, h: Holiday) { return h.id; }
}
