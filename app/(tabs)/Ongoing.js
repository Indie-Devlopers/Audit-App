





// import React, { useState, useEffect } from "react";
// import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
// import { getFirestore, collection, query, getDocs, doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
// import AsyncStorage from "@react-native-async-storage/async-storage"; // For userId storage
// import { app } from "./firebaseConfig"; // Firebase configuration

// const db = getFirestore(app);

// const Ongoing = ({ navigation }) => {
//   const [ongoingAudits, setOngoingAudits] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadOngoingAudits = async () => {
//       setLoading(true); // Show loading
//       try {
//         const userId = await AsyncStorage.getItem("userId");
//         if (!userId) {
//           console.error("User ID not found!");
//           return;
//         }

//         const userAcceptedRef = collection(doc(db, "Profile", userId), "acceptedAudits");
//         const acceptedAuditsSnap = await getDocs(userAcceptedRef);

//         const fetchedAudits = [];
//         for (const auditDoc of acceptedAuditsSnap.docs) {
//           const auditData = auditDoc.data();
//           const auditId = auditDoc.id;

//           // Fetch full audit details
//           const auditRef = doc(db, "audits", auditId);
//           const auditSnap = await getDoc(auditRef);

//           if (auditSnap.exists()) {
//             const auditDetails = auditSnap.data();

//             // Fetch branch details
//             const branchRef = doc(db, "branches", auditDetails.branchId);
//             const branchSnap = await getDoc(branchRef);

//             // Fetch client details
//             const clientRef = doc(db, "clients", auditDetails.clientId);
//             const clientSnap = await getDoc(clientRef);

//             if (branchSnap.exists() && clientSnap.exists()) {
//               fetchedAudits.push({
//                 id: auditId,
//                 ...auditDetails,
//                 branchDetails: branchSnap.data(),
//                 clientDetails: clientSnap.data(),
//               });
//             } else {
//               console.log("Branch or client details missing for audit:", auditId);
//             }
//           }
//         }

//         setOngoingAudits(fetchedAudits);
//       } catch (error) {
//         console.error("Error loading ongoing audits:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadOngoingAudits();
//   }, []); // Runs on initial load

//   // const handleComplete = async (auditId) => {
//   //   try {
//   //     // Log auditId to ensure the value is passed correctly
//   //     console.log("Completing audit", auditId);
  
//   //     const userId = await AsyncStorage.getItem("userId");
//   //     if (!userId) {
//   //       console.error("User ID not found!");
//   //       return;
//   //     }
  
//   //     // Mark the audit as completed in the "audits" collection
//   //     await updateDoc(doc(db, "audits", auditId), { isCompleted: true });
  
//   //     // Update the completedCounter in the user's profile
//   //     const userProfileRef = doc(db, "Profile", userId);
//   //     const userProfileSnap = await getDoc(userProfileRef);
  
//   //     if (userProfileSnap.exists()) {
//   //       const userProfileData = userProfileSnap.data();
//   //       const completedCount = (userProfileData.completedCounter || 0) + 1;
  
//   //       // Update the completedCounter
//   //       await updateDoc(userProfileRef, {
//   //         completedCounter: completedCount,
//   //       });
  
//   //       // Move the auditId to the completedAudits collection
//   //       await setDoc(doc(db, "Profile", userId, "completedAudits", auditId), {
//   //         auditId,
//   //         completedAt: new Date(),
//   //       });
//   //     }
  
//   //     // Remove the audit from the ongoing list
//   //     setOngoingAudits((prev) => prev.filter((audit) => audit.id !== auditId));
  
//   //     // Navigate to the CompletedTasks screen
//   //     navigation.navigate("CompletedTasks", { auditId, isCompleted: true });
//   //   } catch (error) {
//   //     console.error("Error completing audit:", error);
//   //   }
//   // };
  


//   // const handleRemove = async (auditId, auditName) => {
//   //   try {
//   //     // Mark the audit as rejected in the "audits" collection
//   //     await updateDoc(doc(db, "audits", auditId), { isRejected: true });

//   //     // Remove the audit from the ongoing list
//   //     setOngoingAudits((prev) => prev.filter((audit) => audit.id !== auditId));

//   //     // Navigate to the RejectedAudits screen
//   //     navigation.navigate("RejectedAudits", { auditName, isRejected: true });
//   //   } catch (error) {
//   //     console.error("Error removing audit:", error);
//   //   }
//   // };



//   // const handleComplete = async (auditId) => {
//   //   try {
//   //     const userId = await AsyncStorage.getItem("userId");
//   //     if (!userId) {
//   //       console.error("User ID not found!");
//   //       return;
//   //     }
  
//   //     // Mark the audit as completed in the "audits" collection
//   //     await updateDoc(doc(db, "audits", auditId), { isCompleted: true });
  
//   //     // Update the completedCounter in the user's profile
//   //     const userProfileRef = doc(db, "Profile", userId);
//   //     const userProfileSnap = await getDoc(userProfileRef);
  
//   //     if (userProfileSnap.exists()) {
//   //       const userProfileData = userProfileSnap.data();
//   //       const completedCount = (userProfileData.completedCounter || 0) + 1;
  
//   //       // Update the completedCounter
//   //       await updateDoc(userProfileRef, {
//   //         completedCounter: completedCount,
//   //       });
  
//   //       // Move the auditId to the completedAudits collection
//   //       await setDoc(doc(db, "Profile", userId, "completedAudits", auditId), {
//   //         auditId,
//   //         completedAt: new Date(),
//   //       });
  
//   //       // Remove the auditId from acceptedAudits
//   //       const acceptedAuditsRef = doc(db, "Profile", userId);
//   //       const acceptedAuditsSnap = await getDoc(acceptedAuditsRef);
//   //       const acceptedAuditsData = acceptedAuditsSnap.data();
//   //       const acceptedAuditsList = acceptedAuditsData.acceptedAudits || [];
  
//   //       // Filter out the completed auditId
//   //       const updatedAcceptedAudits = acceptedAuditsList.filter(
//   //         (id) => id !== auditId
//   //       );
  
//   //       // Update the acceptedAudits collection
//   //       await updateDoc(acceptedAuditsRef, {
//   //         acceptedAudits: updatedAcceptedAudits,
//   //       });
  
//   //       // Update ongoingCounter
//   //       const ongoingCounter = Math.max(0, (userProfileData.ongoingCounter || 0) - 1);
//   //       await updateDoc(userProfileRef, {
//   //         ongoingCounter: ongoingCounter,
//   //       });
//   //     }
  

//   //     // Remove the audit from the ongoing list in the UI
//   //     setOngoingAudits((prev) => prev.filter((audit) => audit.id !== auditId));
  
