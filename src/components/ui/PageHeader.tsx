import { motion } from "framer-motion";
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
      <motion.div initial="hidden" animate="visible" variants={stagger()} className="max-w-3xl">
        {eyebrow && (
          <motion.div variants={riseIn}>
            <Eyebrow>{eyebrow}</Eyebrow>
          </motion.div>
        )}
        <motion.h1 variants={riseIn} className="mt-4 text-display text-charcoal-900">
          {title}
        </motion.h1>
        <motion.div variants={riseIn} className="mt-6">
          <Rule />
        </motion.div>
        {intro && (
          <motion.p variants={riseIn} className="mt-6 text-lead text-charcoal-600">
            {intro}
          </motion.p>
        )}
      </motion.div>
    </Container>
  );
}
