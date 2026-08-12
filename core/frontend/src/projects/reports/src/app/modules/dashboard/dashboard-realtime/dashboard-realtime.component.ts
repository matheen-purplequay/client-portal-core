import { Component, Input, OnInit } from '@angular/core';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import html2canvas from 'html2canvas';
import * as moment from 'moment';
import * as tz from 'moment-timezone';
import { BehaviorSubject } from 'rxjs';
import { WorkFlowRequest, DefaultRequest, ToARequest } from '../../../models/chartdata';
import { MonthType, CommonDataTypes } from '../../../models/common-data-types';
import { ConfigService } from '../../../services/app/config.service';
import { ChartDataService } from '../../../services/dashboard/chart-data.service';
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { format, utcToZonedTime } from 'date-fns-tz';
import { DefaultChart, BarChartData, ChartJS, ChartJSConfig, LineChartData } from 'pq-ui';
import { LocalStorageService } from '../../../services/app/storage/local-storage.service';
import { Settings } from 'projects/reports/src/environments/settings';

Chart.register(ChartDataLabels);

@Component({
  selector: 'app-dashboard-realtime',
  templateUrl: './dashboard-realtime.component.html',
  styleUrls: ['./dashboard-realtime.component.scss']
})
export class DashboardRealtimeComponent implements OnInit {

  @Input() revalidate: BehaviorSubject<boolean> = new BehaviorSubject(false);
  @Input() refresh: BehaviorSubject<boolean> = new BehaviorSubject(false);
  @Input() hideIndex: BehaviorSubject<number> = new BehaviorSubject(-1);

  fy = Settings.getAustralianFinancialYear();
  
  months = [];
  metaDetails: {
    localTime: string,
    otherTime: string,
    lastUpdated: string
  } = {
      localTime: '',
      otherTime: '',
      lastUpdated: ''
  };

  filterTabs: {
    tabs: {index: number, label: string}[],
    selectedTab: {index: number, label: string}
  } = {
    tabs: [
      { index: 0, label: 'Staff' },
      { index: 1, label: 'Hourly' },
      { index: 2, label: 'Agreed' }
    ],
    selectedTab: { index: 0, label: 'Staff' }
  };

  verticals = [
    { index: 'smsf', name: 'SMSF' },
    { index: 'bs', name: 'Business Services' },
    { index: 'fp', name: 'Financial Planning' },
    { index: 'os', name: 'OSS' },
  ];

  durations: { index: number, label: string }[] = [
    { index: 2, label: 'Last 3 Months' },
    { index: 5, label: 'Last 6 Months' },
    { index: 11, label: 'Last 1 year' }
  ];

  currentYear = new Date().getFullYear();
  showDateError = false;
  currentMonth = new Date().getMonth();
  currentDate = new Date().getDate();

  allMonths: MonthType[] = CommonDataTypes.getAllMonthsWithIndex();
  monthsToShow = this.allMonths.slice(0, this.currentMonth);

  xaxis: string = '';
  yaxis: string = '';
  labels = [];
  chartType: string = 'bar';

  chartData: any[] = [];

  wfConfig: ChartJSConfig = ChartJS.defaultConfig('bar');
  @Input() wfRefresh: BehaviorSubject<boolean> = new BehaviorSubject(false);

  toaConfig: ChartJSConfig = ChartJS.defaultConfig('line');
  @Input() toaRefresh: BehaviorSubject<boolean> = new BehaviorSubject(false);

  jftConfig: ChartJSConfig = ChartJS.defaultConfig('bar');
  @Input() jftRefresh: BehaviorSubject<boolean> = new BehaviorSubject(false);

  barChart: BarChartData = DefaultChart.defaultBarChart();
  lineChartData: LineChartData = DefaultChart.defaultLineChart();
  jftBarChart: BarChartData = DefaultChart.defaultBarChart();

  filters: WorkFlowRequest = DefaultRequest.defaultWorkflowRequest();
  workflowFilter: WorkFlowRequest = DefaultRequest.defaultWorkflowRequest();
  toaFilter: ToARequest = DefaultRequest.defaultToARequest();

  wfChartType: 'bar' | 'line' = 'bar';

  sDateText: string = '';
  eDateText: string = '';

  metrics: {
    ReceivedCount: number,
    CompletedCount: number,
    ThroughPut: string
  } = {
    ReceivedCount: 0,
    CompletedCount: 0,
    ThroughPut: ""
  };

  overall: {
    Clientname: string,
    NotYetStarted: string,
    InProgress: string,
    Queries: string,
    ClientClosure: string
  } = {
    Clientname: "",
    NotYetStarted: "",
    InProgress: "",
    Queries: "",
    ClientClosure: ""
  };

  wfCheckboxes = {
    awaiting: true,
    closed: true,
    inprogress: true,
    hold: true
  };

  jobStatus: {
    clientName: string,
    JobName:  string,
    TLName:  string,
    TimeTaken:  string,
    BudgetTime:  string,
    WorkStatus:  string,
    Receiveddate:  string,
    EstDate: string,
    LastTouch: number,
  }[] = [];

