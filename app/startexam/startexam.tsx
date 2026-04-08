/**
 * app/exam/[code].tsx
 * Complete Exam System — MCQ, Timer, Palette, Submit, Result
 * With Anti-Cheating & Fresh State Reset
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  AppState,
  AppStateStatus,
  BackHandler,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Optional: expo-camera for proctoring ───────────
// Uncomment if you have expo-camera installed:
// import { CameraView, useCameraPermissions } from "expo-camera";

const { width: SCREEN_W } = Dimensions.get("window");
const API_URL = "https://talent-assess.in/api";
const api = axios.create({ baseURL: API_URL, timeout: 12000 });
const pad = (n: number) => String(n).padStart(2, "0");

// ─── Anti-cheat config ───────────────────────────
const MAX_VIOLATIONS = 3; // auto-submit after this many app-switch violations

// ─── Colors ─────────────────────────────────────
const C = {
  bg: "#0f1117",
  surface: "#1a1d27",
  surface2: "#22263a",
  border: "#2e3350",
  accent: "#6366f1",
  accent2: "#818cf8",
  text: "#e2e8f0",
  muted: "#8892a4",
  success: "#22c55e",
  danger: "#ef4444",
  warn: "#f59e0b",
};

// ─── Types ────────────────────────────────────────
interface Question {
  id: string | number;
  question_text?: string;
  question_en?: string;
  question_hi?: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  category?: string;
  [key: string]: any;
}

interface CandidateInfo {
  candidate_name: string;
  father_name: string;
  mobile_number: string;
  language: string;
  exam_code: string;
}

type OptionKey = "a" | "b" | "c" | "d";
const OPTS: OptionKey[] = ["a", "b", "c", "d"];

// ─── Toast ────────────────────────────────────────
let _tid = 0;
function useToast() {
  const [toasts, set] = useState<{ id: number; msg: string; type: string }[]>(
    [],
  );
  const push = useCallback((msg: string, type = "info") => {
    const id = ++_tid;
    set((p) => [...p, { id, msg, type }]);
    setTimeout(() => set((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);
  return { toasts, push };
}

// ─── Option Card ─────────────────────────────────
const OptionCard = React.memo(
  ({
    label,
    text,
    selected,
    onPress,
  }: {
    label: string;
    text: string;
    selected: boolean;
    onPress: () => void;
  }) => {
    const sc = useRef(new Animated.Value(1)).current;
    const press = () => {
      Animated.sequence([
        Animated.timing(sc, {
          toValue: 0.97,
          duration: 70,
          useNativeDriver: true,
        }),
        Animated.spring(sc, { toValue: 1, useNativeDriver: true }),
      ]).start();
      onPress();
    };
    return (
      <Animated.View style={{ transform: [{ scale: sc }] }}>
        <TouchableOpacity
          style={[S.opt, selected && S.optSel]}
          onPress={press}
          activeOpacity={0.85}
        >
          <View style={[S.optBullet, selected && S.optBulletSel]}>
            <Text style={[S.optBulletTxt, selected && S.optBulletTxtSel]}>
              {label}
            </Text>
          </View>
          <Text style={[S.optTxt, selected && S.optTxtSel]}>{text}</Text>
          {selected && (
            <View style={S.optCheck}>
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>
                ✓
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  },
);

// ─── Palette ─────────────────────────────────────
const Palette = React.memo(
  ({
    questions,
    answers,
    current,
    onJump,
  }: {
    questions: Question[];
    answers: Record<string, OptionKey>;
    current: number;
    onJump: (i: number) => void;
  }) => (
    <View style={S.palette}>
      {questions.map((q, i) => {
        const ans = !!answers[String(q.id)];
        const cur = i === current;
        return (
          <TouchableOpacity
            key={String(q.id)}
            style={[S.palDot, ans && S.palDotAns, cur && S.palDotCur]}
            onPress={() => onJump(i)}
          >
            <Text style={[S.palDotTxt, (ans || cur) && { color: "#fff" }]}>
              {i + 1}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  ),
);

// ─── Violation Warning Modal ──────────────────────
const ViolationModal = React.memo(
  ({
    visible,
    count,
    max,
    onDismiss,
  }: {
    visible: boolean;
    count: number;
    max: number;
    onDismiss: () => void;
  }) => (
    <Modal visible={visible} transparent animationType="fade">
      <View style={S.modalOverlay}>
        <View style={[S.modal, { borderColor: C.danger, borderWidth: 2 }]}>
          <View
            style={[S.modalIcon, { backgroundColor: "rgba(239,68,68,0.15)" }]}
          >
            <Text style={{ fontSize: 28 }}>⚠️</Text>
          </View>
          <Text style={[S.modalTitle, { color: C.danger }]}>
            Cheating Detected!
          </Text>
          <Text style={S.modalBody}>
            You left the exam screen.{"\n\n"}
            <Text style={{ color: C.warn, fontWeight: "700" }}>
              Violation {count} of {max}
            </Text>
            {"\n\n"}
            {count >= max
              ? "Your exam will now be auto-submitted."
              : `After ${max - count} more violation${max - count === 1 ? "" : "s"}, your exam will be auto-submitted.`}
          </Text>
          <TouchableOpacity
            style={[
              S.mBtn,
              { backgroundColor: C.danger, flex: 0, paddingHorizontal: 32 },
            ]}
            onPress={onDismiss}
          >
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 14 }}>
              Return to Exam
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  ),
);

// ─────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────
export default function ExamScreen() {
  const { code, lang } = useLocalSearchParams<{
    code: string;
    lang?: string;
  }>();
  const router = useRouter();
  const language = lang || "en";

  // Core state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [candidate, setCandidate] = useState<CandidateInfo | null>(null);
  const [examMeta, setExamMeta] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, OptionKey>>({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showPal, setShowPal] = useState(false);

  // Anti-cheat state
  const [violations, setViolations] = useState(0);
  const [showViolation, setShowViolation] = useState(false);
  const violationsRef = useRef(0);

  // Refs
  const submittedRef = useRef(false);
  const answersRef = useRef<Record<string, OptionKey>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef(Date.now());
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // Animations
  const slideX = useRef(new Animated.Value(0)).current;
  const fadeA = useRef(new Animated.Value(1)).current;
  const progA = useRef(new Animated.Value(0)).current;

  const { toasts, push: toast } = useToast();

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // ── Lock orientation to portrait ─────────────────
  useEffect(() => {
    ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP,
    ).catch(() => {});
    return () => {
      ScreenOrientation.unlockAsync().catch(() => {});
    };
  }, []);

  // ── FRESH STATE: Clear any previous exam data ─────
  // This runs once on mount to ensure a clean start
  useEffect(() => {
    if (!code) return;
    (async () => {
      // Always clear old exam progress for a fresh start
      await AsyncStorage.multiRemove([
        "examAnswers",
        "examCurrentIndex",
        "examStarted",
        "examTimeLeft",
      ]);
    })();
  }, [code]);

  // ── Load exam data ────────────────────────────────
  useEffect(() => {
    if (!code) return;
    (async () => {
      try {
        // Load candidate info and exam meta (these persist, unlike progress)
        const keys = await AsyncStorage.multiGet([
          "candidateInfo",
          "scheduledExamData",
        ]);
        const fromKey = (k: string) => keys.find(([key]) => key === k)?.[1];

        const cand = fromKey("candidateInfo")
          ? JSON.parse(fromKey("candidateInfo")!)
          : null;
        const meta = fromKey("scheduledExamData")
          ? JSON.parse(fromKey("scheduledExamData")!)
          : null;

        if (!cand) {
          toast("Candidate info missing. Please login again.", "error");
          setLoading(false);
          return;
        }

        setCandidate(cand);
        if (meta) setExamMeta(meta);

        // Fetch questions
        const res = await api.get(`/exam/${code}/questions?lang=${language}`);
        const qs: Question[] =
          res.data?.data ?? res.data?.questions ?? res.data ?? [];
        setQuestions(qs);

        // Always start fresh: index=0, answers={}, timer=full
        setCurrent(0);
        setAnswers({});
        answersRef.current = {};

        const durSecs = (meta?.duration_minutes ?? 60) * 60;
        setTimeLeft(durSecs);
        startRef.current = Date.now();

        // Mark exam as started
        await AsyncStorage.setItem("examStarted", "true");

        setLoading(false);
      } catch (e) {
        toast("Failed to load questions.", "error");
        setLoading(false);
      }
    })();
  }, [code]);

  // ── Submit ────────────────────────────────────────
  const submitExam = useCallback(
    async (reason: string) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      if (timerRef.current) clearInterval(timerRef.current);
      setSubmitting(true);

      const timeTaken = Math.floor((Date.now() - startRef.current) / 1000);
      try {
        const res = await api.post(`/exam/${code}/submit`, {
          exam_code: code,
          candidate_name: candidate?.candidate_name,
          father_name: candidate?.father_name,
          mobile_number: candidate?.mobile_number,
          language,
          answers: answersRef.current,
          time_taken: timeTaken,
          reason,
        });
        const r = res.data?.data ?? res.data;
        await AsyncStorage.setItem("examResult", JSON.stringify(r));
        await AsyncStorage.multiRemove([
          "examStarted",
          "examAnswers",
          "examCurrentIndex",
          "examTimeLeft",
        ]);
        setResult(r);
      } catch {
        setResult({
          attempted: Object.keys(answersRef.current).length,
          total: questions.length,
          error: true,
        });
      } finally {
        setSubmitting(false);
        setSubmitted(true);
      }
    },
    [code, candidate, language, questions.length],
  );

  // ── Timer ─────────────────────────────────────────
  useEffect(() => {
    if (loading || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const n = prev - 1;
        if (n <= 0) {
          clearInterval(timerRef.current!);
          submitExam("Time Up");
          return 0;
        }
        return n;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, submitted]);

  // ── ANTI-CHEAT: AppState (background/foreground) ──
  useEffect(() => {
    if (loading || submitted) return;

    const handleAppStateChange = (nextState: AppStateStatus) => {
      const prev = appStateRef.current;
      appStateRef.current = nextState;

      // User switched away from app
      if (
        (prev === "active" && nextState === "background") ||
        (prev === "active" && nextState === "inactive")
      ) {
        if (submittedRef.current) return;

        violationsRef.current += 1;
        const newCount = violationsRef.current;
        setViolations(newCount);
        setShowViolation(true);

        if (newCount >= MAX_VIOLATIONS) {
          // Auto-submit after dismissing the modal
          setTimeout(() => {
            submitExam("Auto-submitted: Cheating detected");
          }, 1500);
        }
      }
    };

    const sub = AppState.addEventListener("change", handleAppStateChange);
    return () => sub.remove();
  }, [loading, submitted, submitExam]);

  // ── ANTI-CHEAT: Hardware back button (Android) ────
  useEffect(() => {
    const h = BackHandler.addEventListener("hardwareBackPress", () => {
      if (submitted) return false;

      // Block back — show alert
      Alert.alert(
        "⚠️ Exam in Progress",
        "You cannot go back during the exam. Exiting will record a violation.",
        [
          { text: "Stay in Exam", style: "cancel" },
          {
            text: "Force Exit",
            style: "destructive",
            onPress: () => {
              submittedRef.current = true;
              submitExam("Force exited");
              router.replace("/(tabs)/home");
            },
          },
        ],
        { cancelable: false },
      );
      return true; // blocks default back
    });
    return () => h.remove();
  }, [submitted, submitExam]);

  // ── Progress animation ────────────────────────────
  useEffect(() => {
    if (!questions.length) return;
    Animated.timing(progA, {
      toValue: ((current + 1) / questions.length) * 100,
      duration: 280,
      useNativeDriver: false,
    }).start();
  }, [current, questions.length]);

  // ── Navigate with slide ───────────────────────────
  const goTo = useCallback(
    (idx: number) => {
      if (idx === current) {
        setShowPal(false);
        return;
      }
      const dir = idx > current ? -1 : 1;
      Animated.parallel([
        Animated.timing(slideX, {
          toValue: dir * SCREEN_W * 0.35,
          duration: 130,
          useNativeDriver: true,
        }),
        Animated.timing(fadeA, {
          toValue: 0,
          duration: 130,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrent(idx);
        slideX.setValue(-dir * SCREEN_W * 0.35);
        Animated.parallel([
          Animated.timing(slideX, {
            toValue: 0,
            duration: 170,
            useNativeDriver: true,
          }),
          Animated.timing(fadeA, {
            toValue: 1,
            duration: 170,
            useNativeDriver: true,
          }),
        ]).start();
      });
      setShowPal(false);
    },
    [current],
  );

  // ── Select/clear answer ───────────────────────────
  const selectAnswer = useCallback((qId: string, opt: OptionKey) => {
    setAnswers((prev) => {
      const next = { ...prev, [qId]: opt };
      answersRef.current = next;
      AsyncStorage.setItem("examAnswers", JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const clearAnswer = useCallback((qId: string) => {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[qId];
      answersRef.current = next;
      AsyncStorage.setItem("examAnswers", JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  // ── Violation dismiss ─────────────────────────────
  const handleViolationDismiss = useCallback(() => {
    setShowViolation(false);
    if (violationsRef.current >= MAX_VIOLATIONS) {
      submitExam("Auto-submitted: Cheating detected");
    }
  }, [submitExam]);

  // ── Helpers ───────────────────────────────────────
  const getQText = (q: Question) =>
    language === "hi" && q.question_hi
      ? q.question_hi
      : (q.question_en ?? q.question_text ?? "");

  const timerColor =
    timeLeft < 300 ? C.danger : timeLeft < 600 ? C.warn : C.success;
  const answered = Object.keys(answers).length;

  const progWidth = useMemo(
    () =>
      progA.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }),
    [progA],
  );

  // ─────────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={S.center}>
        <StatusBar barStyle="light-content" backgroundColor={C.bg} hidden />
        <ActivityIndicator
          size="large"
          color={C.accent}
          style={{ marginBottom: 18 }}
        />
        <Text style={S.loadTitle}>Loading Questions…</Text>
        <Text style={S.loadSub}>प्रश्न लोड हो रहे हैं</Text>
      </View>
    );
  }

  // ─────────────────────────────────────────────────
  // RESULT
  // ─────────────────────────────────────────────────
  if (submitted) {
    const score = result?.score ?? result?.marks ?? null;
    const total = result?.total_marks ?? result?.total ?? questions.length;
    const correct = result?.correct ?? null;
    const wrong = result?.wrong ?? null;
    const att = result?.attempted ?? answered;
    const pct =
      result?.percentage ??
      (score !== null && total ? Math.round((score / total) * 100) : null);
    const passed = pct !== null ? pct >= 40 : null;

    return (
      <View style={S.resRoot}>
        <StatusBar barStyle="dark-content" backgroundColor="#f0f4ff" />
        <ScrollView
          contentContainerStyle={S.resScroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={S.resHeader}>
            <Text style={{ fontSize: 64 }}>
              {result?.error ? "⚠️" : passed ? "🎉" : "📊"}
            </Text>
            <Text style={S.resTitle}>
              {result?.error
                ? "Submitted"
                : passed
                  ? "Excellent!"
                  : "Exam Complete"}
            </Text>
            <Text style={S.resSub}>
              {result?.error
                ? "Result will be available soon"
                : "परीक्षा पूर्ण — Here is your report"}
            </Text>
          </View>

          <View style={S.resScoreCard}>
            <Text
              style={[
                S.resScoreNum,
                {
                  color:
                    passed === null ? C.accent : passed ? "#10b981" : C.danger,
                },
              ]}
            >
              {pct !== null ? `${pct}%` : score !== null ? `${score}` : "—"}
            </Text>
            <Text style={S.resScoreLabel}>
              {pct !== null ? "Percentage" : "Score"}
            </Text>
            {score !== null && total && (
              <Text style={S.resScoreFrac}>
                {score} / {total} marks
              </Text>
            )}
          </View>

          <View style={S.resGrid}>
            {[
              {
                icon: "📝",
                label: "Total",
                val: String(total ?? "—"),
                color: C.accent,
              },
              {
                icon: "✏️",
                label: "Attempted",
                val: String(att),
                color: "#0ea5e9",
              },
              {
                icon: "✅",
                label: "Correct",
                val: String(correct ?? "—"),
                color: "#10b981",
              },
              {
                icon: "❌",
                label: "Wrong",
                val: String(wrong ?? "—"),
                color: C.danger,
              },
            ].map((s, i) => (
              <View key={i} style={S.resStatCard}>
                <Text style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</Text>
                <Text style={[S.resStatVal, { color: s.color }]}>{s.val}</Text>
                <Text style={S.resStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {violations > 0 && (
            <View style={[S.resBadge, S.resBadgeFail, { marginBottom: 12 }]}>
              <Text style={[S.resBadgeTxt, { color: "#b91c1c" }]}>
                ⚠️ {violations} Violation{violations > 1 ? "s" : ""} Recorded
              </Text>
            </View>
          )}

          {candidate && (
            <View style={S.resCand}>
              <Text style={S.resCandName}>👤 {candidate.candidate_name}</Text>
              <Text style={S.resCandSub}>
                {candidate.mobile_number} • Code: {code}
              </Text>
            </View>
          )}

          {passed !== null && (
            <View
              style={[S.resBadge, passed ? S.resBadgePass : S.resBadgeFail]}
            >
              <Text
                style={[
                  S.resBadgeTxt,
                  { color: passed ? "#15803d" : "#b91c1c" },
                ]}
              >
                {passed ? "✅ PASSED" : "❌ FAILED"}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={S.homeBtn}
            onPress={() => router.replace("/(tabs)/home")}
            activeOpacity={0.88}
          >
            <Text style={S.homeBtnTxt}>🏠 Back to Home</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ─────────────────────────────────────────────────
  // EXAM UI
  // ─────────────────────────────────────────────────
  const q = questions[current];
  if (!q)
    return (
      <View style={S.center}>
        <Text style={{ color: C.muted }}>No question found.</Text>
      </View>
    );

  const qId = String(q.id);
  const sel = answers[qId] ?? null;

  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} hidden />

      {/* ── TOP BAR ── */}
      <View style={S.topbar}>
        <View style={S.topLeft}>
          <TouchableOpacity style={S.ham} onPress={() => setShowPal(true)}>
            <Text style={{ color: C.text, fontSize: 18 }}>☰</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={S.topName} numberOfLines={1}>
              {candidate?.candidate_name ?? "—"}
            </Text>
            <Text style={S.topCode}>
              {answered}/{questions.length} answered
            </Text>
          </View>
        </View>

        {/* Violation indicator */}
        {violations > 0 && (
          <View style={S.violBadge}>
            <Text style={S.violTxt}>
              ⚠️ {violations}/{MAX_VIOLATIONS}
            </Text>
          </View>
        )}

        <View style={S.timerWrap}>
          <View style={[S.timerDot, { backgroundColor: timerColor }]} />
          <Text style={[S.timerTxt, { color: timerColor }]}>
            {pad(Math.floor(timeLeft / 60))}:{pad(timeLeft % 60)}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={S.progTrack}>
        <Animated.View style={[S.progFill, { width: progWidth }]} />
      </View>

      {/* ── QUESTION ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={S.qScroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={{ opacity: fadeA, transform: [{ translateX: slideX }] }}
        >
          {/* Counter + category */}
          <View style={S.qMeta}>
            <View style={S.qBadge}>
              <Text style={S.qBadgeTxt}>
                Q{current + 1}
                <Text style={{ color: C.muted, fontWeight: "500" }}>
                  {" "}
                  / {questions.length}
                </Text>
              </Text>
            </View>
            {q.category && (
              <View style={S.catTag}>
                <Text style={S.catTxt}>{q.category}</Text>
              </View>
            )}
            {sel && (
              <View style={S.answBadge}>
                <Text style={S.answBadgeTxt}>✓ Answered</Text>
              </View>
            )}
          </View>

          {/* Question card */}
          <View style={S.qCard}>
            <Text style={S.qTxt}>{getQText(q)}</Text>
          </View>

          {/* Options */}
          <View style={{ gap: 10 }}>
            {OPTS.map((opt) => {
              const text = q[`option_${opt}`];
              if (!text) return null;
              return (
                <OptionCard
                  key={opt}
                  label={opt.toUpperCase()}
                  text={text}
                  selected={sel === opt}
                  onPress={() => selectAnswer(qId, opt)}
                />
              );
            })}
          </View>

          {sel && (
            <TouchableOpacity
              style={S.clearBtn}
              onPress={() => clearAnswer(qId)}
            >
              <Text style={S.clearTxt}>✕ Clear Selection</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </ScrollView>

      {/* ── BOTTOM NAV ── */}
      <View style={S.bottomNav}>
        <TouchableOpacity
          style={[S.navBtn, current === 0 && S.navBtnDis]}
          onPress={() => current > 0 && goTo(current - 1)}
          disabled={current === 0}
        >
          <Text
            style={[
              S.navBtnTxt,
              current === 0 && { color: C.muted, opacity: 0.4 },
            ]}
          >
            ← Prev
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={S.submitNavBtn}
          onPress={() => setShowSubmit(true)}
        >
          <Text style={S.submitNavTxt}>Submit ✓</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            S.navBtn,
            S.navBtnPri,
            current >= questions.length - 1 && S.navBtnDis,
          ]}
          onPress={() => current < questions.length - 1 && goTo(current + 1)}
          disabled={current >= questions.length - 1}
        >
          <Text
            style={[
              S.navBtnTxt,
              { color: "#fff" },
              current >= questions.length - 1 && { opacity: 0.4 },
            ]}
          >
            Next →
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── PALETTE DRAWER ── */}
      <Modal
        visible={showPal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPal(false)}
      >
        <TouchableOpacity
          style={S.drawerOverlay}
          activeOpacity={1}
          onPress={() => setShowPal(false)}
        >
          <TouchableOpacity activeOpacity={1} style={S.drawer}>
            <View style={S.drawerHandle} />
            <Text style={S.drawerTitle}>Question Palette</Text>

            <View style={S.palStats}>
              {[
                { val: answered, label: "Answered", color: C.success },
                {
                  val: questions.length - answered,
                  label: "Remaining",
                  color: C.warn,
                },
                {
                  val: `${pad(Math.floor(timeLeft / 60))}:${pad(timeLeft % 60)}`,
                  label: "Time",
                  color: timerColor,
                },
              ].map((s, i) => (
                <View
                  key={i}
                  style={[
                    S.palStat,
                    i < 2 && {
                      borderRightWidth: 1,
                      borderRightColor: C.border,
                    },
                  ]}
                >
                  <Text style={[S.palStatVal, { color: s.color }]}>
                    {s.val}
                  </Text>
                  <Text style={S.palStatLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 260 }}
            >
              <Palette
                questions={questions}
                answers={answers}
                current={current}
                onJump={goTo}
              />
            </ScrollView>

            <View style={S.palLegend}>
              {[
                ["#4f46e5", "Current"],
                ["#22c55e", "Answered"],
                ["#22263a", "Skipped"],
              ].map(([c, l], i) => (
                <View key={i} style={S.legItem}>
                  <View style={[S.legDot, { backgroundColor: c }]} />
                  <Text style={S.legTxt}>{l}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={S.drawerSubmit}
              onPress={() => {
                setShowPal(false);
                setShowSubmit(true);
              }}
            >
              <Text style={S.drawerSubmitTxt}>✓ Submit Exam</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ── SUBMIT MODAL ── */}
      <Modal
        visible={showSubmit}
        transparent
        animationType="fade"
        onRequestClose={() => !submitting && setShowSubmit(false)}
      >
        <View style={S.modalOverlay}>
          <View style={S.modal}>
            <View
              style={[S.modalIcon, { backgroundColor: "rgba(34,197,94,0.15)" }]}
            >
              <Text style={{ fontSize: 24 }}>📋</Text>
            </View>
            <Text style={S.modalTitle}>Submit Exam?</Text>

            <View style={S.modalStats}>
              {[
                { val: answered, label: "Answered", color: C.success },
                {
                  val: questions.length - answered,
                  label: "Unanswered",
                  color: C.warn,
                },
                {
                  val: `${pad(Math.floor(timeLeft / 60))}:${pad(timeLeft % 60)}`,
                  label: "Time Left",
                  color: timerColor,
                },
              ].map((s, i) => (
                <View
                  key={i}
                  style={[
                    S.mStat,
                    i > 0 && { borderLeftWidth: 1, borderLeftColor: C.border },
                  ]}
                >
                  <Text style={[S.mStatVal, { color: s.color }]}>{s.val}</Text>
                  <Text style={S.mStatLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            <Text style={S.modalBody}>
              You've answered {answered} of {questions.length} questions.{"\n"}
              This cannot be undone.
            </Text>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                style={[S.mBtn, S.mBtnGhost]}
                onPress={() => setShowSubmit(false)}
                disabled={submitting}
              >
                <Text
                  style={{ color: C.muted, fontWeight: "700", fontSize: 14 }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[S.mBtn, S.mBtnSuccess, submitting && { opacity: 0.7 }]}
                onPress={() => {
                  setShowSubmit(false);
                  submitExam("Student Submitted");
                }}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text
                    style={{ color: "#fff", fontWeight: "800", fontSize: 14 }}
                  >
                    Confirm Submit
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── VIOLATION WARNING MODAL ── */}
      <ViolationModal
        visible={showViolation}
        count={violations}
        max={MAX_VIOLATIONS}
        onDismiss={handleViolationDismiss}
      />

      {/* ── TOASTS ── */}
      <View style={S.toastStack} pointerEvents="none">
        {toasts.map((t) => (
          <View
            key={t.id}
            style={[
              S.toast,
              t.type === "error"
                ? S.toastErr
                : t.type === "success"
                  ? S.toastOk
                  : S.toastInfo,
            ]}
          >
            <Text
              style={[
                S.toastTxt,
                {
                  color:
                    t.type === "error"
                      ? "#f87171"
                      : t.type === "success"
                        ? "#4ade80"
                        : "#818cf8",
                },
              ]}
            >
              {t.msg}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────
const S = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  loadTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
    marginBottom: 4,
  },
  loadSub: { fontSize: 12, color: C.muted },

  root: { flex: 1, backgroundColor: C.bg },

  topbar: {
    backgroundColor: C.surface,
    paddingTop: Platform.OS === "ios" ? 52 : 14,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  topLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  ham: {
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  topName: { fontSize: 13, fontWeight: "700", color: C.text },
  topCode: { fontSize: 10, color: C.muted, marginTop: 1 },

  violBadge: {
    backgroundColor: "rgba(239,68,68,0.15)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.4)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
  },
  violTxt: { fontSize: 11, color: C.danger, fontWeight: "700" },

  timerWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 50,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  timerDot: { width: 7, height: 7, borderRadius: 4 },
  timerTxt: {
    fontWeight: "800",
    fontSize: 15,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },

  progTrack: { height: 3, backgroundColor: C.surface2 },
  progFill: { height: "100%", backgroundColor: C.accent },

  qScroll: { padding: 18, paddingBottom: 110 },
  qMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  qBadge: {
    backgroundColor: "rgba(99,102,241,0.15)",
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.3)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  qBadgeTxt: { fontSize: 13, fontWeight: "800", color: C.accent2 },
  catTag: {
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flex: 1,
  },
  catTxt: { fontSize: 10, color: C.muted },
  answBadge: {
    backgroundColor: "rgba(34,197,94,0.15)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.35)",
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  answBadgeTxt: { fontSize: 11, color: C.success, fontWeight: "700" },
  qCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
  },
  qTxt: { fontSize: 16, fontWeight: "500", color: C.text, lineHeight: 26 },

  opt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    backgroundColor: C.surface2,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 13,
    padding: 15,
    marginBottom: 10,
  },
  optSel: {
    borderColor: C.accent,
    backgroundColor: "#ffffff",
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  optBullet: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  optBulletSel: { backgroundColor: C.accent, borderColor: C.accent },
  optBulletTxt: {
    fontSize: 12,
    fontWeight: "800",
    color: C.muted,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },
  optBulletTxtSel: { color: "#fff" },
  optTxt: { flex: 1, fontSize: 14, color: C.text, lineHeight: 20 },
  optTxtSel: { color: "#111827", fontWeight: "600" },
  optCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  clearBtn: {
    alignSelf: "center",
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  clearTxt: { fontSize: 13, color: C.muted },

  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    paddingBottom: Platform.OS === "ios" ? 30 : 12,
    gap: 8,
  },
  navBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
  },
  navBtnPri: { backgroundColor: C.accent, borderColor: C.accent },
  navBtnDis: { opacity: 0.4 },
  navBtnTxt: { fontSize: 14, fontWeight: "700", color: C.muted },
  submitNavBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "rgba(34,197,94,0.15)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.35)",
  },
  submitNavTxt: { fontSize: 14, fontWeight: "800", color: "#4ade80" },

  drawerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  drawer: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 38 : 20,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  drawerHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: "center",
    marginBottom: 18,
  },
  drawerTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: C.text,
    marginBottom: 16,
    letterSpacing: 0.04,
  },
  palStats: {
    flexDirection: "row",
    backgroundColor: C.surface2,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  palStat: { flex: 1, paddingVertical: 13, alignItems: "center" },
  palStatVal: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 3,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },
  palStatLabel: {
    fontSize: 9.5,
    color: C.muted,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  palette: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingVertical: 4,
  },
  palDot: {
    width: 38,
    height: 38,
    borderRadius: 9,
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  palDotAns: { backgroundColor: "rgba(34,197,94,0.2)", borderColor: C.success },
  palDotCur: { backgroundColor: C.accent, borderColor: "#4338ca" },
  palDotTxt: { fontSize: 12, fontWeight: "700", color: C.muted },
  palLegend: { flexDirection: "row", gap: 14, marginTop: 14, marginBottom: 16 },
  legItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legDot: { width: 10, height: 10, borderRadius: 3 },
  legTxt: { fontSize: 11, color: C.muted },
  drawerSubmit: {
    backgroundColor: "rgba(34,197,94,0.15)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.4)",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  drawerSubmitTxt: { color: "#4ade80", fontWeight: "800", fontSize: 15 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    padding: 28,
    width: "100%",
    maxWidth: 380,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    elevation: 20,
  },
  modalIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: C.text,
    marginBottom: 16,
  },
  modalStats: {
    flexDirection: "row",
    backgroundColor: C.surface2,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  mStat: { flex: 1, alignItems: "center", paddingVertical: 4 },
  mStatVal: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 3,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },
  mStatLabel: {
    fontSize: 10,
    color: C.muted,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  modalBody: { fontSize: 13, color: C.muted, lineHeight: 20, marginBottom: 22 },
  mBtn: {
    flex: 1,
    borderRadius: 11,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  mBtnGhost: {
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
  },
  mBtnSuccess: {
    backgroundColor: "#16a34a",
    shadowColor: C.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },

  toastStack: {
    position: "absolute",
    top: Platform.OS === "ios" ? 108 : 76,
    right: 14,
    gap: 8,
  },
  toast: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    maxWidth: 280,
  },
  toastErr: {
    backgroundColor: "rgba(239,68,68,0.15)",
    borderColor: "rgba(239,68,68,0.3)",
  },
  toastOk: {
    backgroundColor: "rgba(34,197,94,0.15)",
    borderColor: "rgba(34,197,94,0.3)",
  },
  toastInfo: {
    backgroundColor: "rgba(99,102,241,0.15)",
    borderColor: "rgba(99,102,241,0.3)",
  },
  toastTxt: { fontSize: 13, fontWeight: "600" },

  resRoot: { flex: 1, backgroundColor: "#f0f4ff" },
  resScroll: { flexGrow: 1, padding: 20, paddingBottom: 50 },
  resHeader: { alignItems: "center", paddingVertical: 28, gap: 8 },
  resTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1e1b4b",
    letterSpacing: -0.5,
  },
  resSub: { fontSize: 13, color: "#94a3b8", textAlign: "center" },
  resScoreCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e7ff",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  resScoreNum: {
    fontSize: 58,
    fontWeight: "800",
    letterSpacing: -2,
    marginBottom: 4,
  },
  resScoreLabel: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.08,
  },
  resScoreFrac: { fontSize: 14, color: "#94a3b8", marginTop: 6 },
  resGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  resStatCard: {
    flex: 1,
    minWidth: "44%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e7ff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  resStatVal: { fontSize: 26, fontWeight: "800", marginBottom: 4 },
  resStatLabel: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  resCand: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e7ff",
  },
  resCandName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 4,
  },
  resCandSub: { fontSize: 12, color: "#94a3b8" },
  resBadge: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
  },
  resBadgePass: { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" },
  resBadgeFail: { backgroundColor: "#fef2f2", borderColor: "#fecaca" },
  resBadgeTxt: { fontSize: 15, fontWeight: "800", letterSpacing: 0.3 },
  homeBtn: {
    backgroundColor: "#4f46e5",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 7,
  },
  homeBtnTxt: { color: "#fff", fontSize: 15, fontWeight: "800" },
});
