import React from 'react';
import { KeenIcon } from '@/components/keenicons/keenicons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function UserStatics() {
  // Mock data - in a real app, this would come from an API
  const userStats = {
    totalUsers: 9,
    newSignups: 9,
    activeUsers: 9,
    roleDistribution: {
      'Application Admin': 1,
      'Attendee': 5,
      'Host': 2,
      'Super Admin': 1
    }
  };

  const StatCard = ({ title, value, description, icon, iconColor, trend }) => (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColor}`}>
                <KeenIcon icon={icon} className="text-lg" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-xs text-gray-500">{description}</p>
            {trend && (
              <div className="mt-2">
                <div className="flex items-center space-x-1">
                  <div className="w-16 h-1 bg-orange-200 rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-orange-500 rounded-full"></div>
                  </div>
                  <span className="text-xs text-gray-500">Guests Trend</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const RoleDistributionCard = ({ roles }) => (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-100">
            <KeenIcon icon="users" className="text-purple-600 text-lg" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Role Distribution</h3>
          </div>
        </div>
        <div className="space-y-3">
          {Object.entries(roles).map(([role, count]) => (
            <div key={role} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{role}</span>
              <span className="text-sm font-semibold text-gray-900">{count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">User Statistics</h2>
        <p className="text-sm text-gray-600 mb-4">Overview of user data and activity</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={userStats.totalUsers}
          description="All registered users"
          icon="users"
          iconColor="bg-purple-100 text-purple-600"
        />
        
        <StatCard
          title="New Sign-ups (30d)"
          value={userStats.newSignups}
          description="Users registered in the last 30 days"
          icon="users"
          iconColor="bg-green-100 text-green-600"
        />
        
        <StatCard
          title="Active Users (30d)"
          value={userStats.activeUsers}
          description="Users active in the last 30 days"
          icon="users"
          iconColor="bg-yellow-100 text-yellow-600"
        />
        
        <StatCard
          title="Avg. Guests per Event"
          value="1"
          description="Average number of guests per event"
          icon="users"
          iconColor="bg-orange-100 text-orange-600"
          trend={true}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RoleDistributionCard roles={userStats.roleDistribution} />
        
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100">
                <KeenIcon icon="chart-simple" className="text-blue-600 text-lg" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Popular Event Categories</h3>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Birthday</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-blue-200 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-blue-500 rounded-full"></div>
                  </div>
                  <span className="text-xs text-gray-500">3 events (42.9%)</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Community</span>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-2 bg-blue-200 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-blue-500 rounded-full"></div>
                  </div>
                  <span className="text-xs text-gray-500">1 events (14.3%)</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Conference</span>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-2 bg-blue-200 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-blue-500 rounded-full"></div>
                  </div>
                  <span className="text-xs text-gray-500">1 events (14.3%)</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Charity Gala</span>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-2 bg-blue-200 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-blue-500 rounded-full"></div>
                  </div>
                  <span className="text-xs text-gray-500">1 events (14.3%)</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Workshop</span>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-2 bg-blue-200 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-blue-500 rounded-full"></div>
                  </div>
                  <span className="text-xs text-gray-500">1 events (14.3%)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default UserStatics;
