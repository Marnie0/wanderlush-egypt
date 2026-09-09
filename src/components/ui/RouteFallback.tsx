import { Container } from "./Layout";

/**
 * Shown while a split route chunk loads. It mirrors the shape of a page
 * header so the layout does not jump when the real content arrives.
 */
export function RouteFallback() {
  return (
    <Container className="pt-16 pb-24 lg:pt-24">
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
