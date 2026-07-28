/**
 * The ONLY contract Sports/Events are allowed to use to talk to Care, and vice
 * versa. Modules must never import each other's repository/store/types
 * directly — they pass through this typed DTO + deep link instead. This is
 * what keeps "cross-module coordination" from turning into "cross-module
 * coupling".
 */

export type ContextModule = 'sports' | 'events';

export interface CareSuggestion {
  contextModule: ContextModule;
  contextBookingId: string;
  /** ISO 8601 */
  startTime: string;
  /** ISO 8601 */
  endTime: string;
}

const CARE_SUGGESTION_PATH = '/(care)';

export function buildCareSuggestionHref(suggestion: CareSuggestion): string {
  const params = new URLSearchParams({
    contextModule: suggestion.contextModule,
    contextBookingId: suggestion.contextBookingId,
    startTime: suggestion.startTime,
    endTime: suggestion.endTime,
  });
  return `${CARE_SUGGESTION_PATH}?${params.toString()}`;
}

export interface ParsedCareSuggestion extends CareSuggestion {}

/**
 * Care module calls this against its own `useLocalSearchParams()` output —
 * it never reaches into Sports/Events state to get here.
 */
export function parseCareSuggestionParams(
  params: Record<string, string | string[] | undefined>
): ParsedCareSuggestion | null {
  const { contextModule, contextBookingId, startTime, endTime } = params;
  if (
    typeof contextModule !== 'string' ||
    typeof contextBookingId !== 'string' ||
    typeof startTime !== 'string' ||
    typeof endTime !== 'string'
  ) {
    return null;
  }
  if (contextModule !== 'sports' && contextModule !== 'events') return null;

  return { contextModule, contextBookingId, startTime, endTime };
}
