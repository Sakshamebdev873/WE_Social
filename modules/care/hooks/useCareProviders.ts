import { useQuery } from '@tanstack/react-query';
import { careRepository } from '../repository/careRepository';

export function useCareProviders() {
  return useQuery({
    queryKey: ['care', 'providers'],
    queryFn: () => careRepository.listProviders(),
  });
}

export function useCareProvider(providerId: string | undefined) {
  return useQuery({
    queryKey: ['care', 'provider', providerId],
    queryFn: () => careRepository.getProvider(providerId as string),
    enabled: Boolean(providerId),
  });
}
