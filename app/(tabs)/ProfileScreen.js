// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Animated,
//   Dimensions,
//   Linking,
// } from "react-native";
// import { doc, getDoc } from "firebase/firestore";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { db } from "./firebaseConfig";
// import { LinearGradient } from "expo-linear-gradient";
// import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// const { width } = Dimensions.get("window");

// const ProfileScreen = ({ navigation }) => {
//   const [userData, setUserData] = useState(null);
//   const [scaleValue] = useState(new Animated.Value(1));

//   useEffect(() => {
//     const getUserData = async () => {
//       try {
//         const userId = await AsyncStorage.getItem("userId");
//         if (!userId) return;
//         const docRef = doc(db, "Profile", userId);
//         const docSnap = await getDoc(docRef);
//         if (docSnap.exists()) {
//           setUserData(docSnap.data());
//         }
//       } catch (error) {
//         console.error("Error:", error);
//       }
//     };
//     getUserData();
//   }, []);

//   const handleLogout = async () => {
//     Animated.sequence([
//       Animated.timing(scaleValue, {
//         toValue: 0.95,
//         duration: 100,
//         useNativeDriver: true,
//       }),
//       Animated.timing(scaleValue, {
//         toValue: 1,
//         duration: 100,
//         useNativeDriver: true,
//       }),
//     ]).start(async () => {
//       await AsyncStorage.removeItem("userId");
//       navigation.navigate("LoginScreen");
//     });
//   };

//   return (
//     <View style={styles.container}>
//       <LinearGradient colors={["#00796B", "#004D40"]} style={styles.headerGradient}>
//         <View style={styles.headerOverlay}>
//           <View style={styles.profileSection}>
//             <View style={styles.profileImageContainer}>
//               <LinearGradient
//                 colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.1)"]}
//                 style={styles.profileIconContainer}
//               >
//                 <Ionicons name="person" size={50} color="#fff" />
//               </LinearGradient>
//               <View style={styles.onlineIndicator} />
//             </View>
//             <Text style={styles.name}>{userData?.name || "Loading..."}</Text>
//             <Text style={styles.email}>{userData?.email || ""}</Text>
//           </View>
//         </View>
//       </LinearGradient>

//       <View style={styles.contentContainer}>
//         <View style={styles.infoCard}>
//           <LinearGradient colors={["#E8F5E9", "#C8E6C9"]} style={styles.iconBackground}>
//             <MaterialCommunityIcons name="phone-outline" size={24} color="#00796B" />
//           </LinearGradient>
//           <View style={styles.infoTextContainer}>
//             <Text style={styles.infoLabel}>Contact Number</Text>
//             <Text style={styles.infoValue}>{userData?.phone || "Not specified"}</Text>
//           </View>
//         </View>

//         <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
//           <LinearGradient
//             colors={["#00796B", "#004D40"]}
//             style={styles.logoutGradient}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 1 }}
//           >
//             <MaterialCommunityIcons name="logout" size={24} color="#fff" style={styles.logoutIcon} />
//             <Text style={styles.logoutText}>Logout</Text>
//           </LinearGradient>
//         </TouchableOpacity>

//         {/* Footer */}
//         {/* <View style={styles.footer}>
//           <TouchableOpacity onPress={() => Linking.openURL("https://indidevelopers.com")}>
//             <Text style={styles.footerText}>
//               <Text style={{ color: "#666" }}>Designed & Developed by </Text>
//               <Text style={{ color: "#00796B", fontWeight: "bold" }}>Indidevelopers</Text>
//             </Text>
//           </TouchableOpacity>
//         </View> */}

