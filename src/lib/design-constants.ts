export const designSystem = {
  colors: {
    primary: {
      gradient: 'from-primary/5 to-primary/10',
      gradientHover: 'from-primary/10 to-primary/15',
      border: 'border-primary/10',
    },
    card: {
      background: 'bg-card/50',
      border: 'border-border/50',
      backdropBlur: 'backdrop-blur-sm',
    },
    success: {
      gradient: 'from-green-500/5 to-green-600/10',
      border: 'border-green-500/10',
    },
    warning: {
      gradient: 'from-orange-500/5 to-amber-500/5',
      border: 'border-orange-500/10',
    },
    danger: {
      gradient: 'from-red-500/5 to-rose-500/5',
      border: 'border-destructive/20',
    },
  },
  spacing: {
    sectionGap: 'gap-8',
    cardPadding: 'p-6',
    contentPadding: 'px-4 sm:px-6 lg:px-8',
  },
  animation: {
    pageTransition: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      duration: 0.5,
    },
    cardHover: 'hover:shadow-lg hover:scale-[1.02] transition-all duration-300',
    buttonHover: 'hover:scale-[1.02] transition-all duration-200',
  },
  typography: {
    heading: {
      h1: 'text-3xl md:text-4xl font-bold',
      h2: 'text-2xl font-bold',
      h3: 'text-xl font-semibold',
      gradient: 'bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent',
    },
    body: {
      base: 'text-base text-muted-foreground',
      large: 'text-lg text-muted-foreground',
      small: 'text-sm text-muted-foreground',
    },
  },
  effects: {
    glassmorphism: 'bg-background/50 backdrop-blur-sm border-border/50 shadow-xl',
  },
}