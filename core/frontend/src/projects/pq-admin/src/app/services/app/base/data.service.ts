import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpParams, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment as env } from 'projects/pq-admin/src/environments/environment';
import { StorageService } from '../storage/storage.service';

const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;
const REPORTS_HOST = env.api_production.hosts.reports_server;

const GET_TOKEN = `${ACCOUNTS_HOST}/get-token`;

@Injectable({
  providedIn: 'root'
})
export class DataService {
  
  token = '';
  csrfToken: string = '';
  options: any;
  user: any;

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {
    this.user = this.storageService.getItem('userdata');
    this.token = this.storageService.getItem('token');
    this.options = {
      headers: new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', `Bearer ${this.token}`)
    }
    this.getToken();
  }

  getToken() {
    const options = { 
      headers: new HttpHeaders().set('Content-Type', 'application/text').set('Authorization', `Bearer ${this.token}`)
    };
    let body = {
      email: 'nikko76@example.net',
      password: 'password'
    }
    return this.http.post(GET_TOKEN, body, options);
  }
  
  setToken() {
    this.options = { 
      headers: new HttpHeaders().set('Content-Type', 'application/json') .set( 'X-CSRF-TOKEN', this.csrfToken).set('Authorization', `Bearer ${this.token}`)
    };
  }

  doPost(url: string, body: any, modifyPayload: boolean = true) {    
    if (modifyPayload && this.user) {
      body = {
        ...body,
        logged_in_user: {
          user_id: this.user.user_id,
          role_id: this.user.role_id,
          role: this.user.role,
          company_id: this.user.company_id,
        },
      };
    }
    return this.http.post(url, body, this.options);
  }

  doUpload(url: string, file: File, body: any) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'multipart/form-data'
      }).set('Authorization', `Bearer ${this.token}`)
    };

    this.options.headers.append('Content-Type', 'multipart/form-data');

    let formData = new FormData();
    formData.append('file', file);
    Object.keys(body).forEach(key => {
      formData.append(key, JSON.stringify(body[key]));
    });

    let params = new HttpParams();

    const options = {
      params: params,
      reportProgress: true,
    };
    
    const req = new HttpRequest('POST', url, formData, httpOptions);
    return this.http.request(req);
  }

  doGet(url: string, responseType: string = 'json') {  
    const options = { 
      headers: new HttpHeaders().set('Content-Type', `application/${responseType}`).set('Authorization', `Bearer ${this.token}`)
    };
    return this.http.get(url, options);
  }

  doGetAsHTML(url: string) {
    const options = { 
      headers: new HttpHeaders().set('Content-Type', 'application/text').set('responseType', 'text').set('Authorization', `Bearer ${this.token}`)
    };
    return this.http.get(url, options);
  }

  readHtmlFile(url: string) {
    return this.http.get(url, { responseType: 'text' });
  }

  doGetAsBlob(url: string) {
    const options = {
      responseType: 'blob' as 'json'
    };
    return this.http.get(url, options);
  }

  doGetAsBlobByPost(url: string, body: any) {
    const options = {
      responseType: 'blob' as 'json'
    };
    return this.http.post(url, body, options);
  }

  doGetAsText(url: string) {
    const options = {
      headers: new HttpHeaders().set('Content-Type', 'application/text').set('responseType', 'text').set('Authorization', `Bearer ${this.token}`)
    };
    return this.http.get<any>(url, options);
  }

  doGetWithParams(url: string, params: HttpParams) {
    return this.http.get(url, {
      params: params
    });
  }

  doGetAsArrayBuffer(url: string): Observable<Uint8Array | ArrayBuffer> {
    // Make an HTTP GET request to fetch the PDF data
    return this.http.get(url, { responseType: 'arraybuffer' });
  }

  doPostAsArrayBuffer(url: string, body: any): Observable<Uint8Array | ArrayBuffer> {
    return this.http.post(url, body, { 
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }

  doGetJSONData(data: string) {
    return this.http.get(`/assets/json/${data}.json`);
  }

  doUploadFormData(url: string, body: any, file: File, fileParam: string = 'report') {
    let formData = new FormData();

    for (const key in body) {
      if (body.hasOwnProperty(key)) {
        formData.append(key, body[key]);
      }
    }

    formData.append(fileParam, file);

    let params = new HttpParams();
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');
    headers.append('Accept', 'application/json');

    const options = {
      params: params,
      headers: headers,
      reportProgress: true,
    };

    return this.http.post(url, formData, options);
  }

}
