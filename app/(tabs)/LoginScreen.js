
// import React, { useState } from "react";
// import { View, TextInput, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import{auth} from './firebaseConfig';
// import { signInWithEmailAndPassword } from "firebase/auth";
// import Icon from 'react-native-vector-icons/FontAwesome';

// const LoginScreen = ({ navigation }) => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [emailError, setEmailError] = useState("");
//   const [passwordError, setPasswordError] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   // Email validation regex
//   const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

//   // Password validation regex
// //   const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
// const passwordRegex = /^[a-z]{8,}$/;


//   const handleLogin = () => {
//     let isValid = true;

//     // Reset previous error messages
//     setEmailError("");
//     setPasswordError("");

//     // Email validation
//     // if (!emailRegex.test(email)) {
//     //   setEmailError("Please enter a valid email.");
//     //   isValid = false;
//     // }

//     // Password validation
//     // if (!passwordRegex.test(password)) {
//     //   setPasswordError(
//     //     "Password must contain at least 1 special symbol, 1 uppercase letter, 1 lowercase letter, and 1 number."
//     //   );
//     //   isValid = false;
//     // }


    
//     // if (!passwordRegex.test(password)) {
//     //     setPasswordError("Password must contain only lowercase letters and be at least 8 characters long.");
//     //     isValid = false;
//     //   }
    
//     // if (isValid) {
//     //   signInWithEmailAndPassword(auth, email, password)
//     //     .then((userCredential) => {
        
//     //       navigation.navigate("NextPage"); 
//     //     })
//     //     .catch((error) => {
        
//     //       const errorMessage = error.message;
//     //       Alert.alert("Login Error", errorMessage);
//     //     });
//     // }



//     // In LoginScreen component, inside handleLogin function
// if (isValid) {
//     signInWithEmailAndPassword(auth, email, password)
//       .then((userCredential) => {
//         // Successfully signed in, navigate to HomeScreen and pass the email
//         navigation.navigate("HomeScreen", { userEmail: email });
//       })
//       .catch((error) => {
//         const errorMessage = error.message;
//         Alert.alert("Login Error", errorMessage);
//       });
//   }
  
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Login</Text>
  
//       {/* Email field */}
//       <Text style={styles.label}>Email</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Enter your email"
//         value={email}
//         onChangeText={(text) => setEmail(text)}
//         keyboardType="email-address"
//       />
//       {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
  
//       {/* Password field */}
//       <Text style={styles.label}>Password</Text>
//       <View style={styles.passwordContainer}>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter your password"
//           value={password}
//           onChangeText={(text) => setPassword(text)}
//           secureTextEntry={!showPassword} 
//         />
//         <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordButton}>
//         <Icon name={showPassword ? 'eye' : 'eye-slash'} size={20} color="black" />
//         </TouchableOpacity>
//       </View>
//       {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
  
//       {/* Login Button */}
//       <TouchableOpacity style={styles.button} onPress={handleLogin}>
//         <Text style={styles.buttonText}>Log In</Text>
//       </TouchableOpacity>
//     </View>
//   );}


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
    
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//     // borderWidth: 4,
//     // borderColor: "#4CA6FF", 
    
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: "bold",
//     marginBottom: 30,
//     color: "black",
//   },
//   label: {
//     fontSize: 16,
//     marginBottom: 5,
//     textAlign: "left",
//     width: "100%",
//     color: "black",
//   },
//   input: {
//     width: "100%",
//     padding: 10,
//     marginBottom: 10,
//     // borderWidth: 1.5,
//     // borderColor: "grey",
//     // borderRadius: 5,
//     backgroundColor:'#DCDCDC',
//   },
//   button: {
//     backgroundColor: "#4CA6FF",
//     padding: 10,
//     width: "100%",
//     borderRadius: 5,
//     alignItems: "center",
//   },
//   buttonText: {
//     color: "white",
//     fontSize: 18,
//   },
//   errorText: {
//     color: "red",
//     fontSize: 12,
//     textAlign: "left",
//     width: "100%",
//     marginBottom: 10,
//   },
//   passwordContainer: {
//     width: "100%",
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   showPasswordButton: {
//     position: "absolute",
//     right: 10,
//     padding: 5,
//   },
// });

// export default LoginScreen;


















// import React, { useState } from "react";
// import {
//   View,
//   TextInput,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ScrollView,
// } from "react-native";
// import { collection, query, where, getDocs } from "firebase/firestore";
// import { db,} from "./firebaseConfig";
// import Icon from "react-native-vector-icons/FontAwesome";

// const LoginScreen = ({ navigation }) => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [emailError, setEmailError] = useState("");
//   const [passwordError, setPasswordError] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   const handleLogin = async () => {
//     // Reset previous error messages
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
//         // Valid user, navigate to HomeScreen
//         Alert.alert("Login Successful", "Welcome back!");
//         navigation.navigate("HomeScreen", { userEmail: email });
//       } else {
//         // Invalid credentials
//         Alert.alert("Login Error", "Invalid email or password.");
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error.message);
//       Alert.alert("Error", "Could not connect to the server. Check permissions.");
//     }
//   };

