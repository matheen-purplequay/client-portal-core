import { Injectable } from '@angular/core';
import * as Parser from 'rss-parser';
import { DataService } from '../app/data.service';
import { environment as env } from 'projects/reports/src/environments/environment';

const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;
const REPORTS_HOST = env.api_production.hosts.reports_server;

@Injectable({
  providedIn: 'root'
})
export class RssService {
  private rssParser: Parser;

  constructor(
    private dataService: DataService
  ) {
    this.rssParser = new Parser();
  }

  async getFeed(url: string) {
    try {
      const feed = await this.rssParser.parseURL(url);
      return feed.items;
    } catch (error) {
      console.error('Error fetching RSS feed:', error);
      return [];
    }
  }

  getNewsletters(body: any) {
    return this.dataService.doPost(`${REPORTS_HOST}/get-newsletters-by-master-company`, body);
  }
}
