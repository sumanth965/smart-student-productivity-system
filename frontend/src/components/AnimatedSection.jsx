import { motion } from 'framer-motion';

const DEFAULT_VIEWPORT = { once: true, amount: 0.2 };

export default function AnimatedSection({
  children,
  className,
  delay = 0,
  duration = 0.5,
  as: Component = motion.div,
  ...props
}) {
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={DEFAULT_VIEWPORT}
      transition={{ duration, delay, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </Component>
  );
}
