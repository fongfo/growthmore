import { StyleSheet, View, type ViewStyle } from "react-native";
import { AppText } from "./Text";
import { colors, radius, spacing } from "../theme";

type BadgeTone = "default" | "success" | "learning" | "reward" | "danger";

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
};

export function Badge({ label, tone = "default" }: BadgeProps) {
  return (
    <View style={[styles.base, styles[tone]]}>
      <AppText color={tone === "default" ? "textSecondary" : tone} variant="caption">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create<Record<BadgeTone | "base", ViewStyle>>({
  base: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  default: {
    backgroundColor: colors.light.surfaceMuted,
    borderColor: colors.light.border
  },
  success: {
    backgroundColor: colors.light.successSoft,
    borderColor: "#99F6E4"
  },
  learning: {
    backgroundColor: colors.light.learningSoft,
    borderColor: "#DDD6FE"
  },
  reward: {
    backgroundColor: colors.light.rewardSoft,
    borderColor: "#FDE68A"
  },
  danger: {
    backgroundColor: colors.light.dangerSoft,
    borderColor: "#FECACA"
  }
});
