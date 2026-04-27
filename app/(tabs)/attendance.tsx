/**
 * attendance.tsx — Student Attendance Registration Screen
 *
 * Install dependencies before running:
 *   npx expo install expo-location expo-image-picker
 */

import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  examCode: string;
  institutionName: string;
  fullName: string;
  fatherName: string;
  mobileNumber: string;
  aadharNumber: string;
}

interface FormErrors {
  examCode?: string;
  institutionName?: string;
  fullName?: string;
  fatherName?: string;
  mobileNumber?: string;
  aadharNumber?: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
}

// ─── Theme ────────────────────────────────────────────────────────────────────

const COLORS = {
  primary: "#2563EB",
  primaryLight: "#EFF6FF",
  primaryDark: "#1D4ED8",
  accent: "#3B82F6",
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
  bg: "#F0F4F8",
  card: "#FFFFFF",
  border: "#E2E8F0",
  borderFocus: "#2563EB",
  text: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  disabled: "#CBD5E1",
  shadow: "rgba(37, 99, 235, 0.12)",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  keyboardType?: "default" | "numeric" | "phone-pad" | "number-pad";
  maxLength?: number;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  keyboardType = "default",
  maxLength,
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          focused && styles.inputFocused,
          error ? styles.inputError : null,
        ]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoCapitalize={keyboardType === "default" ? "words" : "none"}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

