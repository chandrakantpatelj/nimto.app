import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/providers/toast-provider';

// Custom hook to use roles for selection
export const useRoleSelectQuery = () => {
  const { toastError } = useToast();
  
  // Fetch roles for selection
  const fetchRoleList = async () => {
    const response = await apiFetch('/api/user-management/roles/select');

    if (!response.ok) {
      toastError(
        'Something went wrong while loading the records. Please try again.',
        {
          position: 'bottom-right',
        },
      );
    }

    return response.json();
  };

  return useQuery({
    queryKey: ['user-role-select'],
    queryFn: fetchRoleList,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60, // 60 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });
};
