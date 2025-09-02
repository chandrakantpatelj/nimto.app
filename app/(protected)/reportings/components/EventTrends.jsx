import React from 'react';
import { useTheme } from 'next-themes';
import { Card, CardContent } from '@/components/ui/card';
import { KeenIcon } from '@/components/keenicons/keenicons';

function EventTrends() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  // Mock data - in a real app, this would come from an API
  const eventStats = {
    totalEvents: 7,
    upcomingEvents: 1,
    avgGuestsPerEvent: 1,
  };

  const StatCard = ({ title, value, description, icon, iconColor, trend }) => (
    <Card className=" border border-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColor}`}
              >
                <KeenIcon icon={icon} className="text-lg" />
              </div>
            </div>
            <h3 className="text-2xl font-bold  mb-1">{value}</h3>
            <p className="text-sm font-medium text-mono mb-1">{title}</p>
            <p className="text-xs text-secondary-foreground">{description}</p>
            {trend && (
              <div className="mt-2">
                <div className="flex items-center space-x-1">
                  <div className="w-16 h-1 bg-orange-200 rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-orange-500 rounded-full"></div>
                  </div>
                  <span className="text-xs text-grey-600">Guests Trend</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold  mb-2">Event Trends</h2>
        <p className="text-sm text-mono mb-4">
          Event-related statistics and trends
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Events Created"
          value={eventStats.totalEvents}
          description="All events ever created"
          icon="users"
          iconColor={
            isDark
              ? 'bg-green-500/20 text-green-400'
              : 'bg-green-100 text-green-600'
          }
        />
        <StatCard
          title="Upcoming Events"
          value={eventStats.upcomingEvents}
          description="Events scheduled for the future"
          icon="users"
          iconColor={
            isDark
              ? 'bg-purple-500/20 text-purple-400'
              : 'bg-purple-100 text-purple-600'
          }
        />
        <StatCard
          title="Avg. Guests per Event"
          value={eventStats.avgGuestsPerEvent}
          description="Average number of guests per event"
          icon="users"
          iconColor={
            isDark
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-yellow-100 text-yellow-600'
          }
          trend={true}
        />
      </div>
    </div>
  );
}

export default EventTrends;