//   //     // Navigate to the CompletedTasks screen
//   //     navigation.navigate("CompletedTasks", { auditId, isCompleted: true });
//   //   } catch (error) {
//   //     console.error("Error completing audit:", error);
//   //   }
//   // };
//   const handleComplete = async (auditId) => {
//     try {
//       const userId = await AsyncStorage.getItem("userId");
//       if (!userId) {
//         console.error("User ID not found!");
//         return;
//       }
  
//       // Step 1: Mark the audit as completed in the "audits" collection
//       await updateDoc(doc(db, "audits", auditId), { isCompleted: true });
  
//       // Step 2: Update the completedCounter in the user's profile
//       const userProfileRef = doc(db, "Profile", userId);
//       const userProfileSnap = await getDoc(userProfileRef);
  
//       if (userProfileSnap.exists()) {
//         const userProfileData = userProfileSnap.data();
//         const completedCount = (userProfileData.completedCounter || 0) + 1;
  
//         // Update the completedCounter
//         await updateDoc(userProfileRef, {
//           completedCounter: completedCount,
//         });
  
//         // Step 3: Remove the auditId from the acceptedAudits array in Profile -> userId -> acceptedAudits
//         const acceptedAuditsRef = doc(db, "Profile", userId);
//         await updateDoc(acceptedAuditsRef, {
//           acceptedAudits: arrayRemove(auditId), // Remove the auditId from acceptedAudits
//         });
  
//         // Step 4: Decrease the ongoingCounter by 1
//         const ongoingCounter = Math.max(0, (userProfileData.ongoingCounter || 0) - 1);
//         await updateDoc(userProfileRef, {
//           ongoingCounter: ongoingCounter,
//         });
  
//         // Step 5: Move the auditId to the completedAudits collection
//         await setDoc(doc(db, "Profile", userId, "completedAudits", auditId), {
//           auditId,
//           completedAt: new Date(),
//         });
//       }
  
//       // Step 6: Remove the audit from the ongoing list in the UI
//       setOngoingAudits((prev) => prev.filter((audit) => audit.id !== auditId));
  
//       // Step 7: Navigate to the CompletedTasks screen
//       navigation.navigate("CompletedTasks", { auditId, isCompleted: true });
//     } catch (error) {
//       console.error("Error completing audit:", error);
//     }
//   };
  
  
  

//   // const handleRemove = async (auditId, auditName) => {
//   //   try {
//   //     const userId = await AsyncStorage.getItem("userId");
//   //     if (!userId) {
//   //       console.error("User ID not found!");
//   //       return;
//   //     }
  
//   //     // Mark the audit as rejected in the "audits" collection
//   //     await updateDoc(doc(db, "audits", auditId), { isRejected: true });
  
//   //     // Remove the auditId from acceptedAudits
//   //     const acceptedAuditsRef = doc(db, "Profile", userId);
//   //     const acceptedAuditsSnap = await getDoc(acceptedAuditsRef);
//   //     const acceptedAuditsData = acceptedAuditsSnap.data();
//   //     const acceptedAuditsList = acceptedAuditsData.acceptedAudits || [];
  
//   //     // Filter out the rejected auditId
//   //     const updatedAcceptedAudits = acceptedAuditsList.filter(
//   //       (id) => id !== auditId
//   //     );
  
//   //     // Update the acceptedAudits collection
//   //     await updateDoc(acceptedAuditsRef, {
//   //       acceptedAudits: updatedAcceptedAudits,
//   //     });
  
//   //     // Update ongoingCounter
//   //     const userProfileRef = doc(db, "Profile", userId);
//   //     const userProfileSnap = await getDoc(userProfileRef);
//   //     const userProfileData = userProfileSnap.data();
//   //     const ongoingCounter = Math.max(0, (userProfileData.ongoingCounter || 0) - 1);
  
//   //     // Update the ongoingCounter
//   //     await updateDoc(userProfileRef, {
//   //       ongoingCounter: ongoingCounter,
//   //     });
  
//   //     // Remove the audit from the ongoing list in the UI
//   //     setOngoingAudits((prev) => prev.filter((audit) => audit.id !== auditId));
  
//   //     // Navigate to the RejectedAudits screen
//   //     navigation.navigate("RejectedAudits", { auditName, isRejected: true });
//   //   } catch (error) {
//   //     console.error("Error removing audit:", error);
//   //   }
//   // };
//   const handleRemove = async (auditId, auditName) => {
//     try {
//       const userId = await AsyncStorage.getItem("userId");
//       if (!userId) {
//         console.error("User ID not found!");
//         return;
//       }
  
//       // Mark the audit as rejected in the "audits" collection
//       await updateDoc(doc(db, "audits", auditId), { isRejected: true });
  
//       // Remove the auditId from acceptedAudits inside Profile -> userId -> acceptedAudits
//       const acceptedAuditsRef = doc(db, "Profile", userId);
//       const acceptedAuditsSnap = await getDoc(acceptedAuditsRef);
//       const acceptedAuditsData = acceptedAuditsSnap.data();
  
//       // Ensure acceptedAudits is an array
//       const acceptedAuditsList = acceptedAuditsData?.acceptedAudits || [];
  
//       // Filter out the rejected auditId from acceptedAudits list
//       const updatedAcceptedAudits = acceptedAuditsList.filter(
//         (id) => id !== auditId
//       );
  
//       // Update the acceptedAudits collection
//       await updateDoc(acceptedAuditsRef, {
//         acceptedAudits: updatedAcceptedAudits,
//       });
  
//       // Decrease the ongoingCounter by 1
//       const userProfileRef = doc(db, "Profile", userId);
//       const userProfileSnap = await getDoc(userProfileRef);
//       const userProfileData = userProfileSnap.data();
//       const ongoingCounter = Math.max(0, (userProfileData.ongoingCounter || 0) - 1);
  
//       // Update the ongoingCounter
//       await updateDoc(userProfileRef, {
//         ongoingCounter: ongoingCounter,
//       });
  
//       // Remove the audit from the ongoing list in the UI
//       setOngoingAudits((prev) => prev.filter((audit) => audit.id !== auditId));
  
//       // Navigate to the RejectedAudits screen
//       navigation.navigate("RejectedAudits", { auditName, isRejected: true });
//     } catch (error) {
//       console.error("Error removing audit:", error);
//     }
//   };
  
  
  

//   const handleGenerateReport = (auditId, auditName) => {
//     // Navigate to the ReportScreen with the auditId and auditName as params
//     navigation.navigate("ReportScreen", { auditId, auditName });
//   };

//   const renderFields = (data, excludeKeys = []) =>
//     data
//       ? Object.entries(data)
//           .filter(([key]) => !excludeKeys.includes(key)) // Exclude specified keys
//           .map(([key, value]) => (
//             <Text key={key} style={styles.detailText}>
//               {key}: {value}
//             </Text>
//           ))
//       : <Text>No details available</Text>;

