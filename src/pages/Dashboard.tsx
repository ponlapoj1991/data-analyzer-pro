import { DashboardLayout } from '@/components/DashboardLayout';
import { MetricCard } from '@/components/MetricCard';
import { TimeSeriesChart } from '@/components/Charts/TimeSeriesChart';
import { PieChart } from '@/components/Charts/PieChart';

// Sample data for charts
const sentimentData = [
  { name: 'Positive', value: 45, color: 'hsl(var(--success))' },
  { name: 'Neutral', value: 35, color: 'hsl(var(--muted-foreground))' },
  { name: 'Negative', value: 20, color: 'hsl(var(--destructive))' },
];

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

const mediaTypesData = [
  { name: 'Social Media', value: 40, color: 'hsl(217 91% 60%)' },
  { name: 'News', value: 25, color: 'hsl(142 76% 36%)' },
  { name: 'Blogs', value: 20, color: 'hsl(45 93% 47%)' },
  { name: 'Forums', value: 15, color: 'hsl(0 84% 60%)' },
];

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Results"
            value="25"
            change="92.3%"
            changeType="positive"
            subtitle="Compared to previous 7D"
          />
          <MetricCard
            title="Unique Authors"
            value="21"
            change="320%"
            changeType="positive"
            subtitle="Compared to previous 7D"
          />
          <MetricCard
            title="Engagement"
            value="27"
            change="96.8%"
            changeType="negative"
            subtitle="Compared to previous 7D"
          />
          <MetricCard
            title="Potential Reach"
            value="2.6M"
            change="160.7%"
            changeType="positive"
            subtitle="Compared to previous 7D"
          />
        </div>

        {/* Time Series Chart */}
        <TimeSeriesChart />

        {/* Bottom Row Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <PieChart title="Share of Sentiment" data={sentimentData} />
          <PieChart title="Share of Countries/Regions" data={countriesData} />
          <PieChart title="Share of Languages" data={languagesData} />
          <PieChart title="Share of Media Types" data={mediaTypesData} />
        </div>
      </div>
    </DashboardLayout>
  );
}