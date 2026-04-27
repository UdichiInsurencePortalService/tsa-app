import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const INDUSTRIES = [
  {
    id: 1,
    name: "Manufacturing",
    title: "Manufacturing Employment Assessments & Skill Evaluations",
    heading:
      "Identify the right talent for industrial and production roles through role-specific testing.",
    description:
      "TSA's manufacturing assessments measure technical ability, safety awareness, machine handling knowledge, and problem-solving skills to ensure candidates are job-ready for production environments. Each test is calibrated to real floor-level demands — from assembly operators to shift supervisors — validating competency beyond what a resume can show. Designed to improve hiring accuracy, reduce onboarding time, and boost workforce productivity across single or multi-site operations.",
    benefits: [
      "Reduce time-to-productivity with pre-screened, job-ready candidates",
      "Lower workplace incidents through targeted safety knowledge validation",
      "Standardize hiring criteria consistently across multiple facilities",
      "Identify high-potential performers before investing in training programs",
    ],
    skills: [
      "Machine operation & equipment handling",
      "Workplace safety & OSHA compliance",
      "Quality control & defect detection",
      "Lean manufacturing & process efficiency",
      "Blueprint reading & technical documentation",
      "Problem-solving under production pressure",
    ],
    icon: "⚙️",
    accent: "#2563EB",
    accentLight: "#EFF6FF",
  },
  {
    id: 2,
    name: "Healthcare",
    title: "Healthcare Hiring Assessments & Clinical Skill Verification",
    heading:
      "Ensure patient safety and care quality with verified clinical competency screening.",
    description:
      "TSA's healthcare assessments evaluate clinical knowledge, patient care protocols, regulatory compliance, and critical decision-making across a broad range of roles — from nurses and medical technicians to administrative and support staff. Our validated testing framework aligns with healthcare licensing standards and institutional accreditation requirements, giving hiring managers confidence in every placement.",
    benefits: [
      "Accelerate clinical hiring without compromising patient safety standards",
      "Reduce compliance risk with regulation-aligned competency testing",
      "Assess both hard clinical skills and soft communication competencies",
      "Support credentialing, re-certification, and onboarding tracking workflows",
    ],
    skills: [
      "Clinical protocols & patient care standards",
      "Medical terminology & documentation accuracy",
      "HIPAA & healthcare regulatory compliance",
      "Emergency response & triage decision-making",
      "Pharmacology & medication safety awareness",
      "Interpersonal communication & empathy in care settings",
    ],
    icon: "🏥",
    accent: "#0891B2",
    accentLight: "#ECFEFF",
  },
  {
    id: 3,
    name: "Construction",
    title: "Construction Workforce Assessments & Trade Skill Testing",
    heading:
      "Build high-performing construction teams with verified trade and safety evaluations.",
    description:
      "Construction hiring demands more than verifying work history — it requires validating hands-on trade proficiency, site safety knowledge, and project execution capability. TSA's construction assessments cover the full spectrum of roles including general laborers, electricians, welders, and site foremen, structured around OSHA standards and field-tested competency benchmarks.",
    benefits: [
      "Validate trade certifications and field competency objectively before hiring",
      "Reduce site accidents with targeted safety knowledge pre-screening",
      "Assess project coordination and supervisory leadership readiness",
      "Improve workforce deployment decisions across diverse project types",
    ],
    skills: [
      "OSHA safety standards & jobsite compliance",
      "Blueprint reading & structural planning",
      "Heavy equipment operation & machinery handling",
      "Trade-specific skills (electrical, plumbing, HVAC, masonry)",
      "Project scheduling & resource coordination",
      "Physical safety awareness & risk mitigation",
    ],
    icon: "🏗️",
    accent: "#D97706",
    accentLight: "#FFFBEB",
  },
  {
    id: 4,
    name: "Financial Services",
    title: "Financial Services Talent Assessments & Compliance Testing",
    heading:
      "Identify finance professionals who combine analytical precision with regulatory integrity.",
    description:
      "TSA provides financial services organizations with assessment tools that evaluate quantitative reasoning, financial product knowledge, regulatory compliance awareness, and risk management acumen. Whether hiring for banking, investment, insurance, or fintech roles, our platform enables institutions to screen for technical proficiency and ethical judgment simultaneously.",
    benefits: [
      "Screen for regulatory compliance knowledge before candidate onboarding",
      "Evaluate quantitative reasoning and financial modeling aptitude",
      "Reduce audit risk with integrity and ethics-based assessment modules",
      "Support role-specific hiring from junior analysts to relationship managers",
    ],
    skills: [
      "Financial analysis & modeling proficiency",
      "Regulatory compliance knowledge (SEC, FINRA, Basel III)",
      "Risk assessment & portfolio management logic",
      "Anti-money laundering (AML) & fraud detection awareness",
      "Client communication & financial advisory skills",
      "Numerical reasoning & data interpretation",
    ],
    icon: "💼",
    accent: "#059669",
    accentLight: "#ECFDF5",
  },
  {
    id: 5,
    name: "Education",
    title:
      "Education Sector Hiring Assessments & Educator Competency Evaluation",
    heading:
      "Recruit qualified educators and administrators who drive measurable student outcomes.",
    description:
      "Hiring in education requires assessing far more than subject matter expertise — it demands evaluating pedagogy, classroom management, student engagement strategies, and curriculum development capability. TSA's education assessments help school districts, universities, and training institutions identify candidates who are not only qualified but genuinely effective in diverse learning environments.",
    benefits: [
      "Evaluate subject-matter depth alongside instructional methodology",
      "Identify candidates with strong differentiated instruction capabilities",
      "Streamline faculty and administrative hiring across campuses or districts",
      "Assess cultural competency and inclusive education awareness",
    ],
    skills: [
      "Curriculum design & instructional planning",
      "Classroom management & student engagement strategies",
      "Assessment development & learning outcome measurement",
      "Special education awareness & differentiated learning",
      "Parent and stakeholder communication",
      "Educational technology proficiency (EdTech platforms)",
    ],
    icon: "🎓",
    accent: "#7C3AED",
    accentLight: "#F5F3FF",
  },
  {
    id: 6,
    name: "BPO / Call Centers",
    title: "BPO & Call Center Workforce Assessments & Performance Screening",
    heading:
      "Hire high-retention contact center agents with data-driven capability screening.",
    description:
      "BPO and call center environments demand a specific combination of communication agility, process adherence, emotional resilience, and technical proficiency. TSA's BPO assessments evaluate candidates across voice and non-voice competencies — including typing accuracy, script comprehension, CRM tool familiarity, and customer conflict resolution.",
    benefits: [
      "Reduce early attrition through behavioral and aptitude pre-screening",
      "Measure typing speed, accuracy, and multi-tasking capability objectively",
      "Screen for language proficiency and professional communication readiness",
      "Evaluate stress tolerance and customer de-escalation effectiveness",
    ],
    skills: [
      "Verbal and written communication fluency",
      "Typing speed & data entry accuracy",
      "Customer handling & conflict de-escalation",
      "CRM and support tool familiarity",
      "Active listening & comprehension skills",
      "Process adherence and quality compliance awareness",
    ],
    icon: "🎧",
    accent: "#DB2777",
    accentLight: "#FDF2F8",
  },
  {
    id: 7,
    name: "Retail & E-commerce",
    title:
      "Retail & E-commerce Hiring Assessments & Customer Experience Testing",
    heading:
      "Build customer-centric retail teams with targeted behavioral and skills screening.",
    description:
      "Retail and e-commerce success depends on hiring people who combine product knowledge with service excellence, speed, and adaptability. TSA's retail assessments evaluate candidates for customer-facing and operational roles — from sales associates and inventory managers to e-commerce analysts and fulfillment leads.",
    benefits: [
      "Reduce seasonal hiring risk with rapid yet structured candidate screening",
      "Identify upselling and consultative selling aptitude at the screening stage",
      "Assess loss prevention awareness and cash handling accuracy",
      "Screen for digital commerce and omnichannel platform familiarity",
    ],
    skills: [
      "Customer service & complaint resolution",
      "Point-of-sale systems & transaction accuracy",
      "Product knowledge retention & upselling technique",
      "Inventory management & supply chain basics",
      "Visual merchandising & planogram adherence",
      "E-commerce platform proficiency & order fulfillment logic",
    ],
    icon: "🛍️",
    accent: "#EA580C",
    accentLight: "#FFF7ED",
  },
  {
    id: 8,
    name: "Government",
    title: "Government Hiring Assessments & Public Sector Competency Testing",
    heading:
      "Modernize civil service recruitment with structured, merit-based assessment frameworks.",
    description:
      "Government agencies at federal, state, and local levels face unique hiring challenges — navigating civil service mandates, equity goals, and the need for strict role-based competency validation. TSA provides public sector organizations with standardized, defensible assessment tools that support merit-based hiring, promote transparency, and comply with OPM and EEOC guidelines.",
    benefits: [
      "Support merit-based selection fully aligned with civil service regulations",
      "Deliver assessments that satisfy OPM and EEOC compliance requirements",
      "Evaluate policy knowledge, public communication, and decision integrity",
      "Reduce hiring bias through objective, structured competency scoring",
    ],
    skills: [
      "Public policy knowledge & legislative awareness",
      "Government records management & documentation standards",
      "Ethics, integrity & public accountability frameworks",
      "Constituent communication & interpersonal skills",
      "Budgeting & fiscal responsibility fundamentals",
      "Emergency preparedness & crisis response awareness",
    ],
    icon: "🏛️",
    accent: "#475569",
    accentLight: "#F8FAFC",
  },
  {
    id: 9,
    name: "Engineering & Design",
    title:
      "Engineering & Design Talent Assessments & Technical Aptitude Testing",
    heading:
      "Validate engineering expertise and design thinking with role-precise technical evaluations.",
    description:
      "Engineering and design roles demand a rare blend of domain knowledge, problem-solving rigor, and creative systems thinking. TSA's technical assessments span mechanical, civil, software, electrical, and product design disciplines — evaluating candidates on real-world problem sets, tool proficiency, and design methodology.",
    benefits: [
      "Evaluate domain-specific technical knowledge with role-level precision",
      "Assess CAD, BIM, and software tool proficiency objectively",
      "Screen for systems thinking and design iteration capability",
      "Reduce engineering mis-hires with structured problem-solving assessments",
    ],
    skills: [
      "Engineering fundamentals (mechanical, civil, electrical, software)",
      "CAD, BIM & technical design software proficiency",
      "Problem-solving & root cause analysis",
      "Project lifecycle management & technical documentation",
      "Systems design & architecture thinking",
      "Regulatory standards awareness (ISO, IEC, ASME)",
    ],
    icon: "📐",
    accent: "#0284C7",
    accentLight: "#F0F9FF",
  },
  {
    id: 10,
    name: "Energy & Utilities",
    title:
      "Energy & Utilities Workforce Assessments & Technical Competency Screening",
    heading:
      "Power your workforce strategy with safety-first technical hiring assessments.",
    description:
      "Energy and utilities operations require workers who combine deep technical knowledge with an unwavering commitment to safety and environmental compliance. TSA's assessments are purpose-built for the energy sector — covering power generation, transmission, renewable energy systems, and utility infrastructure roles.",
    benefits: [
      "Validate safety compliance and hazardous environment readiness pre-hire",
      "Assess technical knowledge across power, gas, and renewable systems",
      "Reduce incident risk with behavioral judgment and safety screening",
      "Support NERC CIP and sector-specific regulatory compliance hiring",
    ],
    skills: [
      "Electrical systems, grid operations & power generation knowledge",
      "Safety protocols (LOTO, arc flash, confined space entry)",
      "Environmental compliance & sustainability regulations",
      "SCADA and industrial control systems awareness",
      "Preventive maintenance & equipment diagnostics",
      "Renewable energy technologies (solar, wind, storage systems)",
    ],
    icon: "⚡",
    accent: "#CA8A04",
    accentLight: "#FEFCE8",
  },
  {
    id: 11,
    name: "Transportation & Logistics",
    title:
      "Transportation & Logistics Hiring Assessments & Operations Screening",
    heading:
      "Keep supply chains moving with operationally sharp, compliance-ready logistics hires.",
    description:
      "Transportation and logistics operations depend on professionals who are technically capable, safety-conscious, process-disciplined, and able to perform under time-sensitive pressure. TSA's logistics assessments evaluate route planning capability, freight regulations knowledge, fleet operations awareness, and warehouse management proficiency.",
    benefits: [
      "Assess DOT compliance knowledge and driver safety awareness pre-hire",
      "Evaluate route optimization and dispatch decision-making skills",
      "Screen for inventory accuracy and warehouse systems proficiency",
      "Reduce operational errors with structured aptitude and judgment testing",
    ],
    skills: [
      "DOT regulations & transportation compliance",
      "Route planning & fleet management fundamentals",
      "Warehouse operations & inventory control (WMS)",
      "Freight logistics & import/export documentation knowledge",
      "Forklift, loading dock & materials handling safety",
      "Supply chain coordination & delivery SLA management",
    ],
    icon: "🚛",
    accent: "#16A34A",
    accentLight: "#F0FDF4",
  },
  {
    id: 12,
    name: "Staffing & Recruitment",
    title:
      "Staffing & Recruitment Firm Assessments & Candidate Readiness Testing",
    heading:
      "Place better candidates faster with validated skills and job-readiness scoring.",
    description:
      "Staffing and recruitment firms compete on placement quality and speed. TSA empowers agencies with a scalable assessment infrastructure that enables rapid candidate screening across industries, roles, and skill levels. Our platform supports temp, contract, and permanent placement workflows — allowing recruiters to verify skills and match candidates with documented confidence.",
    benefits: [
      "Accelerate candidate throughput without sacrificing placement quality",
      "Build client trust with objective, documented skill verification reports",
      "Customize assessment profiles per client industry and job specification",
      "Reduce placement fallouts and first-week contractor dropouts",
    ],
    skills: [
      "Cross-industry skill benchmarking & role alignment",
      "Professional communication & workplace conduct assessment",
      "Cognitive aptitude & learning agility evaluation",
      "Technology proficiency (MS Office, CRM, domain-specific tools)",
      "Behavioral reliability indicators & work ethic signals",
      "Role-specific knowledge verification & interview readiness",
    ],
    icon: "👥",
    accent: "#9333EA",
    accentLight: "#FAF5FF",
  },
  {
    id: 13,
    name: "Hospitality & Tourism",
    title:
      "Hospitality & Tourism Talent Assessments & Service Excellence Screening",
    heading:
      "Elevate guest experience from the first hire with service-focused talent evaluation.",
    description:
      "In hospitality, every guest interaction reflects the quality of your team. TSA's hospitality assessments evaluate front-of-house and back-of-house candidates on service etiquette, cultural sensitivity, guest handling skills, and operational standards. Our platform helps hotels, resorts, and travel brands hire professionals who embody brand values and deliver consistent, high-quality experiences.",
    benefits: [
      "Identify candidates with natural service orientation and genuine empathy",
      "Assess multilingual communication and cross-cultural competency",
      "Screen for upselling capability and guest loyalty program knowledge",
      "Evaluate stress tolerance for peak-season and high-volume service roles",
    ],
    skills: [
      "Guest relations & service recovery protocols",
      "Property management & reservation systems (PMS)",
      "Food & beverage service standards and compliance",
      "Cultural awareness & international guest etiquette",
      "Revenue management & upselling techniques",
      "Event coordination & hospitality operations planning",
    ],
    icon: "🏨",
    accent: "#0EA5E9",
    accentLight: "#F0F9FF",
  },
  {
    id: 14,
    name: "Legal Services",
    title:
      "Legal Services Hiring Assessments & Professional Competency Evaluation",
    heading:
      "Hire legally precise, ethically grounded professionals with rigorous competency testing.",
    description:
      "Legal organizations require talent that combines domain-specific legal knowledge with analytical rigor, ethical integrity, and precise written communication. TSA's legal assessments are designed for law firms, corporate legal departments, and compliance functions — evaluating paralegals, contract specialists, compliance officers, and junior counsel.",
    benefits: [
      "Assess legal research, drafting, and case analysis proficiency objectively",
      "Validate knowledge of procedural and substantive law by practice area",
      "Screen for ethics compliance and attorney-client privilege awareness",
      "Reduce billing inefficiencies through competency-matched legal staffing",
    ],
    skills: [
      "Legal research & case law analysis",
      "Contract drafting, review & redlining",
      "Procedural law & court filing knowledge",
      "Regulatory compliance & legal ethics standards",
      "Legal documentation accuracy & attention to detail",
      "Client communication, confidentiality & professional conduct",
    ],
    icon: "⚖️",
    accent: "#DC2626",
    accentLight: "#FEF2F2",
  },
];

