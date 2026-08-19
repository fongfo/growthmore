import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { demoTenant, productLoopSteps } from "@growthmore/shared";

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroPanel}>
          <Text style={styles.eyebrow}>{demoTenant.displayName}</Text>
          <Text style={styles.title}>成长金计划 Demo MVP</Text>
          <Text style={styles.copy}>
            先跑通任务奖励、模拟学习、奖励罐和提现审核闭环，后续开发全部从 Jira BGM
            任务和 development 分支推进。
          </Text>
        </View>

        <View style={styles.loopPanel}>
          <Text style={styles.sectionTitle}>Product Loop</Text>
          {productLoopSteps.map((step) => (
            <View key={step.id} style={styles.loopRow}>
              <Text style={styles.stepLabel}>{step.label}</Text>
              <Text style={styles.stepTitle}>{step.title}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC"
  },
  content: {
    flexGrow: 1,
    gap: 16,
    justifyContent: "center",
    padding: 20
  },
  heroPanel: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    padding: 24,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 2
  },
  eyebrow: {
    marginBottom: 12,
    color: "#1E3A8A",
    fontSize: 14,
    fontWeight: "700"
  },
  title: {
    color: "#0F172A",
    fontSize: 36,
    fontWeight: "800",
    lineHeight: 40
  },
  copy: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 16,
    lineHeight: 26
  },
  loopPanel: {
    gap: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    padding: 20
  },
  sectionTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "800"
  },
  loopRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  stepLabel: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "700"
  },
  stepTitle: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800"
  }
});

