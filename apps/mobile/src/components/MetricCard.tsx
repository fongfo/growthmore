import { StyleSheet, View } from "react-native";
import { Badge } from "./Badge";
import { Card } from "./Card";
import { AppIcon, type IconName } from "./Icon";
import { AppText } from "./Text";
import { colors, radius, spacing } from "../theme";

type MetricCardProps = {
  badge?: string;
  helper: string;
  iconName?: IconName;
  label: string;
  value: string;
};

export function MetricCard({ badge, helper, iconName, label, value }: MetricCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.labelGroup}>
          {iconName ? (
            <View style={styles.iconBubble}>
              <AppIcon color="primary" name={iconName} size="sm" />
            </View>
          ) : null}
          <AppText color="textSecondary" variant="label">
            {label}
          </AppText>
        </View>
        {badge ? <Badge iconName="check-circle-outline" label={badge} tone="success" /> : null}
      </View>
      <AppText adjustsFontSizeToFit minimumFontScale={0.82} variant="metric">
        {value}
      </AppText>
      <AppText color="textSecondary" variant="caption">
        {helper}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: spacing.md,
    minWidth: 0
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between"
  },
  iconBubble: {
    alignItems: "center",
    backgroundColor: colors.light.surfaceMuted,
    borderColor: colors.light.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 30,
    justifyContent: "center",
    width: 30
  },
  labelGroup: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minWidth: 0
  }
});
