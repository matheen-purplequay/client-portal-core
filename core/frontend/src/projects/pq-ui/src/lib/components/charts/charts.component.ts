import { AfterViewInit, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Chart, ChartData, registerables } from "chart.js";
import { BehaviorSubject } from 'rxjs';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(...registerables);
Chart.register(ChartDataLabels);

export interface ChartJSConfig {
  width: number;
  height: number;
  type: "line" | "bar" | "pie" | "bubble" | "radar" | "doughnut";
  data: LineChartData | BarChartData;
  options: {};
  plugins: [];
}

export interface LineChartData {
  label: string;
  dataset: any[];
  borderColor: string;
  fill: boolean;
  tension: number;
  customLabel: boolean;
  customLabels: string[];
}

export interface BarChartData {
  labels: string | any[];
  datasets: any[];
  backgroundColor: [] | string;
  borderColor: [] | string;
  customLabel: boolean;
  customLabels: string[];
}

export class DefaultChart {
  static defaultBarChart(): BarChartData {
    return {
      labels: '',
      datasets: [],
      backgroundColor: [],
      borderColor: [],
      customLabel: false,
      customLabels: []
    } as BarChartData;
  }

  static defaultLineChart(): LineChartData {
    return {
      label: "",
      dataset: [],
      borderColor: "",
      fill: false,
      tension: 0,
      customLabel: false,
      customLabels: []
    } as LineChartData;
  }
}

export class ChartJS {
  static defaultConfig(type: string): ChartJSConfig {
    return {
      width: 200,
      height: 400,
      type: type,
      data: {},
      options: {},
      plugins: [],
    } as ChartJSConfig;
  }
}

@Component({
  selector: 'pq-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss']
})
export class ChartsComponent implements OnInit, OnChanges, AfterViewInit {

  private chart: Chart | undefined = undefined;
  @Input() chartId = 'chart001';
  @Input() containerClass: string = '';
  @Input() chartClass: string = '';
  @Input() config: ChartJSConfig = ChartJS.defaultConfig('bar');
  @Input() revalidate: BehaviorSubject<boolean> = new BehaviorSubject(false);

  @Input() chartTitle: string = '';
  @Input() refresh: BehaviorSubject<boolean> = new BehaviorSubject(false);
  @Input() hideIndex: BehaviorSubject<number> = new BehaviorSubject(-1);
  
  constructor(private cdRef: ChangeDetectorRef) { }
  
  ngOnInit(): void {
    
  }
  
  ngAfterViewInit(): void {
    this.initializeChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    
    this.cdRef.detectChanges(); 
    if (this.chart) {
      this.chart.destroy();
    }
    this.initializeChart();

    this.hideIndex.subscribe(value => {
      
      this.cdRef.detectChanges(); 
      this.chartToggle(value);
    });

    this.refresh.subscribe(value => {
      this.initializeChart();
    });
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  initializeChart(): void {
    if(this.chartId) {
      const ctx = document.getElementById(this.chartId) as HTMLCanvasElement;
      
      // Destroy the previous chart if it exists
      if (this.chart) {
        this.chart.destroy();
      }
      const cl = this.config.data.customLabel;
      const labels = this.config.data.customLabels;
      
      
      this.chart = new Chart(ctx, {
        type: this.config.type,
        data: {...this.config.data as ChartData},
        // options: this.config.options,
        // plugins: this.config.plugins
        plugins: [ChartDataLabels],
        options: {
          responsive: true,
          maintainAspectRatio: false,
          aspectRatio: 2,
          plugins: {
              datalabels: {
                  color: 'black', // Label text color
                  anchor: 'center', // Label text alignment
                  align: 'top', // Label position relative to the bar
                  clip: false,
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  textStrokeColor: 'rgba(255,255,255,0.2)',
                  textStrokeWidth: 1,
                  borderRadius: 100,
                  formatter: function (value, context) {
                    // Round the data label to 2 decimal places
                    if(cl) {
                      return labels[context.dataIndex];
                    } else {
                      if(value % 1 != 0)
                        return value.toFixed(2);
                      else return value;
                    }
                  },
                  font: {
                    weight: 'normal',
                    size: 12,
                  }
              },
              legend: {
                position: 'right',
                display: false
              }
          },
          scales: {
            x: {
              stacked: true,
              ticks: {
                callback: function(val, index) {
                  
                  const w = this.getLabelForValue(Number(val));
                  const words = (w as string).split(' '); // Split the input string into words
                  const middleIndex = Math.ceil(words.length / 2); // Find the middle index
  
                  // Join the words in the first half
                  const firstHalf = words.slice(0, middleIndex).join(' ');
  
                  // Join the words in the second half
                  const secondHalf = words.slice(middleIndex).join(' ');
  
                  if(words.length > 4) return [firstHalf, secondHalf];
                  else return this.getLabelForValue(Number(val));
                }
              }
            },
              y: {
                  stacked: true
              }
          }
        }
      });
  
      
    }
  }

  chartToggle(index: number) {
    this.chart!.toggleDataVisibility(index);
    this.chart?.update();
  }

}
