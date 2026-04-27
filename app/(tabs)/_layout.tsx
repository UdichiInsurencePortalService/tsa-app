import { HapticTab } from "@/components/haptic-tab";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

// ─── Theme Tokens ───────────────────────────────────────────────
const THEME = {
  dark: {
    tabBg: "#1A1A2E",
    tabBorder: "rgba(147, 112, 219, 0.25)",
    inactive: "#4A4A6A",
    label: "#4A4A6A",
    activeLabel: "#A855F7",
    active: "#A855F7",
    fabGradient: ["#7C3AED", "#A855F7"] as [string, string],
    fabRing: "rgba(168, 85, 247, 0.35)",
    fabGlow: "#7C3AED",
    activePill: "#A855F7",
    activeIconBg: "rgba(168, 85, 247, 0.12)",
  },
  light: {
    tabBg: "#FFFFFF",
    tabBorder: "rgba(124, 58, 237, 0.15)",
    inactive: "#A0AEC0",
    label: "#A0AEC0",
    activeLabel: "#7C3AED",
    active: "#7C3AED",
    fabGradient: ["#6D28D9", "#7C3AED"] as [string, string],
    fabRing: "rgba(124, 58, 237, 0.25)",
    fabGlow: "#7C3AED",
    activePill: "#7C3AED",
    activeIconBg: "rgba(124, 58, 237, 0.08)",
  },
};

// ─── Tab Icon with Pill Indicator ───────────────────────────────
function TabIcon({
  name,
  focusedName,
  focused,
  color,
  activeIconBg,
  activePill,
}: {
  name: any;
  focusedName: any;
  focused: boolean;
  color: string;
  activeIconBg: string;
  activePill: string;
}) {
  return (
    <View style={styles.iconContainer}>
      <View
        style={[styles.iconBg, focused && { backgroundColor: activeIconBg }]}
      >
        <Ionicons name={focused ? focusedName : name} size={22} color={color} />
      </View>
      {focused && (
        <View style={[styles.activePill, { backgroundColor: activePill }]} />
      )}
    </View>
  );
}

// ─── Main Layout ────────────────────────────────────────────────
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const t = THEME[colorScheme ?? "light"];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: t.active,
        tabBarInactiveTintColor: t.inactive,
        tabBarButton: HapticTab,
        tabBarLabelStyle: [styles.tabLabel, { color: t.label }],
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: t.tabBg,
            borderTopColor: t.tabBorder,
            shadowColor: t.fabGlow,
          },
        ],
      }}
    >
      <Tabs.Screen
        name="exam"
        options={{
          title: "Exam",
          tabBarActiveTintColor: t.active,
          tabBarLabel: ({ focused }) => (
            <Text
              style={[
                styles.tabLabel,
                { color: focused ? t.activeLabel : t.label },
              ]}
            >
              Exam
            </Text>
          ),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="document-text-outline"
              focusedName="document-text"
              focused={focused}
              color={color}
              activeIconBg={t.activeIconBg}
              activePill={t.activePill}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="attendance"
        options={{
          title: "Attendance",
          tabBarLabel: ({ focused }) => (
            <Text
              style={[
                styles.tabLabel,
                { color: focused ? t.activeLabel : t.label },
              ]}
            >
              Attendance
            </Text>
          ),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="calendar-outline"
              focusedName="calendar"
              focused={focused}
              color={color}
              activeIconBg={t.activeIconBg}
              activePill={t.activePill}
            />
          ),
        }}
      />

      {/* ── Home FAB ─────────────────────────────────────────── */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) => (
            <View style={styles.fabContainer}>
              {/* Outer glow ring */}
              <View
                style={[
                  styles.fabGlowRing,
                  {
                    borderColor: t.fabRing,
                    opacity: focused ? 1 : 0.4,
                  },
                ]}
              />
              {/* Inner ring */}
              <View
                style={[
                  styles.fabInnerRing,
                  {
                    borderColor: focused
                      ? "rgba(168,85,247,0.5)"
                      : "transparent",
                  },
                ]}
              />
              {/* FAB Button */}
              <LinearGradient
                colors={t.fabGradient}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={[
                  styles.fab,
                  focused && styles.fabFocused,
                  {
                    shadowColor: t.fabGlow,
                    shadowOpacity: focused ? 0.65 : 0.35,
                  },
                ]}
              >
                <Ionicons
                  name={focused ? "home" : "home-outline"}
                  size={26}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="industries"
        options={{
          title: "Industries",
          tabBarLabel: ({ focused }) => (
            <Text
              style={[
                styles.tabLabel,
                { color: focused ? t.activeLabel : t.label },
              ]}
            >
              Industries
            </Text>
          ),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="business-outline"
              focusedName="business"
              focused={focused}
              color={color}
              activeIconBg={t.activeIconBg}
              activePill={t.activePill}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="support"
        options={{
          title: "Support",
          tabBarLabel: ({ focused }) => (
            <Text
              style={[
                styles.tabLabel,
                { color: focused ? t.activeLabel : t.label },
              ]}
            >
              Support
            </Text>
          ),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="help-circle-outline"
              focusedName="help-circle"
              focused={focused}
              color={color}
              activeIconBg={t.activeIconBg}
              activePill={t.activePill}
            />
          ),
        }}
      />
    </Tabs>
  );
}

// ─── Styles ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === "ios" ? 88 : 72,
    paddingBottom: Platform.OS === "ios" ? 24 : 10,
    paddingTop: 6,
    paddingHorizontal: 6,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    position: "absolute",
    // Deep purple shadow lift
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 20,
  },

  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.3,
    marginTop: 1,
  },

  // Icon + pill container
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  // Rounded bg that appears when active
  iconBg: {
    width: 46,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  // Pill beneath active icon
  activePill: {
    width: 18,
    height: 3,
    borderRadius: 2,
  },

  // ── FAB ──────────────────────────────────────────────────────
  fabContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -30,
  },

  fabGlowRing: {
    position: "absolute",
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1.5,
  },

  fabInnerRing: {
    position: "absolute",
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 1,
  },

  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    // Colored glow shadow
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 14,
  },

  fabFocused: {
    transform: [{ scale: 1.06 }],
    shadowRadius: 22,
    elevation: 18,
  },
});
