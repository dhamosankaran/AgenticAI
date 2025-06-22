'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Download, GripVertical, X } from 'lucide-react'
import { toast } from 'sonner'
import { Line, Bar, Pie } from 'react-chartjs-2'
import { ChartData } from 'chart.js'

type ChartType = 'line' | 'bar' | 'pie'

interface ChartContent {
  type: ChartType;
  data: any; // Using any here since we'll validate the type when rendering
}

interface ReportComponent {
  id: string;
  type: 'chart' | 'table' | 'text';
  title: string;
  content: ChartContent | string;
}

interface ReportTemplate {
  id: string;
  name: string;
  components: ReportComponent[];
}

interface CustomReportBuilderProps {
  availableComponents: ReportComponent[];
  templates: ReportTemplate[];
  onExport: (format: 'pdf' | 'ppt' | 'excel', components: ReportComponent[]) => void;
}

export function CustomReportBuilder({
  availableComponents,
  templates,
  onExport
}: CustomReportBuilderProps) {
  const [selectedComponents, setSelectedComponents] = useState<ReportComponent[]>([])
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null)

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(selectedComponents)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setSelectedComponents(items)
  }

  const addComponent = (component: ReportComponent) => {
    setSelectedComponents([...selectedComponents, { ...component, id: Date.now().toString() }])
  }

  const removeComponent = (id: string) => {
    setSelectedComponents(selectedComponents.filter(c => c.id !== id))
  }

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setSelectedComponents(template.components.map(c => ({ ...c, id: Date.now().toString() })))
      setActiveTemplate(templateId)
      toast.success(`Applied template: ${template.name}`)
    }
  }

  const renderChartPreview = (component: ReportComponent) => {
    if (component.type !== 'chart' || typeof component.content === 'string') {
      return null
    }

    const chartContent = component.content as ChartContent
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: component.title,
        },
      },
      ...(chartContent.type !== 'pie' && {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      })
    }

    switch (chartContent.type) {
      case 'line':
        return <Line data={chartContent.data} options={options} height={200} />
      case 'bar':
        return <Bar data={chartContent.data} options={options} height={200} />
      case 'pie':
        return <Pie data={chartContent.data} options={options} height={200} />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <div className="flex flex-wrap gap-2">
        {templates.map(template => (
          <Button
            key={template.id}
            variant={activeTemplate === template.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => applyTemplate(template.id)}
            className="text-sm"
          >
            {template.name}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Available Components */}
        <Card className="p-4 md:col-span-1">
          <h3 className="font-medium mb-4">Available Components</h3>
          <div className="space-y-2">
            {availableComponents.map(component => (
              <div
                key={component.id}
                className="p-2 border rounded hover:bg-slate-50 cursor-pointer"
                onClick={() => addComponent(component)}
              >
                <p className="font-medium text-sm">{component.title}</p>
                <p className="text-xs text-slate-500 capitalize">{component.type}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Report Preview */}
        <Card className="p-4 md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Report Preview</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport('pdf', selectedComponents)}
                className="text-xs"
              >
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport('ppt', selectedComponents)}
                className="text-xs"
              >
                <Download className="h-4 w-4 mr-1" />
                PPT
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport('excel', selectedComponents)}
                className="text-xs"
              >
                <Download className="h-4 w-4 mr-1" />
                Excel
              </Button>
            </div>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="report-components">
              {(provided: DroppableProvided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2 min-h-[200px]"
                >
                  {selectedComponents.map((component, index) => (
                    <Draggable
                      key={component.id}
                      draggableId={component.id}
                      index={index}
                    >
                      {(provided: DraggableProvided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="p-3 border rounded bg-white shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div
                              {...provided.dragHandleProps}
                              className="flex items-center gap-2"
                            >
                              <GripVertical className="h-4 w-4 text-slate-400" />
                              <p className="font-medium text-sm">{component.title}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeComponent(component.id)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="pl-6">
                            {component.type === 'chart' && (
                              <div className="h-[200px] bg-slate-50 rounded">
                                {renderChartPreview(component)}
                              </div>
                            )}
                            {component.type === 'table' && (
                              <div className="bg-slate-50 rounded p-2">
                                Table Preview
                              </div>
                            )}
                            {component.type === 'text' && (
                              <div className="bg-slate-50 rounded p-2">
                                {typeof component.content === 'string' ? component.content : null}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Card>
      </div>
    </div>
  )
} 