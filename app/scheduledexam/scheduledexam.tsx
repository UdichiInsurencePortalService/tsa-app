/**
 * app/scheduledexam/[code].tsx
 * Scheduled Exam Details + Candidate Info Form
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

const API_URL = "https://talent-assess.in/api";

const INSTRUCTIONS = [
  {
    icon: "🚫",
    title: "No Tab Switching",
    titleHi: "टैब न बदलें",
    desc: "Switching tabs will be flagged.",
    color: "#ef4444",
    bg: "#fef2f2",
    border: "#fecaca",
  },
  {
    icon: "📷",
    title: "Camera Monitoring",
    titleHi: "कैमरा निगरानी",
    desc: "Keep your face visible at all times.",
    color: "#f97316",
    bg: "#fff7ed",
    border: "#fed7aa",
  },
  {
    icon: "🤖",
    title: "AI Anti-Cheat",
    titleHi: "AI नकल-रोधी",
    desc: "Suspicious activity is tracked live.",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    border: "#ddd6fe",
  },
  {
    icon: "📵",
    title: "No External Aids",
    titleHi: "बाहरी सहायता नहीं",
    desc: "No books, notes or extra devices.",
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
  },
  {
    icon: "⏱️",
    title: "Fixed Duration",
    titleHi: "निश्चित समय",
    desc: "Timer starts on Q1. Cannot be paused.",
    color: "#0ea5e9",
    bg: "#f0f9ff",
    border: "#bae6fd",
  },
  {
    icon: "✅",
    title: "Instant Result",
    titleHi: "तुरंत परिणाम",
    desc: "Score generated right after submit.",
    color: "#10b981",
    bg: "#f0fdf4",
    border: "#bbf7d0",
  },
];

const LANGUAGES = [
  { code: "en", label: "🇬🇧  English" },
  { code: "hi", label: "🇮🇳  Hindi — हिन्दी" },
];

interface ExamData {
  exam_name: string;
  subject_name: string;
  duration_minutes: number;
  total_questions?: number;
  [key: string]: any;
}

export default function ScheduledExamScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();

  const [exam, setExam] = useState<ExamData | null>(null);
  const [loadingExam, setLoadingExam] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    candidate_name: "",
    father_name: "",
    mobile_number: "",
    language: "en",
  });
  const [langOpen, setLangOpen] = useState(false);

  // Animations
  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(24)).current;
  const formFade = useRef(new Animated.Value(0)).current;

  // Load saved candidate info
  useEffect(() => {
    AsyncStorage.getItem("candidateInfo").then((raw) => {
      if (raw) {
        try {
          const saved = JSON.parse(raw);
          if (saved.exam_code === code) {
            setForm({
              candidate_name: saved.candidate_name || "",
              father_name: saved.father_name || "",
              mobile_number: saved.mobile_number || "",
              language: saved.language || "en",
            });
          }
        } catch {}
      }
    });
  }, [code]);

  // Fetch exam details
  useEffect(() => {
    if (!code) return;
    setLoadingExam(true);
    axios
      .get(`${API_URL}/scheduled-exam/${code}`)
      .then((r) => {
        const data = r.data?.data ?? r.data;
        setExam(data);
        setLoadingExam(false);
        Animated.parallel([
          Animated.timing(heroFade, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(heroSlide, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(() => {
          Animated.timing(formFade, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }).start();
        });
      })
      .catch(() => {
        setLoadingExam(false);
        setError(
          "Failed to load exam. Please check your exam code and try again.",
        );
      });
  }, [code]);

  // Auto-save form to AsyncStorage
  useEffect(() => {
    if (!code) return;
    const payload = {
      exam_code: code,
      ...form,
      saved_at: new Date().toISOString(),
    };
    AsyncStorage.setItem("candidateInfo", JSON.stringify(payload)).catch(
      () => {},
    );
  }, [form, code]);

  const handleStart = useCallback(async () => {
    const { candidate_name, father_name, mobile_number } = form;
    if (!candidate_name.trim()) {
      Alert.alert("Missing Info", "Please enter your full name.");
      return;
    }
    if (!father_name.trim()) {
      Alert.alert("Missing Info", "Please enter father's name.");
      return;
    }
    if (!mobile_number.trim()) {
      Alert.alert("Missing Info", "Please enter your mobile number.");
      return;
    }
    if (!/^\d{10}$/.test(mobile_number.trim())) {
      Alert.alert("Invalid Number", "Mobile number must be exactly 10 digits.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        exam_code: code,
        candidate_name: candidate_name.trim(),
        father_name: father_name.trim(),
        mobile_number: mobile_number.trim(),
        language: form.language,
        saved_at: new Date().toISOString(),
      };
      await AsyncStorage.multiSet([
        ["candidateInfo", JSON.stringify(payload)],
        ["examStarted", "false"],
        ["examAnswers", JSON.stringify({})],
        ["scheduledExamData", JSON.stringify(exam)],
      ]);
      router.push({
        pathname: `/startexam/startexam`,
        params: { code, lang: form.language },
      });
    } catch (e) {
      Alert.alert("Error", "Could not start exam. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [form, code, exam, router]);

  // ── Loading ──────────────────────────────────────────────
  if (loadingExam) {
    return (
      <View style={styles.loadingPage}>
        <StatusBar barStyle="dark-content" backgroundColor="#f0f4ff" />
        <View style={styles.loadingBox}>
          <ActivityIndicator
            size="large"
            color="#6366f1"
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.loadingTitle}>Fetching exam details…</Text>
          <Text style={styles.loadingSubtitle}>
            परीक्षा विवरण लोड हो रहा है
          </Text>
        </View>
      </View>
    );
  }

  // ── Error ────────────────────────────────────────────────
  if (error || !exam) {
    return (
      <View style={styles.loadingPage}>
        <StatusBar barStyle="dark-content" backgroundColor="#f0f4ff" />
        <View style={[styles.loadingBox, { borderColor: "#fecaca" }]}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
          <Text style={[styles.loadingTitle, { color: "#dc2626" }]}>
            Exam Not Found
          </Text>
          <Text
            style={[
              styles.loadingSubtitle,
              { textAlign: "center", marginTop: 6 },
            ]}
          >
            {error || "Invalid or expired exam link."}
          </Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.retryBtnText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const selectedLang =
    LANGUAGES.find((l) => l.code === form.language) ?? LANGUAGES[0];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#4f46e5" />

      {/* Decorative blobs */}
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── HERO ── */}
          <Animated.View
            style={[
              styles.hero,
              { opacity: heroFade, transform: [{ translateY: heroSlide }] },
            ]}
          >
            <View style={styles.heroBadge}>
              <View style={styles.heroBadgeDot} />
              <Text style={styles.heroBadgeText}>SCHEDULED EXAMINATION</Text>
            </View>
            <Text style={styles.heroTitle}>{exam.exam_name}</Text>
            <View style={styles.heroChips}>
              <View style={styles.heroChip}>
                <Text style={styles.heroChipText}>📚 {exam.subject_name}</Text>
              </View>
              <View style={styles.heroChip}>
                <Text style={styles.heroChipText}>
                  ⏳ {exam.duration_minutes} min
                </Text>
              </View>
              {exam.total_questions && (
                <View style={styles.heroChip}>
                  <Text style={styles.heroChipText}>
                    ❓ {exam.total_questions} Qs
                  </Text>
                </View>
              )}
              <View style={styles.heroChip}>
                <Text style={[styles.heroChipText, styles.monoText]}>
                  🔑 {code}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* ── INSTRUCTIONS ── */}
          <Animated.View style={{ opacity: formFade }}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.cardHeaderIcon,
                    { backgroundColor: "#eef2ff" },
                  ]}
                >
                  <Text>📌</Text>
                </View>
                <View>
                  <Text style={styles.cardHeaderTitle}>EXAM INSTRUCTIONS</Text>
                  <Text style={styles.cardHeaderSub}>
                    परीक्षा निर्देश — Read carefully
                  </Text>
                </View>
              </View>
              {INSTRUCTIONS.map((ins, i) => (
                <View
                  key={i}
                  style={[
                    styles.instrItem,
                    i === INSTRUCTIONS.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View
                    style={[
                      styles.instrIconWrap,
                      { backgroundColor: ins.bg, borderColor: ins.border },
                    ]}
                  >
                    <Text style={{ fontSize: 20 }}>{ins.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.instrTitle}>{ins.title}</Text>
                    <Text style={[styles.instrTitleHi, { color: ins.color }]}>
                      {ins.titleHi}
                    </Text>
                    <Text style={styles.instrDesc}>{ins.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* ── SCORING ROW ── */}
            <View
              style={[styles.card, { flexDirection: "row", marginTop: 16 }]}
            >
              {[
                {
                  icon: "📊",
                  bg: "#f0fdf4",
                  label: "Result",
                  val: "Instant",
                  sub: "तुरंत परिणाम",
                },
                {
                  icon: "🏆",
                  bg: "#eef2ff",
                  label: "Scoring",
                  val: "Auto-Graded",
                  sub: "स्वतः अंकन",
                },
                {
                  icon: "📄",
                  bg: "#fffbeb",
                  label: "Report",
                  val: "Downloadable",
                  sub: "डाउनलोड योग्य",
                },
              ].map((s, i) => (
                <View
                  key={i}
                  style={[
                    styles.scoreItem,
                    i < 2 && {
                      borderRightWidth: 1,
                      borderRightColor: "#f1f5f9",
                    },
                  ]}
                >
                  <View style={[styles.scoreIcon, { backgroundColor: s.bg }]}>
                    <Text style={{ fontSize: 20 }}>{s.icon}</Text>
                  </View>
                  <Text style={styles.scoreLabel}>{s.label}</Text>
                  <Text style={styles.scoreVal}>{s.val}</Text>
                  <Text style={styles.scoreValSub}>{s.sub}</Text>
                </View>
              ))}
            </View>

            {/* ── CANDIDATE FORM ── */}
            <View style={[styles.card, { marginTop: 16 }]}>
              <View
                style={[
                  styles.cardHeader,
                  { backgroundColor: "#f8faff", borderBottomColor: "#e0e7ff" },
                ]}
              >
                <Text style={styles.formCardTitle}>👤 Candidate Details</Text>
                <Text style={styles.formCardSub}>
                  उम्मीदवार विवरण — Fill all fields to proceed
                </Text>
              </View>

              <View style={styles.formBody}>
                {/* Name */}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>
                    ✏️ Candidate Name <Text style={styles.req}>*</Text>
                    <Text style={styles.fieldLabelHi}> — पूरा नाम</Text>
                  </Text>
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="Enter your full name"
                    placeholderTextColor="#c4cdd8"
                    value={form.candidate_name}
                    onChangeText={(v) =>
                      setForm((p) => ({ ...p, candidate_name: v }))
                    }
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>

                {/* Father Name */}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>
                    👨‍👦 Father's Name <Text style={styles.req}>*</Text>
                    <Text style={styles.fieldLabelHi}> — पिता का नाम</Text>
                  </Text>
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="Enter father's full name"
                    placeholderTextColor="#c4cdd8"
                    value={form.father_name}
                    onChangeText={(v) =>
                      setForm((p) => ({ ...p, father_name: v }))
                    }
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>

                {/* Mobile */}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>
                    📱 Mobile Number <Text style={styles.req}>*</Text>
                    <Text style={styles.fieldLabelHi}> — मोबाइल नंबर</Text>
                  </Text>
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="10-digit mobile number"
                    placeholderTextColor="#c4cdd8"
                    value={form.mobile_number}
                    onChangeText={(v) =>
                      setForm((p) => ({
                        ...p,
                        mobile_number: v.replace(/\D/g, "").slice(0, 10),
                      }))
                    }
                    keyboardType="numeric"
                    maxLength={10}
                    returnKeyType="done"
                  />
                  <Text style={styles.fieldHint}>
                    🇮🇳 10 अंकों का मोबाइल नंबर
                  </Text>
                </View>

                {/* Language Picker */}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>🌐 Language — भाषा</Text>
                  <TouchableOpacity
                    style={styles.langSelector}
                    onPress={() => setLangOpen((o) => !o)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.langSelectorText}>
                      {selectedLang.label}
                    </Text>
                    <Text style={styles.langArrow}>{langOpen ? "▴" : "▾"}</Text>
                  </TouchableOpacity>
                  {langOpen && (
                    <View style={styles.langDropdown}>
                      {LANGUAGES.map((l) => (
                        <TouchableOpacity
                          key={l.code}
                          style={[
                            styles.langOption,
                            l.code === form.language && styles.langOptionActive,
                          ]}
                          onPress={() => {
                            setForm((p) => ({ ...p, language: l.code }));
                            setLangOpen(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.langOptionText,
                              l.code === form.language && {
                                color: "#4f46e5",
                                fontWeight: "700",
                              },
                            ]}
                          >
                            {l.label}
                          </Text>
                          {l.code === form.language && (
                            <Text style={{ color: "#4f46e5" }}>✓</Text>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  <Text style={styles.fieldHint}>
                    🇮🇳 प्रश्न-पत्र की भाषा चुनें
                  </Text>
                </View>

                {/* Start Button */}
                <TouchableOpacity
                  style={[
                    styles.startBtn,
                    submitting && styles.startBtnDisabled,
                  ]}
                  onPress={handleStart}
                  disabled={submitting}
                  activeOpacity={0.88}
                >
                  {submitting ? (
                    <View style={styles.startBtnInner}>
                      <ActivityIndicator color="#fff" size="small" />
                      <View style={{ marginLeft: 10 }}>
                        <Text style={styles.startBtnText}>Starting Exam…</Text>
                        <Text style={styles.startBtnSub}>
                          कृपया प्रतीक्षा करें…
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.startBtnInner}>
                      <Text style={{ fontSize: 22 }}>🚀</Text>
                      <View style={{ marginLeft: 10 }}>
                        <Text style={styles.startBtnText}>Start Exam</Text>
                        <Text style={styles.startBtnSub}>
                          परीक्षा शुरू करें
                        </Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f0f4ff" },
  scroll: { padding: 16, paddingBottom: 60 },

  // Blobs
  blob: { position: "absolute", borderRadius: 999 },
  blob1: {
    width: 340,
    height: 340,
    backgroundColor: "#c7d2fe",
    opacity: 0.3,
    top: -120,
    right: -120,
  },
  blob2: {
    width: 260,
    height: 260,
    backgroundColor: "#bbf7d0",
    opacity: 0.25,
    bottom: 80,
    left: -80,
  },

  // Loading
  loadingPage: {
    flex: 1,
    backgroundColor: "#f0f4ff",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    borderWidth: 1,
    borderColor: "#e0e7ff",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e1b4b",
    marginBottom: 4,
  },
  loadingSubtitle: { fontSize: 12, color: "#94a3b8", fontWeight: "500" },
  retryBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 11,
    backgroundColor: "#eef2ff",
    borderRadius: 12,
  },
  retryBtnText: { color: "#4f46e5", fontWeight: "700", fontSize: 14 },

  // Hero
  hero: {
    backgroundColor: "#4f46e5",
    borderRadius: 20,
    padding: 28,
    marginBottom: 16,
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 50,
    marginBottom: 16,
  },
  heroBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#a5f3fc",
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#e0e7ff",
    letterSpacing: 1.2,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    lineHeight: 32,
    marginBottom: 18,
    letterSpacing: -0.5,
  },
  heroChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  heroChip: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  heroChipText: { fontSize: 13, color: "#e0e7ff", fontWeight: "600" },
  monoText: {
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    letterSpacing: 1,
  },

  // Card
  card: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    overflow: "hidden",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  cardHeaderIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  cardHeaderTitle: {
    fontSize: 11.5,
    fontWeight: "800",
    color: "#1e1b4b",
    letterSpacing: 0.08,
  },
  cardHeaderSub: {
    fontSize: 10.5,
    color: "#94a3b8",
    fontWeight: "500",
    marginTop: 1,
  },

  // Instructions
  instrItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  instrIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    flexShrink: 0,
  },
  instrTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 1,
  },
  instrTitleHi: { fontSize: 11.5, fontWeight: "700", marginBottom: 5 },
  instrDesc: { fontSize: 11.5, color: "#475569", lineHeight: 17 },

  // Score row
  scoreItem: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  scoreIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 9.5,
    color: "#94a3b8",
    fontWeight: "700",
    letterSpacing: 0.08,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  scoreVal: { fontSize: 13, fontWeight: "800", color: "#1e293b" },
  scoreValSub: { fontSize: 10, color: "#94a3b8", marginTop: 2 },

  // Form
  formCardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1e1b4b",
    marginBottom: 3,
  },
  formCardSub: { fontSize: 11, color: "#6366f1", fontWeight: "600" },
  formBody: { padding: 20 },
  field: { marginBottom: 18 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#374151",
    letterSpacing: 0.07,
    textTransform: "uppercase",
    marginBottom: 7,
  },
  fieldLabelHi: {
    fontSize: 10.5,
    color: "#94a3b8",
    fontWeight: "500",
    textTransform: "none",
    letterSpacing: 0,
  },
  req: { color: "#6366f1" },
  fieldInput: {
    backgroundColor: "#f8faff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "500",
  },
  fieldHint: { fontSize: 10.5, color: "#94a3b8", marginTop: 5 },
  langSelector: {
    backgroundColor: "#f8faff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  langSelectorText: { fontSize: 14, color: "#1e293b", fontWeight: "500" },
  langArrow: { color: "#6366f1", fontSize: 13 },
  langDropdown: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e7ff",
    borderRadius: 11,
    marginTop: 6,
    overflow: "hidden",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  langOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  langOptionActive: { backgroundColor: "#eef2ff" },
  langOptionText: { fontSize: 14, color: "#334155", fontWeight: "500" },

  // Start button
  startBtn: {
    backgroundColor: "#4f46e5",
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 24,
    marginTop: 8,
    alignItems: "center",
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  startBtnDisabled: { backgroundColor: "#a5b4fc", shadowOpacity: 0.15 },
  startBtnInner: { flexDirection: "row", alignItems: "center" },
  startBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  startBtnSub: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
});
