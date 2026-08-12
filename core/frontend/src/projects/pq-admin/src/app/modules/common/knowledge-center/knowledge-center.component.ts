import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../services/common/common.service';
import { CommonData, ArticleData } from '../../../models/common';
import { TeamsService } from '../../../services/entities/teams.service';
import { StorageService } from '../../../services/app/storage/storage.service';

const KC_SELECTED_FILTER = 'kc_selected_filter';

@Component({
  selector: 'app-knowledge-center',
  templateUrl: './knowledge-center.component.html',
  styleUrls: ['./knowledge-center.component.scss']
})
export class KnowledgeCenterComponent implements OnInit {

  kcArticlesPayload: ArticleData = CommonData.defaultArticleData();
  kcToolsPayload: ArticleData = CommonData.defaultArticleData();
  kcArticlesData: ArticleData[] = [];
  kcToolsData: ArticleData[] = [];

  articleCategories: { list: any[], selectedCategory: string } = {
    list: [],
    selectedCategory: ''
  };

  toolCategories: { categories: any[], subCategories: any[], selectedCategory: string, selectedSubCategory: string } = {
    categories: [],
    subCategories: [],
    selectedCategory: '',
    selectedSubCategory: ''
  };

  filters = {
    list: [
      { index: 0, label: 'Useful Tools' },
      { index: 1, label: 'Articles' }
    ],
    selectedFilter: { index: 0, label: 'Useful Tools' },
    keys: { key: 'index', value: 'label' }
  };

  isLoadingArticles = false;
  isLoadingTools = false;

  period: { 
    years: number[],
    monthNames: string[],
    selctedPeriod: { date: number, month: number, year: number }
  } = {
    years: [2023],
    monthNames: ['All Months', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    selctedPeriod: { date: new Date().getDate(), month: new Date().getMonth(), year: new Date().getFullYear() }
  };

  verticals = {
    list: [],
    selectedVertical: { wm_vertical_id: 0, title: '' },
    keys: { key: 'wm_vertical_id', value: 'title' }
  };

  constructor(
    private commonService: CommonService,
    private teamsService: TeamsService,
    private storageService: StorageService
  ) { }

  ngOnInit(): void {
    this.setupAmbience();
  }

  setupAmbience() {
    this.period.selctedPeriod.month = 0;
    this.kcArticlesPayload.month = this.period.selctedPeriod.month;
    this.kcArticlesPayload.year = this.period.selctedPeriod.year;
    this.getVerticals();
    if(this.storageService.isItemExists(KC_SELECTED_FILTER)) {
      this.filters.selectedFilter = this.storageService.getItem(KC_SELECTED_FILTER);

      if(this.filters.selectedFilter.index == 0) this.getUsefulTools();
      else this.getArticles();
    }
  }

  getVerticals() {
    this.teamsService.getVerticals().subscribe((res: any) => {
      if(res.status) {
        this.verticals.list = res.data.map(({ id, wm_vertical_id, title }: any) => ({ id, wm_vertical_id, title }));
        this.verticals.selectedVertical = this.verticals.list[0];
      } 
    });
  }

  getToolCategories() {
    this.commonService.getUsefulToolsCategories().subscribe((res: any) => {
      this.toolCategories.categories = res.categories;
      this.toolCategories.subCategories = res.sub_categories;
      if(res.categories.length > 0) this.toolCategories.selectedCategory = res.categories[0];
      // if(res.sub_categories.length > 0) this.toolCategories.selectedSubCategory = res.sub_categories[0];

      this.isLoadingTools = false;
      this.getUsefulTools();
    });
  }

  getArticles() {
    const body = {
      month: this.period.selctedPeriod.month,
      year: this.period.selctedPeriod.year
    };
    this.commonService.getArticles(body).subscribe((res: any) => {

      if(res.status) {
        this.kcArticlesData = res.data;
      }
    });
  }

  getUsefulTools() {
    this.commonService.getUsefulTools().subscribe((res: any) => {

      if(res.status) {
        this.kcToolsData = res.data;
      }
    });
  }

  saveArticle() {

    this.kcArticlesPayload.category = this.verticals.selectedVertical.title;
    this.commonService.saveArticle(this.kcArticlesPayload).subscribe((res: any) => {

      this.kcArticlesPayload = CommonData.defaultArticleData();
      this.getArticles();
    });
  }

  saveUsefulTools() {
    this.commonService.saveUsefulTools(this.kcToolsPayload).subscribe((res: any) => {

      this.kcToolsPayload = CommonData.defaultArticleData();
      this.getUsefulTools();
    });
  }

  handleFilter(event: { index: number, label: string }) {
    this.filters.selectedFilter = event;
    this.storageService.setItem(KC_SELECTED_FILTER, this.filters.selectedFilter);
    if(event.index == 0) this.getUsefulTools();
    if(event.index == 1) this.getArticles();
  }

  convertToNumber = (value: string) => { return Number(value); }

}