//   return (
//     <ScrollView style={styles.container}>
//       {loading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#4CAF50" />
//         </View>
//       ) : ongoingAudits.length === 0 ? (
//         <View style={styles.noTasksContainer}>
//           <Text style={styles.noTasksText}>No ongoing tasks</Text>
//         </View>
//       ) : (
//         ongoingAudits.map((audit) => (
//           <View key={audit.id} style={styles.cardContainer}>
//             <Text style={styles.clientName}>{audit.clientDetails.clientName}</Text>

//             <View style={styles.detailsSection}>
//               <Text style={styles.subTitle}>Client Details:</Text>
//               {renderFields(audit.clientDetails)}
//               <Text style={{ marginTop: 10 }}></Text>
//               <Text style={styles.subTitle}>Branch Details:</Text>
//               {renderFields(audit.branchDetails, ["clientId"])}
//             </View>

//             <View style={styles.buttonsContainer}>
//               <TouchableOpacity
//                 style={styles.completeButton}
//                 onPress={() => handleComplete(audit.id, audit.clientDetails.clientName)}
//               >
//                 <Text style={styles.completeButtonText}>Complete</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.removeButton}
//                 onPress={() => handleRemove(audit.id, audit.clientDetails.clientName)}
//               >
//                 <Text style={styles.removeButtonText}>Remove</Text>
//               </TouchableOpacity>

//               {/* Generate Report Button */}
//               <TouchableOpacity
//                 style={styles.generateReportButton}
//                 onPress={() => handleGenerateReport(audit.id, audit.clientDetails.clientName)}
//               >
//                 <Text style={styles.generateReportButtonText}>Generate Report</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         ))
//       )}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 15,
//     backgroundColor: "white",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   cardContainer: {
//     marginBottom: 30,
//   },
//   detailsSection: {
//     marginBottom: 20,
//   },
//   clientName: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   subTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginBottom: 5,
//   },
//   detailText: {
//     fontSize: 14,
//     color: "#555",
//     marginBottom: 5,
//   },
//   buttonsContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   completeButton: {
//     backgroundColor: "#4CAF50",
//     padding: 12,
//     borderRadius: 5,
//     alignItems: "center",
//     flex: 1,
//     marginRight: 5,
//   },
//   completeButtonText: {
//     color: "white",
//     fontSize: 16,
//   },
//   removeButton: {
//     backgroundColor: "#F44336",
//     padding: 12,
//     borderRadius: 5,
//     alignItems: "center",
//     flex: 1,
//     marginLeft: 5,
//   },
//   removeButtonText: {
//     color: "white",
//     fontSize: 16,
//   },
//   generateReportButton: {
//     backgroundColor: "#2196F3", // Blue color
//     padding: 12,
//     borderRadius: 5,
//     alignItems: "center",
//     flex: 1,
//     marginLeft: 5,
//   },
//   generateReportButtonText: {
//     color: "white",
//     fontSize: 16,
//   },
//   noTasksContainer: {
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 20,
//   },
//   noTasksText: {
//     fontSize: 18,
//     color: "gray",
//   },
// });

// export default Ongoing;


// import React, { useState, useEffect } from "react";
// import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
// import { getFirestore, collection, query, getDocs, doc, getDoc, updateDoc, setDoc, arrayRemove } from "firebase/firestore";
// import AsyncStorage from "@react-native-async-storage/async-storage"; // For userId storage
// import { app } from "./firebaseConfig"; // Firebase configuration
// import { deleteDoc } from "firebase/firestore";


// const db = getFirestore(app);

// const Ongoing = ({ navigation }) => {
//   const [ongoingAudits, setOngoingAudits] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadOngoingAudits = async () => {
//       setLoading(true); // Show loading
//       try {
//         const userId = await AsyncStorage.getItem("userId");
//         if (!userId) {
//           console.error("User ID not found!");
//           return;
//         }

//         const userAcceptedRef = collection(doc(db, "Profile", userId), "acceptedAudits");
//         const acceptedAuditsSnap = await getDocs(userAcceptedRef);

//         const fetchedAudits = [];
//         for (const auditDoc of acceptedAuditsSnap.docs) {
//           const auditData = auditDoc.data();
//           const auditId = auditDoc.id;

//           // Fetch full audit details
//           const auditRef = doc(db, "audits", auditId);
//           const auditSnap = await getDoc(auditRef);

//           if (auditSnap.exists()) {
//             const auditDetails = auditSnap.data();

//             // Fetch branch details
//             const branchRef = doc(db, "branches", auditDetails.branchId);
//             const branchSnap = await getDoc(branchRef);

//             // Fetch client details
//             const clientRef = doc(db, "clients", auditDetails.clientId);
//             const clientSnap = await getDoc(clientRef);

//             if (branchSnap.exists() && clientSnap.exists()) {
//               fetchedAudits.push({
//                 id: auditId,
//                 ...auditDetails,
//                 branchDetails: branchSnap.data(),
//                 clientDetails: clientSnap.data(),
//               });
//             } else {
//               console.log("Branch or client details missing for audit:", auditId);
//             }
//           }
//         }

//         setOngoingAudits(fetchedAudits);
//       } catch (error) {
//         console.error("Error loading ongoing audits:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadOngoingAudits();
//   }, []); // Runs on initial load

//   const handleComplete = async (auditId) => {
//     try {
//       const userId = await AsyncStorage.getItem("userId");
//       if (!userId) {
//         console.error("User ID not found!");
//         return;
//       }
  
//       // Step 1: Mark the audit as completed in the "audits" collection (don't delete it)
//       await updateDoc(doc(db, "audits", auditId), { isCompleted: true });
  
//       // Step 2: Update the completedCounter in the user's profile
//       const userProfileRef = doc(db, "Profile", userId);
//       const userProfileSnap = await getDoc(userProfileRef);
  
//       if (userProfileSnap.exists()) {
//         const userProfileData = userProfileSnap.data();
//         const completedCount = (userProfileData.completedCounter || 0) + 1;
  
//         // Update the completedCounter
//         await updateDoc(userProfileRef, {
//           completedCounter: completedCount,
//         });
  
//         // Step 3: Remove the auditId from the acceptedAudits subcollection in Profile -> userId -> acceptedAudits
//         const acceptedAuditsRef = collection(doc(db, "Profile", userId), "acceptedAudits");
//         const auditDocRef = doc(acceptedAuditsRef, auditId);
//         await deleteDoc(auditDocRef);  // Delete from acceptedAudits
  
//         // Step 4: Decrease the ongoingCounter by 1
//         const ongoingCounter = Math.max(0, (userProfileData.ongoingCounter || 0) - 1);
//         await updateDoc(userProfileRef, {
//           ongoingCounter: ongoingCounter,
//         });
  
