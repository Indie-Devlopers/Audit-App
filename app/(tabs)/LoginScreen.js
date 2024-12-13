













import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ImageBackground,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Svg, { Circle } from "react-native-svg";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

export default function LoginScreen({ navigation }) {
  const [language, setLanguage] = useState("en"); // Default to English
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const checkUserLogin = async () => {
      const userId = await AsyncStorage.getItem("userId");
      if (userId) {
        navigation.navigate("HomeScreen");
      }
    };

    checkUserLogin();
  }, [navigation]);

  useEffect(() => {
    // Check if user is already logged in
    const checkUserLogin = async () => {
      const userId = await AsyncStorage.getItem("userId");
      if (userId) {
        // If user is already logged in, navigate to HomeScreen
        navigation.navigate("HomeScreen");
      }
    };

    checkUserLogin();
  }, [navigation]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Both email and password are required!");
      return;
    }

    try {
      const profilesRef = collection(db, "Profile");
      const q = query(
        profilesRef,
        where("email", "==", email),
        where("password", "==", password)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (doc) => {
          console.log("Document ID (User ID):", doc.id);
          await AsyncStorage.setItem("userId", doc.id);
        });

        Alert.alert("Login Successful", "Welcome back!");
        navigation.navigate("HomeScreen");
      } else {
        Alert.alert("Login Error", "Invalid email or password.");
      }
    } catch (error) {
      console.error("Error during login:", error.message);
      Alert.alert("Error", "Could not connect to the server. Try again later.");
    }
  };

  const texts = {
    en: {
      welcome: "Welcome back",
      emailPlaceholder: "Enter your email",
      passwordPlaceholder: "Enter your password",
      loginButton: "Login",
    },
    hi: {
      welcome: "स्वागत है",
      emailPlaceholder: "फोन नंबर दर्ज करें",
      passwordPlaceholder: "पासवर्ड दर्ज करें",
      loginButton: "लॉगिन",
    },
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      {/* ImageBackground for the top section */}
      <ImageBackground
        source={require("./auditor.jpg")}
        style={styles.background}
      />

      {/* SVG Circles */}
      <Svg height={height / 5} width={width} style={styles.svgStyle}>
        <Circle cx={50} cy={50} r={80} fill="#A7D9C4" />
        <Circle cx={120} cy={30} r={50} fill="#80C7B0" />
      </Svg>

      {/* Language Selector */}
      <View style={styles.languageSelector}>
        <Picker
          selectedValue={language}
          style={styles.picker}
          onValueChange={(itemValue) => setLanguage(itemValue)}
        >
          <Picker.Item label="English" value="en" />
          <Picker.Item label="हिन्दी" value="hi" />
        </Picker>
      </View>

      {/* Main Content */}
      <View style={styles.container}>
        <Text style={styles.welcomeText}>{texts[language].welcome}</Text>

        <TextInput
          style={styles.input}
          placeholder={texts[language].emailPlaceholder}
          placeholderTextColor="#a9a9a9"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder={texts[language].passwordPlaceholder}
          placeholderTextColor="#a9a9a9"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginText}>{texts[language].loginButton}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    marginTop: 0,
    marginBottom: 0,
  },
  background: {
    width: "100%",
    height: height / 3,
    resizeMode: "cover",
    opacity: 0.8,
  },
  svgStyle: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 1,
  },
  languageSelector: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(200, 200, 200, 0.4)",
    borderRadius: 5,
    padding: 10,
    zIndex: 2,
  },
  picker: {
    height: 50,
    width: 120,
    color: "#333",
  },
  container: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -40,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
    fontSize: 16,
  },
  loginButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#009966",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  loginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});