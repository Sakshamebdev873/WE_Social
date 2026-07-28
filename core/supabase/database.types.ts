/**
 * Hand-authored mirror of the shape `supabase gen types typescript` would produce
 * from supabase/schema.sql. Keep in sync with that file until a live project exists
 * to generate against.
 */

export type ModuleName = 'sports' | 'events' | 'care';

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'QUEUED'
  | 'SYNCING'
  | 'CONFLICT_REJECTED';

export interface ProviderRow {
  id: string;
  module: ModuleName;
  display_name: string;
  exact_lat: number;
  exact_lng: number;
  address_line: string;
  created_at: string;
}

export interface BookingRow {
  id: string;
  local_id: string | null;
  module: ModuleName;
  provider_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  version: number;
  context_booking_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      providers: {
        Row: ProviderRow;
        Insert: Omit<ProviderRow, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<ProviderRow, 'id'>>;
      };
      bookings: {
        Row: BookingRow;
        Insert: Omit<BookingRow, 'id' | 'created_at' | 'updated_at' | 'version'> & {
          id?: string;
          version?: number;
        };
        Update: Partial<Omit<BookingRow, 'id'>>;
      };
    };
  };
}
