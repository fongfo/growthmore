import type React from "react";
import { SafeAreaView, ScrollView, StyleSheet, type ViewStyle } from "react-native";
import { colors, spacing } from "../theme";

type ScreenProps = {
  children: React.ReactNode;
  contentStyle?: ViewStyle;
};

export function Screen({ children, contentStyle }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.content, contentStyle]}>{children}</ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.light.background,
    flex: 1
  },
  content: {
    flexGrow: 1,
    gap: spacing.xxl,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl
  }
});
