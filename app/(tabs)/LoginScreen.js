
// import React, { useState } from "react";
// import { View, TextInput, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
// import { collection, query, where, getDocs } from "firebase/firestore";
// import { db } from "./firebaseConfig";
// import Icon from "react-native-vector-icons/FontAwesome";
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const LoginScreen = ({ navigation }) => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [emailError, setEmailError] = useState("");
//   const [passwordError, setPasswordError] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   const handleLogin = async () => {
//     // Reset error messages
//     setEmailError("");
//     setPasswordError("");
  
//     if (!email || !password) {
//       if (!email) setEmailError("Email is required.");
//       if (!password) setPasswordError("Password is required.");
//       return;
//     }
  
//     try {
//       // Query Firestore to validate email and password
//       const profilesRef = collection(db, "Profile");
//       const q = query(
//         profilesRef,
//         where("email", "==", email),
//         where("password", "==", password)
//       );
//       const querySnapshot = await getDocs(q);
  
//       if (!querySnapshot.empty) {
//         // Loop through documents (though you expect only one match)
//         querySnapshot.forEach(async (doc) => {
//           console.log("Document ID (User ID):", doc.id); // Log the document ID
//           console.log("User Profile:", doc.data()); // Log user profile data

//           // Save the userId to AsyncStorage
//           await AsyncStorage.setItem("userId", doc.id);
//         });
  
//         // Navigate to HomeScreen after successful login
//         Alert.alert("Login Successful", "Welcome back!");
//         navigation.navigate("HomeScreen", { userEmail: email });
//       } else {
//         // Invalid credentials
//         Alert.alert("Login Error", "Invalid email or password.");
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error.message);
//       Alert.alert(
//         "Error",
//         "Could not connect to the server. Please try again later."
//       );
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <ScrollView contentContainerStyle={styles.scrollContainer}>
//         <Text style={styles.title}>Login</Text>
//         <Text style={styles.subtitle}>Access your account securely by using your registered email.</Text>
//         <Text style={styles.label}>Email</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter Address"
//           value={email}
//           onChangeText={(text) => setEmail(text)}
//           keyboardType="email-address"
//         />
//         {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

//         <Text style={styles.label}>Password</Text>
//         <View style={styles.passwordContainer}>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter Password"
//             value={password}
//             onChangeText={(text) => setPassword(text)}
//             secureTextEntry={!showPassword}
//           />
//           <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordButton}>
//             <Icon name={showPassword ? "eye" : "eye-slash"} size={20} color="black" />
//           </TouchableOpacity>
//         </View>
//         {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

//         <View style={{ marginTop: 50 }}></View>
//         <TouchableOpacity style={styles.button} onPress={handleLogin}>
//           <Text style={styles.buttonText}>Log In</Text>
//         </TouchableOpacity>

//         <View style={styles.signupContainer}>
//           <Text style={styles.signupText}>Don't have an account? </Text>
//           <TouchableOpacity onPress={() => navigation.navigate("SignUpScreen")}>
//             <Text style={styles.signupLink}>Sign Up</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
//   scrollContainer: { flexGrow: 1, justifyContent: "center", alignItems: "center", paddingBottom: 50 },
//   title: { fontSize: 32, fontWeight: "bold", marginBottom: 20, color: "#002244" },
//   subtitle: { fontSize: 15, fontWeight: "bold", marginBottom: 20, color: "#002244", textAlign: "center" },
//   label: { fontSize: 16, marginBottom: 5, textAlign: "left", width: "100%", color: "black", marginTop: 20 },
//   input: { width: "100%", padding: 10, marginBottom: 10, backgroundColor: "#DCDCDC", borderRadius: 15 },
//   button: { backgroundColor: "#002244", padding: 10, width: "100%", borderRadius: 35, alignItems: "center" },
//   buttonText: { color: "white", fontSize: 18 },
//   errorText: { color: "red", fontSize: 12, textAlign: "left", width: "100%", marginBottom: 10 },
//   passwordContainer: { width: "100%", flexDirection: "row", alignItems: "center", marginTop: 10 },
//   showPasswordButton: { position: "absolute", right: 10, padding: 5 },
//   signupContainer: { marginTop: 40, flexDirection: "row", justifyContent: "center", alignItems: "center" },
//   signupText: { fontSize: 18, color: "black" },
//   signupLink: { fontSize: 18, color: "#002244", fontWeight: "bold" },
// });

// export default LoginScreen;




import React, { useState, useEffect } from "react";
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";
import Icon from "react-native-vector-icons/FontAwesome";
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
    // Reset error messages
    setEmailError("");
    setPasswordError("");
  
    if (!email || !password) {
      if (!email) setEmailError("Email is required.");
      if (!password) setPasswordError("Password is required.");
      return;
    }
  
    try {
      // Query Firestore to validate email and password
      const profilesRef = collection(db, "Profile");
      const q = query(
        profilesRef,
        where("email", "==", email),
        where("password", "==", password)
      );
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        // Loop through documents (though you expect only one match)
        querySnapshot.forEach(async (doc) => {
          console.log("Document ID (User ID):", doc.id); // Log the document ID
          console.log("User Profile:", doc.data()); // Log user profile data

          // Save the userId to AsyncStorage
          await AsyncStorage.setItem("userId", doc.id);
        });
  
        // Navigate to HomeScreen after successful login
        Alert.alert("Login Successful", "Welcome back!");
        navigation.navigate("HomeScreen");
      } else {
        // Invalid credentials
        Alert.alert("Login Error", "Invalid email or password.");
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);
      Alert.alert(
        "Error",
        "Could not connect to the server. Please try again later."
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>Access your account securely by using your registered email.</Text>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Address"
          value={email}
          onChangeText={(text) => setEmail(text)}
          keyboardType="email-address"
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter Password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordButton}>
            <Icon name={showPassword ? "eye" : "eye-slash"} size={20} color="black" />
          </TouchableOpacity>
        </View>
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

        <View style={{ marginTop: 50 }}></View>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignUpScreen")}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  scrollContainer: { flexGrow: 1, justifyContent: "center", alignItems: "center", paddingBottom: 50 },
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 20, color: "#002244" },
  subtitle: { fontSize: 15, fontWeight: "bold", marginBottom: 20, color: "#002244", textAlign: "center" },
  label: { fontSize: 16, marginBottom: 5, textAlign: "left", width: "100%", color: "black", marginTop: 20 },
  input: { width: "100%", padding: 10, marginBottom: 10, backgroundColor: "#DCDCDC", borderRadius: 15 },
  button: { backgroundColor: "#002244", padding: 10, width: "100%", borderRadius: 35, alignItems: "center" },
  buttonText: { color: "white", fontSize: 18 },
  errorText: { color: "red", fontSize: 12, textAlign: "left", width: "100%", marginBottom: 10 },
  passwordContainer: { width: "100%", flexDirection: "row", alignItems: "center", marginTop: 10 },
  showPasswordButton: { position: "absolute", right: 10, padding: 5 },
  signupContainer: { marginTop: 40, flexDirection: "row", justifyContent: "center", alignItems: "center" },
  signupText: { fontSize: 18, color: "black" },
  signupLink: { fontSize: 18, color: "#002244", fontWeight: "bold" },
});

export default LoginScreen;
