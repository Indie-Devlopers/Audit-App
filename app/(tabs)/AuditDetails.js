<<<<<<< HEAD
=======
// import React, { useState, useEffect } from "react";
// import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons } from "@expo/vector-icons";

// const AuditDetails = ({ route, navigation }) => {
//   const { audit } = route.params;
//   const [notes, setNotes] = useState("");

//   const handleAccept = async () => {
//     try {
//       const ongoingClients = await AsyncStorage.getItem("ongoingClients");
//       const parsedOngoingClients = ongoingClients ? JSON.parse(ongoingClients) : {};
//       parsedOngoingClients[audit.id] = { ...audit, notes };
      
//       await AsyncStorage.setItem("ongoingClients", JSON.stringify(parsedOngoingClients));

//       // Navigate back to ongoing page
//       navigation.navigate("Ongoing");
//     } catch (error) {
//       console.error("Error saving accepted audit", error);
//     }
//   };

//   const handleRemove = () => {
//     // Navigate back without saving the audit
//     navigation.goBack();
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>{audit.name}</Text>
//       <Text style={styles.subTitle}>Location: {audit.location}</Text>
//       <Text style={styles.subTitle}>Date of Audit: {audit.date}</Text>

//       <TextInput
//         style={styles.notesInput}
//         placeholder="Add your notes here"
//         value={notes}
//         onChangeText={setNotes}
//       />

