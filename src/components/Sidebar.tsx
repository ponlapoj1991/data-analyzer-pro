import { BarChart3, Home, Users, TrendingUp, Settings, MessageSquare, Globe, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  { icon: Home, label: 'Overview', active: true },
  { icon: BarChart3, label: 'Results', active: false },
  { icon: TrendingUp, label: 'Performance', active: false },
  { icon: Users, label: 'Influencers', active: false },
  { icon: MessageSquare, label: 'Sentiment', active: false },
  { icon: Globe, label: 'Themes', active: false },
  { icon: Eye, label: 'Demographics', active: false },
  { icon: Globe, label: 'World Map', active: false },
  { icon: Eye, label: 'Visual Insights', active: false },
];

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-dashboard-sidebar border-r border-border">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-hover rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Real Studio</h1>
            <p className="text-sm text-muted-foreground">Social Listening</p>
          </div>
        </div>
      </div>
      
      <nav className="px-4 pb-4">
        <ul className="space-y-1">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <li key={index}>
                <a
                  href="#"
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    item.active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};