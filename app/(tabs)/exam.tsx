import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const BASE_URL = "https://talent-assess.in/api";

const FEATURES = [
  {
    icon: "🧠",
    label: "AI-Monitored Examination",
    desc: "Real-time behavioral analysis active",
  },
  {
    icon: "⏱",
    label: "Timed Assessment",
    desc: "Complete within the allotted duration",
  },
  {
    icon: "🔒",
    label: "Secure Environment",
    desc: "Tab switching & refresh are restricted",
  },
  {
    icon: "📷",
    label: "Camera & Mic Required",
    desc: "Audio-visual monitoring enabled",
  },
];

export default function ExamScreen() {
  const router = useRouter();

  const [examCode, setExamCode] = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardFades = useRef(FEATURES.map(() => new Animated.Value(0))).current;
  const cardSlides = useRef(FEATURES.map(() => new Animated.Value(20))).current;
  const inputScale = useRef(new Animated.Value(1)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const errorShake = useRef(new Animated.Value(0)).current;
  const msgFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Header entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Staggered card entrance
    FEATURES.forEach((_, i) => {
      Animated.sequence([
        Animated.delay(300 + i * 120),
        Animated.parallel([
          Animated.timing(cardFades[i], {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(cardSlides[i], {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });

    // Badge pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(errorShake, {
        toValue: 8,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(errorShake, {
        toValue: -8,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(errorShake, {
        toValue: 6,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(errorShake, {
        toValue: -6,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(errorShake, {
        toValue: 0,
        duration: 60,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateMsg = () => {
    msgFade.setValue(0);
    Animated.timing(msgFade, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleFocus = () => {
    setFocused(true);
    setError("");
    setSuccess("");
    Animated.spring(inputScale, {
      toValue: 1.02,
      useNativeDriver: true,
    }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.spring(inputScale, { toValue: 1, useNativeDriver: true }).start();
  };

  const handlePressIn = () => {
    Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(btnScale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handleContinue = async () => {
    const code = examCode.trim();

    if (!code) {
      setError("Please enter your exam code to continue.");
      animateMsg();
      triggerShake();
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Step 1: Verify exam exists
      await axios.get(`${BASE_URL}/exam/${code}`);

      // Step 2: Fetch scheduled exam data
      const scheduledRes = await axios.get(
        `${BASE_URL}/scheduled-exam/${code}`,
      );
      const scheduledExamData = scheduledRes.data;

      // Step 3: Persist to AsyncStorage
      await AsyncStorage.setItem(
        "scheduledExamData",
        JSON.stringify(scheduledExamData),
      );

      // Step 4: Show success & navigate
      setSuccess("Exam verified! Redirecting...");
      animateMsg();

      setTimeout(() => {
        router.push(`/scheduledexam/scheduledexam?code=${code}`);
      }, 800);
    } catch (err: any) {
      const status = err?.response?.status;
      if (!err?.response) {
        setError("Network error. Please check your connection.");
      } else if (status === 404) {
        setError(
          "Invalid or unscheduled exam code. Please check and try again.",
        );
      } else if (status >= 500) {
        setError("Server error. Please try again in a moment.");
      } else {
        setError("Invalid or unscheduled exam code.");
      }
      animateMsg();
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || !examCode.trim();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F4FF" />

      {/* Background decorations */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgDot} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Badge */}
          <Animated.View
            style={[styles.badgeWrap, { transform: [{ scale: pulseAnim }] }]}
          >
            <View style={styles.badge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>SECURE ASSESSMENT PORTAL</Text>
            </View>
          </Animated.View>

          {/* Header */}
          <Animated.View
            style={[
              styles.headerWrap,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={styles.welcomeLabel}>Welcome to</Text>
            <Text style={styles.title}>
              Talent{"\n"}
              <Text style={styles.titleAccent}>Assessment</Text>
            </Text>
            <Text style={styles.subtitle}>
              Enter your exam code to begin your{"\n"}AI-powered evaluation
              session
            </Text>
          </Animated.View>

          {/* Feature Cards */}
          <View style={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.featureCard,
                  {
                    opacity: cardFades[i],
                    transform: [{ translateY: cardSlides[i] }],
                  },
                ]}
              >
                <View style={styles.featureIconWrap}>
                  <Text style={styles.featureIcon}>{f.icon}</Text>
                </View>
                <View style={styles.featureTextWrap}>
                  <Text style={styles.featureLabel}>{f.label}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
                <View style={styles.featureCheck}>
                  <Text style={styles.featureCheckText}>✓</Text>
                </View>
              </Animated.View>
            ))}
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>Enter Your Code</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Input + Button */}
          <Animated.View
            style={[
              styles.inputRow,
              { transform: [{ translateX: errorShake }] },
            ]}
          >
            <Animated.View
              style={[
                styles.inputWrap,
                { transform: [{ scale: inputScale }] },
                focused && styles.inputWrapFocused,
                !!error && styles.inputWrapError,
              ]}
            >
              <Text style={styles.inputIcon}>🔑</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. EXAM-2024-XYZ"
                placeholderTextColor="#A0A8C0"
                value={examCode}
                onChangeText={(t) => {
                  setExamCode(t);
                  if (error) setError("");
                }}
                onFocus={handleFocus}
                onBlur={handleBlur}
                autoCapitalize="characters"
                returnKeyType="done"
                onSubmitEditing={handleContinue}
                editable={!loading}
              />
            </Animated.View>

            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
              <TouchableOpacity
                style={[styles.btn, isDisabled && styles.btnDisabled]}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={handleContinue}
                activeOpacity={1}
                disabled={isDisabled}
              >
                {loading ? (
                  <View style={styles.btnLoading}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.btnLoadingText}>Verifying</Text>
                  </View>
                ) : (
                  <Text style={styles.btnText}>Start →</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

          {/* Status Message */}
          {(!!error || !!success) && (
            <Animated.View
              style={[
                styles.msgBox,
                error ? styles.msgBoxError : styles.msgBoxSuccess,
                { opacity: msgFade },
              ]}
            >
              <Text style={styles.msgIcon}>{error ? "⚠️" : "✅"}</Text>
              <Text
                style={[
                  styles.msgText,
                  error ? styles.msgTextError : styles.msgTextSuccess,
                ]}
              >
                {error || success}
              </Text>
            </Animated.View>
          )}

          <Text style={styles.footer}>
            Having trouble? Contact your exam coordinator
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginBottom: 70,
    flex: 1,
    backgroundColor: "#F0F4FF",
  },
  scroll: {
    paddingHorizontal: 22,
    paddingTop: 56,
    paddingBottom: 40,
  },

  // Background decor
  bgCircle1: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "#DDE6FF",
    opacity: 0.55,
    top: -80,
    right: -80,
  },
  bgCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#C8D8FF",
    opacity: 0.35,
    bottom: 60,
    left: -60,
  },
  bgDot: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4F6EF7",
    opacity: 0.06,
    top: 200,
    left: 30,
  },

  // Badge
  badgeWrap: {
    alignItems: "center",
    marginBottom: 24,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#C7D2FE",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#4F46E5",
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#4F46E5",
    letterSpacing: 1.3,
  },

  // Header
  headerWrap: {
    marginBottom: 28,
  },
  welcomeLabel: {
    fontSize: 15,
    color: "#6B7394",
    fontWeight: "500",
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  title: {
    fontSize: 38,
    fontWeight: "800",
    color: "#1A1F3C",
    lineHeight: 44,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  titleAccent: {
    color: "#4F46E5",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7394",
    lineHeight: 21,
    fontWeight: "400",
  },

  // Feature cards
  featuresGrid: {
    gap: 10,
    marginBottom: 28,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#EEF0FA",
    gap: 12,
  },
  featureIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  featureIcon: { fontSize: 18 },
  featureTextWrap: { flex: 1 },
  featureLabel: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#1A1F3C",
    marginBottom: 2,
    letterSpacing: 0.1,
  },
  featureDesc: {
    fontSize: 12,
    color: "#8A90B0",
    fontWeight: "400",
  },
  featureCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#6EE7B7",
    alignItems: "center",
    justifyContent: "center",
  },
  featureCheckText: {
    fontSize: 11,
    color: "#059669",
    fontWeight: "800",
  },

  // Divider
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#D6DCEF",
  },
  dividerLabel: {
    fontSize: 11.5,
    color: "#8A90B0",
    fontWeight: "600",
    letterSpacing: 0.6,
  },

  // Input row
  inputRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
    alignItems: "center",
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: "#DDE3F4",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    gap: 10,
  },
  inputWrapFocused: {
    borderColor: "#4F46E5",
    shadowOpacity: 0.14,
  },
  inputWrapError: {
    borderColor: "#EF4444",
    shadowColor: "#EF4444",
    shadowOpacity: 0.12,
  },
  inputIcon: { fontSize: 16 },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1A1F3C",
    fontWeight: "600",
    letterSpacing: 0.8,
    padding: 0,
    margin: 0,
  },
  btn: {
    backgroundColor: "#4F46E5",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
    minWidth: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: {
    backgroundColor: "#B4B9D4",
    shadowOpacity: 0.08,
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  btnLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  btnLoadingText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  // Status messages
  msgBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
  },
  msgBoxError: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  msgBoxSuccess: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  msgIcon: { fontSize: 14, marginTop: 1 },
  msgText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 19,
  },
  msgTextError: { color: "#B91C1C" },
  msgTextSuccess: { color: "#15803D" },

  // Footer
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "#A0A8C0",
    fontWeight: "500",
    marginTop: 4,
  },
});
