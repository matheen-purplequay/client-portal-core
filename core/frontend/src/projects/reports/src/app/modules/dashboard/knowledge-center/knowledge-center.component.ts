import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonService } from '../../../services/app/common/common.service';

@Component({
  selector: 'app-knowledge-center',
  templateUrl: './knowledge-center.component.html',
  styleUrls: ['./knowledge-center.component.scss']
})
export class KnowledgeCenterComponent implements OnInit {

  articles: {
    title: string;
    description: string;
    link: string;
    type: string;
    image: string;
    category: string;
  }[] = [];

  articleCategories: { list: any[], selectedCategory: string } = {
    list: [],
    selectedCategory: ''
  };

  tools: {
    title: string;
    link: string;
    description: string;
    image: string;
    category: string;
  }[] = [];

  toolCategories: { categories: any[], subCategories: any[], selectedCategory: string, selectedSubCategory: string } = {
    categories: [],
    subCategories: [],
    selectedCategory: '',
    selectedSubCategory: ''
  };

  filterTabs: {
    tabs: {index: number, label: string}[],
    selectedTab: {index: number, label: string}
  } = {
    tabs: [
      { index: 0, label: 'Useful Tools' },
      { index: 1, label: 'Articles' }
    ],
    selectedTab: { index: 0, label: 'Job Movement' }
  };

  period: { 
    years: number[],
    monthNames: string[],
    selctedPeriod: { date: number, month: number, year: number }
  } = {
    years: [2023],
    monthNames: ['All', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    selctedPeriod: { date: new Date().getDate(), month: new Date().getMonth(), year: new Date().getFullYear() }
  };

  selectedToolLink: SafeResourceUrl = '';
  showToolPopup = false;
  isLoadingArticles = false;
  isLoadingTools = false;

  constructor(
    private commonService: CommonService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    console.log('ng on init ');
    this.setupAmbience();
  }

  setupAmbience() {
    console.log('setup ambience ');
    this.period.selctedPeriod.month = 0;
    this.getToolCategories();
  }

  getToolCategories() {
    this.commonService.getUsefulToolsCategories().subscribe((res: any) => {
      this.toolCategories.categories = res.categories;
      this.toolCategories.subCategories = res.sub_categories;
      if(res.categories.length > 0) this.toolCategories.selectedCategory = res.categories[0];
      // if(res.sub_categories.length > 0) this.toolCategories.selectedSubCategory = res.sub_categories[0];
      console.log('useful tools categories ', res, this.toolCategories);
      this.isLoadingTools = false;
      this.getTools();
    });
  }

  getKnowledgeCenter() {
    this.isLoadingArticles = true;
    const body = {
      month: this.period.selctedPeriod.month,
      year: this.period.selctedPeriod.year,
      category: this.articleCategories.selectedCategory
    };
    const selectedCategory = this.articleCategories.selectedCategory;
    this.commonService.getKnowledgeCenterData(body).subscribe((res: any) => {
      console.log('knowledge center ', res, body);
      this.articles = res.data;
      this.articleCategories.list = res.categories.map((item: string) => { return item; })
      // if((this.articleCategories.selectedCategory != '' && !categories.includes(this.articleCategories.selectedCategory))) 
      //   this.articleCategories.selectedCategory = categories[0];
      this.isLoadingArticles = false;
    });
  }

  getToolsByCategory() {
    this.isLoadingTools = true;
    const body = {
      category: this.toolCategories.selectedCategory,
      sub_category: ""
    };
    this.commonService.getUsefulToolsData(body).subscribe((res: any) => {
      this.tools = res.data;
      this.toolCategories.categories = res.categories;
      this.toolCategories.subCategories = res.sub_categories;
      // if(res.categories.length > 0) this.toolCategories.selectedCategory = res.categories[0];
      this.toolCategories.selectedSubCategory = res.sub_categories[0];
      this.isLoadingTools = false;

      console.log('tool by sub categ ', res.sub_categories[0], this.toolCategories.selectedCategory, this.toolCategories.selectedSubCategory);
      
    });
  }

  getTools() {
    this.isLoadingTools = true;
    const body = {
      category: this.toolCategories.selectedCategory,
      sub_category: this.toolCategories.selectedSubCategory
    };
    this.commonService.getUsefulToolsData(body).subscribe((res: any) => {
      this.tools = res.data;
      this.toolCategories.categories = res.categories;
      this.toolCategories.subCategories = res.sub_categories;
      // if(res.categories.length > 0) this.toolCategories.selectedCategory = res.categories[0];
      if(res.sub_categories.length > 0) this.toolCategories.selectedSubCategory = res.sub_categories[0];
      this.isLoadingTools = false;

      console.log('tool by sub categ ', res.sub_categories, this.toolCategories.selectedCategory, this.toolCategories.selectedSubCategory);
    });
  }

  handleFilterTabs(event: {index: number, label: string}) {
    this.filterTabs.selectedTab = event;
    if(event.index == 0) this.getTools();
    if(event.index == 1) this.getKnowledgeCenter();
  }

  setToolLink(link: string) {
    this.selectedToolLink = this.sanitizer.bypassSecurityTrustResourceUrl(link);
    this.showToolPopup = true;
  }

  goToLink(tool: any){
    console.log('tool ', tool);
    if(tool.link_type == 'download') {
      let body = {
        file_link: tool.link
      };
      this.commonService.getTool(body).subscribe((data: any) => {
        const blob = new Blob([data], {type: 'application/xslm'});
        console.log('tool from api ', blob);
        
  
        var downloadURL = window.URL.createObjectURL(data);
        var link = document.createElement('a');
        link.href = downloadURL;
        link.download = "forex_conversion.xslm";
        link.click();
      });
    } else {
      window.open(tool.link, "_blank");
    }
  }

  convertToNumber = (value: string) => { return Number(value); }
}
