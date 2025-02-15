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
  BackHandler,
  StatusBar,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from "react-native-vector-icons/Ionicons";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get("window");

export default function LoginScreen({ navigation }) {
  const [language, setLanguage] = useState("en"); // Default to English
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false); // State for password visibility

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
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (navigation.isFocused()) {
          BackHandler.exitApp();
          return true;
        }
        return false;
      }
    );

    return () => backHandler.remove();
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
      console.error("Error during login:", error);
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#00796B', '#004D40']}
        style={styles.topSection}
      >
     

        <View style={styles.headerContent}>
          <Ionicons name="shield-checkmark" size={80} color="#fff" />
          <Text style={styles.welcomeText}>Welcome Auditors</Text>
        </View>
      </LinearGradient>

      <View style={styles.bottomSection}>
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={texts[language].emailPlaceholder}
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={texts[language].passwordPlaceholder}
              placeholderTextColor="#999"
              secureTextEntry={!passwordVisible}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setPasswordVisible(!passwordVisible)}
            >
              <Ionicons
                name={passwordVisible ? "eye-off-outline" : "eye-outline"}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <LinearGradient
            colors={['#00796B', '#004D40']}
            style={styles.gradientButton}
          >
            <Text style={styles.loginText}>{texts[language].loginButton}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topSection: {
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  languageSelector: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: 120,
    color: '#fff',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  bottomSection: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 8,
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gradientButton: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  loginText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});