//   // const handleLogin = async () => {
//   //   // Reset previous error messages
//   //   setEmailError("");
//   //   setPasswordError("");
  
//   //   if (!email || !password) {
//   //     if (!email) setEmailError("Email is required.");
//   //     if (!password) setPasswordError("Password is required.");
//   //     return;
//   //   }
  
//   //   try {
//   //     // Query Firestore to validate email and password
//   //     const profilesRef = collection(db, "Profile");
//   //     const q = query(
//   //       profilesRef,
//   //       where("email", "==", email), 
//   //       where("password", "==", password)
//   //     );
  
//   //     const querySnapshot = await getDocs(q);
  
//   //     if (!querySnapshot.empty) {
//   //       // Valid user, navigate to HomeScreen
//   //       querySnapshot.forEach((doc) => {
//   //         console.log("User data:", doc.data()); // Log user data for debugging
//   //       });
  
//   //       Alert.alert("Login Successful", "Welcome back!");
//   //       navigation.navigate("HomeScreen", { userEmail: email });
//   //     } else {
//   //       // Invalid credentials
//   //       Alert.alert("Login Error", "Invalid email or password.");
//   //     }
//   //   } catch (error) {
//   //     console.error("Error fetching data:", error.message);
//   //     Alert.alert("Error", "Could not connect to the server. Check permissions.");
//   //   }
//   // };
  

//   return (
//     <View style={styles.container}>
//       <ScrollView contentContainerStyle={styles.scrollContainer}>
//         <Text style={styles.title}>Login</Text>
//         <Text style={styles.subtitle}>
//           Access your account securely by using your registered email.
//         </Text>

//         {/* Email field */}
//         <Text style={styles.label}>Email</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter Address"
//           value={email}
//           onChangeText={(text) => setEmail(text)}
//           keyboardType="email-address"
//         />
//         {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

//         {/* Password field */}
//         <Text style={styles.label}>Password</Text>
//         <View style={styles.passwordContainer}>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter Password"
//             value={password}
//             onChangeText={(text) => setPassword(text)}
//             secureTextEntry={!showPassword}
//           />
//           <TouchableOpacity
//             onPress={() => setShowPassword(!showPassword)}
//             style={styles.showPasswordButton}
//           >
//             <Icon
//               name={showPassword ? "eye" : "eye-slash"}
//               size={20}
//               color="black"
//             />
//           </TouchableOpacity>
//         </View>
//         {passwordError ? (
//           <Text style={styles.errorText}>{passwordError}</Text>
//         ) : null}

//         {/* Login Button */}
//         <View style={{ marginTop: 50 }}></View>
//         <TouchableOpacity style={styles.button} onPress={handleLogin}>
//           <Text style={styles.buttonText}>Log In</Text>
//         </TouchableOpacity>

