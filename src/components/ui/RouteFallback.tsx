import { Container } from "./Layout";

/**
 * Shown while a split route chunk loads. It mirrors the shape of a page
 * header, and it is at least a viewport tall: a short placeholder let the
 * footer paint near the top and then leap down when the real page arrived,
 * which registered as the largest layout shift on the site.
 */
export function RouteFallback() {
  return (
    <Container className="min-h-[calc(100svh-5rem)] pt-16 pb-24 lg:pt-24">
      <div className="max-w-3xl animate-pulse space-y-6" aria-hidden>
        <div className="h-3 w-24 bg-sand-200" />
        <div className="h-12 w-3/4 bg-sand-200" />
        <div className="h-px w-24 bg-sand-300" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-sand-100" />
          <div className="h-4 w-5/6 bg-sand-100" />
        </div>
      </div>
    </Container>
  );
}
