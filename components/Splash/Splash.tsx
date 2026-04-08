import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

// ─── Animated Ring Component ──────────────────────────────────────────────────
const PulseRing = ({ delay, size, color, duration }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration: duration,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.5,
        borderColor: color,
        transform: [{ scale }],
        opacity,
      }}
    />
  );
};

// ─── Floating Particle ────────────────────────────────────────────────────────
const Particle = ({ x, y, delay, size }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0.7,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -40,
            duration: 2200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x,
        bottom: y,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "rgba(255,255,255,0.5)",
        transform: [{ translateY }],
        opacity,
      }}
    />
  );
};

// ─── Main Splash Screen ───────────────────────────────────────────────────────
export default function SplashScreen({ onFinish }) {
  const bgScale = useRef(new Animated.Value(1.15)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(-12)).current;
  const titleY = useRef(new Animated.Value(30)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subY = useRef(new Animated.Value(20)).current;
  const subOpacity = useRef(new Animated.Value(0)).current;
  const tagY = useRef(new Animated.Value(16)).current;
  const tagOpacity = useRef(new Animated.Value(0)).current;
  const lineWidth = useRef(new Animated.Value(0)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;
  const shimmerX = useRef(new Animated.Value(-80)).current;

  const particles = [
    { x: 30, y: 80, delay: 0, size: 5 },
    { x: 80, y: 140, delay: 400, size: 3 },
    { x: 180, y: 60, delay: 800, size: 4 },
    { x: 260, y: 200, delay: 200, size: 3 },
    { x: 310, y: 100, delay: 600, size: 5 },
    { x: 50, y: 260, delay: 1000, size: 3 },
    { x: 340, y: 300, delay: 300, size: 4 },
  ];

  useEffect(() => {
    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerX, {
          toValue: 160,
          duration: 1800,
          delay: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmerX, {
          toValue: -80,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
      ]),
    );
    shimmerLoop.start();

    Animated.sequence([
      Animated.timing(bgScale, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 55,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(logoRotate, {
          toValue: 0,
          tension: 55,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(titleY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.back(1.4)),
          useNativeDriver: true,
        }),
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(lineWidth, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(subY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(subOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(tagY, {
          toValue: 0,
          duration: 350,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(tagOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),

      Animated.timing(dotsOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),

      Animated.delay(3000),

      Animated.timing(exitOpacity, {
        toValue: 0,
        duration: 500,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      shimmerLoop.stop();
      onFinish && onFinish();
    });

    return () => shimmerLoop.stop();
  }, []);

  const rotateDeg = logoRotate.interpolate({
    inputRange: [-12, 0],
    outputRange: ["-12deg", "0deg"],
  });

  return (
    <Animated.View style={[styles.root, { opacity: exitOpacity }]}>
      <StatusBar barStyle="light-content" backgroundColor="#1338C8" />

      <Animated.View style={[styles.bg, { transform: [{ scale: bgScale }] }]}>
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />
        <View style={styles.bgCircle3} />
      </Animated.View>

      {particles.map((p, i) => (
        <Particle key={i} {...p} />
      ))}

      <View style={styles.ringsContainer}>
        <PulseRing
          delay={0}
          size={160}
          color="rgba(255,255,255,0.25)"
          duration={2000}
        />
        <PulseRing
          delay={700}
          size={220}
          color="rgba(255,255,255,0.15)"
          duration={2000}
        />
        <PulseRing
          delay={1400}
          size={290}
          color="rgba(255,255,255,0.08)"
          duration={2000}
        />
      </View>

      <Animated.View
        style={[
          styles.logoBadge,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }, { rotate: rotateDeg }],
          },
        ]}
      >
        <View style={styles.logoBadgeGlow} />

        <Animated.View
          style={[styles.shimmer, { transform: [{ translateX: shimmerX }] }]}
        />

        <View style={styles.logoLetterRow}>
          <View style={styles.logoLetterBox}>
            <Animated.Text style={styles.logoLetter}>T</Animated.Text>
          </View>
          <View style={[styles.logoLetterBox, styles.logoLetterBoxMid]}>
            <Animated.Text style={styles.logoLetter}>S</Animated.Text>
          </View>
          <View style={styles.logoLetterBox}>
            <Animated.Text style={styles.logoLetter}>A</Animated.Text>
          </View>
        </View>
      </Animated.View>

      <View style={styles.textBlock}>
        <Animated.Text
          style={[
            styles.title,
            { opacity: titleOpacity, transform: [{ translateY: titleY }] },
          ]}
        >
          Talent And Skill
        </Animated.Text>
        <Animated.Text
          style={[
            styles.titleAccent,
            { opacity: titleOpacity, transform: [{ translateY: titleY }] },
          ]}
        >
          Assess
        </Animated.Text>

        <View style={styles.dividerTrack}>
          <Animated.View
            style={[styles.divider, { transform: [{ scaleX: lineWidth }] }]}
          />
        </View>

        <Animated.Text
          style={[
            styles.subtitle,
            { opacity: subOpacity, transform: [{ translateY: subY }] },
          ]}
        >
          Smart Hiring Starts Here
        </Animated.Text>

        <Animated.View
          style={[
            styles.tagPill,
            { opacity: tagOpacity, transform: [{ translateY: tagY }] },
          ]}
        >
          <View style={styles.tagDot} />
          <Animated.Text style={styles.tagText}>
            Pre-hire · Assessments · Insights
          </Animated.Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.dotsRow, { opacity: dotsOpacity }]}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.dot, i === 1 && styles.dotActive]} />
        ))}
      </Animated.View>

      <Animated.Text style={[styles.version, { opacity: subOpacity }]}>
        v2.0.1 · Powered by TSA
      </Animated.Text>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#1338C8",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#1A3FD4",
  },
  bgCircle1: {
    position: "absolute",
    width: width * 1.4,
    height: width * 1.4,
    borderRadius: width * 0.7,
    backgroundColor: "#1030BB",
    top: -width * 0.5,
    left: -width * 0.2,
  },
  bgCircle2: {
    position: "absolute",
    width: width * 1.1,
    height: width * 1.1,
    borderRadius: width * 0.55,
    backgroundColor: "#0D28A6",
    bottom: -width * 0.4,
    right: -width * 0.3,
  },
  bgCircle3: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.04)",
    top: height * 0.55,
    left: 20,
  },

  ringsContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    top: height / 2 - 155,
  },

  logoBadge: {
    width: 104,
    height: 104,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 16,
  },
  logoBadgeGlow: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(120,160,255,0.15)",
  },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: "rgba(255,255,255,0.18)",
    transform: [{ skewX: "-20deg" }],
  },
  logoLetterRow: {
    flexDirection: "row",
    gap: 4,
  },
  logoLetterBox: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoLetterBoxMid: {
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  logoLetter: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0,
  },

  textBlock: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  titleAccent: {
    fontSize: 13, // fixed: removed duplicate fontSize
    fontWeight: "300",
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 4,
    textTransform: "uppercase",
    marginTop: 2,
  },
  dividerTrack: {
    width: 160,
    height: 1.5,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 1,
    marginVertical: 18,
    overflow: "hidden",
  },
  divider: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.5)",
    // removed transformOrigin — not supported with useNativeDriver
  },
  subtitle: {
    fontSize: 15.5,
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 0.3,
    marginBottom: 20,
    textAlign: "center",
  },
  tagPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 7,
    gap: 8,
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#7FFFD4",
  },
  tagText: {
    fontSize: 11.5,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 0.5,
    fontWeight: "500",
  },

  dotsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 48,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  dotActive: {
    width: 22,
    backgroundColor: "rgba(255,255,255,0.8)",
  },

  version: {
    position: "absolute",
    bottom: 36,
    fontSize: 11,
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 0.5,
  },
});
