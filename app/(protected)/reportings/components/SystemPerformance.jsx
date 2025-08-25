import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { KeenIcon } from '@/components/keenicons/keenicons';

function SystemPerformance() {
  // Mock data - in a real app, this would come from an API
  const performanceStats = {
    apiUptime: '99.93%',
    avgResponseTime: '112ms',
    errorRate: '0.08%',
  };

  const StatCard = ({
    title,
    value,
    description,
    icon,
    iconColor,
    graphLabel,
    graphColor,
  }) => (
    <Card className="bg-white border border-gray-200 shadow-sm">
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
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-xs text-gray-500 mb-3">{description}</p>
            <div className="flex items-center space-x-1">
              <div
                className={`w-16 h-1 ${graphColor} rounded-full overflow-hidden`}
              >
                <div className="w-4/5 h-full bg-current rounded-full opacity-80"></div>
              </div>
              <span className="text-xs text-gray-500">{graphLabel}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          System Performance Overview
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Technical performance metrics and monitoring
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="API Uptime"
          value={performanceStats.apiUptime}
          description="Last 90 days. Sourced from hosting provider monitoring."
          icon="chart-line"
          iconColor="bg-green-100 text-green-600"
          graphLabel="Uptime %"
          graphColor="bg-green-200"
        />

        <StatCard
          title="Avg. API Response Time"
          value={performanceStats.avgResponseTime}
          description="Last 90 days. Sourced from hosting provider monitoring."
          icon="chart-line"
          iconColor="bg-purple-100 text-purple-600"
          graphLabel="Response (ms)"
          graphColor="bg-purple-200"
        />

        <StatCard
          title="API Error Rate"
          value={performanceStats.errorRate}
          description="Last 24 hours. From application logs or APM."
          icon="chart-line"
          iconColor="bg-orange-100 text-orange-600"
          graphLabel="Error Rate %"
          graphColor="bg-orange-200"
        />
      </div>
    </div>
  );
}

export default SystemPerformance;
