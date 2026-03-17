import { motion } from 'framer-motion';

const defaultViewport = { once: true, amount: 0.2 };

export default function ScrollReveal({
  children,
  className,
  delay = 0,
  duration = 0.5,
  as: Component = motion.div,
}) {
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={defaultViewport}
      transition={{ duration, delay, ease: 'easeOut' }}
    >
      {children}
    </Component>
  );
}
