import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MetricCard } from '@/components/MetricCard';
import { TimeSeriesChart } from '@/components/Charts/TimeSeriesChart';
import { PieChart } from '@/components/Charts/PieChart';
import { DataUpload } from '@/components/DataUpload';
import { FilterPanel } from '@/components/FilterPanel';
import { ChartBuilder } from '@/components/ChartBuilder';
import { AIAssistant } from '@/components/AIAssistant';
import { useDataStore } from '@/hooks/useDataStore';
import { Upload, Bot } from 'lucide-react';
import { initializeTables } from '@/lib/supabase';

// Sample data for demo
const countriesData = [
  { name: 'Thailand', value: 40, color: 'hsl(217 91% 60%)' },
  { name: 'Singapore', value: 25, color: 'hsl(217 91% 50%)' },
  { name: 'Malaysia', value: 20, color: 'hsl(217 91% 40%)' },
  { name: 'Others', value: 15, color: 'hsl(217 91% 70%)' },
];

const languagesData = [
  { name: 'Thai', value: 50, color: 'hsl(217 91% 60%)' },
  { name: 'English', value: 30, color: 'hsl(217 91% 50%)' },
  { name: 'Chinese', value: 15, color: 'hsl(217 91% 40%)' },
  { name: 'Others', value: 5, color: 'hsl(217 91% 70%)' },
];

export default function Index() {
  const [activeView, setActiveView] = useState('dashboard');
  const { getMetrics, posts } = useDataStore();
  const metrics = getMetrics();

  useEffect(() => {
    //initializeTables().catch(console.error);
  }, []);

  const renderContent = () => {
    switch(activeView) {
      case 'data-import':
        return <DataUpload />;
      case 'filters':
        return <FilterPanel />;
      case 'chart-builder':
        return <ChartBuilder />;
      case 'ai-assistant':
        return <AIAssistant />;
      default:
        return (
          <div className="space-y-6">
            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Posts"
                value={metrics.total.toString()}
                change="92.3%"
                changeType="positive"
                subtitle="Filtered results"
              />
              <MetricCard
                title="Unique Authors"
                value={metrics.uniqueAuthors.toString()}
                change="320%"
                changeType="positive"
                subtitle="Content creators"
              />
              <MetricCard
                title="Total Engagement"
                value={metrics.totalEngagement.toLocaleString()}
                change="96.8%"
                changeType="positive"
                subtitle="Likes, shares, comments"
              />
              <MetricCard
                title="Total Reach"
                value={`${Math.round(metrics.totalReach / 1000)}K`}
                change="160.7%"
                changeType="positive"
                subtitle="Potential impressions"
              />
            </div>

            {posts.length > 0 && <TimeSeriesChart />}

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <PieChart 
                title="Share of Sentiment" 
                data={Object.entries(metrics.sentimentBreakdown).map(([name, value], index) => ({
                  name: name.charAt(0).toUpperCase() + name.slice(1),
                  value: value as number,
                  color: name === 'positive' ? 'hsl(var(--success))' : 
                         name === 'negative' ? 'hsl(var(--destructive))' : 
                         'hsl(var(--muted-foreground))'
                }))} 
              />
              <PieChart title="Share of Countries" data={countriesData} />
              <PieChart title="Share of Languages" data={languagesData} />
              <PieChart 
                title="Share of Platforms" 
                data={Object.entries(metrics.platformBreakdown).map(([name, value], index) => ({
                  name,
                  value: value as number,
                  color: `hsl(${200 + index * 30} 70% 50%)`
                }))} 
              />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl p-6 border">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setActiveView('data-import')}
                    className="p-4 border rounded-lg hover:bg-accent text-left"
                  >
                    <Upload className="h-6 w-6 mb-2 text-primary" />
                    <div className="font-medium">Import Data</div>
                    <div className="text-sm text-muted-foreground">Upload files or connect sheets</div>
                  </button>
                  <button 
                    onClick={() => setActiveView('ai-assistant')}
                    className="p-4 border rounded-lg hover:bg-accent text-left"
                  >
                    <Bot className="h-6 w-6 mb-2 text-primary" />
                    <div className="font-medium">AI Assistant</div>
                    <div className="text-sm text-muted-foreground">Get insights and analysis</div>
                  </button>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 border">
                <h3 className="text-lg font-semibold mb-4">Data Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Records</span>
                    <span className="font-medium">{posts.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data Sources</span>
                    <span className="font-medium">{Object.keys(metrics.platformBreakdown).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium text-success">
                      {posts.length > 0 ? 'Ready' : 'No Data'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      {renderContent()}
    </DashboardLayout>
  );
}
