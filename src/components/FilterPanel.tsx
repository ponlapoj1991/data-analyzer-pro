import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Filter, X, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useDataStore } from '@/hooks/useDataStore'
import { FilterState } from '@/lib/supabase'

const PLATFORMS = ['Facebook', 'Twitter', 'Instagram', 'YouTube', 'TikTok', 'LinkedIn', 'Website', 'Pantip']
const SENTIMENTS = ['positive', 'negative', 'neutral']
const MEDIA_TYPES = ['text', 'image', 'video', 'link']

export const FilterPanel = () => {
  const {
    filters,
    dateRange,
    selectedPlatforms,
    selectedSentiments,
    addFilter,
    removeFilter,
    clearFilters,
    setDateRange,
    setSelectedPlatforms,
    setSelectedSentiments,
    getMetrics
  } = useDataStore()

  const [newFilter, setNewFilter] = useState<Partial<FilterState>>({
    column: '',
    operator: 'contains',
    value: '',
    condition: 'AND'
  })

  const metrics = getMetrics()

  const handleAddFilter = () => {
    if (newFilter.column && newFilter.value) {
      addFilter(newFilter as FilterState)
      setNewFilter({
        column: '',
        operator: 'contains',
        value: '',
        condition: 'AND'
      })
    }
  }

  const handlePlatformChange = (platform: string, checked: boolean) => {
    if (checked) {
      setSelectedPlatforms([...selectedPlatforms, platform])
    } else {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform))
    }
  }

  const handleSentimentChange = (sentiment: string, checked: boolean) => {
    if (checked) {
      setSelectedSentiments([...selectedSentiments, sentiment])
    } else {
      setSelectedSentiments(selectedSentiments.filter(s => s !== sentiment))
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters & Analytics
        </CardTitle>
        <CardDescription>
          Filter your data and view real-time analytics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Quick Metrics */}
        <div>
          <h3 className="font-semibold mb-3">Current Data Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">{metrics.total}</div>
              <div className="text-xs text-muted-foreground">Total Posts</div>
            </div>
            <div className="text-center p-3 bg-success/5 rounded-lg">
              <div className="text-2xl font-bold text-success">{metrics.uniqueAuthors}</div>
              <div className="text-xs text-muted-foreground">Authors</div>
            </div>
            <div className="text-center p-3 bg-warning/5 rounded-lg">
              <div className="text-2xl font-bold text-warning">{metrics.totalEngagement}</div>
              <div className="text-xs text-muted-foreground">Engagement</div>
            </div>
            <div className="text-center p-3 bg-destructive/5 rounded-lg">
              <div className="text-2xl font-bold text-destructive">{Math.round(metrics.totalReach / 1000)}K</div>
              <div className="text-xs text-muted-foreground">Reach</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Date Range Filter */}
        <div>
          <Label className="text-sm font-medium">Date Range</Label>
          <div className="flex gap-2 mt-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !dateRange.start && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.start ? format(dateRange.start, "PPP") : "Start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateRange.start || undefined}
                  onSelect={(date) => setDateRange({ ...dateRange, start: date || null })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !dateRange.end && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.end ? format(dateRange.end, "PPP") : "End date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateRange.end || undefined}
                  onSelect={(date) => setDateRange({ ...dateRange, end: date || null })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Platform Filter */}
        <div>
          <Label className="text-sm font-medium">Platforms</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {PLATFORMS.map((platform) => (
              <div key={platform} className="flex items-center space-x-2">
                <Checkbox
                  id={platform}
                  checked={selectedPlatforms.includes(platform)}
                  onCheckedChange={(checked) => handlePlatformChange(platform, checked as boolean)}
                />
                <Label htmlFor={platform} className="text-sm">{platform}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment Filter */}
        <div>
          <Label className="text-sm font-medium">Sentiment</Label>
          <div className="flex gap-2 mt-2">
            {SENTIMENTS.map((sentiment) => (
              <div key={sentiment} className="flex items-center space-x-2">
                <Checkbox
                  id={sentiment}
                  checked={selectedSentiments.includes(sentiment)}
                  onCheckedChange={(checked) => handleSentimentChange(sentiment, checked as boolean)}
                />
                <Label htmlFor={sentiment} className="text-sm capitalize">{sentiment}</Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Custom Filters */}
        <div>
          <Label className="text-sm font-medium">Custom Filters</Label>
          
          {/* Add New Filter */}
          <div className="grid grid-cols-4 gap-2 mt-2">
            <Select 
              value={newFilter.column} 
              onValueChange={(value) => setNewFilter({ ...newFilter, column: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Column" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="content">Content</SelectItem>
                <SelectItem value="author">Author</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="reach">Reach</SelectItem>
                <SelectItem value="location">Location</SelectItem>
                <SelectItem value="language">Language</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={newFilter.operator} 
              onValueChange={(value) => setNewFilter({ ...newFilter, operator: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contains">Contains</SelectItem>
                <SelectItem value="equals">Equals</SelectItem>
                <SelectItem value="greater">Greater than</SelectItem>
                <SelectItem value="less">Less than</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              placeholder="Value"
              value={newFilter.value}
              onChange={(e) => setNewFilter({ ...newFilter, value: e.target.value })}
            />
            
            <Button onClick={handleAddFilter} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Active Filters */}
          {filters.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Active Filters:</span>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.map((filter, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {filter.column} {filter.operator} {filter.value}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => removeFilter(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}