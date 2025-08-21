import React from 'react';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { KeenIcon } from '@/components/keenicons/keenicons';

function UserStatics() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Mock data - in a real app, this would come from an API
  const userStats = {
    totalUsers: 9,
    newSignups: 9,
    activeUsers: 9,
    roleDistribution: {
      'Application Admin': 1,
      Attendee: 5,
      Host: 2,
      'Super Admin': 1,
    },
  };

  // Event categories data with percentages
  const eventCategories = [
    { name: 'Birthday', events: 3, percentage: 42.9 },
    { name: 'Community', events: 1, percentage: 14.3 },
    { name: 'Conference', events: 1, percentage: 14.3 },
    { name: 'Charity Gala', events: 1, percentage: 14.3 },
    { name: 'Workshop', events: 1, percentage: 14.3 },
  ];

  const StatCard = ({ title, value, description, icon, iconColor, trend }) => (
    <Card
      className={`transition-all duration-200 ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}
    >
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
            <h3
              className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              {value}
            </h3>
            <p
              className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
            >
              {title}
            </p>
            <p
              className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
            >
              {description}
            </p>
            {trend && (
              <div className="mt-2">
                <div className="flex items-center space-x-1">
                  <Progress
                    value={75}
                    className="w-16 h-1"
                    indicatorClassName={
                      isDark ? 'bg-orange-400' : 'bg-orange-500'
                    }
                  />
                  <span
                    className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    Guests Trend
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const RoleDistributionCard = ({ roles }) => (
    <Card
      className={`transition-all duration-200 ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}
    >
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}
          >
            <KeenIcon
              icon="users"
              className={`text-lg ${isDark ? 'text-purple-400' : 'text-purple-600'}`}
            />
          </div>
          <div>
            <h3
              className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              Role Distribution
            </h3>
          </div>
        </div>
        <div className="space-y-3">
          {Object.entries(roles).map(([role, count]) => (
            <div key={role} className="flex items-center justify-between">
              <span
                className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
              >
                {role}
              </span>
              <span
                className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                {count}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2
          className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          User Statistics
        </h2>
        <p
          className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
        >
          Overview of user data and activity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={userStats.totalUsers}
          description="All registered users"
          icon="users"
          iconColor={
            isDark
              ? 'bg-purple-500/20 text-purple-400'
              : 'bg-purple-100 text-purple-600'
          }
        />

        <StatCard
          title="New Sign-ups (30d)"
          value={userStats.newSignups}
          description="Users registered in the last 30 days"
          icon="users"
          iconColor={
            isDark
              ? 'bg-green-500/20 text-green-400'
              : 'bg-green-100 text-green-600'
          }
        />

        <StatCard
          title="Active Users (30d)"
          value={userStats.activeUsers}
          description="Users active in the last 30 days"
          icon="users"
          iconColor={
            isDark
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-yellow-100 text-yellow-600'
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RoleDistributionCard roles={userStats.roleDistribution} />

        <Card
          className={`transition-all duration-200 ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}
              >
                <KeenIcon
                  icon="chart-simple"
                  className={`text-lg ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                />
              </div>
              <div>
                <h3
                  className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  Popular Event Categories
                </h3>
              </div>
            </div>
            <div className="space-y-3">
              {eventCategories.map((category) => (
                <div
                  key={category.name}
                  className="grid grid-cols-12 gap-4 items-end"
                >
                  <div className=" col-span-12 md:col-span-2">
                    <span
                      className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                    >
                      {category.name}
                    </span>
                  </div>
                  <div className=" col-span-12 md:col-span-10">
                    <div className="flex items-center flex-grow space-x-2">
                      <div className="w-full">
                        <Progress
                          value={category.percentage}
                          className="h-2"
                          indicatorClassName={
                            isDark ? 'bg-blue-400' : 'bg-blue-500'
                          }
                        />
                      </div>
                      <span
                        className={`text-xs flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                      >
                        {category.events} events ({category.percentage}%)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default UserStatics;
