export const transitions = {
  page: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  soft: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  quick: { duration: 0.18, ease: [0.22, 1, 0.36, 1] },
};

export const variants = {
  page: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  },
  section: {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  },
  cardHover: {
    rest: { y: 0, scale: 1 },
    hover: { y: -4, scale: 1.01 },
  },
  stagger: {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  },
  staggerChild: {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  },
};