//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f5f5f5",
//   },
//   headerGradient: {
//     height: 280,
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//   },
//   headerOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.1)",
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//   },
//   profileSection: {
//     alignItems: "center",
//     paddingTop: 60,
//   },
//   profileImageContainer: {
//     position: "relative",
//     marginBottom: 20,
//   },
//   profileIconContainer: {
//     width: 110,
//     height: 110,
//     borderRadius: 55,
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 3,
//     borderColor: "rgba(255,255,255,0.5)",
//   },
//   onlineIndicator: {
//     position: "absolute",
//     right: 5,
//     bottom: 5,
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     backgroundColor: "#4CAF50",
//     borderWidth: 3,
//     borderColor: "#fff",
//   },
//   name: {
//     fontSize: 26,
//     fontWeight: "bold",
//     color: "#fff",
//     marginBottom: 8,
//     textShadowColor: "rgba(0,0,0,0.2)",
//     textShadowOffset: { width: 0, height: 1 },
//     textShadowRadius: 2,
//   },
//   email: {
//     fontSize: 16,
//     color: "#B2DFDB",
//     marginBottom: 10,
//   },
//   contentContainer: {
//     flex: 1,
//     padding: 20,
//     justifyContent: "space-between",
//   },
//   infoCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     padding: 20,
//     borderRadius: 16,
//     marginTop: 20,
//     elevation: 4,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//   },
//   iconBackground: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   infoTextContainer: {
//     marginLeft: 15,
//     flex: 1,
//   },
//   infoLabel: {
//     fontSize: 14,
//     color: "#666",
//     marginBottom: 4,
//     fontWeight: "500",
//   },
//   infoValue: {
//     fontSize: 18,
//     color: "#333",
//     fontWeight: "600",
//   },
//   logoutButton: {
//     borderRadius: 16,
//     overflow: "hidden",
//     elevation: 4,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//     width: "100%",
//   },
//   logoutGradient: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 16,
//   },
//   logoutIcon: {
//     marginRight: 10,
//   },
//   logoutText: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "600",
//     letterSpacing: 0.5,
//   },
//   footer: {
//     alignItems: "center",
//     marginTop: 20,
//   },
//   footerText: {
//     fontSize: 14,
//     color: "#00796B",
//     fontWeight: "500",

//   },
// });

// export default ProfileScreen;
import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { db } from './firebaseConfig';  // Import the initialized db
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, getDocs, doc, getDoc } from 'firebase/firestore';

const ProfileScreen = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [auditData, setAuditData] = useState(null);

  useEffect(() => {
    const askForNotificationPermission = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      console.log('Notification Permission Status:', status);  // Log the permission status
      if (status === 'granted') {
        setPermissionGranted(true);
      } else {
        Alert.alert('Permission to access notifications was denied');
      }
    };
    askForNotificationPermission();
  }, []);

  // Fetch User's Accepted Audits from Firestore (Profile -> acceptedAudits)
  const fetchAcceptedAudit = async () => {
    const userId = await AsyncStorage.getItem("userId");
    if (!userId) {
      Alert.alert('User ID not found');
      return null;
    }

    const acceptedAuditsRef = collection(db, 'Profile', userId, 'acceptedAudits');
    const q = query(acceptedAuditsRef);
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const auditDoc = querySnapshot.docs[0];
      const auditData = auditDoc.data();
      return auditData;
    }
    return null;
  };

  // Fetch full audit details from the Audits collection
  const fetchAuditDetails = async (auditId) => {
    const auditRef = doc(db, 'audits', auditId);
    const auditSnap = await getDoc(auditRef);

    if (auditSnap.exists()) {
      return auditSnap.data();
    }
    return null;
  };

  // Schedule notification for 5 seconds after the "Accept Audit" button is clicked
  const scheduleNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Notification',
          body: 'This is a test notification triggered immediately!',
        },
        trigger: {
          type: 'minute',
          seconds: 1,  // Trigger 1 second after scheduling
        },
      });
      console.log('Test notification scheduled');
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  // Set up the notification when the audit is accepted
  const setupNotification = async () => {
    const acceptedAudit = await fetchAcceptedAudit();

    if (acceptedAudit) {
      const { auditId, auditDate } = acceptedAudit;
      const fullAuditDetails = await fetchAuditDetails(auditId);

      if (fullAuditDetails) {
        setAuditData(fullAuditDetails);  // Store full audit data for display
        scheduleNotification(); // Schedule notification after 5 seconds
      } else {
        Alert.alert('Audit details not found');
      }
    } else {
      Alert.alert('No accepted audits found');
    }
  };

  const handleAcceptAudit = async () => {
    Alert.alert('Audit Accepted!', 'You will be notified in 5 seconds.');

    // Schedule the notification 5 seconds after acceptance
    scheduleNotification();
  };

  // Listen for notifications in the foreground
  useEffect(() => {
    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received in foreground:', notification);
      // Manually display an alert or take an action
      Alert.alert(
        notification.request.content.title,
        notification.request.content.body
      );
    });

    // Handle notification interaction in the background
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      // Handle the response, e.g., navigate to a specific screen
    });

    // Clean up listeners
    return () => {
      foregroundSubscription.remove();
      responseListener.remove();
    };
  }, []);

  if (!permissionGranted) {
    return (
      <View>
        <Text>Requesting Notification Permission...</Text>
      </View>
    );
  }

  return (
    <View>
      <Text>Audit Notification Example</Text>
      {auditData ? (
        <>
          <Text>Audit Title: {auditData.title}</Text>
          <Text>Audit Date: {new Date(auditData.auditDate).toLocaleDateString()}</Text>
        </>
      ) : (
        <Text>Loading audit data...</Text>
      )}
      <Button title="Accept Audit" onPress={handleAcceptAudit} />
    </View>
  );
};

export default ProfileScreen;