// ─── Industry Card (List Item) ───────────────────────────────────────────────
const IndustryCard = ({ item, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 30,
    }).start();
  const onPressOut = () =>
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
    }).start();

  return (
    <TouchableOpacity
      style={{ marginBottom: 15 }}
      activeOpacity={1}
      onPress={() => onPress(item)}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Animated.View
        style={[styles.card, { transform: [{ scale: scaleAnim }] }]}
      >
        <View
          style={[styles.cardIconWrap, { backgroundColor: item.accentLight }]}
        >
          <Text style={styles.cardIcon}>{item.icon}</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardHeading} numberOfLines={2}>
            {item.heading}
          </Text>
          <View style={styles.cardFooter}>
            <View
              style={[styles.skillBadge, { backgroundColor: item.accentLight }]}
            >
              <Text style={[styles.skillBadgeText, { color: item.accent }]}>
                {item.skills.length} Skills
              </Text>
            </View>
            <View
              style={[styles.skillBadge, { backgroundColor: item.accentLight }]}
            >
              <Text style={[styles.skillBadgeText, { color: item.accent }]}>
                {item.benefits.length} Benefits
              </Text>
            </View>
          </View>
        </View>
        <View
          style={[styles.cardChevron, { backgroundColor: item.accentLight }]}
        >
          <Text style={[styles.chevronText, { color: item.accent }]}>›</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ─── Detail Screen ────────────────────────────────────────────────────────────
