/**
 * Convex document IDs are opaque strings with a fixed shape. Values like URL slugs
 * must not be passed to `v.id()` or the server returns ArgumentValidationError.
 * @see https://docs.convex.dev/database/document-ids
 */
const CONVEX_DOCUMENT_ID = /^[a-z0-9]{32}$/

export function isConvexDocumentId(value: string): boolean {
  return CONVEX_DOCUMENT_ID.test(value)
}