//         // Step 5: Move the auditId to the completedAudits subcollection (don't delete the audit details)
//         await setDoc(doc(db, "Profile", userId, "completedAudits", auditId), {
//           auditId,
//           completedAt: new Date(),
//         });
//       }
  
//       // Step 6: Remove the audit from the ongoing list in the UI
//       setOngoingAudits((prev) => prev.filter((audit) => audit.id !== auditId));
  
//       // Step 7: Navigate to the CompletedTasks screen
//       navigation.navigate("CompletedTasks", { auditId, isCompleted: true });
//     } catch (error) {
//       console.error("Error completing audit:", error);
//     }
//   };
  
//   const handleRemove = async (auditId, auditName) => {
//     try {
//       const userId = await AsyncStorage.getItem("userId");
//       if (!userId) {
//         console.error("User ID not found!");
//         return;
//       }
  
//       // Mark the audit as rejected in the "audits" collection
//       await updateDoc(doc(db, "audits", auditId), { isRejected: true });
  
//       // Remove the auditId from acceptedAudits inside Profile -> userId -> acceptedAudits
//       const acceptedAuditsRef = doc(db, "Profile", userId);
//       const acceptedAuditsSnap = await getDoc(acceptedAuditsRef);
//       const acceptedAuditsData = acceptedAuditsSnap.data();
  
//       // Ensure acceptedAudits is an array
//       const acceptedAuditsList = acceptedAuditsData?.acceptedAudits || [];
  
//       // Filter out the rejected auditId from acceptedAudits list
//       const updatedAcceptedAudits = acceptedAuditsList.filter(
//         (id) => id !== auditId
//       );
  
//       // Update the acceptedAudits collection
//       await updateDoc(acceptedAuditsRef, {
//         acceptedAudits: updatedAcceptedAudits,
//       });
  
//       // Decrease the ongoingCounter by 1
//       const userProfileRef = doc(db, "Profile", userId);
//       const userProfileSnap = await getDoc(userProfileRef);
//       const userProfileData = userProfileSnap.data();
//       const ongoingCounter = Math.max(0, (userProfileData.ongoingCounter || 0) - 1);
  
//       // Update the ongoingCounter
//       await updateDoc(userProfileRef, {
//         ongoingCounter: ongoingCounter,
//       });
  
//       // Remove the audit from the ongoing list in the UI
//       setOngoingAudits((prev) => prev.filter((audit) => audit.id !== auditId));
  
//       // Navigate to the RejectedAudits screen
//       navigation.navigate("RejectedAudits", { auditName, isRejected: true });
//     } catch (error) {
//       console.error("Error removing audit:", error);
//     }
//   };

//   const handleGenerateReport = (auditId, auditName) => {
//     // Navigate to the ReportScreen with the auditId and auditName as params
//     navigation.navigate("ReportScreen", { auditId, auditName });
//   };

//   const renderFields = (data, excludeKeys = []) =>
//     data
//       ? Object.entries(data)
//           .filter(([key]) => !excludeKeys.includes(key)) // Exclude specified keys
//           .map(([key, value]) => (
//             <Text key={key} style={styles.detailText}>
//               {key}: {value}
//             </Text>
//           ))
//       : <Text>No details available</Text>;

//   return (
//     <ScrollView style={styles.container}>
//       {loading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#4CAF50" />
//         </View>
//       ) : ongoingAudits.length === 0 ? (
//         <View style={styles.noTasksContainer}>
//           <Text style={styles.noTasksText}>No ongoing tasks</Text>
//         </View>
//       ) : (
//         ongoingAudits.map((audit) => (
//           <View key={audit.id} style={styles.cardContainer}>
//             <Text style={styles.clientName}>{audit.clientDetails.clientName}</Text>

//             <View style={styles.detailsSection}>
//               <Text style={styles.subTitle}>Client Details:</Text>
//               {renderFields(audit.clientDetails)}
//               <Text style={{ marginTop: 10 }}></Text>
//               <Text style={styles.subTitle}>Branch Details:</Text>
//               {renderFields(audit.branchDetails, ["clientId"])}
//             </View>

//             <View style={styles.buttonsContainer}>
//               <TouchableOpacity
//                 style={styles.completeButton}
//                 onPress={() => handleComplete(audit.id, audit.clientDetails.clientName)}
//               >
//                 <Text style={styles.completeButtonText}>Complete</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.removeButton}
//                 onPress={() => handleRemove(audit.id, audit.clientDetails.clientName)}
//               >
//                 <Text style={styles.removeButtonText}>Remove</Text>
//               </TouchableOpacity>

//               {/* Generate Report Button */}
//               <TouchableOpacity
//                 style={styles.generateReportButton}
//                 onPress={() => handleGenerateReport(audit.id, audit.clientDetails.clientName)}
//               >
//                 <Text style={styles.generateReportButtonText}>Generate Report</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         ))
//       )}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 15,
//     backgroundColor: "white",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   cardContainer: {
//     marginBottom: 30,
//   },
//   detailsSection: {
//     marginBottom: 20,
//   },
//   clientName: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   subTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginBottom: 5,
//   },
//   detailText: {
//     fontSize: 14,
//     color: "#555",
//     marginBottom: 5,
//   },
//   buttonsContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   completeButton: {
//     backgroundColor: "#4CAF50",
//     padding: 12,
//     borderRadius: 5,
//     alignItems: "center",
//     flex: 1,
//     marginRight: 5,
//   },
//   completeButtonText: {
//     color: "white",
//     fontSize: 16,
//   },
//   removeButton: {
//     backgroundColor: "#F44336",
//     padding: 12,
//     borderRadius: 5,
//     alignItems: "center",
//     flex: 1,
//     marginLeft: 5,
//   },
//   removeButtonText: {
//     color: "white",
//     fontSize: 16,
//   },
//   generateReportButton: {
//     backgroundColor: "#2196F3", // Blue color
//     padding: 12,
//     borderRadius: 5,
//     alignItems: "center",
//     flex: 1,
//     marginLeft: 5,
//   },
//   generateReportButtonText: {
//     color: "white",
//     fontSize: 16,
//   },
//   noTasksContainer: {
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 20,
//   },
//   noTasksText: {
//     fontSize: 18,
//     color: "gray",
//   },
// });

// export default Ongoing;











// import React, { useState, useEffect } from "react";
// import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
// import { getFirestore, collection, query, getDocs, doc, getDoc, updateDoc, setDoc, deleteDoc } from "firebase/firestore"; 
// import AsyncStorage from "@react-native-async-storage/async-storage"; 
// import { app } from "./firebaseConfig"; 

// const db = getFirestore(app);

