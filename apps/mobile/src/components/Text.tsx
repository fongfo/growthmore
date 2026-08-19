import { StyleSheet, Text, type TextProps, type TextStyle } from "react-native";
import { colors, typography } from "../theme";

type TextVariant =
  | "eyebrow"
  | "title"
  | "heading"
  | "body"
  | "bodyStrong"
  | "caption"
  | "metric"
  | "label";

type AppTextProps = TextProps & {
  color?: keyof typeof colors.light;
  variant?: TextVariant;
};

export function AppText({
  color = "textPrimary",
  style,
  variant = "body",
  ...props
}: AppTextProps) {
  return <Text {...props} style={[styles.base, styles[variant], { color: colors.light[color] }, style]} />;
}

const styles = StyleSheet.create<Record<TextVariant | "base", TextStyle>>({
  base: {
    includeFontPadding: false
  },
  eyebrow: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
    lineHeight: typography.lineHeight.label,
    textTransform: "uppercase"
  },
  title: {
    fontSize: typography.size.title,
    fontWeight: typography.weight.extraBold,
    lineHeight: typography.lineHeight.title
  },
  heading: {
    fontSize: typography.size.heading,
    fontWeight: typography.weight.bold,
    lineHeight: typography.lineHeight.heading
  },
  body: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.regular,
    lineHeight: typography.lineHeight.body
  },
  bodyStrong: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    lineHeight: typography.lineHeight.body
  },
  caption: {
    fontSize: typography.size.caption,
    fontWeight: typography.weight.medium,
    lineHeight: typography.lineHeight.caption
  },
  metric: {
    fontSize: typography.size.metric,
    fontWeight: typography.weight.extraBold,
    lineHeight: typography.lineHeight.metric
  },
  label: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.lineHeight.label
  }
});
