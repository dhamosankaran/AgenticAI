import { ChartData } from 'chart.js'

export interface ChartContent {
  type: 'line' | 'bar' | 'pie';
  data: ChartData;
}

export interface TableContent {
  headers: string[];
  rows: Record<string, string>[];
}

export interface ReportComponent {
  id: string;
  type: 'chart' | 'table' | 'text';
  title: string;
  content: ChartContent | TableContent | string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  components: ReportComponent[];
}

export interface ExportOptions {
  title: string;
  subtitle?: string;
  author?: string;
  date?: string;
  companyLogo?: string;
  theme?: 'light' | 'dark';
} 