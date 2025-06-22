import { ChartData } from 'chart.js'

// Market Size Trends Data
const marketSizeChartData: ChartData<'line'> = {
  labels: ['2019', '2020', '2021', '2022', '2023', '2024 (Projected)'],
  datasets: [
    {
      label: 'Market Size (Billion $)',
      data: [45, 48, 53, 59, 65, 72],
      borderColor: 'rgb(59, 130, 246)', // Blue
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.3,
      fill: true
    },
    {
      label: 'Growth Rate (%)',
      data: [6.5, 6.7, 10.4, 11.3, 10.2, 10.8],
      borderColor: 'rgb(16, 185, 129)', // Green
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.3,
      fill: true
    }
  ]
}

// Consumer Behavior Patterns Data
const consumerBehaviorChartData: ChartData<'bar'> = {
  labels: ['Online Shopping', 'Mobile Purchases', 'In-Store', 'Social Commerce', 'Voice Shopping'],
  datasets: [
    {
      label: 'Adoption Rate (%)',
      data: [78, 65, 45, 35, 15],
      backgroundColor: [
        'rgba(59, 130, 246, 0.7)', // Blue
        'rgba(16, 185, 129, 0.7)', // Green
        'rgba(249, 115, 22, 0.7)', // Orange
        'rgba(139, 92, 246, 0.7)', // Purple
        'rgba(236, 72, 153, 0.7)'  // Pink
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(16, 185, 129)',
        'rgb(249, 115, 22)',
        'rgb(139, 92, 246)',
        'rgb(236, 72, 153)'
      ],
      borderWidth: 1
    }
  ]
}

// Geographic Distribution Data
const geographicChartData: ChartData<'pie'> = {
  labels: ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East & Africa'],
  datasets: [
    {
      data: [35, 28, 22, 10, 5],
      backgroundColor: [
        'rgba(59, 130, 246, 0.7)',  // Blue
        'rgba(16, 185, 129, 0.7)',  // Green
        'rgba(249, 115, 22, 0.7)',  // Orange
        'rgba(139, 92, 246, 0.7)',  // Purple
        'rgba(236, 72, 153, 0.7)'   // Pink
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(16, 185, 129)',
        'rgb(249, 115, 22)',
        'rgb(139, 92, 246)',
        'rgb(236, 72, 153)'
      ],
      borderWidth: 1
    }
  ]
}

export const marketSizeData = {
  type: 'line' as const,
  title: 'Market Size Trends',
  data: marketSizeChartData
}

export const consumerBehaviorData = {
  type: 'bar' as const,
  title: 'Consumer Behavior Patterns',
  data: consumerBehaviorChartData
}

export const geographicData = {
  type: 'pie' as const,
  title: 'Geographic Distribution',
  data: geographicChartData
}

// Sample Report Templates
export const reportTemplates = [
  {
    id: 'market-overview',
    name: 'Market Overview',
    components: [
      {
        id: 'market-size',
        type: 'chart' as const,
        title: 'Market Size Trends',
        content: marketSizeData
      },
      {
        id: 'geographic-dist',
        type: 'chart' as const,
        title: 'Geographic Distribution',
        content: geographicData
      }
    ]
  },
  {
    id: 'consumer-insights',
    name: 'Consumer Insights',
    components: [
      {
        id: 'consumer-behavior',
        type: 'chart' as const,
        title: 'Consumer Behavior Patterns',
        content: consumerBehaviorData
      },
      {
        id: 'market-size-trends',
        type: 'chart' as const,
        title: 'Market Size Trends',
        content: marketSizeData
      }
    ]
  }
]

// Available Components for Custom Reports
export const availableComponents = [
  {
    id: 'market-size-chart',
    type: 'chart' as const,
    title: 'Market Size Trends',
    content: marketSizeData
  },
  {
    id: 'consumer-behavior-chart',
    type: 'chart' as const,
    title: 'Consumer Behavior Patterns',
    content: consumerBehaviorData
  },
  {
    id: 'geographic-dist-chart',
    type: 'chart' as const,
    title: 'Geographic Distribution',
    content: geographicData
  }
] 