//       <View style={styles.buttonsContainer}>
//         <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
//           <Ionicons name="checkmark-circle" size={24} color="white" />
//           <Text style={styles.buttonText}>Accept</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
//           <Ionicons name="remove-circle" size={24} color="white" />
//           <Text style={styles.buttonText}>Remove</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     justifyContent: "center",
//     backgroundColor: "#fff",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
//   subTitle: {
//     fontSize: 18,
//     marginBottom: 10,
//   },
//   notesInput: {
//     height: 100,
//     borderColor: "#ccc",
//     borderWidth: 1,
//     marginBottom: 20,
//     padding: 10,
//     borderRadius: 5,
//   },
//   buttonsContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   acceptButton: {
//     backgroundColor: "#4CAF50",
//     padding: 15,
//     borderRadius: 5,
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   removeButton: {
//     backgroundColor: "#F44336",
//     padding: 15,
//     borderRadius: 5,
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   buttonText: {
//     color: "white",
//     marginLeft: 10,
//     fontSize: 16,
//   },
// });

// export default AuditDetails;






// import React, { useState, useEffect } from "react";
// import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons } from "@expo/vector-icons";
// import { getFirestore, doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
// import { app } from "./firebaseConfig"; // Import Firebase configuration

// const db = getFirestore(app);

// const AuditDetails = ({ route, navigation }) => {
//   const { audit } = route.params; // Getting the audit passed from the previous screen
//   const [notes, setNotes] = useState(""); // State for storing notes
//   const [auditDetails, setAuditDetails] = useState(null); // State to store fetched audit details
//   const [branchDetails, setBranchDetails] = useState(null); // State for storing branch details
//   const [clientDetails, setClientDetails] = useState(null); // State for storing client details
//   const [isAcceptedByUser, setIsAcceptedByUser] = useState(false); // State to check if the user has accepted the audit
//   const [loading, setLoading] = useState(true); // Loading state

//   // Fetch audit data and related info when component mounts
//   useEffect(() => {
//     const fetchAuditDetails = async () => {
//       try {
//         // Fetch audit details
//         const auditRef = doc(db, "audits", audit.id);
//         const auditSnap = await getDoc(auditRef);

//         if (auditSnap.exists()) {
//           const auditData = auditSnap.data();
//           setAuditDetails(auditData);

//           // Check if the user has already accepted the audit
//           const userId = await AsyncStorage.getItem("userId");
//           if (userId && auditData.acceptedBy && auditData.acceptedBy === userId) {
//             setIsAcceptedByUser(true);
//           }

//           // Fetch branch details based on branchId
//           const branchRef = doc(db, "branches", auditData.branchId);
//           const branchSnap = await getDoc(branchRef);
//           if (branchSnap.exists()) {
//             setBranchDetails(branchSnap.data());
//           } else {
//             console.log("Branch not found!");
//           }

//           // Fetch client details based on clientId
//           const clientRef = doc(db, "clients", auditData.clientId);
//           const clientSnap = await getDoc(clientRef);
//           if (clientSnap.exists()) {
//             setClientDetails(clientSnap.data());
//           } else {
//             console.log("Client not found!");
//           }
//         } else {
//           console.log("Audit not found!");
//         }

//         setLoading(false); // Stop loading once data is fetched
//       } catch (error) {
//         console.error("Error fetching audit details:", error);
//         setLoading(false); // Stop loading in case of error
//       }
//     };

//     fetchAuditDetails();
//   }, [audit.id]);

//   const handleAccept = async () => {
//     try {
//       const userId = await AsyncStorage.getItem("userId"); // Get the logged-in user's ID
//       if (!userId) {
//         console.error("User ID not found!");
//         return;
//       }

//       // Firebase: Update the isAccepted field and notes in Firestore
//       const auditRef = doc(db, "audits", audit.id);
//       await updateDoc(auditRef, {
//         isAccepted: true, // Set isAccepted to true
//         notes: notes,     // Store the notes provided by the user
//         acceptedBy: userId // Save the userId of the person accepting
//       });

//       // Update the user's Profile collection to include the auditId
//       const userRef = doc(db, "Profile", userId);
//       await updateDoc(userRef, {
//         AcceptedAudits: arrayUnion(audit.id), // Append the auditId to the AcceptedAudits array
//       });

//       // Update the local state
//       setIsAcceptedByUser(true);

//       // Navigate to ongoing tasks screen
//       navigation.navigate("Ongoing");
//     } catch (error) {
//       console.error("Error accepting audit", error);
//     }
//   };

//   const handleUnaccept = async () => {
//     try {
//       // Firebase: Update the isAccepted field to false (unaccept)
//       const auditRef = doc(db, "audits", audit.id);
//       await updateDoc(auditRef, {
//         isAccepted: false, // Set isAccepted to false (unaccepted)
//         acceptedBy: null,  // Remove the user from acceptedBy
//       });

//       // Update the local state
//       setIsAcceptedByUser(false);

//       // Navigate back to the previous screen
//       navigation.goBack();
//     } catch (error) {
//       console.error("Error unaccepting audit", error);
//     }
//   };

//   const handleRemove = async () => {
//     try {
//       // Firebase: Remove the audit or user's association with the audit
//       const auditRef = doc(db, "audits", audit.id);
//       await updateDoc(auditRef, {
//         acceptedBy: null, // Removing the association
//       });

//       // Navigate back or update the UI accordingly
//       navigation.goBack();
//     } catch (error) {
//       console.error("Error removing audit", error);
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text>Loading...</Text>
//       </View>
//     );
//   }

//   // Function to display all fields of an object dynamically
//   const renderFields = (data) => {
//     return Object.keys(data).map((key) => (
//       <Text key={key} style={styles.detailText}>
//         {key}: {data[key]}
//       </Text>
//     ));
//   };

//   return (
//     <View style={styles.container}>
//       <ScrollView>
//         {auditDetails && branchDetails && clientDetails ? (
//           <>
//             <View style={styles.detailsSection}>
//               <Text style={styles.subTitle}>Audit Details:</Text>
//               <Text style={styles.detailText}>Audit Name: {auditDetails.name}</Text>
//             </View>

//             <View style={styles.detailsSection}>
//               <Text style={styles.subTitle}>Branch Details:</Text>
//               {renderFields(branchDetails)} 
//             </View>

//             <View style={styles.detailsSection}>
//               <Text style={styles.subTitle}>Client Details:</Text>
//               {renderFields(clientDetails)} 
//             </View>

//             <TextInput
//               style={styles.notesInput}
//               placeholder="Add your notes here"
//               value={notes}
//               onChangeText={setNotes}
//             />

//             <View style={styles.buttonsContainer}>
//               {/* Accept/Unaccept Button */}
//               {!isAcceptedByUser ? (
//                 <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
//                   <Ionicons name="checkmark-circle" size={24} color="white" />
//                   <Text style={styles.buttonText}>Accept Audit</Text>
//                 </TouchableOpacity>
//               ) : (
//                 <TouchableOpacity style={styles.rejectButton} onPress={handleUnaccept}>
//                   <Ionicons name="close-circle" size={24} color="white" />
//                   <Text style={styles.buttonText}>Unaccept Audit</Text>
//                 </TouchableOpacity>
//               )}
//             </View>

//             {/* Remove Button */}
//             <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
//               <Ionicons name="trash-bin" size={24} color="white" />
//               <Text style={styles.buttonText}>Remove Audit</Text>
//             </TouchableOpacity>
//           </>
//         ) : (
//           <Text>No data found!</Text>
//         )}
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: "#fff",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   subTitle: {
//     fontSize: 18,
//     marginBottom: 5,
//   },
//   detailsSection: {
//     marginBottom: 20,
//     padding: 15,
//     backgroundColor: "#f9f9f9",
//     borderRadius: 8,
//   },
//   detailText: {
//     fontSize: 16,
//     marginBottom: 5,
//   },
//   notesInput: {
//     height: 100,
//     borderColor: "#ccc",
//     borderWidth: 1,
//     marginBottom: 20,
//     padding: 10,
//     borderRadius: 5,
//   },
//   buttonsContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   acceptButton: {
//     backgroundColor: "#4CAF50",
//     padding: 15,
//     borderRadius: 5,
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   rejectButton: {
//     backgroundColor: "#F44336",
//     padding: 15,
//     borderRadius: 5,
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   removeButton: {
//     backgroundColor: "#FF9800",
//     padding: 15,
//     borderRadius: 5,
//     marginTop: 15,
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   buttonText: {
//     color: "white",
//     marginLeft: 10,
//     fontSize: 16,
//   },
// });

// export default AuditDetails;





// import React, { useState, useEffect } from "react";
// import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons } from "@expo/vector-icons";
// import { getFirestore, doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
// import { app } from "./firebaseConfig"; // Import Firebase configuration

// const db = getFirestore(app);

// const AuditDetails = ({ route, navigation }) => {
//   const { audit } = route.params; // Getting the audit passed from the previous screen
//   const [notes, setNotes] = useState(""); // State for storing notes
//   const [auditDetails, setAuditDetails] = useState(null); // State to store fetched audit details
//   const [branchDetails, setBranchDetails] = useState(null); // State for storing branch details
//   const [clientDetails, setClientDetails] = useState(null); // State for storing client details
//   const [isAcceptedByUser, setIsAcceptedByUser] = useState(false); // State to check if the user has accepted the audit
//   const [loading, setLoading] = useState(true); // Loading state

//   // Fetch audit data and related info when component mounts
//   useEffect(() => {
//     const fetchAuditDetails = async () => {
//       try {
//         // Fetch audit details
//         const auditRef = doc(db, "audits", audit.id);
//         const auditSnap = await getDoc(auditRef);

//         if (auditSnap.exists()) {
//           const auditData = auditSnap.data();
//           setAuditDetails(auditData);

//           // Check if the user has already accepted the audit
//           const userId = await AsyncStorage.getItem("userId");
//           if (userId && auditData.acceptedBy && auditData.acceptedBy === userId) {
//             setIsAcceptedByUser(true);
//           }

//           // Fetch branch details based on branchId
//           const branchRef = doc(db, "branches", auditData.branchId);
//           const branchSnap = await getDoc(branchRef);
//           if (branchSnap.exists()) {
//             setBranchDetails(branchSnap.data());
//           } else {
//             console.log("Branch not found!");
//           }

//           // Fetch client details based on clientId
//           const clientRef = doc(db, "clients", auditData.clientId);
//           const clientSnap = await getDoc(clientRef);
//           if (clientSnap.exists()) {
//             setClientDetails(clientSnap.data());
//           } else {
//             console.log("Client not found!");
//           }
//         } else {
//           console.log("Audit not found!");
//         }

//         setLoading(false); // Stop loading once data is fetched
//       } catch (error) {
//         console.error("Error fetching audit details:", error);
//         setLoading(false); // Stop loading in case of error
//       }
//     };

//     fetchAuditDetails();
//   }, [audit.id]);

//   const handleAccept = async () => {
//     try {
//       const userId = await AsyncStorage.getItem("userId"); // Get the logged-in user's ID
//       if (!userId) {
//         console.error("User ID not found!");
//         return;
//       }

//       // Firebase: Update the isAccepted field and notes in Firestore
//       const auditRef = doc(db, "audits", audit.id);
//       await updateDoc(auditRef, {
//         isAccepted: true, // Set isAccepted to true
//         notes: notes,     // Store the notes provided by the user
//         acceptedBy: userId // Save the userId of the person accepting
//       });

//       // Update the user's Profile collection to include the auditId
//       const userRef = doc(db, "Profile", userId);
//       await updateDoc(userRef, {
//         AcceptedAudits: arrayUnion(audit.id), // Append the auditId to the AcceptedAudits array
//       });

//       // Update the local state
//       setIsAcceptedByUser(true);

//       // Navigate to ongoing tasks screen
//       navigation.navigate("Ongoing");
//     } catch (error) {
//       console.error("Error accepting audit", error);
//     }
//   };

//   const handleUnaccept = async () => {
//     try {
//       // Firebase: Update the isAccepted field to false (unaccept)
//       const auditRef = doc(db, "audits", audit.id);
//       await updateDoc(auditRef, {
//         isAccepted: false, // Set isAccepted to false (unaccepted)
//         acceptedBy: null,  // Remove the user from acceptedBy
//       });

//       // Update the local state
//       setIsAcceptedByUser(false);

//       // Navigate back to the previous screen
//       navigation.goBack();
//     } catch (error) {
//       console.error("Error unaccepting audit", error);
//     }
//   };

//   const handleRemove = async () => {
//     try {
//       // Firebase: Remove the audit or user's association with the audit
//       const auditRef = doc(db, "audits", audit.id);
//       await updateDoc(auditRef, {
//         acceptedBy: null, // Removing the association
//       });

//       // Navigate back or update the UI accordingly
//       navigation.goBack();
//     } catch (error) {
//       console.error("Error removing audit", error);
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text>Loading...</Text>
//       </View>
//     );
//   }

//   // Function to display all fields of an object dynamically
//   const renderFields = (data) => {
//     return Object.keys(data).map((key) => (
//       <Text key={key} style={styles.detailText}>
//         {key}: {data[key]}
//       </Text>
//     ));
//   };

//   return (
//     <View style={styles.container}>
//       <ScrollView>
//         {auditDetails && branchDetails && clientDetails ? (
//           <>
//             <View style={styles.detailsSection}>
//               <Text style={styles.subTitle}>Audit Details:</Text>
//               <Text style={styles.detailText}>Audit Name: {auditDetails.name}</Text>
//             </View>

//             <View style={styles.detailsSection}>
//               <Text style={styles.subTitle}>Branch Details:</Text>
//               {renderFields(branchDetails)} 
//             </View>

//             <View style={styles.detailsSection}>
//               <Text style={styles.subTitle}>Client Details:</Text>
//               {renderFields(clientDetails)} 
//             </View>

//             <TextInput
//               style={styles.notesInput}
//               placeholder="Add your notes here"
//               value={notes}
//               onChangeText={setNotes}
//             />

//             <View style={styles.buttonsContainer}>
//               {/* Accept/Unaccept Button */}
//               {!isAcceptedByUser ? (
//                 <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
//                   <Ionicons name="checkmark-circle" size={24} color="white" />
//                   <Text style={styles.buttonText}>Accept Audit</Text>
//                 </TouchableOpacity>
//               ) : (
//                 <TouchableOpacity style={styles.rejectButton} onPress={handleUnaccept}>
//                   <Ionicons name="close-circle" size={24} color="white" />
//                   <Text style={styles.buttonText}>Unaccept Audit</Text>
//                 </TouchableOpacity>
//               )}
//             </View>

//             {/* Remove Button */}
//             <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
//               <Ionicons name="trash-bin" size={24} color="white" />
//               <Text style={styles.buttonText}>Remove Audit</Text>
//             </TouchableOpacity>
//           </>
//         ) : (
//           <Text>No data found!</Text>
//         )}
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: "#fff",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   subTitle: {
//     fontSize: 18,
//     marginBottom: 5,
//   },
//   detailsSection: {
//     marginBottom: 20,
//     padding: 15,
//     backgroundColor: "#f9f9f9",
//     borderRadius: 8,
//   },
//   detailText: {
//     fontSize: 16,
//     marginBottom: 5,
//   },
//   notesInput: {
//     height: 100,
//     borderColor: "#ccc",
//     borderWidth: 1,
//     marginBottom: 20,
//     padding: 10,
//     borderRadius: 5,
//   },
//   buttonsContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   acceptButton: {
//     backgroundColor: "#4CAF50",
//     padding: 15,
//     borderRadius: 5,
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   rejectButton: {
//     backgroundColor: "#F44336",
//     padding: 15,
//     borderRadius: 5,
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   removeButton: {
//     backgroundColor: "#FF9800",
//     padding: 15,
//     borderRadius: 5,
//     marginTop: 15,
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   buttonText: {
//     color: "white",
//     marginLeft: 10,
//     fontSize: 16,
//   },
// });

// export default AuditDetails;













































































// import React, { useState, useEffect } from "react";
// import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons } from "@expo/vector-icons";
// import { getFirestore, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
// import { app } from "./firebaseConfig"; // Import Firebase configuration

// const db = getFirestore(app);

// const AuditDetails = ({ route, navigation }) => {
//   const { audit } = route.params; // Getting the audit passed from the previous screen
//   const [notes, setNotes] = useState(""); // State for storing notes
//   const [auditDetails, setAuditDetails] = useState(null); // State to store fetched audit details
//   const [branchDetails, setBranchDetails] = useState(null); // State for storing branch details
//   const [clientDetails, setClientDetails] = useState(null); // State for storing client details
//   const [isAcceptedByUser, setIsAcceptedByUser] = useState(false); // State to check if the user has accepted the audit
//   const [loading, setLoading] = useState(true); // Loading state

//   // Fetch audit data and related info when component mounts
//   useEffect(() => {
//     const fetchAuditDetails = async () => {
//       try {
//         // Fetch audit details
//         const auditRef = doc(db, "audits", audit.id);
//         const auditSnap = await getDoc(auditRef);

//         if (auditSnap.exists()) {
//           const auditData = auditSnap.data();
//           setAuditDetails(auditData);

//           // Check if the user has already accepted the audit
//           const userId = await AsyncStorage.getItem("userId");
//           if (userId && auditData.acceptedBy && auditData.acceptedBy === userId) {
//             setIsAcceptedByUser(true);
//           }

//           // Fetch branch details based on branchId
//           const branchRef = doc(db, "branches", auditData.branchId);
//           const branchSnap = await getDoc(branchRef);
//           if (branchSnap.exists()) {
//             setBranchDetails(branchSnap.data());
//           } else {
//             console.log("Branch not found!");
//           }

//           // Fetch client details based on clientId
//           const clientRef = doc(db, "clients", auditData.clientId);
//           const clientSnap = await getDoc(clientRef);
//           if (clientSnap.exists()) {
//             setClientDetails(clientSnap.data());
//           } else {
//             console.log("Client not found!");
//           }
//         } else {
//           console.log("Audit not found!");
//         }

//         setLoading(false); // Stop loading once data is fetched
//       } catch (error) {
//         console.error("Error fetching audit details:", error);
//         setLoading(false); // Stop loading in case of error
//       }
//     };

//     fetchAuditDetails();
//   }, [audit.id]);

//   const handleAccept = async () => {
//     try {
//       const userId = await AsyncStorage.getItem("userId"); // Get the logged-in user's ID
//       if (!userId) {
//         console.error("User ID not found!");
//         return;
//       }

//       // Firebase: Update the isAccepted field and notes in Firestore
//       const auditRef = doc(db, "audits", audit.id);
//       await updateDoc(auditRef, {
//         isAccepted: true, // Set isAccepted to true
//         notes: notes,     // Store the notes provided by the user
//         acceptedBy: userId // Save the userId of the person accepting
//       });

//       // Update the user's Profile collection to include the auditId
//       const userRef = doc(db, "Profile", userId);
//       await updateDoc(userRef, {
//         AcceptedAudits: arrayUnion(audit.id), // Append the auditId to the AcceptedAudits array
//       });

//       // Update the local state
//       setIsAcceptedByUser(true);

//       // Navigate to ongoing tasks screen
//       navigation.navigate("Ongoing");
//     } catch (error) {
//       console.error("Error accepting audit", error);
//     }
//   };

//   // const handleUnaccept = async () => {
//   //   try {
//   //     const userId = await AsyncStorage.getItem("userId"); // Get the logged-in user's ID
//   //     if (!userId) {
//   //       console.error("User ID not found!");
//   //       return;
//   //     }

//   //     // Firebase: Update the isAccepted field to false (unaccept)
//   //     const auditRef = doc(db, "audits", audit.id);
//   //     await updateDoc(auditRef, {
//   //       isAccepted: false, // Set isAccepted to false (unaccepted)
//   //       acceptedBy: null,  // Remove the user from acceptedBy
//   //     });

//   //     // Remove the auditId from the AcceptedAudits array in the user's Profile collection
//   //     const userRef = doc(db, "Profile", userId);
//   //     await updateDoc(userRef, {
//   //       AcceptedAudits: arrayRemove(audit.id), // Remove the auditId from the AcceptedAudits array
//   //     });

//   //     // Update the local state
//   //     setIsAcceptedByUser(false);

//   //     // Navigate back to the previous screen or wherever needed
//   //     navigation.goBack();
//   //   } catch (error) {
//   //     console.error("Error unaccepting audit", error);
//   //   }
//   // };


//   const handleUnaccept = async () => {
//     try {
//       const userId = await AsyncStorage.getItem("userId"); // Get the logged-in user's ID
//       if (!userId) {
//         console.error("User ID not found!");
//         return;
//       }
  
//       // Firebase: Update the isAccepted field to false (unaccept)
//       const auditRef = doc(db, "audits", audit.id);
//       await updateDoc(auditRef, {
//         isAccepted: false, // Set isAccepted to false (unaccepted)
//         acceptedBy: null,  // Remove the user from acceptedBy
//       });
  
//       // Remove the auditId from the AcceptedAudits array in the user's Profile collection
//       const userRef = doc(db, "Profile", userId);
//       await updateDoc(userRef, {
//         AcceptedAudits: arrayRemove(audit.id), // Remove the auditId from the AcceptedAudits array
//       });
  
//       // Update the local state
//       setIsAcceptedByUser(false);
  
//       // Navigate to the "Ongoing" screen after state update
//       setTimeout(() => {
//         navigation.navigate("Ongoing"); // Explicitly navigate to Ongoing
//       }, 500); // Adjust timeout if needed
//     } catch (error) {
//       console.error("Error unaccepting audit", error);
//     }
//   };
  

//   const handleRemove = async () => {
//     try {
//       // Firebase: Remove the audit or user's association with the audit
//       const auditRef = doc(db, "audits", audit.id);
//       await updateDoc(auditRef, {
//         acceptedBy: null, // Removing the association
//       });

//       // Navigate back or update the UI accordingly
//       navigation.goBack();
//     } catch (error) {
//       console.error("Error removing audit", error);
//     }
//   };

//   if (!auditDetails) {
//     return (
//       <View style={styles.container}>
//         <Text>No audit details found</Text>
//       </View>
//     );
//   }

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
  
//         <Text>Loading...</Text>
//       </View>
//     );
//   }

//   // Function to display all fields of an object dynamically
//   const renderFields = (data) => {
//     return Object.keys(data).map((key) => (
//       <Text key={key} style={styles.detailText}>
//         {key}: {data[key]}
//       </Text>
//     ));
//   };

//   return (
//     <View style={styles.container}>
//       <ScrollView>
//         {auditDetails && branchDetails && clientDetails ? (
//           <>
//             <View style={styles.detailsSection}>
//               <Text style={styles.subTitle}>Audit Details:</Text>
//               <Text style={styles.detailText}>Audit Name: {auditDetails.name}</Text>
//             </View>

//             <View style={styles.detailsSection}>
//               <Text style={styles.subTitle}>Branch Details:</Text>
//               {renderFields(branchDetails)} 
//             </View>

//             <View style={styles.detailsSection}>
//               <Text style={styles.subTitle}>Client Details:</Text>
//               {renderFields(clientDetails)} 
//             </View>

//             <TextInput
//               style={styles.notesInput}
//               placeholder="Add your notes here"
//               value={notes}
//               onChangeText={setNotes}
//             />

//             <View style={styles.buttonsContainer}>
//               {/* Accept/Unaccept Button */}
//               {!isAcceptedByUser ? (
//                 <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
//                   <Ionicons name="checkmark-circle" size={24} color="white" />
//                   <Text style={styles.buttonText}>Accept Audit</Text>
//                 </TouchableOpacity>
//               ) : (
//                 <TouchableOpacity style={styles.rejectButton} onPress={handleUnaccept}>
//                   <Ionicons name="close-circle" size={24} color="white" />
//                   <Text style={styles.buttonText}>Unaccept Audit</Text>
//                 </TouchableOpacity>
//               )}
//             </View>

//             {/* Remove Button */}
//             <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
//               <Ionicons name="trash-bin" size={24} color="white" />
//               <Text style={styles.buttonText}>Remove Audit</Text>
//             </TouchableOpacity>
//           </>
//         ) : (
//           <Text>No data found!</Text>
//         )}
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: "#fff",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   subTitle: {
//     fontSize: 18,
//     marginBottom: 5,
//   },
//   detailsSection: {
//     marginBottom: 20,
//     padding: 15,
//     backgroundColor: "#f9f9f9",
//     borderRadius: 8,
//   },
//     title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#333",
//     marginBottom: 10,
//   },
//   detailText: {
//     fontSize: 16,
//     marginBottom: 5,
//   },
//   notesInput: {
//     height: 100,
//     borderColor: "#ccc",
//     borderWidth: 1,
//     marginBottom: 20,
//     padding: 10,
//     borderRadius: 5,
//   },
//   buttonsContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   acceptButton: {
//     backgroundColor: "#4CAF50",
//     padding: 15,
//     borderRadius: 5,
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   rejectButton: {
//     backgroundColor: "#F44336",
//     padding: 15,
//     borderRadius: 5,
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   removeButton: {
//     backgroundColor: "#9E9E9E",
//     padding: 15,
//     borderRadius: 5,
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 10,
//   },
//   buttonText: {
//     color: "white",
//     marginLeft: 10,
//     fontSize: 16,
//   },
// });

// export default AuditDetails;















>>>>>>> b9f48e99e16895170955d10a15b6812dc1f2c671




import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
<<<<<<< HEAD
import { doc, getDoc, setDoc, collection } from "firebase/firestore";
import { db } from "./firebaseConfig"; // Import Firebase configuration
=======
import { getFirestore, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { app } from "./firebaseConfig"; // Import Firebase configuration
>>>>>>> b9f48e99e16895170955d10a15b6812dc1f2c671

import DateTimePicker from "@react-native-community/datetimepicker";

const AuditDetails = ({ route, navigation }) => {
  const { audit } = route.params;
  const [auditDetails, setAuditDetails] = useState(null);
  const [branchDetails, setBranchDetails] = useState(null);
  const [clientDetails, setClientDetails] = useState(null);
  const [isAcceptedByUser, setIsAcceptedByUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Handle date selection and save the report dates under acceptedAudits > {auditId}
  const handleDateConfirm = async (event, date) => {
    if (event.type === "set" && date) {
      setShowCalendar(false);
      const formattedDate = date.toISOString().split("T")[0]; // Format the date to yyyy-mm-dd
      setSelectedDate(new Date(formattedDate));

      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          console.error("User ID not found!");
          return;
        }

        // Reference to the user's Profile and acceptedAudits sub-collection
        const userProfileRef = doc(db, "Profile", userId);

        // Reference to the specific audit under acceptedAudits
        const acceptedAuditsRef = doc(userProfileRef, "acceptedAudits", audit.id);

        // Create or update the accepted audit document under acceptedAudits > {auditId}
        await setDoc(acceptedAuditsRef, {
          auditId: audit.id,
          date: formattedDate,
          isCompleted: false, // Initially set to false
        });

        // Commenting out the creation of the ReportDates subcollection kyuki abhi isme changes jkarne hai 
        
        // const reportDatesRef = collection(acceptedAuditsRef, "ReportDates");

        // Add the dates to the ReportDates collection as documents
        // await setDoc(doc(reportDatesRef, "scan"), { date: formattedDate });
        // await setDoc(doc(reportDatesRef, "hard"), { date: formattedDate });
        // await setDoc(doc(reportDatesRef, "soft"), { date: formattedDate });
        // await setDoc(doc(reportDatesRef, "photo"), { date: formattedDate });

        // Mark the audit as accepted by the user and navigate to Ongoing screen
        setIsAcceptedByUser(true);
        navigation.navigate("Ongoing");
      } catch (error) {
        console.error("Error accepting audit", error);
      }
    } else {
      setShowCalendar(false);
    }
  };

  // Fetch audit details from Firebase
  useEffect(() => {
    const fetchAuditDetails = async () => {
      try {
        const auditRef = doc(db, "audits", audit.id);
        const auditSnap = await getDoc(auditRef);
        if (auditSnap.exists()) {
          const auditData = auditSnap.data();
          setAuditDetails(auditData);

          const userId = await AsyncStorage.getItem("userId");
          if (userId && auditData.acceptedBy && auditData.acceptedBy === userId) {
            setIsAcceptedByUser(true);
          }

          const branchRef = doc(db, "branches", auditData.branchId);
          const branchSnap = await getDoc(branchRef);
          if (branchSnap.exists()) {
            const branchData = branchSnap.data();
            delete branchData.clientId;
            setBranchDetails(branchData);
          }

          const clientRef = doc(db, "clients", auditData.clientId);
          const clientSnap = await getDoc(clientRef);
          if (clientSnap.exists()) {
            setClientDetails(clientSnap.data());
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching audit details:", error);
        setLoading(false);
      }
    };

    fetchAuditDetails();
  }, [audit.id]);

<<<<<<< HEAD
  const handleAccept = () => {
    setShowCalendar(true);
  };

  const renderFields = (details) => {
    return Object.keys(details).map((key) => (
      <Text key={key} style={styles.detailText}>
        {key}: {details[key]}
      </Text>
    ));
=======
  const handleAccept = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId"); // Get the logged-in user's ID
      if (!userId) {
        console.error("User ID not found!");
        return;
      }

      // Firebase: Update the isAccepted field and notes in Firestore
      const auditRef = doc(db, "audits", audit.id);
      await updateDoc(auditRef, {
        isAccepted: true, // Set isAccepted to true
        notes: notes,     // Store the notes provided by the user
        acceptedBy: userId // Save the userId of the person accepting
      });

      // Update the user's Profile collection to include the auditId
      const userRef = doc(db, "Profile", userId);
      await updateDoc(userRef, {
        AcceptedAudits: arrayUnion(audit.id), // Append the auditId to the AcceptedAudits array
      });

      // Update the local state
      setIsAcceptedByUser(true);

      // Navigate to ongoing tasks screen
      navigation.navigate("Ongoing");
    } catch (error) {
      console.error("Error accepting audit", error);
    }
  };

  // const handleUnaccept = async () => {
  //   try {
  //     const userId = await AsyncStorage.getItem("userId"); // Get the logged-in user's ID
  //     if (!userId) {
  //       console.error("User ID not found!");
  //       return;
  //     }

  //     // Firebase: Update the isAccepted field to false (unaccept)
  //     const auditRef = doc(db, "audits", audit.id);
  //     await updateDoc(auditRef, {
  //       isAccepted: false, // Set isAccepted to false (unaccepted)
  //       acceptedBy: null,  // Remove the user from acceptedBy
  //     });

  //     // Remove the auditId from the AcceptedAudits array in the user's Profile collection
  //     const userRef = doc(db, "Profile", userId);
  //     await updateDoc(userRef, {
  //       AcceptedAudits: arrayRemove(audit.id), // Remove the auditId from the AcceptedAudits array
  //     });

  //     // Update the local state
  //     setIsAcceptedByUser(false);

  //     // Navigate back to the previous screen or wherever needed
  //     navigation.goBack();
  //   } catch (error) {
  //     console.error("Error unaccepting audit", error);
  //   }
  // };


  const handleUnaccept = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId"); // Get the logged-in user's ID
      if (!userId) {
        console.error("User ID not found!");
        return;
      }
  
      // Firebase: Update the isAccepted field to false (unaccept)
      const auditRef = doc(db, "audits", audit.id);
      await updateDoc(auditRef, {
        isAccepted: false, // Set isAccepted to false (unaccepted)
        acceptedBy: null,  // Remove the user from acceptedBy
      });
  
      // Remove the auditId from the AcceptedAudits array in the user's Profile collection
      const userRef = doc(db, "Profile", userId);
      await updateDoc(userRef, {
        AcceptedAudits: arrayRemove(audit.id), // Remove the auditId from the AcceptedAudits array
      });
  
      // Update the local state
      setIsAcceptedByUser(false);
  
      // Navigate to the "Ongoing" screen after state update
      setTimeout(() => {
        navigation.navigate("Ongoing"); // Explicitly navigate to Ongoing
      }, 500); // Adjust timeout if needed
    } catch (error) {
      console.error("Error unaccepting audit", error);
    }
  };
  

  const handleReject = () => {
    // Navigate to the RejectAudits screen
    navigation.navigate("RejectedAudits", { auditId: audit.id });
  };

  const handleRemove = async () => {
    try {
      // Firebase: Remove the audit or user's association with the audit
      const auditRef = doc(db, "audits", audit.id);
      await updateDoc(auditRef, {
        acceptedBy: null, // Removing the association
      });

      // Navigate back or update the UI accordingly
      navigation.goBack();
    } catch (error) {
      console.error("Error removing audit", error);
    }
>>>>>>> b9f48e99e16895170955d10a15b6812dc1f2c671
  };

  if (!auditDetails) {
    return (
      <View style={styles.container}>
        <Text>No audit details found</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
<<<<<<< HEAD
        <ActivityIndicator size="large" color="#0000ff" />
=======
  
        <Text>Loading...</Text>
>>>>>>> b9f48e99e16895170955d10a15b6812dc1f2c671
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {auditDetails && branchDetails && clientDetails ? (
          <>
            <Text style={styles.title}>{auditDetails.title}</Text>
            <View style={styles.detailsSection}>
              <Text style={styles.subTitle}>Client Details:</Text>
              {renderFields(clientDetails)}
              <View style={{ marginTop: 10 }}>
                <Text style={styles.subTitle}>Branch Details:</Text>
                {renderFields(branchDetails)}
              </View>
            </View>

            <View style={styles.buttonsContainer}>
              {!isAcceptedByUser && (
                <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                  <Text style={styles.buttonText}>Accept Audit</Text>
                </TouchableOpacity>
              )}
            </View>
<<<<<<< HEAD
=======


            <TouchableOpacity style={styles.holdButton} onPress={handleReject}>
             <Ionicons name="close-circle" size={24} color="white" />
              <Text style={styles.buttonText}>Reject Audit</Text>
            </TouchableOpacity>


            {/* Remove Button */}
            <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
              <Ionicons name="trash-bin" size={24} color="white" />
              <Text style={styles.buttonText}>Remove Audit</Text>
            </TouchableOpacity>
>>>>>>> b9f48e99e16895170955d10a15b6812dc1f2c671
          </>
        ) : (
          <Text style={styles.errorText}>No data found!</Text>
        )}
      </ScrollView>

      {showCalendar && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateConfirm}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  scrollView: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  detailsSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
<<<<<<< HEAD
  subTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
=======
    title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
>>>>>>> b9f48e99e16895170955d10a15b6812dc1f2c671
  },
  detailText: {
    fontSize: 16,
    color: "#555",
    marginVertical: 5,
  },
  buttonsContainer: {
    marginTop: 20,
  },
  acceptButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#007BFF",
    borderRadius: 5,
<<<<<<< HEAD
    marginBottom: 10,
=======
    flexDirection: "row",
    alignItems: "center",
  },
  holdButton: {
    backgroundColor: "#000033",
    padding: 15,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  removeButton: {
    backgroundColor: "#990000",
    padding: 15,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
>>>>>>> b9f48e99e16895170955d10a15b6812dc1f2c671
  },
  buttonText: {
    marginLeft: 10,
    color: "white",
    fontSize: 16,
  },
  ongoingContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f4f4f4",
    borderRadius: 5,
  },
  ongoingText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
});

export default AuditDetails;