// const Ongoing = ({ navigation }) => {
//   const [ongoingAudits, setOngoingAudits] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadOngoingAudits = async () => {
//       setLoading(true);
//       try {
//         const userId = await AsyncStorage.getItem("userId");
//         if (!userId) {
//           console.error("User ID not found!");
//           return;
//         }

//         const userAcceptedRef = collection(doc(db, "Profile", userId), "acceptedAudits");
//         const acceptedAuditsSnap = await getDocs(userAcceptedRef);

//         const fetchedAudits = [];
//         for (const auditDoc of acceptedAuditsSnap.docs) {
//           const auditData = auditDoc.data();
//           const auditId = auditDoc.id;

//           // Fetch full audit details from the main `audits` collection
//           const auditRef = doc(db, "audits", auditId);
//           const auditSnap = await getDoc(auditRef);

//           if (auditSnap.exists()) {
//             const auditDetails = auditSnap.data();

//             // Fetch branch details
//             const branchRef = doc(db, "branches", auditDetails.branchId);
//             const branchSnap = await getDoc(branchRef);

//             // Fetch client details
//             const clientRef = doc(db, "clients", auditDetails.clientId);
//             const clientSnap = await getDoc(clientRef);

//             if (branchSnap.exists() && clientSnap.exists()) {
//               fetchedAudits.push({
//                 id: auditId,
//                 ...auditDetails,
//                 branchDetails: branchSnap.data(),
//                 clientDetails: clientSnap.data(),
//               });
//             } else {
//               console.log("Branch or client details missing for audit:", auditId);
//             }
//           }
//         }

//         setOngoingAudits(fetchedAudits);
//       } catch (error) {
//         console.error("Error loading ongoing audits:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadOngoingAudits();
//   }, []); 

//   const handleComplete = async (auditId) => {
//     try {
//       const userId = await AsyncStorage.getItem("userId");
//       if (!userId) {
//         console.error("User ID not found!");
//         return;
//       }

//       // Step 1: Update the audit's isCompleted field (in `audits` collection), but don't delete it
//       await updateDoc(doc(db, "audits", auditId), { isCompleted: true });

//       // Step 2: Fetch user profile and update the completedCounter
//       const userProfileRef = doc(db, "Profile", userId);
//       const userProfileSnap = await getDoc(userProfileRef);

//       if (userProfileSnap.exists()) {
//         const userProfileData = userProfileSnap.data();
//         const completedCount = (userProfileData.completedCounter || 0) + 1;

//         // Update the completedCounter
//         await updateDoc(userProfileRef, {
//           completedCounter: completedCount,
//         });

//         // Step 3: Remove the auditId from the acceptedAudits subcollection
//         const acceptedAuditsRef = doc(db, "Profile", userId, "acceptedAudits", auditId); 
//         await deleteDoc(acceptedAuditsRef);

//         // Step 4: Decrease the ongoingCounter by 1
//         const ongoingCounter = Math.max(0, (userProfileData.ongoingCounter || 0) - 1);
//         await updateDoc(userProfileRef, {
//           ongoingCounter: ongoingCounter,
//         });

//         // Step 5: Move the auditId to the completedAudits subcollection
//         await setDoc(doc(db, "Profile", userId, "completedAudits", auditId), {
//           auditId,
//           completedAt: new Date(),
//         });

//         // Step 6: Remove related subcollections like reportDate, if present
//         const reportDateRef = collection(doc(db, "audits", auditId), "reportDate");
//         const reportDateSnap = await getDocs(reportDateRef);
//         reportDateSnap.forEach(async (doc) => {
//           await deleteDoc(doc.ref);
//         });
//       }

//       // Step 7: Remove the audit from the ongoing list in the UI
//       setOngoingAudits((prev) => prev.filter((audit) => audit.id !== auditId));

//       // Step 8: Navigate to the CompletedTasks screen
//       navigation.navigate("CompletedTasks", { auditId, isCompleted: true });
//     } catch (error) {
//       console.error("Error completing audit:", error);
//     }
//   };

//   const handleRemove = async (auditId, auditName) => {
//     try {
//       const userId = await AsyncStorage.getItem("userId");
//       if (!userId) {
//         console.error("User ID not found!");
//         return;
//       }

//       // Mark the audit as rejected in the "audits" collection
//       await updateDoc(doc(db, "audits", auditId), { isRejected: true });

//       // Remove the auditId from acceptedAudits inside Profile -> userId -> acceptedAudits
//       const acceptedAuditsRef = doc(db, "Profile", userId);
//       const acceptedAuditsSnap = await getDoc(acceptedAuditsRef);
//       const acceptedAuditsData = acceptedAuditsSnap.data();

//       const acceptedAuditsList = acceptedAuditsData?.acceptedAudits || [];
//       const updatedAcceptedAudits = acceptedAuditsList.filter(
//         (id) => id !== auditId
//       );

//       // Update the acceptedAudits collection
//       await updateDoc(acceptedAuditsRef, {
//         acceptedAudits: updatedAcceptedAudits,
//       });

//       // Decrease the ongoingCounter by 1
//       const userProfileRef = doc(db, "Profile", userId);
//       const userProfileSnap = await getDoc(userProfileRef);
//       const userProfileData = userProfileSnap.data();
//       const ongoingCounter = Math.max(0, (userProfileData.ongoingCounter || 0) - 1);

//       // Update the ongoingCounter
//       await updateDoc(userProfileRef, {
//         ongoingCounter: ongoingCounter,
//       });

//       // Remove the audit from the ongoing list in the UI
//       setOngoingAudits((prev) => prev.filter((audit) => audit.id !== auditId));

//       // Navigate to the RejectedAudits screen
//       navigation.navigate("RejectedAudits", { auditName, isRejected: true });
//     } catch (error) {
//       console.error("Error removing audit:", error);
//     }
//   };

//   const handleGenerateReport = (auditId, auditName) => {
//     // Navigate to the ReportScreen with the auditId and auditName as params
//     navigation.navigate("ReportScreen", { auditId, auditName });
//   };

//   const renderFields = (data, excludeKeys = []) =>
//     data
//       ? Object.entries(data)
//           .filter(([key]) => !excludeKeys.includes(key))
//           .map(([key, value]) => (
//             <Text key={key} style={styles.detailText}>
//               {key}: {value}
//             </Text>
//           ))
//       : <Text>No details available</Text>;

//   return (
//     <ScrollView style={styles.container}>
//       {loading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#4CAF50" />
//         </View>
//       ) : ongoingAudits.length === 0 ? (
//         <View style={styles.noTasksContainer}>
//           <Text style={styles.noTasksText}>No ongoing tasks</Text>
//         </View>
//       ) : (
//         ongoingAudits.map((audit) => (
//           <View key={audit.id} style={styles.cardContainer}>
//             <Text style={styles.clientName}>{audit.clientDetails.clientName}</Text>

