import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { BarChart3, LineChart, PieChart as PieChartIcon, AreaChart, Activity, TrendingUp } from 'lucide-react'
import { useDataStore } from '@/hooks/useDataStore'
import { BarChart, Bar, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Pie, Cell, AreaChart as RechartsAreaChart, Area, ScatterChart, Scatter as RechartsScatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter'
  title: string
  xAxis: string
  yAxis: string
  groupBy?: string
  aggregation: 'count' | 'sum' | 'avg' | 'min' | 'max'
}

const CHART_TYPES = [
  { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { value: 'line', label: 'Line Chart', icon: LineChart },
  { value: 'pie', label: 'Pie Chart', icon: PieChartIcon },
  { value: 'area', label: 'Area Chart', icon: AreaChart },
  { value: 'scatter', label: 'Scatter Plot', icon: Activity }
]

const CHART_COLORS = [
  'hsl(217 91% 60%)',
  'hsl(142 76% 36%)', 
  'hsl(45 93% 47%)',
  'hsl(0 84% 60%)',
  'hsl(271 76% 53%)',
  'hsl(24 70% 50%)'
]

export const ChartBuilder = () => {
  const { getFilteredPosts, columns } = useDataStore()
  const [config, setConfig] = useState<ChartConfig>({
    type: 'bar',
    title: 'Custom Chart',
    xAxis: 'platform',
    yAxis: 'engagement',
    aggregation: 'sum'
  })
  const [chartData, setChartData] = useState<any[]>([])

  const posts = getFilteredPosts()

  const generateChartData = () => {
    if (!posts.length) return []

    let data: any[] = []

    if (config.type === 'pie') {
      // For pie charts, group by the selected field and count
      const grouped = posts.reduce((acc, post) => {
        const key = (post as any)[config.xAxis] || 'Unknown'
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      data = Object.entries(grouped).map(([name, value], index) => ({
        name,
        value,
        color: CHART_COLORS[index % CHART_COLORS.length]
      }))
    } else {
      // For other charts, group by xAxis and aggregate yAxis
      const grouped = posts.reduce((acc, post) => {
        const xValue = (post as any)[config.xAxis] || 'Unknown'
        const yValue = (post as any)[config.yAxis] || 0
        
        if (!acc[xValue]) {
          acc[xValue] = { values: [], count: 0 }
        }
        
        acc[xValue].values.push(Number(yValue) || 0)
        acc[xValue].count++
        
        return acc
      }, {} as Record<string, { values: number[], count: number }>)

      data = Object.entries(grouped).map(([key, { values, count }]) => {
        let aggregatedValue = 0
        
        switch (config.aggregation) {
          case 'sum':
            aggregatedValue = values.reduce((sum, val) => sum + val, 0)
            break
          case 'avg':
            aggregatedValue = values.reduce((sum, val) => sum + val, 0) / values.length
            break
          case 'min':
            aggregatedValue = Math.min(...values)
            break
          case 'max':
            aggregatedValue = Math.max(...values)
            break
          case 'count':
            aggregatedValue = count
            break
        }
        
        return {
          [config.xAxis]: key,
          [config.yAxis]: Math.round(Number(aggregatedValue) || 0)
        }
      }).sort((a, b) => (b as any)[config.yAxis] - (a as any)[config.yAxis])
    }

    setChartData(data)
    return data
  }

  const renderChart = () => {
    const data = chartData.length > 0 ? chartData : generateChartData()
    
    if (!data.length) {
      return (
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          No data available for the selected configuration
        </div>
      )
    }

    const commonProps = {
      width: '100%',
      height: 300
    }

    switch (config.type) {
      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={config.xAxis} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={config.yAxis} fill={CHART_COLORS[0]} />
            </BarChart>
          </ResponsiveContainer>
        )
      
      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <RechartsLineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={config.xAxis} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={config.yAxis} stroke={CHART_COLORS[0]} strokeWidth={2} />
            </RechartsLineChart>
          </ResponsiveContainer>
        )
      
      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <RechartsAreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={config.xAxis} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey={config.yAxis} stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.6} />
            </RechartsAreaChart>
          </ResponsiveContainer>
        )
      
      case 'pie':
        return (
          <ResponsiveContainer {...commonProps}>
            <RechartsPieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        )
      
      case 'scatter':
        return (
          <ResponsiveContainer {...commonProps}>
            <ScatterChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={config.xAxis} />
              <YAxis dataKey={config.yAxis} />
              <Tooltip />
              <Legend />
              <RechartsScatter dataKey={config.yAxis} fill={CHART_COLORS[0]} />
            </ScatterChart>
          </ResponsiveContainer>
        )
      
      default:
        return null
    }
  }

  const availableColumns = [
    { value: 'platform', label: 'Platform' },
    { value: 'sentiment', label: 'Sentiment' },
    { value: 'author', label: 'Author' },
    { value: 'language', label: 'Language' },
    { value: 'location', label: 'Location' },
    { value: 'media_type', label: 'Media Type' },
    { value: 'engagement', label: 'Engagement' },
    { value: 'reach', label: 'Reach' },
    { value: 'created_at', label: 'Date' }
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Chart Builder
        </CardTitle>
        <CardDescription>
          Create custom charts and visualizations from your data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="config" className="space-y-6">
            {/* Chart Type Selection */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Chart Type</Label>
              <div className="grid grid-cols-5 gap-2">
                {CHART_TYPES.map((type) => {
                  const Icon = type.icon
                  return (
                    <Button
                      key={type.value}
                      variant={config.type === type.value ? "default" : "outline"}
                      className="h-20 flex flex-col gap-2"
                      onClick={() => setConfig({ ...config, type: type.value as any })}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-xs">{type.label}</span>
                    </Button>
                  )
                })}
              </div>
            </div>

            <Separator />

            {/* Chart Configuration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Chart Title</Label>
                <Input
                  id="title"
                  value={config.title}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  placeholder="Enter chart title"
                />
              </div>
              <div>
                <Label htmlFor="aggregation">Aggregation</Label>
                <Select 
                  value={config.aggregation} 
                  onValueChange={(value) => setConfig({ ...config, aggregation: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="count">Count</SelectItem>
                    <SelectItem value="sum">Sum</SelectItem>
                    <SelectItem value="avg">Average</SelectItem>
                    <SelectItem value="min">Minimum</SelectItem>
                    <SelectItem value="max">Maximum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="xaxis">X-Axis {config.type === 'pie' ? '(Category)' : ''}</Label>
                <Select 
                  value={config.xAxis} 
                  onValueChange={(value) => setConfig({ ...config, xAxis: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableColumns.map((col) => (
                      <SelectItem key={col.value} value={col.value}>
                        {col.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {config.type !== 'pie' && (
                <div>
                  <Label htmlFor="yaxis">Y-Axis (Value)</Label>
                  <Select 
                    value={config.yAxis} 
                    onValueChange={(value) => setConfig({ ...config, yAxis: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableColumns.filter(col => ['engagement', 'reach', 'created_at'].includes(col.value)).map((col) => (
                        <SelectItem key={col.value} value={col.value}>
                          {col.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Data Info */}
            <div className="flex gap-2">
              <Badge variant="outline">
                {posts.length} data points
              </Badge>
              <Badge variant="outline">
                {availableColumns.length} available columns
              </Badge>
            </div>

            <Button onClick={generateChartData} className="w-full">
              Generate Chart
            </Button>
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">{config.title}</h3>
              {renderChart()}
            </div>
            
            {chartData.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Generated {chartData.length} data points using {config.aggregation} aggregation
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}