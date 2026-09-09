import { m } from "framer-motion";
import { Container, Eyebrow, Rule } from "./Layout";
import { riseIn, stagger } from "@/lib/motion";

/** The standard opening block for every non-cinematic route. */
export function PageHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
}) {
  return (
    <Container className="pt-16 pb-12 lg:pt-24 lg:pb-16">
      <m.div initial="hidden" animate="visible" variants={stagger()} className="max-w-3xl">
        {eyebrow && (
          <m.div variants={riseIn}>
            <Eyebrow>{eyebrow}</Eyebrow>
          </m.div>
        )}
        <m.h1 variants={riseIn} className="mt-4 text-display text-charcoal-900">
          {title}
        </m.h1>
        <m.div variants={riseIn} className="mt-6">
          <Rule />
        </m.div>
        {intro && (
          <m.p variants={riseIn} className="mt-6 text-lead text-charcoal-600">
            {intro}
          </m.p>
        )}
      </m.div>
    </Container>
  );
}