//         {/* Sign Up Option */}
//         <View style={styles.signupContainer}>
//           <Text style={styles.signupText}>Don't have an account? </Text>
//           <TouchableOpacity
//             onPress={() => navigation.navigate("SignUpScreen")}
//           >
//             <Text style={styles.signupLink}>Sign Up</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   scrollContainer: {
//     flexGrow: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingBottom: 50,
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: "bold",
//     marginBottom: 20,
//     color: "#002244",
//   },
//   subtitle: {
//     fontSize: 15,
//     fontWeight: "bold",
//     marginBottom: 20,
//     color: "#002244",
//     textAlign: "center",
//   },
//   label: {
//     fontSize: 16,
//     marginBottom: 5,
//     textAlign: "left",
//     width: "100%",
//     color: "black",
//     marginTop: 20,
//   },
//   input: {
//     width: "100%",
//     padding: 10,
//     marginBottom: 10,
//     backgroundColor: "#DCDCDC",
//     borderRadius: 15,
//   },
//   button: {
//     backgroundColor: "#002244",
//     padding: 10,
//     width: "100%",
//     borderRadius: 35,
//     alignItems: "center",
//   },
//   buttonText: {
//     color: "white",
//     fontSize: 18,
//   },
//   errorText: {
//     color: "red",
//     fontSize: 12,
//     textAlign: "left",
//     width: "100%",
//     marginBottom: 10,
//   },
//   passwordContainer: {
//     width: "100%",
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 10,
//   },
//   showPasswordButton: {
//     position: "absolute",
//     right: 10,
//     padding: 5,
//   },
//   signupContainer: {
//     marginTop: 40,
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   signupText: {
//     fontSize: 18,
//     color: "black",
//   },
//   signupLink: {
//     fontSize: 18,
//     color: "#002244",
//     fontWeight: "bold",
//   },
// });

// export default LoginScreen;







import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";
import Icon from "react-native-vector-icons/FontAwesome";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // const handleLogin = async () => {
  //   // Reset error messages
  //   setEmailError("");
  //   setPasswordError("");

  //   if (!email || !password) {
  //     if (!email) setEmailError("Email is required.");
  //     if (!password) setPasswordError("Password is required.");
  //     return;
  //   }

  //   try {
  //     // Query Firestore to validate email and password
  //     const profilesRef = collection(db, "Profile");
  //     const q = query(
  //       profilesRef,
  //       where("email", "==", email),
  //       where("password", "==", password)
  //     );
  //     const querySnapshot = await getDocs(q);
  //     // console.log(querySnapshot.id)
  //     querySnapshot.forEach((doc) => {
  //       console.log('Document ID (User ID):', doc.id);
      
  //     })
  //     if (!querySnapshot.empty) {
  //       // const userProfile = querySnapshot.docs[0].data();
  //       // const ProfileId = querySnapshot.docs[0].id; //profile check

  //       Alert.alert("Login Successful", "Welcome back!");
  //       navigation.navigate("HomeScreen", { userEmail: email });

  //     } else {
  //       // Invalid credentials
  //       Alert.alert("Login Error", "Invalid email or password.");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching data:", error.message);
  //     Alert.alert(
  //       "Error",
  //       "Could not connect to the server. Please try again later."
  //     );
  //   }
  // };


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
        querySnapshot.forEach((doc) => {
          console.log("Document ID (User ID):", doc.id); // Log the document ID
          console.log("User Profile:", doc.data()); // Log user profile data
        });
  
        // Navigate to HomeScreen after successful login
        Alert.alert("Login Successful", "Welcome back!");
        navigation.navigate("HomeScreen", { userEmail: email });
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
        <Text style={styles.subtitle}>
          Access your account securely by using your registered email.
        </Text>

        {/* Email field */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Address"
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
            placeholder="Enter Password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.showPasswordButton}
          >
            <Icon
              name={showPassword ? "eye" : "eye-slash"}
              size={20}
              color="black"
            />
          </TouchableOpacity>
        </View>
        {passwordError ? (
          <Text style={styles.errorText}>{passwordError}</Text>
        ) : null}

        {/* Login Button */}
        <View style={{ marginTop: 50 }}></View>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>

        {/* Sign Up Option */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("SignUpScreen")}
          >
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#002244",
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#002244",
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: "left",
    width: "100%",
    color: "black",
    marginTop: 20,
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#DCDCDC",
    borderRadius: 15,
  },
  button: {
    backgroundColor: "#002244",
    padding: 10,
    width: "100%",
    borderRadius: 35,
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
    marginTop: 10,
  },
  showPasswordButton: {
    position: "absolute",
    right: 10,
    padding: 5,
  },
  signupContainer: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    fontSize: 18,
    color: "black",
  },
  signupLink: {
    fontSize: 18,
    color: "#002244",
    fontWeight: "bold",
  },
});

export default LoginScreen;


