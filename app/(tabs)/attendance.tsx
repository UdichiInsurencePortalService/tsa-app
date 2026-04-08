import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function attendance() {
  const questions = [
    {
      q: "Capital of India?",
      options: ["Mumbai", "Delhi", "Kolkata", "Chennai"],
    },
    { q: "2 + 2 = ?", options: ["3", "4", "5", "6"] },
    { q: "React is?", options: ["Library", "Language", "DB", "OS"] },
    { q: "Sun rises from?", options: ["West", "East", "North", "South"] },
    {
      q: "HTML stands for?",
      options: [
        "Hyper Text Markup Language",
        "High Text Machine Language",
        "Hyper Tool ML",
        "None",
      ],
    },
    { q: "CSS is used for?", options: ["Styling", "Logic", "DB", "Server"] },
    { q: "JS is?", options: ["Programming Language", "DB", "Tool", "Browser"] },
    { q: "India PM?", options: ["Modi", "Rahul", "Amit", "None"] },
    { q: "5 * 5 = ?", options: ["10", "20", "25", "30"] },
    { q: "Mobile OS?", options: ["Android", "HTML", "CSS", "Node"] },
  ];

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
    } else {
      Alert.alert("Submitted ✅", "Your exam successfully submitted!");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exam Portal 📝</Text>
      <Text style={styles.subtitle}>
        Question {current + 1} / {questions.length}
      </Text>

      <View style={styles.card}>
        <Text style={styles.question}>
          Q{current + 1}. {questions[current].q}
        </Text>

        {questions[current].options.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.option, selected === index && styles.selectedOption]}
            onPress={() => setSelected(index)}
          >
            <Text style={styles.optionText}>
              {String.fromCharCode(65 + index)}. {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>
          {current === questions.length - 1 ? "Submit ✅" : "Next ➡️"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 20,
    justifyContent: "center",
  },

  title: {
    fontSize: 26,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },

  subtitle: {
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },

  question: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 15,
    fontWeight: "bold",
  },

  option: {
    backgroundColor: "#334155",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  selectedOption: {
    backgroundColor: "#22c55e",
  },

  optionText: {
    color: "#fff",
  },

  button: {
    backgroundColor: "#3b82f6",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
