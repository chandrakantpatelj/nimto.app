'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { formatDateTime } from '@/lib/helpers';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '../components/user-context';

export default function UserActivityLogsPage() {
  const { user, isLoading: userLoading } = useUser();
  const [activityLogs, setActivityLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const Loading = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-4 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Fetch activity logs when user is loaded
  useEffect(() => {
    const fetchActivityLogs = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await apiFetch(
          `/api/user-management/users/${user.id}/logs`,
        );

        if (!response.ok) {
          throw new Error('Failed to fetch activity logs');
        }

        const logs = await response.json();
        setActivityLogs(logs);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching activity logs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivityLogs();
  }, [user?.id]);

  const Content = () => {
    const getActivityTypeVariant = (type) => {
      switch (type) {
        case 'create':
          return 'default';
        case 'verify':
          return 'success';
        case 'login':
          return 'info';
        case 'update':
          return 'warning';
        default:
          return 'secondary';
      }
    };

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Activity Logs</CardTitle>
          </CardHeader>
          <CardContent>
            {activityLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No activity logs found for this user.
              </div>
            ) : (
              <div className="space-y-4">
                {activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start space-x-4 p-4 border rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-foreground">
                          {log.action}
                        </h4>
                        <Badge variant={getActivityTypeVariant(log.type)}>
                          {log.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {log.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDateTime(new Date(log.timestamp))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return isLoading || !user ? <Loading /> : <Content />;
}