  constructor(
    private configService: ConfigService,
    private localStorageService: LocalStorageService,
    private chartDataService: ChartDataService
  ) {
    this.setupAmbience();
  }

  ngOnInit(): void {
  }
  
  setupAmbience() {
    if(this.localStorageService.getItem('chartfilters')) {
      this.filters = JSON.parse(this.localStorageService.getItem('chartfilters')!) as WorkFlowRequest;
    } else {
      let sdate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      let edate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  
      this.filters.startDate = sdate;
      this.filters.endDate = edate;
  
      this.setLocalStorageFilters();
    }
    setInterval(() => { 
      this.getTime();
    }, 1000);
    setTimeout(() => {
      this.getWFStatusFromService();
    }, 1000);
    setTimeout(() => {
      this.getToAStatusFromService();
    }, 2000);
    setTimeout(() => {
      this.getJFTStatusFromService();
    }, 3000);

    this.chartDataService.getMetrics(this.filters).subscribe((res: any) => {
      console.log('METRICS REPORT - ', res);  
      this.metrics = res[0];
    });

    this.getOverall();
    this.getJobStatus();
    this.checkDates();
  }

  getOverall() {
    const body = {
      project_id: this.localStorageService.getItem('userdata').project_id
    };
    this.chartDataService.getOverall(body).subscribe((res: any) => {
      // console.log('OVERALL REPORT - ', res); 
      this.overall = res[0];     
    });
  }

  refreshAllCharts() {
    this.getWFStatusFromService();
    this.getJobStatus();
    this.getToAStatusFromService();
    this.getJFTStatusFromService();

    this.chartDataService.getMetrics(this.filters).subscribe((res: any) => {
      console.log('METRICS REPORT - ', res);  
      this.metrics = res[0];
    });

    this.getOverall();
  }

  getTime() {
    // Get the current time in the local time zone
    this.metaDetails.localTime = moment().format('YYYY-MM-DD HH:mm:ss');

    // Get the current time in Melbourne time zone
    const melbourneTimezone = 'Australia/Melbourne';
    this.metaDetails.otherTime = tz.tz(melbourneTimezone).format('YYYY-MM-DD HH:mm:ss');

    // Get Last update
    this.metaDetails.lastUpdated = moment().fromNow();
  }

  // WORKFLOW STATUS
  getWFStatusFromService() {
    this.chartDataService.getWorkflowStatus(this.filters).subscribe((res: any) => {
      const chartData = res;
      console.log('WF Data - ', res);
      
      
      const labels = chartData[0].map((item: any) => {
        return item.Status;
      });
  
      const counts = chartData[0].map((item: any) => {
        return item.Count;
      });

      const backgroundColors = ["#FFA600", "#FF562F", "#37CB89", "#2FC1FF"];
      const backgrounds = chartData[0].map((item: any, index: number) => {
        return backgroundColors[Math.floor(Math.random() * backgroundColors.length)];
      });
      
      const data: any[] = [];
      data.push({
        label: "Workflow Status",
        backgroundColor: backgroundColors,
        borderRadius: 5,
        data: counts,
        legend: {
          display: false
        }
      });
  
      this.wfConfig.type = this.wfChartType;
      this.barChart.labels = labels;
      this.barChart.datasets = data;
      this.wfConfig.data = {...this.barChart as BarChartData};

      console.log('wf config in dashboard ', this.wfConfig);

      this.refreshChart(1);
    });
  }

  getToAStatusFromService(duration = this.durations[0].index) {
    let body = {
      pid: 28,
      intervalId: duration
    };
    this.chartDataService.getToAStatus(body).subscribe((res: any) => {
      console.log('TOA chart data - ', res);
      const chartData = res;
      
      const backgroundColors = ["#FFA600", "#FF562F", "#37CB89", "#2FC1FF"];
      const backgrounds = chartData[0].map((item: any, index: number) => {
        return backgroundColors[Math.floor(Math.random() * backgroundColors.length)];
      });

      const data = {
        labels: chartData[0].map((item: any) => item.Month),
        datasets: [
          {
            label: 'Closed jobs',
            data: chartData[0].map((item: any) => item.ClosedJobs),
            fill: false,
            borderColor: '#5CA9FF',
            tension: 0.1
          },
          {
            label: 'Near to close',
            data: chartData[0].map((item: any) => item.NearToClose),
            fill: false,
            borderColor: '#FB896B',
            tension: 0.1
          }
        ]
      };

      this.toaConfig.data = data as unknown as LineChartData;
      console.log('TOA config data ', this.toaConfig);

      this.refreshChart(2);
    });
  }

