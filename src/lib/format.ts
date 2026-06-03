/** Helpers de formatage — source unique (évite la duplication d'Intl). */

const DATE_FR = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' });

/** Date longue en français : « 3 juin 2026 ». */
export function formatDate(date: Date): string {
  return DATE_FR.format(date);
}
