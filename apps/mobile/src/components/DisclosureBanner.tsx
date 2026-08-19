import { StyleSheet, View } from "react-native";
import { AppText } from "./Text";
import { colors, radius, spacing } from "../theme";

type DisclosureBannerProps = {
  body: string;
  title: string;
};

export function DisclosureBanner({ body, title }: DisclosureBannerProps) {
  return (
    <View accessibilityRole="summary" style={styles.container}>
      <View style={styles.marker} />
      <View style={styles.copy}>
        <AppText color="danger" variant="label">
          {title}
        </AppText>
        <AppText color="textSecondary" variant="caption">
          {body}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    backgroundColor: colors.light.dangerSoft,
    borderColor: "#FECACA",
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.lg
  },
  marker: {
    backgroundColor: colors.light.danger,
    borderRadius: radius.pill,
    height: spacing.xl,
    marginTop: spacing.xs,
    width: spacing.xs
  },
  copy: {
    flex: 1,
    gap: spacing.xs
  }
});
