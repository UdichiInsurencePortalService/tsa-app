import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  LayoutAnimation,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface SupportOption {
  id: string;
  title: string;
  description: string;
  contact: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  onPress: () => void;
}
interface InfoPoint {
  id: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
}
interface FaqItem {
  id: string;
  question: string;
  answer: string;
}
interface HourItem {
  day: string;
  time: string;
  open: boolean;
}

const supportHours: HourItem[] = [
  { day: "Mon – Fri", time: "8am – 6pm", open: true },
  { day: "Saturday", time: "9am – 2pm", open: true },
  { day: "Sunday", time: "Closed", open: false },
  { day: "Public holiday", time: "Closed", open: false },
];

const infoPoints: InfoPoint[] = [
  {
    id: "response",
    iconName: "time-outline",
    iconColor: "#4f6ef7",
    iconBg: "#eef3ff",
    title: "Average response time",
    subtitle: "WhatsApp & Phone: under 5 min · Email: within 24 hours",
  },
  {
    id: "topics",
    iconName: "checkmark-circle-outline",
    iconColor: "#14a85a",
    iconBg: "#f0fdf4",
    title: "What we can help with",
    subtitle:
      "Appointments, billing, test results, queries, and general health enquiries",
  },
  {
    id: "emergency",
    iconName: "warning-outline",
    iconColor: "#d97706",
    iconBg: "#fff8e6",
    title: "Emergency",
    subtitle:
      "For life-threatening emergencies please dial 112 or visit your nearest A&E",
  },
];

const faqItems: FaqItem[] = [
  {
    id: "faq1",
    question: "How do I book an appointment?",
    answer:
      "You can book via WhatsApp, call our phone line, or email us with your preferred date and time. Confirmation is sent within 1 hour.",
  },
  {
    id: "faq2",
    question: "Can I reschedule or cancel?",
    answer:
      "Yes. Please notify us at least 24 hours in advance via any support channel to reschedule or cancel without a fee.",
  },
  {
    id: "faq3",
    question: "How do I get my test results?",
    answer:
      "Results are shared via email or WhatsApp once ready — typically within 24–48 hours of your test. You can also call us to follow up.",
  },
];

