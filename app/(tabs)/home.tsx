import { ScrollView, StyleSheet } from "react-native";

import Industry from "@/components/Home/Industry";
import TestimonialsScreen from "@/components/Home/Testimonialsscreen";
import TrustedByCarousel from "@/components/Home/Trustedbycarousel";
import TalentAssessmentHomeScreen from "../../components/Home/TalentAssessmentHomeScreen";

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <TalentAssessmentHomeScreen />
      <TrustedByCarousel />
      <Industry />
      <TestimonialsScreen />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