//             <View style={styles.detailsSection}>
//               <Text style={styles.subTitle}>Client Details:</Text>
//               {renderFields(audit.clientDetails)}
//               <Text style={{ marginTop: 10 }}></Text>
//               <Text style={styles.subTitle}>Branch Details:</Text>
//               {renderFields(audit.branchDetails, ["clientId"])}
//             </View>

//             <View style={styles.buttonsContainer}>
//               <TouchableOpacity
//                 style={styles.completeButton}
//                 onPress={() => handleComplete(audit.id, audit.clientDetails.clientName)}
//               >
//                 <Text style={styles.completeButtonText}>Complete</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.removeButton}
//                 onPress={() => handleRemove(audit.id, audit.clientDetails.clientName)}
//               >
//                 <Text style={styles.removeButtonText}>Remove</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.generateReportButton}
//                 onPress={() => handleGenerateReport(audit.id, audit.clientDetails.clientName)}
//               >
//                 <Text style={styles.generateReportButtonText}>Generate Report</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         ))
//       )}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 15,
//     backgroundColor: "white",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   cardContainer: {
//     marginBottom: 30,
//   },
//   detailsSection: {
//     marginBottom: 20,
//   },
//   clientName: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   subTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginBottom: 5,
//   },
//   detailText: {
//     fontSize: 14,
//     color: "#555",
//     marginBottom: 5,
//   },
//   buttonsContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   completeButton: {
//     backgroundColor: "#4CAF50",
//     padding: 12,
//     borderRadius: 5,
//     alignItems: "center",
//     flex: 1,
//     marginRight: 5,
//   },
//   completeButtonText: {
//     color: "white",
//     fontSize: 16,
//   },
//   removeButton: {
//     backgroundColor: "#F44336",
//     padding: 12,
//     borderRadius: 5,
//     alignItems: "center",
//     flex: 1,
//     marginLeft: 5,
//   },
//   removeButtonText: {
//     color: "white",
//     fontSize: 16,
//   },
//   generateReportButton: {
//     backgroundColor: "#2196F3", 
//     padding: 12,
//     borderRadius: 5,
//     alignItems: "center",
//     flex: 1,
//     marginLeft: 5,
//   },
//   generateReportButtonText: {
//     color: "white",
//     fontSize: 16,
//   },
//   noTasksContainer: {
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 20,
//   },
//   noTasksText: {
//     fontSize: 18,
//     color: "gray",
//   },
// });

// export default Ongoing;




// import React, { useState, useEffect } from "react";
// import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
// import { getFirestore, collection, query, getDocs, doc, getDoc, updateDoc, setDoc, deleteDoc } from "firebase/firestore"; 
// import AsyncStorage from "@react-native-async-storage/async-storage"; 
// import { app } from "./firebaseConfig"; 

// const db = getFirestore(app);

// const Ongoing = ({ navigation }) => {
//   const [ongoingAudits, setOngoingAudits] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadOngoingAudits = async () => {
//       setLoading(true);
//       try {
//         const userId = await AsyncStorage.getItem("userId");
//         if (!userId) {
//           console.error("User ID not found!");
//           return;
//         }

//         const userAcceptedRef = collection(doc(db, "Profile", userId), "acceptedAudits");
//         const acceptedAuditsSnap = await getDocs(userAcceptedRef);

//         const fetchedAudits = [];
//         for (const auditDoc of acceptedAuditsSnap.docs) {
//           const auditData = auditDoc.data();
//           const auditId = auditDoc.id;

//           // Fetch full audit details from the main `audits` collection
//           const auditRef = doc(db, "audits", auditId);
//           const auditSnap = await getDoc(auditRef);

//           if (auditSnap.exists()) {
//             const auditDetails = auditSnap.data();

//             // Fetch branch details
//             const branchRef = doc(db, "branches", auditDetails.branchId);
//             const branchSnap = await getDoc(branchRef);

//             // Fetch client details
//             const clientRef = doc(db, "clients", auditDetails.clientId);
//             const clientSnap = await getDoc(clientRef);

//             if (branchSnap.exists() && clientSnap.exists()) {
//               fetchedAudits.push({
//                 id: auditId,
//                 ...auditDetails,
//                 branchDetails: branchSnap.data(),
//                 clientDetails: clientSnap.data(),
//               });
//             } else {
//               console.log("Branch or client details missing for audit:", auditId);
//             }
//           }
//         }

//         setOngoingAudits(fetchedAudits);
//       } catch (error) {
//         console.error("Error loading ongoing audits:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadOngoingAudits();
//   }, []); 

//   const handleComplete = async (auditId) => {
//     try {
//       const userId = await AsyncStorage.getItem("userId");
//       if (!userId) {
//         console.error("User ID not found!");
//         return;
//       }

//       // Step 1: Update the audit's isCompleted field (in `audits` collection), but don't delete it
//       await updateDoc(doc(db, "audits", auditId), { isCompleted: true });

//       // Step 2: Fetch user profile and update the completedCounter
//       const userProfileRef = doc(db, "Profile", userId);
//       const userProfileSnap = await getDoc(userProfileRef);

//       if (userProfileSnap.exists()) {
//         const userProfileData = userProfileSnap.data();
//         const completedCount = (userProfileData.completedCounter || 0) + 1;

//         // Update the completedCounter
//         await updateDoc(userProfileRef, {
//           completedCounter: completedCount,
//         });

//         // Step 3: Remove the auditId from the acceptedAudits subcollection
//         const acceptedAuditsRef = doc(db, "Profile", userId, "acceptedAudits", auditId); 
//         await deleteDoc(acceptedAuditsRef);

//         // Step 4: Decrease the ongoingCounter by 1
//         const ongoingCounter = Math.max(0, (userProfileData.ongoingCounter || 0) - 1);
//         await updateDoc(userProfileRef, {
//           ongoingCounter: ongoingCounter,
//         });

//         // Step 5: Move the auditId to the completedAudits subcollection
//         await setDoc(doc(db, "Profile", userId, "completedAudits", auditId), {
//           auditId,
//           completedAt: new Date(),
//         });

//         // Step 6: Commenting out the removal of reportDate subcollection
//         // const reportDateRef = collection(doc(db, "audits", auditId), "reportDate");
//         // const reportDateSnap = await getDocs(reportDateRef);
//         // reportDateSnap.forEach(async (doc) => {
//         //   await deleteDoc(doc.ref);
//         // });

//       }

//       // Step 7: Remove the audit from the ongoing list in the UI
//       setOngoingAudits((prev) => prev.filter((audit) => audit.id !== auditId));

//       // Step 8: Navigate to the CompletedTasks screen
//       navigation.navigate("CompletedTasks", { auditId, isCompleted: true });
//     } catch (error) {
//       console.error("Error completing audit:", error);
//     }
//   };

