'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  CalendarDays, 
  Shield, 
  Settings, 
  UserCheck,
  Activity,
  BarChart3,
  Database
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalGuests: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    systemHealth: 'healthy',
    recentActivity: [],
    userRoles: {},
    eventStats: {}
  });
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all users
      const usersResponse = await apiFetch('/api/user-management/users?limit=1000');
      const usersData = await usersResponse.json();
      const users = usersData?.data || [];
      
      // Fetch all events (admin can see all events)
      const eventsResponse = await apiFetch('/api/events?admin=true');
      const eventsData = await eventsResponse.json();
      const events = eventsData?.data || [];
      
      // Fetch all guests
      const guestsResponse = await apiFetch('/api/events/guests');
      const guestsData = await guestsResponse.json();
      
      const guests = guestsData?.data || [];      
      
      // Calculate user statistics
      const totalUsers = users.length;
      const activeUsers = users.filter(user => user.status === 'ACTIVE').length;
      const inactiveUsers = users.filter(user => user.status === 'INACTIVE').length;
            
      // Calculate role distribution
      const userRoles = users.reduce((acc, user) => {
        const roleName = user.role?.name || 'No Role';
        acc[roleName] = (acc[roleName] || 0) + 1;
        return acc;
      }, {});
      
      // Calculate event statistics
      const totalEvents = events.length;
      const totalGuests = guests.length;
      const publishedEvents = events.filter(event => event.status === 'PUBLISHED').length;
      const draftEvents = events.filter(event => event.status === 'DRAFT').length;
      
      // Get recent activity (last 10 events created)
      const recentActivity = events
        .sort((a, b) => {
          try {
            return new Date(b.createdAt) - new Date(a.createdAt);
          } catch (error) {
            return 0;
          }
        })
        .slice(0, 10);
      
      setStats({
        totalUsers,
        totalEvents,
        totalGuests,
        activeUsers,
        inactiveUsers,
        systemHealth: 'healthy', // You can implement actual health checks here
        recentActivity,
        userRoles,
        eventStats: {
          published: publishedEvents,
          draft: draftEvents
        }
      });
    } catch (error) {
      console.error('Error fetching system stats:', error);
      console.error('Error details:', error.message, error.stack);
      // Set some default stats in case of error
      setStats(prev => ({
        ...prev,
        totalUsers: 0,
        totalEvents: 0,
        totalGuests: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        userRoles: {},
        eventStats: { published: 0, draft: 0 },
        recentActivity: []
      }));
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (health) => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('Invalid date format:', dateString);
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-4 sm:p-6 text-white">
        <h1 className="text-xl sm:text-2xl font-bold mb-2">System Overview</h1>
        <p className="text-purple-100 text-sm sm:text-base">Welcome, {session?.user?.name}. Here's your system dashboard</p>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthColor(stats.systemHealth)}`}>
              {stats.systemHealth.charAt(0).toUpperCase() + stats.systemHealth.slice(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} active, {stats.inactiveUsers} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.eventStats.published} published, {stats.eventStats.draft} drafts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGuests}</div>
            <p className="text-xs text-muted-foreground">
              Across all events
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Management Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start" 
              onClick={() => router.push('/user-management/users')}
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => router.push('/user-management/roles')}
            >
              <Shield className="h-4 w-4 mr-2" />
              Manage Roles
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => router.push('/settings')}
            >
              <Settings className="h-4 w-4 mr-2" />
              System Settings
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => router.push('/reportings')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              View Reports
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              User Role Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.userRoles).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">{role}</span>
                  </div>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent System Activity
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/events')}
            >
              View All Events
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentActivity.map((event) => (
                <div key={event.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 gap-3">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="font-medium text-sm sm:text-base">{event.title}</h3>
                      <Badge variant="outline">
                        {event.status}
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                        Created by {event.User?.name || 'Unknown'}
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4" />
                        {formatDate(event.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <UserCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                        {event.guests?.length || 0} guests
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => router.push(`/events/${event.id}`)}
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
