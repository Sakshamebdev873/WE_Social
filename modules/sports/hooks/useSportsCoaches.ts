import { useQuery } from '@tanstack/react-query';
import { sportsRepository } from '../repository/sportsRepository';

export function useSportsCoaches() {
  return useQuery({
    queryKey: ['sports', 'coaches'],
    queryFn: () => sportsRepository.listCoaches(),
  });
}
