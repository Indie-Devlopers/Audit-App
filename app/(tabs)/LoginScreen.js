
import React, { useState } from "react";
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import{auth} from './firebaseConfig';
import { signInWithEmailAndPassword } from "firebase/auth";
import Icon from 'react-native-vector-icons/FontAwesome';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Email validation regex
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

  // Password validation regex
//   const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
const passwordRegex = /^[a-z]{8,}$/;


  const handleLogin = () => {
    let isValid = true;

    // Reset previous error messages
    setEmailError("");
    setPasswordError("");

    // Email validation
    // if (!emailRegex.test(email)) {
    //   setEmailError("Please enter a valid email.");
    //   isValid = false;
    // }

    // Password validation
    // if (!passwordRegex.test(password)) {
    //   setPasswordError(
    //     "Password must contain at least 1 special symbol, 1 uppercase letter, 1 lowercase letter, and 1 number."
    //   );
    //   isValid = false;
    // }


    
    // if (!passwordRegex.test(password)) {
    //     setPasswordError("Password must contain only lowercase letters and be at least 8 characters long.");
    //     isValid = false;
    //   }
    
    // if (isValid) {
    //   signInWithEmailAndPassword(auth, email, password)
    //     .then((userCredential) => {
        
    //       navigation.navigate("NextPage"); 
    //     })
    //     .catch((error) => {
        
    //       const errorMessage = error.message;
    //       Alert.alert("Login Error", errorMessage);
    //     });
    // }



    // In LoginScreen component, inside handleLogin function
if (isValid) {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Successfully signed in, navigate to HomeScreen and pass the email
        navigation.navigate("HomeScreen", { userEmail: email });
      })
      .catch((error) => {
        const errorMessage = error.message;
        Alert.alert("Login Error", errorMessage);
      });
  }
  
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
  
      {/* Email field */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        keyboardType="email-address"
      />
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
  
      {/* Password field */}
      <Text style={styles.label}>Password</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          value={password}
          onChangeText={(text) => setPassword(text)}
          secureTextEntry={!showPassword} 
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordButton}>
        <Icon name={showPassword ? 'eye' : 'eye-slash'} size={20} color="black" />
        </TouchableOpacity>
      </View>
      {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
  
      {/* Login Button */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>
    </View>
  );}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    // borderWidth: 4,
    // borderColor: "#4CA6FF", 
    
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
    color: "black",
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: "left",
    width: "100%",
    color: "black",
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    // borderWidth: 1.5,
    // borderColor: "grey",
    // borderRadius: 5,
    backgroundColor:'#DCDCDC',
  },
  button: {
    backgroundColor: "#4CA6FF",
    padding: 10,
    width: "100%",
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    textAlign: "left",
    width: "100%",
    marginBottom: 10,
  },
  passwordContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  showPasswordButton: {
    position: "absolute",
    right: 10,
    padding: 5,
  },
});

export default LoginScreen;
