import { Injectable } from '@angular/core';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor(
    private dataService: DataService
  ) { }

  getJSONData(data: string) {
    return this.dataService.doGet(`assets/json/${data}.json`);
  }

  getHTMLData(data: string) {
    return this.dataService.readHtmlFile(`assets/html/${data}.html`);
  }
}
