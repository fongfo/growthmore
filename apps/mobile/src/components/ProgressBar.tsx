import { StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "../theme";

type ProgressBarProps = {
  accessibilityLabel: string;
  value: number;
};

export function ProgressBar({ accessibilityLabel, value }: ProgressBarProps) {
  const normalizedValue = Math.max(0, Math.min(value, 1));

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(normalizedValue * 100) }}
      style={styles.track}
    >
      <View style={[styles.fill, { width: `${normalizedValue * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.light.surfaceMuted,
    borderRadius: radius.pill,
    height: spacing.sm,
    overflow: "hidden"
  },
  fill: {
    backgroundColor: colors.light.success,
    borderRadius: radius.pill,
    height: "100%"
  }
});
