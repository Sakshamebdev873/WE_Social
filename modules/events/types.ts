export interface CommunityEvent {
  id: string;
  title: string;
  /** ISO 8601 */
  startTime: string;
  location: string;
  attendeeCount: number;
}
