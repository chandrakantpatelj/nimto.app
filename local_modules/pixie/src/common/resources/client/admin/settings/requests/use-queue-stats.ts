import {useQuery} from '@tanstack/react-query';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {apiClient} from '@common/http/query-client';

interface Response extends BackendResponse {
  failedJobs: number;
  jobsPerMinute: number;
  pausedMasters: number;
  periods: {
    failedJobs: number;
    recentJobs: number;
  };
  processes: number;
  queueWithMaxRuntime?: string;
  queueWithMaxThroughput?: string;
  recentJobs: number;
  status: 'running' | 'inactive' | 'paused';
}

export function useQueueStats() {
  return useQuery({
    queryKey: ['queue-stats'],
    queryFn: () => fetchStats(),
    refetchInterval: 5000, // Poll every 5s
  });
}

function fetchStats() {
  return apiClient
    .get<Response>('horizon/api/stats')
    .then(response => response.data);
}