export default function SupportScreen() {
  const openWhatsApp = () => {
    const phone = "08069378166";
    const url = `whatsapp://send?phone=${phone}`;
    Linking.canOpenURL(url)
      .then((supported) =>
        Linking.openURL(supported ? url : `https://wa.me/${phone}`),
      )
      .catch(() => Linking.openURL(`https://wa.me/${phone}`));
  };
  const openEmail = () => {
    Linking.openURL(
      "mailto:talentassessoffical@gmail.com?subject=Support&body=",
    );
  };
  const openPhone = () => Linking.openURL("tel:08069378166");

  const supportOptions: SupportOption[] = [
    {
      id: "whatsapp",
      title: "WhatsApp",
      description: "Connect with our self-serve chat bot support",
      contact: "08069378166",
      iconName: "logo-whatsapp",
      iconColor: "#25D366",
      iconBg: "#E8F8EF",
      onPress: openWhatsApp,
    },
    {
      id: "Email",
      title: "Email",
      description: "Write to us at",
      contact: "talentassessoffical@gmail.com",
      iconName: "mail",
      iconColor: "#E53935",
      iconBg: "#FDECEA",
      onPress: openEmail,
    },
    {
      id: "phone",
      title: "Phone",
      description: "Call us on",
      contact: "08069378166",
      iconName: "call",
      iconColor: "#2563EB",
      iconBg: "#E8F0FB",
      onPress: openPhone,
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Need Help?</Text>
          <Text style={styles.subtitle}>
            Get in touch with our support team for assistance
          </Text>
        </View>

        {supportOptions.map((opt) => (
          <SupportCard key={opt.id} option={opt} />
        ))}

        <Divider />

        <SectionLabel label="Support hours" />
        <View style={styles.hoursGrid}>
          {supportHours.map((h) => (
            <View key={h.day} style={styles.hoursCell}>
              <Text style={styles.hoursDay}>{h.day}</Text>
              <Text style={styles.hoursTime}>{h.time}</Text>
              <View
                style={[
                  styles.hoursBadge,
                  { backgroundColor: h.open ? "#E8F8EF" : "#FDECEA" },
                ]}
              >
                <Text
                  style={[
                    styles.hoursBadgeText,
                    { color: h.open ? "#14a85a" : "#E53935" },
                  ]}
                >
                  {h.open ? "Open" : "Closed"}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Divider />

        <SectionLabel label="Quick info" />
        {infoPoints.map((info) => (
          <InfoRow key={info.id} item={info} />
        ))}

        <Divider />

        <SectionLabel label="FAQs" />
        {faqItems.map((faq) => (
          <FaqCard key={faq.id} item={faq} />
        ))}

        <Text style={styles.footerNote}>
          TSA{"\n"}© 2025 All rights reserved
        </Text>
      </ScrollView>
    </View>
  );
}

function SupportCard({ option }: { option: SupportOption }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={option.onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Contact via ${option.title}`}
    >
      <View style={[styles.iconWrapper, { backgroundColor: option.iconBg }]}>
        <Ionicons name={option.iconName} size={26} color={option.iconColor} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{option.title}</Text>
        <Text style={styles.cardDescription}>{option.description}</Text>
        <Text style={styles.cardContact} numberOfLines={1} adjustsFontSizeToFit>
          {option.contact}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#C0C0C0" />
    </TouchableOpacity>
  );
}

function InfoRow({ item }: { item: InfoPoint }) {
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIconWrap, { backgroundColor: item.iconBg }]}>
        <Ionicons name={item.iconName} size={16} color={item.iconColor} />
      </View>
      <View style={styles.infoTextBlock}>
        <Text style={styles.infoTitle}>{item.title}</Text>
        <Text style={styles.infoSubtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );
}

function FaqCard({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((v) => !v);
  };
  return (
    <View style={styles.faqCard}>
      <TouchableOpacity
        style={styles.faqRow}
        onPress={toggle}
        activeOpacity={0.7}
      >
        <Text style={styles.faqQuestion}>{item.question}</Text>
        <Ionicons
          name={open ? "chevron-down" : "chevron-forward"}
          size={16}
          color="#C0C0C0"
        />
      </TouchableOpacity>
      {open && (
        <View style={styles.faqAnswerWrap}>
          <Text style={styles.faqAnswer}>{item.answer}</Text>
        </View>
      )}
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function SectionLabel({ label }: { label: string }) {
  return <Text style={styles.sectionLabel}>{label.toUpperCase()}</Text>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5", marginBottom: 60 },
  scrollContent: {
    padding: 24,
    paddingTop: Platform.OS === "android" ? 40 : 56,
    paddingBottom: 48,
  },
  header: { marginBottom: 24 },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: { fontSize: 15, color: "#888888", lineHeight: 22 },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: { flex: 1, gap: 3 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#1A1A2E" },
  cardDescription: { fontSize: 13, color: "#888888" },
  cardContact: { fontSize: 13, fontWeight: "600", color: "#2563EB" },

  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.07)",
    marginVertical: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: "#AAAAAA",
    marginBottom: 12,
  },

  hoursGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  hoursCell: {
    width: "47.5%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  hoursDay: {
    fontSize: 11,
    color: "#999999",
    fontWeight: "500",
    marginBottom: 4,
  },
  hoursTime: { fontSize: 13, fontWeight: "700", color: "#1A1A2E" },
  hoursBadge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  hoursBadgeText: { fontSize: 10, fontWeight: "600" },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  infoIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  infoTextBlock: { flex: 1 },
  infoTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1A1A2E",
    marginBottom: 2,
  },
  infoSubtitle: { fontSize: 12, color: "#888888", lineHeight: 18 },

  faqCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  faqRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  faqQuestion: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#1A1A2E",
    paddingRight: 8,
  },
  faqAnswerWrap: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(0,0,0,0.08)",
  },
  faqAnswer: { fontSize: 12, color: "#777777", lineHeight: 18 },

  footerNote: {
    textAlign: "center",
    fontSize: 11,
    color: "#BBBBBB",
    marginTop: 24,
    lineHeight: 18,
  },
});