const IndustryDetail = ({ industry, onBack }) => {
  const router = useRouter();
  const [tab, setTab] = useState("overview");

  return (
    <View style={styles.detailContainer}>
      {/* Header */}
      <View style={[styles.detailHeader, { backgroundColor: industry.accent }]}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>‹ Back</Text>
        </TouchableOpacity>
        <View style={styles.detailHeaderContent}>
          <Text style={styles.detailIcon}>{industry.icon}</Text>
          <Text style={styles.detailName}>{industry.name}</Text>
          <Text style={styles.detailTitle}>{industry.title}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.detailScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Heading */}
        <View style={styles.detailHeadingBox}>
          <View
            style={[styles.accentBar, { backgroundColor: industry.accent }]}
          />
          <Text style={styles.detailHeading}>{industry.heading}</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {["overview", "benefits", "skills"].map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.tabBtn,
                tab === t && {
                  backgroundColor: industry.accent,
                  borderColor: industry.accent,
                },
              ]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, tab === t && { color: "#fff" }]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab: Overview */}
        {tab === "overview" && (
          <View style={styles.tabContent}>
            <Text style={styles.descText}>{industry.description}</Text>

            {/* Quick stats */}
            <View style={styles.statsRow}>
              <View
                style={[
                  styles.statCard,
                  { backgroundColor: industry.accentLight },
                ]}
              >
                <Text style={[styles.statNumber, { color: industry.accent }]}>
                  {industry.skills.length}
                </Text>
                <Text style={styles.statLabel}>Skills Assessed</Text>
              </View>
              <View
                style={[
                  styles.statCard,
                  { backgroundColor: industry.accentLight },
                ]}
              >
                <Text style={[styles.statNumber, { color: industry.accent }]}>
                  {industry.benefits.length}
                </Text>
                <Text style={styles.statLabel}>Key Benefits</Text>
              </View>
              <View
                style={[
                  styles.statCard,
                  { backgroundColor: industry.accentLight },
                ]}
              >
                <Text style={[styles.statNumber, { color: industry.accent }]}>
                  AI
                </Text>
                <Text style={styles.statLabel}>Powered</Text>
              </View>
            </View>
          </View>
        )}

        {/* Tab: Benefits */}
        {tab === "benefits" && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionLabel}>KEY BENEFITS</Text>
            {industry.benefits.map((b, i) => (
              <View key={i} style={styles.benefitRow}>
                <View
                  style={[
                    styles.benefitDot,
                    { backgroundColor: industry.accent },
                  ]}
                >
                  <Text style={styles.benefitDotText}>{i + 1}</Text>
                </View>
                <Text style={styles.benefitText}>{b}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Tab: Skills */}
        {tab === "skills" && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionLabel}>SKILLS ASSESSED</Text>
            <View style={styles.skillsGrid}>
              {industry.skills.map((s, i) => (
                <View
                  key={i}
                  style={[
                    styles.skillChip,
                    {
                      backgroundColor: industry.accentLight,
                      borderColor: industry.accent + "30",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.skillDot,
                      { backgroundColor: industry.accent },
                    ]}
                  />
                  <Text
                    style={[styles.skillChipText, { color: industry.accent }]}
                  >
                    {s}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* CTA */}
        <TouchableOpacity
          style={[styles.ctaBtn, { backgroundColor: industry.accent }]}
          onPress={() => router.push("/exam")}
        >
          <Text style={styles.ctaBtnText}>
            Start Assessment for {industry.name}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// ─── Main Industries Screen ───────────────────────────────────────────────────
export default function IndustriesScreen() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = INDUSTRIES.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.heading.toLowerCase().includes(search.toLowerCase()),
  );

  if (selected) {
    return (
      <IndustryDetail industry={selected} onBack={() => setSelected(null)} />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerLabel}>TSA PLATFORM</Text>
            <Text style={styles.headerTitle}>Industries</Text>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{INDUSTRIES.length}</Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          Select your industry to explore tailored hiring assessments and skill
          evaluations.
        </Text>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search industries..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Text style={styles.searchClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results count */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>
          {filtered.length} {filtered.length === 1 ? "industry" : "industries"}{" "}
          found
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <IndustryCard item={item} onPress={setSelected} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptyText}>Try a different search term</Text>
          </View>
        }
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    marginBottom: 55,
    flex: 1,
    backgroundColor: "#F1F5F9",
  },

  // Header
  header: {
    backgroundColor: "#0F172A",
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 2,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#F8FAFC",
    letterSpacing: -0.5,
  },
  headerBadge: {
    backgroundColor: "#1E293B",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#334155",
  },
  headerBadgeText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#94A3B8",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 19,
    marginBottom: 16,
  },

  // Search
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#F1F5F9",
    padding: 0,
  },
  searchClear: { fontSize: 12, color: "#64748B", paddingLeft: 8 },

  // Results row
  resultsRow: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  resultsText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  // Card
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 10,
    padding: 14,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  cardIcon: { fontSize: 24 },
  cardBody: { flex: 1 },
  cardName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 3,
  },
  cardHeading: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 17,
    marginBottom: 8,
  },
  cardFooter: { flexDirection: "row", gap: 6 },
  skillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  skillBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  cardChevron: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  chevronText: { fontSize: 22, fontWeight: "300", marginTop: -2 },

  // Empty
  emptyState: { alignItems: "center", paddingTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 4,
  },
  emptyText: { fontSize: 13, color: "#94A3B8" },

  // ── Detail ──────────────────────────────────────────────────
  detailContainer: { flex: 1, backgroundColor: "#F1F5F9" },

  detailHeader: {
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  backBtn: {
    marginBottom: 16,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  backBtnText: { fontSize: 14, color: "#fff", fontWeight: "600" },
  detailHeaderContent: { alignItems: "flex-start" },
  detailIcon: { fontSize: 36, marginBottom: 8 },
  detailName: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 28,
  },

  detailScroll: { flex: 1 },

  detailHeadingBox: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 4,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  accentBar: { width: 3, borderRadius: 3, marginRight: 14 },
  detailHeading: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
    lineHeight: 22,
  },

  // Tabs
  tabRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 12,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },

  tabContent: { paddingHorizontal: 20, paddingTop: 16 },

  // Overview
  descText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
    marginBottom: 20,
  },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  statNumber: { fontSize: 24, fontWeight: "700", marginBottom: 4 },
  statLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
    textAlign: "center",
  },

  // Benefits
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  benefitDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 1,
  },
  benefitDotText: { fontSize: 12, fontWeight: "700", color: "#fff" },
  benefitText: { flex: 1, fontSize: 14, color: "#334155", lineHeight: 20 },

  // Skills
  skillsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 2,
  },
  skillDot: { width: 6, height: 6, borderRadius: 3, marginRight: 7 },
  skillChipText: { fontSize: 13, fontWeight: "500" },

  // CTA
  ctaBtn: {
    marginBottom: 50,
    marginHorizontal: 20,
    marginTop: 28,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  ctaBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },
});
