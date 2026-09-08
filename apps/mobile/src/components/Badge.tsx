import { StyleSheet, View, type ViewStyle } from "react-native";
import { AppIcon, type IconName } from "./Icon";
import { AppText } from "./Text";
import { colors, radius, spacing } from "../theme";

type BadgeTone = "default" | "success" | "learning" | "reward" | "danger";

type BadgeProps = {
  iconName?: IconName;
  label: string;
  tone?: BadgeTone;
};

export function Badge({ iconName, label, tone = "default" }: BadgeProps) {
  const contentColor = tone === "default" ? "textSecondary" : tone;

  return (
    <View style={[styles.base, styles[tone]]}>
      {iconName ? <AppIcon color={contentColor} name={iconName} size="xs" /> : null}
      <AppText color={contentColor} variant="caption">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create<Record<BadgeTone | "base", ViewStyle>>({
  base: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
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
