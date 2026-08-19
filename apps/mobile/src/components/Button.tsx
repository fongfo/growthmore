import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type ViewStyle
} from "react-native";
import { AppText } from "./Text";
import { colors, radius, spacing, touch } from "../theme";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = Omit<PressableProps, "style" | "children"> & {
  label: string;
  loading?: boolean;
  style?: ViewStyle;
  variant?: ButtonVariant;
};

export function Button({
  accessibilityLabel,
  disabled,
  label,
  loading = false,
  style,
  variant = "primary",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      {...props}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && !isDisabled ? styles.pressed : undefined,
        isDisabled ? styles.disabled : undefined,
        style
      ]}
    >
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={variant === "primary" ? colors.light.inverseText : colors.light.primary} /> : null}
        <AppText color={variant === "primary" ? "inverseText" : "primary"} variant="label">
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

export const buttonMetrics = {
  minHeight: touch.minTarget,
  minWidth: touch.minTarget
} as const;

const styles = StyleSheet.create<Record<ButtonVariant | "base" | "content" | "pressed" | "disabled", ViewStyle>>({
  base: {
    alignItems: "center",
    borderRadius: radius.md,
    justifyContent: "center",
    minHeight: buttonMetrics.minHeight,
    minWidth: buttonMetrics.minWidth,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md
  },
  primary: {
    backgroundColor: colors.light.primary
  },
  secondary: {
    backgroundColor: colors.light.surface,
    borderColor: colors.light.borderStrong,
    borderWidth: 1
  },
  ghost: {
    backgroundColor: "transparent"
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center"
  },
  pressed: {
    opacity: 0.82
  },
  disabled: {
    opacity: 0.48
  }
});
