import { StyleSheet, View, type ViewProps, type ViewStyle } from "react-native";
import { colors, radius, shadows, spacing } from "../theme";

type CardTone = "default" | "muted" | "learning" | "reward" | "success" | "danger";

type CardProps = ViewProps & {
  tone?: CardTone;
};

export function Card({ style, tone = "default", ...props }: CardProps) {
  return <View {...props} style={[styles.base, styles[tone], style]} />;
}

const styles = StyleSheet.create<Record<CardTone | "base", ViewStyle>>({
  base: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.xl,
    ...shadows.card
  },
  default: {
    backgroundColor: colors.light.surface,
    borderColor: colors.light.border
  },
  muted: {
    backgroundColor: colors.light.surfaceMuted,
    borderColor: colors.light.border
  },
  learning: {
    backgroundColor: colors.light.learningSoft,
    borderColor: "#DDD6FE"
  },
  reward: {
    backgroundColor: colors.light.rewardSoft,
    borderColor: "#FDE68A"
  },
  success: {
    backgroundColor: colors.light.successSoft,
    borderColor: "#99F6E4"
  },
  danger: {
    backgroundColor: colors.light.dangerSoft,
    borderColor: "#FECACA"
  }
});