  // Get Jobs Flow ThroughPut Ratio
  getJFTStatusFromService(duration = this.durations[0].index) {
    let body = {
      pid: 28,
      intervalId: duration
    };
    this.chartDataService.getJFTStatus(body).subscribe((res: any) => {
      console.log('JFT chart data - ', res);
      const chartData = res;

      const backgroundColors = ["#FFA600", "#FF562F", "#37CB89", "#2FC1FF"];
      const backgrounds = chartData[0].map((item: any, index: number) => {
        return backgroundColors[Math.floor(Math.random() * backgroundColors.length)];
      });
      

      const data = {
        labels: chartData[0].map((item: any) => item.Month),
        datasets: [
          {
            label: "Received Jobs",
            data: chartData[0].map((item: any) => item.ReceivedCount),
            backgroundColor: '#2FC1FF', // Adjust the color as needed
            borderRadius: 100,
            borderColor: '#2FC1FF', // Adjust the color as needed
            borderWidth: 1
          },
          {
            label: "Completed Jobs",
            data: chartData[0].map((item: any) => item.CompletedCount),
            borderRadius: 100,
            backgroundColor: '#37CB89', // Adjust the color as needed
            borderColor: '#37CB89', // Adjust the color as needed
            borderWidth: 1
          },
          {
            label: "Percentage",
            data: chartData[0].map((item: any) => item.ThroughPut),
            borderRadius: 100,
            backgroundColor: '#FFA600', // Adjust the color as needed
            borderColor: '#FFA600', // Adjust the color as needed
            borderWidth: 1
          }
        ]
      };

      this.jftConfig.data = data as BarChartData;
      console.log('JFT config data ', this.jftConfig);

      this.refreshChart(3);
    });
  }

  getJobStatus() {
    this.chartDataService.getJobStatus(this.filters).subscribe((res: any) => {
      this.jobStatus = res;
      console.log('JOB STATUS - ', res);
    });
  }

  handleFilterTab(event: any) {
    this.filterTabs.selectedTab = event;
    this.workflowFilter.filterType = event.index;
    
    if(event.index == 2) {
      let sdate = new Date(new Date().getFullYear(), 0, 1);
      let edate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

      this.sDateText = `${sdate.getFullYear()}-${sdate.getMonth()}-${sdate.getDate()}`;
      this.eDateText = `${sdate.getFullYear()}-${sdate.getMonth()}-${edate.getDate()}`;

      this.filters.startDate = sdate;
      this.filters.endDate = edate;
  
      console.log('TAB INDEX ', sdate);
    } else if (event.index == 3) {
      let sdate = new Date(new Date().getFullYear(), 6, 1);
      let edate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());


      this.sDateText = `${sdate.getFullYear()}-${sdate.getMonth()}-${sdate.getDate()}`;
      this.eDateText = `${sdate.getFullYear()}-${sdate.getMonth()}-${edate.getDate()}`;

      this.filters.startDate = sdate;
      this.filters.endDate = edate;

      console.log('TAB INDEX ', sdate);
    }

    console.log('filter tab ', event); 
  }

  handleMonthChange(event: any) {
    const currentDate = new Date();
    const firstDay: Date = new Date(currentDate.getFullYear(), event.index - 1, 1);
    const lastDay: Date = new Date(currentDate.getFullYear(), event.index, 0);

    this.filters.startDate = firstDay;
    this.filters.endDate = lastDay;

    console.log('last date ', this.filters.startDate, this.filters.endDate);
    
  }

  convertToNgbDate(dt: Date) {
    return new NgbDate(dt.getFullYear(), dt.getMonth(), dt.getDate())
  }

  handleDateChange() {
    // this.filters[type] = new Date(event.timeStamp);
    this.setLocalStorageFilters();
  }

  setLocalStorageFilters() {
    localStorage.setItem('chartfilters', JSON.stringify(this.filters));
  }

  filterBarChart() {
    this.hideIndex.next(1);
  }

  refreshChart(type: number) {
    if(type == 1) {
      this.revalidate.next(!this.revalidate.value);
      this.wfRefresh.next(!this.wfRefresh.value);
    }
    else if(type == 2) {
      this.revalidate.next(!this.revalidate.value);
      this.toaRefresh.next(!this.toaRefresh.value);
    }
    else if(type == 3) {
      this.revalidate.next(!this.revalidate.value);
      this.jftRefresh.next(!this.jftRefresh.value);
    }
  }

  captureChartAsImage(id: string) {
    const chartElement = document.getElementById(id); // Replace 'your-chart-id' with the actual ID of your chart element
  
    html2canvas(chartElement!).then((canvas) => {
      // Convert canvas to data URL
      const chartImage = canvas.toDataURL('image/png');
  
      // Create a download link
      const a = document.createElement('a');
      a.href = chartImage;
      a.download = 'chart.png'; // Set the desired file name
  
      // Trigger a click event to initiate the download
      a.click();
    });
  }

  parseInt(value: string) {
    return parseInt(value);
  }

  parseDate(event: Event, type: "start" | "end", value: string) {
    const newDate = new Date(value);
    if(type == "start") this.filters.startDate = newDate;
    else if(type == "end") this.filters.endDate = newDate;
    this.setLocalStorageFilters();

    return new Date(value);
  }

  checkDates() {
    console.log('inside check dates');
    console.log('start date ', this.filters.startDate);
    console.log('end date ', this.filters.endDate);

    if(this.filters.startDate > this.filters.endDate)  {
      console.log('inside check dates if condition ');
      this.showDateError = true;
    } else this.showDateError = false;
  }

  getUser() {
    this.chartDataService.getUser().subscribe((res: any) => {
      console.log('res from API ', res);
      
    });
  }


}
