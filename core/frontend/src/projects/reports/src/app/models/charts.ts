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
    datasets: any;
    borderColor: string;
    fill: boolean;
    tension: number;
  }
  
  export interface BarChartData {
    label: string;
    datasets: any;
    backgroundColor: [] | string;
    borderColor: [] | string;
  }
  
  export class ChartJS {
    static defaultConfig(): ChartJSConfig {
      return {
        width: 400,
        height: 200,
        type: 'bar',
        data: {},
        options: {},
        plugins: [],
      } as ChartJSConfig;
    }
}