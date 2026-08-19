import { StyleSheet, View } from "react-native";
import { Badge } from "./Badge";
import { Card } from "./Card";
import { AppText } from "./Text";
import { spacing } from "../theme";

type MetricCardProps = {
  badge?: string;
  helper: string;
  label: string;
  value: string;
};

export function MetricCard({ badge, helper, label, value }: MetricCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <AppText color="textSecondary" variant="label">
          {label}
        </AppText>
        {badge ? <Badge label={badge} tone="success" /> : null}
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
  }
});
