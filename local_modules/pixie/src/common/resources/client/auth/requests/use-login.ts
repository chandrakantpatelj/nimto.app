import {useMutation} from '@tanstack/react-query';
import {UseFormReturn} from 'react-hook-form';
import {BackendResponse} from '../../http/backend-response/backend-response';
import {onFormQueryError} from '../../errors/on-form-query-error';
import {useNavigate} from '../../ui/navigation/use-navigate';
import {apiClient} from '../../http/query-client';
import {useAuth} from '../use-auth';
import {useCallback} from 'react';
import {setBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';

interface LoginResponse extends BackendResponse {
  bootstrapData: string;
  two_factor: false;
}
interface TwoFactorResponse {
  two_factor: true;
}

type Response = LoginResponse | TwoFactorResponse;

export interface LoginPayload {
  email: string;
  password: string;
  remember: boolean;
  token_name: string;
}

export function useLogin(form: UseFormReturn<LoginPayload>) {
  const handleSuccess = useHandleLoginSuccess();
  return useMutation({
    mutationFn: login,
    onSuccess: response => {
      if (!response.two_factor) {
        handleSuccess(response);
      }
    },
    onError: r => onFormQueryError(r, form),
  });
}

export function useHandleLoginSuccess() {
  const navigate = useNavigate();
  const {getRedirectUri} = useAuth();

  return useCallback(
    (response: LoginResponse) => {
      setBootstrapData(response.bootstrapData);
      navigate(getRedirectUri(), {replace: true});
    },
    [navigate, getRedirectUri],
  );
}

function login(payload: LoginPayload): Promise<Response> {
  return apiClient.post('auth/login', payload).then(response => response.data);
}
