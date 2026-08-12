import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment as env } from 'projects/pq-admin/src/environments/environment';
import { Holiday } from '../../models/holidays';

const REPORTS_HOST = env.api_production.hosts.reports_server + '/admin/holidays';

const GETALL = `${REPORTS_HOST}/get/all/holidays`;
const GETBYID = `${REPORTS_HOST}/get/holiday`;
const CREATE = `${REPORTS_HOST}/create/holiday`;
const UPDATE = `${REPORTS_HOST}/update/holiday`;
const DELETE = `${REPORTS_HOST}/delete/holiday`;

@Injectable({
  providedIn: 'root'
})
export class HolidaysService {
 private apiUrl = '/api/holidays'; // change the methods to match:
 
  constructor(private http: HttpClient) {}
 
  getAll(filters?: { country?: string; year?: number; month_id?: number }): Observable<Holiday[]> {
    let params = new HttpParams();
    if (filters?.country) params = params.set('country', filters.country);
    if (filters?.year)    params = params.set('year', filters.year.toString());
    if (filters?.month_id) params = params.set('month_id', filters.month_id.toString());
    return this.http.get<any>(GETALL, { params }).pipe(
      map(res => Array.isArray(res) ? res : (res?.holidays ?? res?.data ?? []))
    );
  }
 
  getById(id: number): Observable<Holiday> {
    return this.http.get<Holiday>(GETBYID + `/${id}`);
  }
 
  create(holiday: Holiday): Observable<Holiday> {
    return this.http.post<Holiday>(CREATE, holiday);
  }
 
  update(id: number, holiday: Holiday): Observable<Holiday> {
    return this.http.put<Holiday>(UPDATE + `/${id}`, holiday);
  }
 
  delete(id: number): Observable<void> {
    return this.http.delete<void>(DELETE + `/${id}`);
  }
}