//   const handleRemove = async (auditId, auditName) => {
//     try {
//       const userId = await AsyncStorage.getItem("userId");
//       if (!userId) {
//         console.error("User ID not found!");
//         return;
//       }

//       // Mark the audit as rejected in the "audits" collection
//       await updateDoc(doc(db, "audits", auditId), { isRejected: true });

//       // Remove the auditId from acceptedAudits inside Profile -> userId -> acceptedAudits
//       const acceptedAuditsRef = doc(db, "Profile", userId);
//       const acceptedAuditsSnap = await getDoc(acceptedAuditsRef);
//       const acceptedAuditsData = acceptedAuditsSnap.data();

//       const acceptedAuditsList = acceptedAuditsData?.acceptedAudits || [];
//       const updatedAcceptedAudits = acceptedAuditsList.filter(
//         (id) => id !== auditId
//       );

//       // Update the acceptedAudits collection
//       await updateDoc(acceptedAuditsRef, {
//         acceptedAudits: updatedAcceptedAudits,
//       });

//       // Decrease the ongoingCounter by 1
//       const userProfileRef = doc(db, "Profile", userId);
//       const userProfileSnap = await getDoc(userProfileRef);
//       const userProfileData = userProfileSnap.data();
//       const ongoingCounter = Math.max(0, (userProfileData.ongoingCounter || 0) - 1);

//       // Update the ongoingCounter
//       await updateDoc(userProfileRef, {
//         ongoingCounter: ongoingCounter,
//       });

//       // Remove the audit from the ongoing list in the UI
//       setOngoingAudits((prev) => prev.filter((audit) => audit.id !== auditId));

//       // Navigate to the RejectedAudits screen
//       navigation.navigate("RejectedAudits", { auditName, isRejected: true });
//     } catch (error) {
//       console.error("Error removing audit:", error);
//     }
//   };

//   const handleGenerateReport = (auditId, auditName) => {
//     // Navigate to the ReportScreen with the auditId and auditName as params
//     navigation.navigate("ReportScreen", { auditId, auditName });
//   };

//   const renderFields = (data, excludeKeys = []) =>
//     data
//       ? Object.entries(data)
//           .filter(([key]) => !excludeKeys.includes(key))
//           .map(([key, value]) => (
//             <Text key={key} style={styles.detailText}>
//               {key}: {value}
//             </Text>
//           ))
//       : <Text>No details available</Text>;

//   return (
//     <ScrollView style={styles.container}>
//       {loading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#4CAF50" />
//         </View>
//       ) : ongoingAudits.length === 0 ? (
//         <View style={styles.noTasksContainer}>
//           <Text style={styles.noTasksText}>No ongoing tasks</Text>
//         </View>
//       ) : (
//         ongoingAudits.map((audit) => (
//           <View key={audit.id} style={styles.cardContainer}>
//             <Text style={styles.clientName}>{audit.clientDetails.clientName}</Text>

//             <View style={styles.detailsSection}>
//               <Text style={styles.subTitle}>Client Details:</Text>
//               {renderFields(audit.clientDetails)}
//               <Text style={{ marginTop: 10 }}></Text>
//               <Text style={styles.subTitle}>Branch Details:</Text>
//               {renderFields(audit.branchDetails, ["clientId"])}
//             </View>

//             <View style={styles.buttonsContainer}>
//               <TouchableOpacity
//                 style={styles.completeButton}
//                 onPress={() => handleComplete(audit.id, audit.clientDetails.clientName)}
//               >
//                 <Text style={styles.completeButtonText}>Complete</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.removeButton}
//                 onPress={() => handleRemove(audit.id, audit.clientDetails.clientName)}
//               >
//                 <Text style={styles.removeButtonText}>Remove</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.generateReportButton}
//                 onPress={() => handleGenerateReport(audit.id, audit.clientDetails.clientName)}
//               >
//                 <Text style={styles.generateReportButtonText}>Generate Report</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         ))
//       )}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 15,
//     backgroundColor: "white",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   cardContainer: {
//     marginBottom: 30,
//   },
//   detailsSection: {
//     marginBottom: 20,
//   },
//   clientName: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   subTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginBottom: 5,
//   },
//   detailText: {
//     fontSize: 14,
//     color: "#555",
//     marginBottom: 5,
//   },
//   buttonsContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   completeButton: {
//     backgroundColor: "#4CAF50",
//     padding: 12,
//     borderRadius: 5,
//     alignItems: "center",
//     flex: 1,
//     marginRight: 5,
//   },
//   completeButtonText: {
//     color: "white",
//     fontSize: 16,
//   },
//   removeButton: {
//     backgroundColor: "#F44336",
//     padding: 12,
//     borderRadius: 5,
//     alignItems: "center",
//     flex: 1,
//     marginLeft: 5,
//   },
//   removeButtonText: {
//     color: "white",
//     fontSize: 16,
//   },
//   generateReportButton: {
//     backgroundColor: "#2196F3", 
//     padding: 12,
//     borderRadius: 5,
//     alignItems: "center",
//     flex: 1,
//     marginLeft: 5,
//   },
//   generateReportButtonText: {
//     color: "white",
//     fontSize: 16,
//   },
//   noTasksContainer: {
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 20,
//   },
//   noTasksText: {
//     fontSize: 18,
//     color: "gray",
//   },
// });

// export default Ongoing;




import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { getFirestore, collection, query, getDocs, doc, getDoc, updateDoc, setDoc, deleteDoc } from "firebase/firestore"; 
import AsyncStorage from "@react-native-async-storage/async-storage"; 
import { app } from "./firebaseConfig"; 

const db = getFirestore(app);

