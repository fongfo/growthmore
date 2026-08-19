export const colors = {
  brand: {
    primaryNavy: "#0F172A",
    bankBlue: "#1E3A8A",
    growthMint: "#12B886",
    learningGrape: "#6C5CE7",
    rewardGold: "#A16207",
    riskCoral: "#DC2626"
  },
  light: {
    background: "#F8FAFC",
    surface: "#FFFFFF",
    surfaceMuted: "#F1F5F9",
    surfaceRaised: "#FFFFFF",
    border: "#E2E8F0",
    borderStrong: "#CBD5E1",
    textPrimary: "#0F172A",
    textSecondary: "#475569",
    textMuted: "#64748B",
    inverseText: "#FFFFFF",
    primary: "#1E3A8A",
    primaryPressed: "#172554",
    success: "#0F766E",
    successSoft: "#CCFBF1",
    learning: "#5B21B6",
    learningSoft: "#EDE9FE",
    reward: "#854D0E",
    rewardSoft: "#FEF3C7",
    danger: "#B91C1C",
    dangerSoft: "#FEE2E2",
    focusRing: "#2563EB"
  },
  dark: {
    background: "#020617",
    surface: "#0F172A",
    surfaceMuted: "#1E293B",
    surfaceRaised: "#111827",
    border: "#334155",
    borderStrong: "#475569",
    textPrimary: "#F8FAFC",
    textSecondary: "#CBD5E1",
    textMuted: "#94A3B8",
    inverseText: "#0F172A",
    primary: "#93C5FD",
    primaryPressed: "#BFDBFE",
    success: "#5EEAD4",
    successSoft: "#134E4A",
    learning: "#C4B5FD",
    learningSoft: "#3B0764",
    reward: "#FCD34D",
    rewardSoft: "#713F12",
    danger: "#FCA5A5",
    dangerSoft: "#7F1D1D",
    focusRing: "#60A5FA"
  }
} as const;

export type ColorMode = "light" | "dark";
export type ThemeColors = (typeof colors)[ColorMode];

export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  jumbo: 40
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999
} as const;

export const typography = {
  family: {
    system:
      "System, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif"
  },
  size: {
    caption: 12,
    label: 13,
    body: 16,
    bodyLarge: 18,
    heading: 22,
    title: 30,
    metric: 34
  },
  lineHeight: {
    caption: 16,
    label: 18,
    body: 24,
    bodyLarge: 28,
    heading: 28,
    title: 36,
    metric: 40
  },
  weight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extraBold: "800"
  }
} as const;

export const shadows = {
  none: {
    shadowOpacity: 0,
    elevation: 0
  },
  card: {
    shadowColor: colors.brand.primaryNavy,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 2
  },
  raised: {
    shadowColor: colors.brand.primaryNavy,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 4
  }
} as const;

export const touch = {
  minTarget: 48,
  minCompactTarget: 44,
  gap: 8
} as const;

export const motion = {
  quick: 150,
  standard: 220,
  slow: 300
} as const;

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  shadows,
  touch,
  motion
} as const;
