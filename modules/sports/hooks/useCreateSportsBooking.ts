import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sportsRepository } from '../repository/sportsRepository';

export function useCreateSportsBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { coachId: string; userId: string; startTime: string; endTime: string }) =>
      sportsRepository.createBooking(input),
    onSuccess: (_booking, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['sports', 'bookings', variables.userId] });
    },
  });
}