const Ongoing = ({ navigation }) => {
  const [ongoingAudits, setOngoingAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOngoingAudits = async () => {
      setLoading(true);
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          console.error("User ID not found!");
          return;
        }

        const userAcceptedRef = collection(doc(db, "Profile", userId), "acceptedAudits");
        const acceptedAuditsSnap = await getDocs(userAcceptedRef);

        const fetchedAudits = [];
        for (const auditDoc of acceptedAuditsSnap.docs) {
          const auditData = auditDoc.data();
          const auditId = auditDoc.id;

          // Fetch full audit details from the main `audits` collection
          const auditRef = doc(db, "audits", auditId);
          const auditSnap = await getDoc(auditRef);

          if (auditSnap.exists()) {
            const auditDetails = auditSnap.data();

            // Fetch branch details
            const branchRef = doc(db, "branches", auditDetails.branchId);
            const branchSnap = await getDoc(branchRef);

            // Fetch client details
            const clientRef = doc(db, "clients", auditDetails.clientId);
            const clientSnap = await getDoc(clientRef);

            if (branchSnap.exists() && clientSnap.exists()) {
              fetchedAudits.push({
                id: auditId,
                ...auditDetails,
                branchDetails: branchSnap.data(),
                clientDetails: clientSnap.data(),
              });
            } else {
              console.log("Branch or client details missing for audit:", auditId);
            }
          }
        }

        setOngoingAudits(fetchedAudits);

        // Update the ongoingCounter and completedCounter based on the audit IDs present
        const userProfileRef = doc(db, "Profile", userId);
        const userProfileSnap = await getDoc(userProfileRef);
        if (userProfileSnap.exists()) {
          const userProfileData = userProfileSnap.data();

          const ongoingCounter = acceptedAuditsSnap.size; // Number of accepted audits
          const completedCounter = userProfileData.completedCounter || 0;

          // Update the user profile counters
          await updateDoc(userProfileRef, {
            ongoingCounter: ongoingCounter,
            completedCounter: completedCounter,
          });
        }

      } catch (error) {
        console.error("Error loading ongoing audits:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOngoingAudits();
  }, []); 

  const handleComplete = async (auditId) => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        console.error("User ID not found!");
        return;
      }

      // Step 1: Update the audit's isCompleted field (in `audits` collection)
      await updateDoc(doc(db, "audits", auditId), { isCompleted: true });

      // Step 2: Fetch user profile and update the completedCounter
      const userProfileRef = doc(db, "Profile", userId);
      const userProfileSnap = await getDoc(userProfileRef);

      if (userProfileSnap.exists()) {
        const userProfileData = userProfileSnap.data();
        const completedCount = (userProfileData.completedCounter || 0) + 1;

        // Update the completedCounter
        await updateDoc(userProfileRef, {
          completedCounter: completedCount,
        });

        // Step 3: Remove the auditId from the acceptedAudits subcollection
        const acceptedAuditsRef = doc(db, "Profile", userId, "acceptedAudits", auditId); 
        await deleteDoc(acceptedAuditsRef);

        // Step 4: Move the auditId to the completedAudits subcollection
        await setDoc(doc(db, "Profile", userId, "completedAudits", auditId), {
          auditId,
          completedAt: new Date(),
        });

        // Step 5: Update the ongoingCounter by subtracting 1
        const ongoingCounter = Math.max(0, (userProfileData.ongoingCounter || 0) - 1);
        await updateDoc(userProfileRef, {
          ongoingCounter: ongoingCounter,
        });

        // Step 6: Remove the audit from the ongoing list in the UI
        setOngoingAudits((prev) => prev.filter((audit) => audit.id !== auditId));

        // Step 7: Navigate to the CompletedTasks screen
        navigation.navigate("CompletedTasks", { auditId, isCompleted: true });
      }

    } catch (error) {
      console.error("Error completing audit:", error);
    }
  };

  const handleRemove = async (auditId, auditName) => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        console.error("User ID not found!");
        return;
      }

      // Mark the audit as rejected in the "audits" collection
      await updateDoc(doc(db, "audits", auditId), { isRejected: true });

      // Remove the auditId from acceptedAudits inside Profile -> userId -> acceptedAudits
      const acceptedAuditsRef = doc(db, "Profile", userId);
      const acceptedAuditsSnap = await getDoc(acceptedAuditsRef);
      const acceptedAuditsData = acceptedAuditsSnap.data();

      const acceptedAuditsList = acceptedAuditsData?.acceptedAudits || [];
      const updatedAcceptedAudits = acceptedAuditsList.filter(
        (id) => id !== auditId
      );

      // Update the acceptedAudits collection
      await updateDoc(acceptedAuditsRef, {
        acceptedAudits: updatedAcceptedAudits,
      });

      // Decrease the ongoingCounter by 1
      const userProfileRef = doc(db, "Profile", userId);
      const userProfileSnap = await getDoc(userProfileRef);
      const userProfileData = userProfileSnap.data();
      const ongoingCounter = Math.max(0, (userProfileData.ongoingCounter || 0) - 1);

      // Update the ongoingCounter
      await updateDoc(userProfileRef, {
        ongoingCounter: ongoingCounter,
      });

      // Remove the audit from the ongoing list in the UI
      setOngoingAudits((prev) => prev.filter((audit) => audit.id !== auditId));

      // Navigate to the RejectedAudits screen
      navigation.navigate("RejectedAudits", { auditName, isRejected: true });
    } catch (error) {
      console.error("Error removing audit:", error);
    }
  };

  const handleGenerateReport = (auditId, auditName) => {
    // Navigate to the ReportScreen with the auditId and auditName as params
    navigation.navigate("ReportScreen", { auditId, auditName });
  };

  const renderFields = (data, excludeKeys = []) =>
    data
      ? Object.entries(data)
          .filter(([key]) => !excludeKeys.includes(key))
          .map(([key, value]) => (
            <Text key={key} style={styles.detailText}>
              {key}: {value}
            </Text>
          ))
      : <Text>No details available</Text>;

  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : ongoingAudits.length === 0 ? (
        <View style={styles.noTasksContainer}>
          <Text style={styles.noTasksText}>No ongoing tasks</Text>
        </View>
      ) : (
        ongoingAudits.map((audit) => (
          <View key={audit.id} style={styles.cardContainer}>
            <Text style={styles.clientName}>{audit.clientDetails.clientName}</Text>

            <View style={styles.detailsSection}>
              <Text style={styles.subTitle}>Client Details:</Text>
              {renderFields(audit.clientDetails)}
              <Text style={{ marginTop: 10 }}></Text>
              <Text style={styles.subTitle}>Branch Details:</Text>
              {renderFields(audit.branchDetails, ["clientId"])}
            </View>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.completeButton}
                onPress={() => handleComplete(audit.id)}
              >
                <Text style={styles.completeButtonText}>Complete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemove(audit.id, audit.clientDetails.clientName)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.generateReportButton}
                onPress={() => handleGenerateReport(audit.id, audit.clientDetails.clientName)}
              >
                <Text style={styles.generateReportButtonText}>Generate Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContainer: {
    marginBottom: 30,
  },
  detailsSection: {
    marginBottom: 20,
  },
  clientName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  completeButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    flex: 1,
    marginRight: 5,
  },
  completeButtonText: {
    color: "white",
    fontSize: 16,
  },
  removeButton: {
    backgroundColor: "#F44336",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    flex: 1,
    marginLeft: 5,
  },
  removeButtonText: {
    color: "white",
    fontSize: 16,
  },
  generateReportButton: {
    backgroundColor: "#2196F3", 
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    flex: 1,
    marginLeft: 5,
  },
  generateReportButtonText: {
    color: "white",
    fontSize: 16,
  },
  noTasksContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noTasksText: {
    fontSize: 18,
    color: "#555",
  },
});

export default Ongoing;