interface SectionCardProps {
  title: string;
  icon: string;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, icon, children }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardIcon}>{icon}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const AttendanceScreen: React.FC = () => {
  const [form, setForm] = useState<FormData>({
    examCode: "",
    institutionName: "",
    fullName: "",
    fatherName: "",
    mobileNumber: "",
    aadharNumber: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const updateField = (key: keyof FormData) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  // ── Location ───────────────────────────────────────────────────────────────

  const handleEnableLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError(
          "Location permission denied. Please enable it in Settings.",
        );
        setLocationLoading(false);
        return;
      }
      const coords = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation({
        latitude: coords.coords.latitude,
        longitude: coords.coords.longitude,
      });
    } catch {
      setLocationError("Unable to fetch location. Please try again.");
    } finally {
      setLocationLoading(false);
    }
  };

  // ── Camera ─────────────────────────────────────────────────────────────────

  const handleOpenCamera = async () => {
    setCameraLoading(true);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Camera access is needed to capture your photo.",
        );
        setCameraLoading(false);
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
        allowsEditing: true,
        aspect: [3, 4],
      });
      if (!result.canceled && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Error", "Failed to open camera. Please try again.");
    } finally {
      setCameraLoading(false);
    }
  };

  const handleRetakePhoto = () => {
    setPhotoUri(null);
    handleOpenCamera();
  };

  // ── Validation ─────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.examCode.trim()) newErrors.examCode = "Exam code is required.";
    if (!form.institutionName.trim())
      newErrors.institutionName = "Institution name is required.";
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required.";
    if (!form.fatherName.trim())
      newErrors.fatherName = "Father's name is required.";
    if (!form.mobileNumber.trim() || form.mobileNumber.length < 10)
      newErrors.mobileNumber = "Enter a valid 10-digit mobile number.";
    if (!form.aadharNumber.trim() || form.aadharNumber.length < 12)
      newErrors.aadharNumber = "Enter a valid 12-digit Aadhar number.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isSubmitReady =
    form.examCode &&
    form.institutionName &&
    form.fullName &&
    form.fatherName &&
    form.mobileNumber.length === 10 &&
    form.aadharNumber.length === 12 &&
    location !== null &&
    photoUri !== null;

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!location) {
      Alert.alert(
        "Location Required",
        "Please enable live location before submitting.",
      );
      return;
    }
    if (!photoUri) {
      Alert.alert(
        "Photo Required",
        "Please capture your photo before submitting.",
      );
      return;
    }

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200)); // Simulate network call

    const now = new Date();
    const attendanceData = {
      examCode: form.examCode,
      institutionName: form.institutionName,
      fullName: form.fullName,
      fatherName: form.fatherName,
      mobileNumber: form.mobileNumber,
      aadharNumber: form.aadharNumber,
      date: now.toLocaleDateString("en-IN"),
      time: now.toLocaleTimeString("en-IN"),
      latitude: location.latitude,
      longitude: location.longitude,
      photoUri,
    };

    console.log(
      "✅ Attendance Submitted:",
      JSON.stringify(attendanceData, null, 2),
    );

    setSubmitting(false);
    Alert.alert(
      "✅ Attendance Submitted",
      `${form.fullName}'s attendance has been recorded successfully.\n\n📅 ${attendanceData.date}  🕐 ${attendanceData.time}`,
      [
        {
          text: "OK",
          onPress: () => {
            setForm({
              examCode: "",
              institutionName: "",
              fullName: "",
              fatherName: "",
              mobileNumber: "",
              aadharNumber: "",
            });
            setLocation(null);
            setPhotoUri(null);
            setErrors({});
          },
        },
      ],
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>📋</Text>
        <Text style={styles.headerTitle}>Attendance Registration</Text>
        <Text style={styles.headerSubtitle}>
          Fill in all details to mark your attendance
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Exam Details ── */}
        <SectionCard title="Exam Details" icon="🏫">
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <InputField
                label="Exam Code"
                placeholder="e.g. UPSC-2024"
                value={form.examCode}
                onChangeText={updateField("examCode")}
                error={errors.examCode}
              />
            </View>
            <View style={styles.rowSpacer} />
            <View style={{ flex: 1 }}>
              <InputField
                label="Institution Name"
                placeholder="Enter institution"
                value={form.institutionName}
                onChangeText={updateField("institutionName")}
                error={errors.institutionName}
              />
            </View>
          </View>
        </SectionCard>

        {/* ── Candidate Details ── */}
        <SectionCard title="Candidate Details" icon="👤">
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <InputField
                label="Full Name"
                placeholder="Enter full name"
                value={form.fullName}
                onChangeText={updateField("fullName")}
                error={errors.fullName}
              />
            </View>
            <View style={styles.rowSpacer} />
            <View style={{ flex: 1 }}>
              <InputField
                label="Father's Name"
                placeholder="Enter father's name"
                value={form.fatherName}
                onChangeText={updateField("fatherName")}
                error={errors.fatherName}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <InputField
                label="Mobile Number"
                placeholder="10-digit mobile"
                value={form.mobileNumber}
                onChangeText={updateField("mobileNumber")}
                error={errors.mobileNumber}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
            <View style={styles.rowSpacer} />
            <View style={{ flex: 1 }}>
              <InputField
                label="Aadhar Number"
                placeholder="12-digit Aadhar"
                value={form.aadharNumber}
                onChangeText={updateField("aadharNumber")}
                error={errors.aadharNumber}
                keyboardType="number-pad"
                maxLength={12}
              />
            </View>
          </View>
        </SectionCard>

        {/* ── Location ── */}
        <SectionCard title="Live Location" icon="📍">
          {location ? (
            <View style={styles.locationResult}>
              <View style={styles.locationBadge}>
                <Text style={styles.locationBadgeText}>
                  ✅ Location Captured
                </Text>
              </View>
              <View style={styles.locationCoords}>
                <View style={styles.coordRow}>
                  <Text style={styles.coordLabel}>Latitude</Text>
                  <Text style={styles.coordValue}>
                    {location.latitude.toFixed(6)}°
                  </Text>
                </View>
                <View style={styles.coordDivider} />
                <View style={styles.coordRow}>
                  <Text style={styles.coordLabel}>Longitude</Text>
                  <Text style={styles.coordValue}>
                    {location.longitude.toFixed(6)}°
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.outlineButton}
                onPress={handleEnableLocation}
                activeOpacity={0.75}
              >
                <Text style={styles.outlineButtonText}>
                  🔄 Refresh Location
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {locationError ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>⚠️ {locationError}</Text>
                </View>
              ) : null}
              <TouchableOpacity
                style={styles.outlineButton}
                onPress={handleEnableLocation}
                disabled={locationLoading}
                activeOpacity={0.75}
              >
                {locationLoading ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Text style={styles.outlineButtonText}>
                    📍 Enable Live Location
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </SectionCard>

        {/* ── Camera ── */}
        <SectionCard title="Photo Capture" icon="📸">
          {photoUri ? (
            <View style={styles.photoContainer}>
              <Image
                source={{ uri: photoUri }}
                style={styles.photoPreview}
                resizeMode="cover"
              />
              <View style={styles.photoBadge}>
                <Text style={styles.photoBadgeText}>✅ Photo Captured</Text>
              </View>
              <TouchableOpacity
                style={styles.outlineButton}
                onPress={handleRetakePhoto}
                activeOpacity={0.75}
              >
                <Text style={styles.outlineButtonText}>🔄 Retake Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={handleOpenCamera}
              disabled={cameraLoading}
              activeOpacity={0.75}
            >
              {cameraLoading ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <>
                  <Text style={styles.cameraButtonIcon}>📷</Text>
                  <Text style={styles.cameraButtonText}>Open Camera</Text>
                  <Text style={styles.cameraButtonHint}>
                    Tap to capture your photo
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </SectionCard>

        {/* ── Checklist ── */}
        <View style={styles.checklistCard}>
          <Text style={styles.checklistTitle}>Submission Checklist</Text>
          {[
            {
              label: "All fields completed",
              done: !!(
                form.examCode &&
                form.institutionName &&
                form.fullName &&
                form.fatherName &&
                form.mobileNumber.length === 10 &&
                form.aadharNumber.length === 12
              ),
            },
            { label: "Live location captured", done: !!location },
            { label: "Photo captured", done: !!photoUri },
          ].map((item, idx) => (
            <View key={idx} style={styles.checklistRow}>
              <Text
                style={[
                  styles.checklistDot,
                  item.done && styles.checklistDotDone,
                ]}
              >
                {item.done ? "✅" : "○"}
              </Text>
              <Text
                style={[
                  styles.checklistLabel,
                  item.done && styles.checklistLabelDone,
                ]}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Submit ── */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            !isSubmitReady && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!isSubmitReady || submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.submitButtonIcon}>🎓</Text>
              <Text style={styles.submitButtonText}>Submit Attendance</Text>
            </>
          )}
        </TouchableOpacity>

        {!isSubmitReady && (
          <Text style={styles.submitHint}>
            Complete all fields, location, and photo to enable submission.
          </Text>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Layout
  scroll: { backgroundColor: COLORS.bg, flex: 1 },
  scrollContent: { padding: 16, paddingTop: 20 },

  // Header
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  headerEmoji: { fontSize: 32, marginBottom: 6 },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginTop: 4,
    textAlign: "center",
  },

  // Card
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  cardIcon: { fontSize: 18, marginRight: 8 },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: 0.2,
  },

  // Row
  row: { flexDirection: "row", gap: 0 },
  rowSpacer: { width: 12 },

  // Field
  fieldContainer: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  input: {
    height: 46,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: "#FAFCFF",
  },
  inputFocused: {
    borderColor: COLORS.borderFocus,
    backgroundColor: COLORS.primaryLight,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  inputError: { borderColor: COLORS.error },
  errorText: {
    fontSize: 11,
    color: COLORS.error,
    marginTop: 4,
    fontWeight: "500",
  },

  // Location
  locationResult: { gap: 12 },
  locationBadge: {
    backgroundColor: "#ECFDF5",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#6EE7B7",
  },
  locationBadgeText: { fontSize: 13, color: COLORS.success, fontWeight: "600" },
  locationCoords: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
  },
  coordRow: { flex: 1, alignItems: "center" },
  coordLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  coordValue: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: "700",
    marginTop: 2,
  },
  coordDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
  },
  errorBanner: {
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  errorBannerText: { fontSize: 13, color: COLORS.error, fontWeight: "500" },

  // Buttons
  outlineButton: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 46,
  },
  outlineButtonText: { color: COLORS.primary, fontSize: 14, fontWeight: "600" },

  // Camera
  cameraButton: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    borderRadius: 14,
    paddingVertical: 28,
    alignItems: "center",
    backgroundColor: "#FAFCFF",
  },
  cameraButtonIcon: { fontSize: 36, marginBottom: 8 },
  cameraButtonText: { fontSize: 15, color: COLORS.primary, fontWeight: "700" },
  cameraButtonHint: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },

  photoContainer: { gap: 12, alignItems: "center" },
  photoPreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: COLORS.bg,
  },
  photoBadge: {
    backgroundColor: "#ECFDF5",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#6EE7B7",
  },
  photoBadgeText: { fontSize: 13, color: COLORS.success, fontWeight: "600" },

  // Checklist
  checklistCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  checklistTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  checklistRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  checklistDot: { fontSize: 16, marginRight: 10, color: COLORS.textMuted },
  checklistDotDone: { color: COLORS.success },
  checklistLabel: { fontSize: 14, color: COLORS.textMuted },
  checklistLabelDone: { color: COLORS.text, fontWeight: "500" },

  // Submit
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonIcon: { fontSize: 18 },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  submitHint: {
    textAlign: "center",
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 10,
  },
});

export default AttendanceScreen;
