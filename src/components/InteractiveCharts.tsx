'use client'

import { useState } from 'react'
import { Line, Bar, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Download } from 'lucide-react'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface ChartDataType<T extends 'line' | 'bar' | 'pie'> {
  type: T;
  title: string;
  data: ChartData<T>;
}

interface InteractiveChartsProps {
  marketSizeData: ChartDataType<'line'>;
  consumerBehaviorData: ChartDataType<'bar'>;
  geographicData: ChartDataType<'pie'>;
  onExport: (format: 'pdf' | 'ppt' | 'excel') => void;
}

export function InteractiveCharts({
  marketSizeData,
  consumerBehaviorData,
  geographicData,
  onExport
}: InteractiveChartsProps) {
  const [activeChart, setActiveChart] = useState<'market' | 'consumer' | 'geographic'>('market')

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Market Size Trends',
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }

  const barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Consumer Behavior Patterns',
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }

  const pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Geographic Distribution',
      },
    }
  }

  const renderChart = () => {
    switch (activeChart) {
      case 'market':
        return <Line data={marketSizeData.data} options={lineChartOptions} height={300} />
      case 'consumer':
        return <Bar data={consumerBehaviorData.data} options={barChartOptions} height={300} />
      case 'geographic':
        return <Pie data={geographicData.data} options={pieChartOptions} height={300} />
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={activeChart === 'market' ? 'default' : 'outline'}
            onClick={() => setActiveChart('market')}
            className="text-sm"
          >
            Market Size
          </Button>
          <Button
            variant={activeChart === 'consumer' ? 'default' : 'outline'}
            onClick={() => setActiveChart('consumer')}
            className="text-sm"
          >
            Consumer Behavior
          </Button>
          <Button
            variant={activeChart === 'geographic' ? 'default' : 'outline'}
            onClick={() => setActiveChart('geographic')}
            className="text-sm"
          >
            Geographic
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport('pdf')}
            className="text-xs"
          >
            <Download className="h-4 w-4 mr-1" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport('ppt')}
            className="text-xs"
          >
            <Download className="h-4 w-4 mr-1" />
            PPT
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport('excel')}
            className="text-xs"
          >
            <Download className="h-4 w-4 mr-1" />
            Excel
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="h-[400px]">
          {renderChart()}
        </div>
      </Card>
    </div>
  )
} 