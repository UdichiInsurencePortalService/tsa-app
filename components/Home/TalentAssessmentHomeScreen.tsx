import React, { useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

const COMPANY_SIZES = [
  "1–10 employees",
  "11–50 employees",
  "51–200 employees",
  "201–500 employees",
  "500+ employees",
];

const StatsItem = ({ value, label }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const InputField = ({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  required,
}) => (
  <View style={styles.fieldWrapper}>
    <Text style={styles.fieldLabel}>
      {label}
      {required && <Text style={styles.required}> *</Text>}
    </Text>
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType || "default"}
      autoCapitalize="none"
    />
  </View>
);

export default function HomeScreen() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    workEmail: "",
    companyName: "",
    phone: "",
    companySize: "",
  });
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSelect = (size) => {
    setForm({ ...form, companySize: size });
    setDropdownVisible(false);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Section ── */}
        <View style={styles.hero}>
          {/* Background accent blobs */}
          <View style={styles.blobTop} />
          <View style={styles.blobBottom} />

          {/* Badge */}
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>
              AI-Powered Pre-Employment Testing
            </Text>
          </View>

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Text style={styles.headline}>
              Hire Smarter.{"\n"}
              Assess Talent{"\n"}
              <Text style={styles.headlineAccent}>with Confidence.</Text>
            </Text>
            <Text style={styles.subtext}>
              Help companies evaluate candidates efficiently with 70,000+
              validated assessments. Reduce bias and make data-driven decisions
              that drive results.
            </Text>
          </Animated.View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <StatsItem value="500+" label="Companies" />
            <View style={styles.statDivider} />
            <StatsItem value="70K+" label="Questions" />
            <View style={styles.statDivider} />
            <StatsItem value="95%" label="Satisfaction" />
          </View>
        </View>

        {/* ── Form Card ── */}
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Request a Demo</Text>
            <Text style={styles.cardSubtitle}>
              See how Talent & Skill Assessment transforms your hiring in 30
              minutes.
            </Text>

            <View style={styles.nameRow}>
              {/* First Name */}
              <View style={[styles.fieldWrapper, styles.halfField]}>
                <Text style={styles.fieldLabel}>
                  First Name<Text style={styles.required}> *</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="John"
                  placeholderTextColor="#9CA3AF"
                  value={form.firstName}
                  onChangeText={(v) => setForm({ ...form, firstName: v })}
                />
              </View>
              {/* Last Name */}
              <View style={[styles.fieldWrapper, styles.halfField]}>
                <Text style={styles.fieldLabel}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Doe"
                  placeholderTextColor="#9CA3AF"
                  value={form.lastName}
                  onChangeText={(v) => setForm({ ...form, lastName: v })}
                />
              </View>
            </View>

            <InputField
              label="Work Email"
              placeholder="john@company.com"
              value={form.workEmail}
              onChangeText={(v) => setForm({ ...form, workEmail: v })}
              keyboardType="email-address"
              required
            />
            <InputField
              label="Company Name"
              placeholder="Acme Corp"
              value={form.companyName}
              onChangeText={(v) => setForm({ ...form, companyName: v })}
              required
            />
            <InputField
              label="Phone Number"
              placeholder="+1 (555) 000-0000"
              value={form.phone}
              onChangeText={(v) => setForm({ ...form, phone: v })}
              keyboardType="phone-pad"
            />

            {/* Company Size Dropdown */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>Company Size</Text>
              <TouchableOpacity
                style={[styles.input, styles.dropdown]}
                onPress={() => setDropdownVisible(true)}
                activeOpacity={0.7}
              >
                <Text
                  style={
                    form.companySize
                      ? styles.dropdownSelected
                      : styles.dropdownPlaceholder
                  }
                >
                  {form.companySize || "Select company size"}
                </Text>
                <Text style={styles.dropdownArrow}>▾</Text>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.cta, submitted && styles.ctaSuccess]}
              onPress={handleSubmit}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaText}>
                {submitted ? "✓ Request Sent!" : "Request My Demo"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              No credit card required · Free 30-min demo
            </Text>
          </View>
        </View>

        {/* ── Trust Strip ── */}
        <View style={styles.trustStrip}>
          <Text style={styles.trustText}>🔒 Enterprise-grade security</Text>
          <Text style={styles.trustDot}>·</Text>
          <Text style={styles.trustText}>SOC 2 Compliant</Text>
          <Text style={styles.trustDot}>·</Text>
          <Text style={styles.trustText}>GDPR Ready</Text>
        </View>
      </ScrollView>

      {/* ── Dropdown Modal ── */}
      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Company Size</Text>
            {COMPANY_SIZES.map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.modalOption,
                  form.companySize === size && styles.modalOptionSelected,
                ]}
                onPress={() => handleSelect(size)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    form.companySize === size && styles.modalOptionTextSelected,
                  ]}
                >
                  {size}
                </Text>
                {form.companySize === size && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ─────────────────────────────────────────
const BLUE = "#2563EB";
const BLUE_DARK = "#1E3A8A";
const BLUE_LIGHT = "#EFF6FF";
const ACCENT = "#34D399";

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#F8FAFC" },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 48 },

  // ── Hero ──
  hero: {
    backgroundColor: BLUE_DARK,
    paddingTop: 56,
    paddingBottom: 48,
    paddingHorizontal: 24,
    overflow: "hidden",
  },
  blobTop: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(37,99,235,0.35)",
  },
  blobBottom: {
    position: "absolute",
    bottom: -40,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(52,211,153,0.12)",
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: ACCENT,
    marginRight: 8,
  },
  badgeText: {
    color: "#CBD5E1",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  headline: {
    fontSize: 34,
    fontWeight: "800",
    color: "#FFFFFF",
    lineHeight: 42,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  headlineAccent: {
    color: ACCENT,
  },
  subtext: {
    fontSize: 15,
    color: "#94A3B8",
    lineHeight: 23,
    marginBottom: 32,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 22, fontWeight: "800", color: "#FFFFFF" },
  statLabel: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 3,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  // ── Card ──
  cardContainer: {
    paddingHorizontal: 16,
    marginTop: -20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#1E3A8A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 13.5,
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 24,
  },

  nameRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 0,
  },
  halfField: { flex: 1 },

  fieldWrapper: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  required: { color: BLUE },

  input: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#FAFAFA",
  },

  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownPlaceholder: { color: "#9CA3AF", fontSize: 14 },
  dropdownSelected: { color: "#111827", fontSize: 14, fontWeight: "500" },
  dropdownArrow: { color: "#6B7280", fontSize: 16 },

  cta: {
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaSuccess: { backgroundColor: "#059669" },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  disclaimer: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 12,
  },

  // ── Trust ──
  trustStrip: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 8,
    flexWrap: "wrap",
  },
  trustText: { fontSize: 12, color: "#94A3B8", fontWeight: "500" },
  trustDot: { color: "#CBD5E1", fontSize: 14 },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: "#F8FAFC",
  },
  modalOptionSelected: {
    backgroundColor: BLUE_LIGHT,
    borderWidth: 1.5,
    borderColor: BLUE,
  },
  modalOptionText: { fontSize: 14.5, color: "#374151", fontWeight: "500" },
  modalOptionTextSelected: { color: BLUE, fontWeight: "700" },
  checkmark: { color: BLUE, fontWeight: "800", fontSize: 15 },
});
