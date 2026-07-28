import { useQuery } from '@tanstack/react-query';
import { eventsRepository } from '../repository/eventsRepository';

export function useEvents() {
  return useQuery({
    queryKey: ['events', 'list'],
    queryFn: () => eventsRepository.listEvents(),
  });
}
