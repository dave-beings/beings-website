/**
 * Aida Marketing Design Tokens
 * beings.com blue tech aesthetic
 */

export const colors = {
  brand: {
    primary: '#049CF0',
    primaryLight: '#33B5F5',
    primaryDark: '#0380CC',
  },
  accent: {
    cta: '#049CF0',
    ctaHover: '#0380CC',
    ctaLight: '#33B5F5',
  },
  gradients: {
    blue: 'rgba(4, 156, 240, 0.2)',
    blueSolid: '#049CF0',
    cyan: 'rgba(0, 212, 255, 0.2)',
    cyanSolid: '#00D4FF',
    sky: 'rgba(51, 181, 245, 0.15)',
    skySolid: '#33B5F5',
    navy: 'rgba(0, 51, 204, 0.15)',
    navySolid: '#0033CC',
  },
  surface: {
    white: '#FFFFFF',
    gray50: '#F8FAFC',
    gray100: '#F0F4F8',
    gray200: '#E2E8F0',
    gray300: '#CBD5E1',
  },
  text: {
    primary: '#101A29',
    secondary: '#737588',
    muted: '#A1A1AA',
  },
} as const

export const shadows = {
  soft: '0 2px 8px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.06)',
  elevated: '0 4px 12px rgba(0, 0, 0, 0.05), 0 8px 32px rgba(0, 0, 0, 0.08)',
  glowBrand: '0 0 32px rgba(4, 156, 240, 0.25)',
  glowBlue: '0 0 32px rgba(4, 156, 240, 0.2)',
} as const

export const radius = {
  sm: '6px',
  md: '10px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
} as const

export const fonts = {
  display: '"Poppins", system-ui, sans-serif',
  sans: '"Poppins", system-ui, sans-serif',
  mono: '"JetBrains Mono", "SF Mono", Menlo, monospace',
} as const

export const animation = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    default: [0.4, 0, 0.2, 1],
    spring: { type: 'spring', stiffness: 400, damping: 30 },
    bounce: { type: 'spring', stiffness: 300, damping: 20 },
  },
} as const

// Framer Motion Variants
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const scaleOnHover = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.98 },
  transition: { type: 'spring', stiffness: 400, damping: 30 },
}

export const pillVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  hover: { scale: 1.05, y: -2 },
  tap: { scale: 0.95 },
}

// Chat demo sample data - keyed by prompt type for interactive demos
export const chatDemoMessages = {
  summarise: {
    user: "Summarise the key points from this cohort of user reviews",
    assistant: "Based on the selected transcript, here are the key points raised:",
    citations: [
      { text: "Poor usability", source: "8/10 participants recorded" },
      { text: "Confusion around labeling conventions", source: "6/10 participants recorded" },
      { text: "Reliance on strong WiFi", source: "9/10 participants recorded" },
    ],
  },
  discuss: {
    user: "What collaboration themes emerged from this discussion?",
    assistant: "Two key areas of collaboration emerged from the discussion:",
    citations: [
      { text: "Collaborating on User Strategy", source: "Speaker 0 expressed a need for input on their User strategy [9]" },
      { text: "Requirement for Branded Guidelines", source: "Multiple speakers expressed a desire for branded guidelines [4] [5] [9] [12]" },
    ],
  },
  evaluate: {
    user: "Evaluate the suggested initiatives, based on the transcript",
    assistant: "Here\u2019s an evaluation of the suggested initiatives, based on the transcript:",
    citations: [
      { text: "Initiative to encourage team adoption \u2014 Potential Impact: High", source: "Clear demand across multiple departments. Multiple speakers acknowledge a lack of authority when prompting adoption [1] [2] [14] [17] [23]" },
    ],
  },
}

export const promptSuggestions = [
  { label: 'Summarise', icon: '📝' },
  { label: 'Discuss', icon: '💬' },
  { label: 'Evaluate', icon: '⚖️' },
]

// Type for chat demo message keys
export type ChatDemoKey = keyof typeof chatDemoMessages

// Mapping from prompt labels to demo keys
export const promptLabelToKey: Record<string, ChatDemoKey> = {
  'Summarise': 'summarise',
  'Discuss': 'discuss',
  'Evaluate': 'evaluate',
}

export const featureCards = [
  {
    title: 'AI-Powered Analysis',
    description: 'Get instant insights from your meetings with contextual understanding',
    icon: '🧠',
  },
  {
    title: 'Source Citations',
    description: 'Every response grounded in your actual meeting content',
    icon: '📎',
  },
  {
    title: 'Custom Instructions',
    description: 'Tailor Aida\'s responses to your workflow and preferences',
    icon: '⚙️',
  },
  {
    title: 'Multi-Document Chat',
    description: 'Ask questions across all your meetings and documents',
    icon: '📚',
  },
]
