// import React, { useState, useEffect } from 'react';  // Make sure it's only here, not multiple times

// import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, Dimensions } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { firebase } from './firebaseConfig';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { getDocs, collection, updateDoc, doc, arrayUnion } from "firebase/firestore";
// import { db } from "./firebaseConfig";
// import AuditDetails from "./AuditDetails";
// import { useEffect, useState } from "react";
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const { width, height } = Dimensions.get("window");

// const HomeScreen = ({ navigation, route }) => {
//   const [userId, setUserId] = useState(null);
//   const userEmail = route?.params?.userEmail || "";
//   const [greeting, setGreeting] = useState("");
//   const [userName, setUserName] = useState("");
//   const [audits, setAudits] = useState([]);
//   const [ongoingAudits, setOngoingAudits] = useState([]);
//   const [todayTasks, setTodayTasks] = useState([]);
//   const [completedTasks, setCompletedTasks] = useState([]);
//   const [clientsData, setClientsData] = useState({});
//   const [branchesData, setBranchesData] = useState([]);
//   const [selectedStatus, setSelectedStatus] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterLocation, setFilterLocation] = useState("");
//   // const [userId, setUserId] = useState(""); // To store logged-in user's ID
 

  

//   useEffect(() => {
 
//     const loadData = async () => {
//       try {
//         // Fetch audits from Firebase collection 'audits'
//         const auditRef = collection(db, "audits");
//         const snapshot = await getDocs(auditRef);
//         const auditData = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setAudits(auditData);

//         // Fetch ongoing audits from AsyncStorage
//         const ongoingAuditsData = await AsyncStorage.getItem("ongoingAudits");
//         if (ongoingAuditsData) {
//           setOngoingAudits(JSON.parse(ongoingAuditsData));
//         }

//         // Fetch clients from 'clients' collection
//         const clientsRef = collection(db, "clients");
//         const clientSnapshot = await getDocs(clientsRef);
//         const clients = {};
//         clientSnapshot.docs.forEach((doc) => {
//           clients[doc.id] = doc.data().name;
//         });
//         setClientsData(clients);

//         // Fetch branches from 'branches' collection
//         const branchesRef = collection(db, "branches");
//         const branchSnapshot = await getDocs(branchesRef);
//         const branches = branchSnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setBranchesData(branches);

//         // Fetch tasks from 'tasks' collection
//         const tasksRef = collection(db, "tasks");
//         const taskSnapshot = await getDocs(tasksRef);
//         const taskData = taskSnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setTodayTasks(taskData.filter(task => task.status === 'today'));
//         setCompletedTasks(taskData.filter(task => task.status === 'completed'));

//         // Fetch the logged-in user's ID
//         const userDoc = await firebase.firestore().collection('Profile').where("email", "==", userEmail).get();
//         if (!userDoc.empty) {
//           const userId = userDoc.docs[0].id;
//           setUserId(userId); // Set the logged-in user's document ID
//         }

//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }

//       // Set greeting based on time
//       const currentTime = new Date().getHours();
//       setGreeting(currentTime < 12 ? "Good Morning" : currentTime < 19 ? "Good Afternoon " : "Good Evening");
//       setUserName(userEmail ? userEmail.split("@")[0] : "User");
//     };

//     loadData();
//   }, [userEmail]);

//   const getAvatar = (Client) => {
//     const firstLetter = Client ? Client.charAt(0).toUpperCase() : "Ⓐ";
//     return firstLetter;
//   };

//   const acceptAudit = async (auditId) => {
//     try {
//       // Update the audit with auditorId and isAccepted status
//       const auditRef = doc(db, "audits", auditId);
//       await updateDoc(auditRef, {
//         auditorId: userId, // Set the auditorId to the logged-in user's ID
//         isAccepted: true, // Mark the audit as accepted
//       });
  
//       // Update the logged-in user's Profile with the accepted auditId
//       if (userId) {
//         const userRef = doc(db, "Profile", userId); // Reference to the specific user document
//         await updateDoc(userRef, {
//           AcceptedAudits: arrayUnion(auditId), // Add the auditId to the AcceptedAudits array
//         });
  
//         console.log("Audit accepted successfully!");
//       } else {
//         console.log("User ID is not available.");
//       }
//     } catch (error) {
//       console.error("Error accepting audit:", error);
//     }
//   };
  

//   const completeAudit = async (auditId) => {
//     try {
//       // Fetch the audit data to check if it's accepted
//       const auditRef = doc(db, "audits", auditId);
//       const auditSnapshot = await getDoc(auditRef);
//       const auditData = auditSnapshot.data();
  
//       // Only allow marking as complete if isAccepted is true
//       if (auditData.isAccepted) {
//         // Update the audit to mark it as complete
//         await updateDoc(auditRef, {
//           isCompleted: true, // Set the isCompleted field to true
//         });
  
//         console.log("Audit marked as complete!");
//       } else {
//         console.log("Audit is not accepted, cannot mark as complete.");
//       }
//     } catch (error) {
//       console.error("Error completing audit:", error);
//     }
//   };
  

//   // Filter the audits based on status, location, and search term
//   const filteredAudits = audits.filter((audit) => {
//     if (selectedStatus && audit.status !== selectedStatus) {
//       return false;
//     }
//     if (filterLocation && audit.location !== filterLocation) {
//       return false;
//     }
//     if (searchTerm && !audit.name.toLowerCase().includes(searchTerm.toLowerCase())) {
//       return false;
//     }
//     return true;
//   });

//   return (
    
//     <View style={styles.fullScreen}>
//          <View>
//       {userId ? (
//         <Text>Welcome, User ID: {userId}</Text>
//       ) : (
//         <Text>Loading...</Text>
//       )}
//     </View>
//       <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
//         <View style={styles.greetingContainer}>
//           <Text style={styles.greetingText}>{greeting}, {userName}</Text>
//         </View>

//         <View style={styles.container}>
//           {/* Task Boxes Section */}
//           <View style={styles.taskBoxesContainer}>
//             <TouchableOpacity style={styles.taskBox}>
//               <TouchableOpacity onPress={() => navigation.navigate("UserInfo")}>
//                 <Ionicons name="calendar" size={30} color="black" style={styles.icon} />
//                 <Text style={styles.taskBoxTitle}>Today's Tasks</Text>
//                 <Text style={styles.taskBoxContent}>{todayTasks.length} Tasks</Text>
//               </TouchableOpacity>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.taskBox}>
//               <TouchableOpacity onPress={() => navigation.navigate("Ongoing")}>
//                 <Ionicons name="play-circle" size={30} color="black" style={styles.icon} />
//                 <Text style={styles.taskBoxTitle}>Ongoing Tasks</Text>
//                 <Text style={styles.taskBoxContent}>{ongoingAudits.length} Tasks</Text>
//               </TouchableOpacity>
//             </TouchableOpacity>
//           </View>

//           <TouchableOpacity style={styles.taskBox2}>
//             <TouchableOpacity onPress={() => navigation.navigate("Completed-Tasks")}>
//               <Ionicons name="checkmark-circle" size={30} color="black" style={styles.icon} />
//               <Text style={styles.taskBoxTitle}>Completed Tasks</Text>
//               <Text style={styles.taskBoxContent}>{completedTasks.length} Tasks</Text>
//             </TouchableOpacity>
//           </TouchableOpacity>

//           {/* Upcoming Audits Section */}
//           <View style={styles.upcomingAuditsContainer}>
//             <Text style={styles.upcomingAuditsText}>Upcoming Audits</Text>

//             <FlatList
//               data={filteredAudits}
//               renderItem={({ item }) => {
//                 const clientName = clientsData[item.clientId] || "Unknown Client";
//                 const branch = branchesData.find((branch) => branch.id === item.branchId);
//                 const branchCity = branch ? branch.city : "Unknown Location";

//                 return (
//                   <TouchableOpacity
//                     style={styles.auditItem}
//                     onPress={() => navigation.navigate("AuditDetails", { audit: item })}
//                   >
//                     <View style={styles.clientImageContainer}>
//                       <Text style={styles.clientImage}>{getAvatar(item.auditorId)}</Text>
//                     </View>
//                     <View style={styles.auditContent}>
//                       <Text style={styles.auditName}>{item.name}</Text>
//                       <Text style={styles.auditLocation}>{clientName}</Text>
//                       <Text style={styles.auditLocation}>{branchCity}</Text>
//                     </View>
//                     <View style={styles.actionsContainer}>
                    
//                         <TouchableOpacity
//                           style={styles.acceptButton}
//                           onPress={() => navigation.navigate("AuditDetails", { audit: item })}
//                         >
//                           <Text style={styles.buttonText}>See More</Text>
//                         </TouchableOpacity>
                      
//                     </View>
//                   </TouchableOpacity>
//                 );
//               }}
//               keyExtractor={(item) => item.id}
//             />
//           </View>
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   fullScreen: {
//     flex: 1,
//     backgroundColor: "#f5f5f5",
//   },
//   greetingContainer: {
//     padding: 15,
//     backgroundColor: "#6200ea",
//   },
//   greetingText: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   container: {
//     padding: 20,
//   },
//   taskBoxesContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 20,
//   },
//   taskBox: {
//     width: (width - 60) / 2,
//     backgroundColor: "#fff",
//     padding: 15,
//     borderRadius: 10,
//     elevation: 3,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   taskBoxTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginTop: 10,
//   },
//   taskBoxContent: {
//     fontSize: 14,
//     marginTop: 5,
//   },
//   taskBox2: {
//     backgroundColor: "#fff",
//     padding: 15,
//     borderRadius: 10,
//     elevation: 3,
//     marginBottom: 20,
//   },
//   upcomingAuditsContainer: {
//     backgroundColor: "#fff",
//     padding: 20,
//     borderRadius: 10,
//     elevation: 3,
//   },
//   upcomingAuditsText: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 15,
//   },
//   auditItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     padding: 10,
//     borderBottomWidth: 1,
//     borderColor: "#ddd",
//   },
//   clientImageContainer: {
//     width: 50,
//     height: 50,
//     borderRadius: 50,
//     backgroundColor: "#6200ea",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   clientImage: {
//     color: "#fff",
//     fontSize: 22,
//     fontWeight: "bold",
//   },
//   auditContent: {
//     flex: 1,
//     paddingLeft: 10,
//   },
//   auditName: {
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   auditLocation: {
//     fontSize: 14,
//     color: "#888",
//   },
//   actionsContainer: {
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   acceptButton: {
//     backgroundColor: "#4caf50",
//     padding: 10,
//     borderRadius: 5,
//   },
//   completeButton: {
//     backgroundColor: "#4caf50",
//     padding: 10,
//     borderRadius: 5,
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "bold",
//   },
// });

// export default HomeScreen;










// import React, { useState, useEffect } from "react";
// import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, Dimensions } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { firebase } from "./firebaseConfig";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { getDocs, collection, doc, updateDoc, arrayUnion } from "firebase/firestore";
// import { db } from "./firebaseConfig";

// const { width } = Dimensions.get("window");

// const HomeScreen = ({ navigation, route }) => {
//   const userEmail = route?.params?.userEmail || "";
//   const [greeting, setGreeting] = useState("");
//   const [userName, setUserName] = useState("");
//   const [audits, setAudits] = useState([]);
//   const [ongoingAudits, setOngoingAudits] = useState([]);
//   const [todayTasks, setTodayTasks] = useState([]);
//   const [completedTasks, setCompletedTasks] = useState([]);
//   const [clientsData, setClientsData] = useState({});
//   const [branchesData, setBranchesData] = useState([]);

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         // Fetch audits from Firebase collection 'audits'
//         const auditRef = collection(db, "audits");
//         const snapshot = await getDocs(auditRef);
//         const auditData = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setAudits(auditData);

//         // Fetch ongoing audits from AsyncStorage
//         const ongoingAuditsData = await AsyncStorage.getItem("ongoingAudits");
//         if (ongoingAuditsData) {
//           setOngoingAudits(JSON.parse(ongoingAuditsData));
//         }

//         // Fetch clients from 'clients' collection
//         const clientsRef = collection(db, "clients");
//         const clientSnapshot = await getDocs(clientsRef);
//         const clients = {};
//         clientSnapshot.docs.forEach((doc) => {
//           clients[doc.id] = doc.data().name;
//         });
//         setClientsData(clients);

//         // Fetch branches from 'branches' collection
//         const branchesRef = collection(db, "branches");
//         const branchSnapshot = await getDocs(branchesRef);
//         const branches = branchSnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setBranchesData(branches);

//         // Fetch tasks from 'tasks' collection
//         const tasksRef = collection(db, "tasks");
//         const taskSnapshot = await getDocs(tasksRef);
//         const taskData = taskSnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setTodayTasks(taskData.filter((task) => task.status === "today"));
//         setCompletedTasks(taskData.filter((task) => task.status === "completed"));
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }

//       // Set greeting based on time
//       const currentTime = new Date().getHours();
//       setGreeting(currentTime < 12 ? "Good Morning" : currentTime < 19 ? "Good Afternoon " : "Good Evening");
//       setUserName(userEmail ? userEmail.split("@")[0] : "User");
//     };

//     loadData();
//   }, [userEmail]);

//   const getAvatar = (Client) => {
//     const firstLetter = Client ? Client.charAt(0).toUpperCase() : "Ⓐ";
//     return firstLetter;
//   };

//   const acceptAudit = async (auditId) => {
//     try {
//       // Retrieve userId from AsyncStorage or any other source
//       const userId = await AsyncStorage.getItem("userId");

//       if (!userId) {
//         console.error("User ID not found");
//         return;
//       }

//       // Update the auditorId in the audits collection
//       const auditRef = doc(db, "audits", auditId);
//       await updateDoc(auditRef, {
//         auditorId: userId,
//         isAccepted: true,
//       });

//       // Update the AcceptedAudits field in the user's Profile document
//       const userRef = doc(db, "Profile", userId);
//       await updateDoc(userRef, {
//         AcceptedAudits: arrayUnion(auditId),
//       });

//       // Update local state
//       setAudits((prevAudits) =>
//         prevAudits.map((audit) =>
//           audit.id === auditId ? { ...audit, auditorId: userId, isAccepted: true } : audit
//         )
//       );

//       console.log("Audit accepted successfully");
//     } catch (error) {
//       console.error("Error accepting audit:", error);
//     }
//   };

//   return (
//     <View style={styles.fullScreen}>
//       <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
//         <View style={styles.greetingContainer}>
//           <Text style={styles.greetingText}>{greeting}, {userName}</Text>
//         </View>

//         <View style={styles.container}>
//           {/* Task Boxes Section */}
//           <View style={styles.taskBoxesContainer}>
//             <TouchableOpacity style={styles.taskBox} onPress={() => navigation.navigate("UserInfo")}>
//               <Ionicons name="calendar" size={30} color="black" style={styles.icon} />
//               <Text style={styles.taskBoxTitle}>Today's Tasks</Text>
//               <Text style={styles.taskBoxContent}>{todayTasks.length} Tasks</Text>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.taskBox} onPress={() => navigation.navigate("Ongoing")}>
//               <Ionicons name="play-circle" size={30} color="black" style={styles.icon} />
//               <Text style={styles.taskBoxTitle}>Ongoing Tasks</Text>
//               <Text style={styles.taskBoxContent}>{ongoingAudits.length} Tasks</Text>
//             </TouchableOpacity>
//           </View>

//           <TouchableOpacity style={styles.taskBox2} onPress={() => navigation.navigate("Completed-Tasks")}>
//             <Ionicons name="checkmark-circle" size={30} color="black" style={styles.icon} />
//             <Text style={styles.taskBoxTitle}>Completed Tasks</Text>
//             <Text style={styles.taskBoxContent}>{completedTasks.length} Tasks</Text>
//           </TouchableOpacity>

//           {/* Upcoming Audits Section */}
//           <View style={styles.upcomingAuditsContainer}>
//             <Text style={styles.upcomingAuditsText}>Upcoming Audits</Text>

//             <FlatList
//               data={audits}
//               renderItem={({ item }) => {
//                 const clientName = clientsData[item.clientId] || "Unknown Client";
//                 const branch = branchesData.find((branch) => branch.id === item.branchId);
//                 const branchCity = branch ? branch.city : "Unknown Location";

//                 return (
//                   <View style={styles.auditItem}>
//                     <View style={styles.clientImageContainer}>
//                       <Text style={styles.clientImage}>{getAvatar(item.auditorId)}</Text>
//                     </View>
//                     <View style={styles.auditContent}>
//                       <Text style={styles.auditName}>{item.name}</Text>
//                       <Text style={styles.auditDate}>{item.date}</Text>
//                       <Text style={styles.auditBranchId}>Branch: {branch?.name || "Unknown Branch"}</Text>
//                       <Text style={styles.auditClientId}>Client: {clientName}</Text>
//                       <Text style={styles.auditCity}>Location: {branchCity}</Text>
//                       <Text style={styles.auditAuditorId}>Auditor: {item.auditorId}</Text>

//                       {!item.isAccepted && (
//                         <TouchableOpacity
//                           style={styles.acceptButton}
//                           onPress={() => acceptAudit(item.id)}
//                         >
//                           <Text style={styles.acceptButtonText}>Accept</Text>
//                         </TouchableOpacity>
//                       )}
//                     </View>
//                   </View>
//                 );
//               }}
//               keyExtractor={(item) => item.id}
//             />
//           </View>
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   fullScreen: {
//     flex: 1,
//     backgroundColor: "white",
//   },
//   greetingContainer: {
//     marginTop: 50,
//     paddingHorizontal: 20,
//   },
//   greetingText: {
//     fontSize: 24,
//     fontWeight: "bold",
//   },
//   container: {
//     padding: 20,
//   },
//   taskBoxesContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   taskBox: {
//     width: (width - 60) / 2,
//     height: 120,
//     backgroundColor: "#f0f0f0",
//     borderRadius: 10,
//     padding: 15,
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "gray",
//   },
//   taskBox2: {
//     width: width - 40,
//     height: 120,
//     backgroundColor: "#f0f0f0",
//     borderRadius: 10,
//     padding: 15,
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "gray",
//   },
//   taskBoxTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   taskBoxContent: {
//     fontSize: 16,
//   },
//   upcomingAuditsContainer: {
//     marginTop: 20,
//   },
//   upcomingAuditsText: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
//   auditItem: {
//     flexDirection: "row",
//     padding: 10,
//     marginBottom: 10,
//     borderRadius: 5,
//     backgroundColor: "#f9f9f9",
//     borderWidth: 1,
//     borderColor: "#ddd",
//   },
//   clientImageContainer: {
//     width: 50,
//     height: 50,
//     backgroundColor: "#ccc",
//     borderRadius: 25,
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 10,
//   },
//   clientImage: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#fff",
//   },
//   auditContent: {
//     flex: 1,
//   },
//   auditName: {
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   auditDate: {
//     fontSize: 14,
//     color: "gray",
//   },
//   auditBranchId: {
//     fontSize: 14,
//     color: "gray",
//   },
//   auditClientId: {
//     fontSize: 14,
//     color: "gray",
//   },
//   auditCity: {
//     fontSize: 14,
//     color: "gray",
//   },
//   auditAuditorId: {
//     fontSize: 14,
//     color: "gray",
//   },
//   acceptButton: {
//     marginTop: 10,
//     padding: 10,
//     backgroundColor: "#4CAF50",
//     borderRadius: 5,
//     alignItems: "center",
//   },
//   acceptButtonText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
// });

// export default HomeScreen;

















// ##############################       Running code #############################################

// import React, { useState, useEffect } from 'react'; 
// import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, Dimensions } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { firebase } from './firebaseConfig';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { getDocs, collection, updateDoc, doc, arrayUnion, onSnapshot, getDoc } from "firebase/firestore"; // Import onSnapshot

// import { db } from "./firebaseConfig";

// const { width, height } = Dimensions.get("window");

// const HomeScreen = ({ navigation, route }) => {
//   const [userId, setUserId] = useState(null);
//   const userEmail = route?.params?.userEmail || "";
//   const [greeting, setGreeting] = useState("");
//   const [userName, setUserName] = useState("");
//   const [audits, setAudits] = useState([]);
//   const [ongoingAudits, setOngoingAudits] = useState([]);
//   const [todayTasks, setTodayTasks] = useState([]);
//   const [completedTasks, setCompletedTasks] = useState([]);
//   const [clientsData, setClientsData] = useState({});
//   const [branchesData, setBranchesData] = useState([]);
//   const [selectedStatus, setSelectedStatus] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterLocation, setFilterLocation] = useState("");

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         // Fetch audits from Firebase collection 'audits'
//         const auditRef = collection(db, "audits");

//         // Real-time listener for updates on audits
//         const unsubscribe = onSnapshot(auditRef, (snapshot) => {
//           const auditData = snapshot.docs.map((doc) => ({
//             id: doc.id,
//             ...doc.data(),
//           }));
//           setAudits(auditData); // Update audits with real-time data
//         });

//         // Fetch ongoing audits from AsyncStorage
//         const ongoingAuditsData = await AsyncStorage.getItem("ongoingAudits");
//         if (ongoingAuditsData) {
//           setOngoingAudits(JSON.parse(ongoingAuditsData));
//         }

//         // Fetch clients from 'clients' collection
//         const clientsRef = collection(db, "clients");
//         const clientSnapshot = await getDocs(clientsRef);
//         const clients = {};
//         clientSnapshot.docs.forEach((doc) => {
//           clients[doc.id] = doc.data().name;
//         });
//         setClientsData(clients);

//         // Fetch branches from 'branches' collection
//         const branchesRef = collection(db, "branches");
//         const branchSnapshot = await getDocs(branchesRef);
//         const branches = branchSnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setBranchesData(branches);

//         // Fetch tasks from 'tasks' collection
//         const tasksRef = collection(db, "tasks");
//         const taskSnapshot = await getDocs(tasksRef);
//         const taskData = taskSnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setTodayTasks(taskData.filter(task => task.status === 'today'));
//         setCompletedTasks(taskData.filter(task => task.status === 'completed'));

//         // Fetch the logged-in user's ID
//         const userDoc = await firebase.firestore().collection('Profile').where("email", "==", userEmail).get();
//         if (!userDoc.empty) {
//           const userId = userDoc.docs[0].id;
//           setUserId(userId); // Set the logged-in user's document ID
//         }

//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }

//       // Set greeting based on time
//       const currentTime = new Date().getHours();
//       setGreeting(currentTime < 12 ? "Good Morning" : currentTime < 19 ? "Good Afternoon " : "Good Evening");
//       setUserName(userEmail ? userEmail.split("@")[0] : "User");
//     };

//     loadData();

//     // Clean up the listener when the component unmounts
//     return () => {
//       if (typeof unsubscribe === "function") {
//         unsubscribe(); // Make sure unsubscribe is a function before calling it
//       }
//     };

//   }, [userEmail]);
//   const getAvatar = (Client) => {
//     // Check if 'Client' is a valid string
//     const firstLetter = Client && typeof Client === 'string' ? Client.charAt(0).toUpperCase() : "Ⓐ";
//     return firstLetter;
//   };
  
//   const acceptAudit = async (auditId) => {
//     try {
//       const auditRef = doc(db, "audits", auditId);
//       await updateDoc(auditRef, {
//         auditorId: userId,
//         isAccepted: true,
//       });

//       if (userId) {
//         const userRef = doc(db, "Profile", userId);
//         await updateDoc(userRef, {
//           AcceptedAudits: arrayUnion(auditId),
//         });

//         console.log("Audit accepted successfully!");
//       } else {
//         console.log("User ID is not available.");
//       }
//     } catch (error) {
//       console.error("Error accepting audit:", error);
//     }
//   };

//   const completeAudit = async (auditId) => {
//     try {
//       const auditRef = doc(db, "audits", auditId);
//       const auditSnapshot = await getDoc(auditRef);
//       const auditData = auditSnapshot.data();

//       if (auditData.isAccepted) {
//         await updateDoc(auditRef, {
//           isCompleted: true,
//         });

//         console.log("Audit marked as complete!");
//       } else {
//         console.log("Audit is not accepted, cannot mark as complete.");
//       }
//     } catch (error) {
//       console.error("Error completing audit:", error);
//     }
//   };

//   const filteredAudits = audits.filter((audit) => {
//     if (selectedStatus && audit.status !== selectedStatus) {
//       return false;
//     }
//     if (filterLocation && audit.location !== filterLocation) {
//       return false;
//     }
//     if (searchTerm && !audit.name.toLowerCase().includes(searchTerm.toLowerCase())) {
//       return false;
//     }
//     return true;
//   });

//   return (
//     <View style={styles.fullScreen}>
//       <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
//         <View>
//           {userId ? (
//             <Text>Welcome, User ID: {userId}</Text>
//           ) : (
//             <Text>.</Text>
//           )}
//         </View>
  
//         <View style={styles.greetingContainer}>
//           <Text style={styles.greetingText}>{greeting}, {userName}</Text>
//         </View>
  
//         <View style={styles.container}>
//           <View style={styles.taskBoxesContainer}>
//             <TouchableOpacity style={styles.taskBox}>
//               <TouchableOpacity onPress={() => navigation.navigate("UserInfo")}>
//                 <Ionicons name="calendar" size={30} color="black" style={styles.icon} />
//                 <Text style={styles.taskBoxTitle}>Today's Tasks</Text>
//                 <Text style={styles.taskBoxContent}>{todayTasks.length} Tasks</Text>
//               </TouchableOpacity>
//             </TouchableOpacity>
  
//             <TouchableOpacity style={styles.taskBox}>
//               <TouchableOpacity onPress={() => navigation.navigate("Ongoing")}>
//                 <Ionicons name="play-circle" size={30} color="black" style={styles.icon} />
//                 <Text style={styles.taskBoxTitle}>Ongoing Tasks</Text>
//                 <Text style={styles.taskBoxContent}>{ongoingAudits.length} Tasks</Text>
//               </TouchableOpacity>
//             </TouchableOpacity>
//           </View>
  
//           <TouchableOpacity style={styles.taskBox2}>
//             <TouchableOpacity onPress={() => navigation.navigate("Completed-Tasks")}>
//               <Ionicons name="checkmark-circle" size={30} color="black" style={styles.icon} />
//               <Text style={styles.taskBoxTitle}>Completed Tasks</Text>
//               <Text style={styles.taskBoxContent}>{completedTasks.length} Tasks</Text>
//             </TouchableOpacity>
//           </TouchableOpacity>
  
//           <View style={styles.upcomingAuditsContainer}>
//             <Text style={styles.upcomingAuditsText}>Upcoming Audits</Text>
  
//             <FlatList
//               data={filteredAudits}
//               renderItem={({ item }) => {
//                 const clientName = clientsData[item.clientId] || "Unknown Client";
//                 const branch = branchesData.find((branch) => branch.id === item.branchId);
//                 const branchCity = branch ? branch.city : "Unknown Location";
  
//                 return (
//                   <TouchableOpacity
//                     style={styles.auditItem}
//                     onPress={() => navigation.navigate("AuditDetails", { audit: item })}
//                   >
//                     <View style={styles.clientImageContainer}>
//                       <Text style={styles.clientImage}>{getAvatar(item.auditorId)}</Text>
//                     </View>
//                     <View style={styles.auditContent}>
//                       <Text style={styles.auditTitle}>{item.name}</Text>
//                       <Text style={styles.auditDetails}>Location: {branchCity}</Text>
//                       <Text style={styles.auditDetails}>Client: {clientName}</Text>
//                       <Text style={styles.auditDetails}>Date: {item.date}</Text>
  
//                       {item.isAccepted ? (
//                         <Text style={styles.acceptedText}>Accepted</Text>
//                       ) : (
//                         <TouchableOpacity
//                           style={styles.acceptButton}
//                           onPress={() => acceptAudit(item.id)}
//                         >
//                           <Text style={styles.acceptButtonText}>Accept Audit</Text>
//                         </TouchableOpacity>
//                       )}
//                     </View>
//                   </TouchableOpacity>
//                 );
//               }}
//               keyExtractor={(item) => item.id}
//             />
//           </View>
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//     fullScreen: {
//       flex: 1,
//       backgroundColor: "#f5f5f5",
//     },
//     greetingContainer: {
//       padding: 15,
//       backgroundColor: "#6200ea",
//     },
//     greetingText: {
//       color: "#fff",
//       fontSize: 18,
//       fontWeight: "bold",
//     },
//     container: {
//       padding: 20,
//     },
//     taskBoxesContainer: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       marginBottom: 20,
//     },
//     taskBox: {
//       width: (width - 60) / 2,
//       backgroundColor: "#fff",
//       padding: 15,
//       borderRadius: 10,
//       elevation: 3,
//       alignItems: "center",
//       justifyContent: "center",
//     },
//     taskBoxTitle: {
//       fontSize: 16,
//       fontWeight: "bold",
//       marginTop: 10,
//     },
//     taskBoxContent: {
//       fontSize: 14,
//       marginTop: 5,
//     },
//     taskBox2: {
//       backgroundColor: "#fff",
//       padding: 15,
//       borderRadius: 10,
//       elevation: 3,
//       marginBottom: 20,
//     },
//     upcomingAuditsContainer: {
//       backgroundColor: "#fff",
//       padding: 20,
//       borderRadius: 10,
//       elevation: 3,
//     },
//     upcomingAuditsText: {
//       fontSize: 18,
//       fontWeight: "bold",
//       marginBottom: 15,
//     },
//     auditItem: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       padding: 10,
//       borderBottomWidth: 1,
//       borderColor: "#ddd",
//     },
//     clientImageContainer: {
//       width: 50,
//       height: 50,
//       borderRadius: 50,
//       backgroundColor: "#6200ea",
//       justifyContent: "center",
//       alignItems: "center",
//     },
//     clientImage: {
//       color: "#fff",
//       fontSize: 22,
//       fontWeight: "bold",
//     },
//     auditContent: {
//       flex: 1,
//       paddingLeft: 10,
//     },
//     auditName: {
//       fontSize: 16,
//       fontWeight: "bold",
//     },
//     auditLocation: {
//       fontSize: 14,
//       color: "#888",
//     },
//     actionsContainer: {
//       justifyContent: "center",
//       alignItems: "center",
//     },
//     acceptButton: {
//       backgroundColor: "#4caf50",
//       padding: 10,
//       borderRadius: 5,
//     },
//     completeButton: {
//       backgroundColor: "#4caf50",
//       padding: 10,
//       borderRadius: 5,
//     },
//     buttonText: {
//       color: "#fff",
//       fontSize: 14,
//       fontWeight: "bold",
//     },
//   });
  
//   export default HomeScreen;
  
  
  
  
  






  
  
import React, { useState, useEffect } from 'react'; 
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { firebase } from './firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDocs, collection, updateDoc, doc, arrayUnion, onSnapshot, getDoc } from "firebase/firestore"; // Import onSnapshot

import { db } from "./firebaseConfig";

const { width, height } = Dimensions.get("window");

const HomeScreen = ({ navigation, route }) => {
  const [userId, setUserId] = useState(null);
  const userEmail = route?.params?.userEmail || "";
  const [greeting, setGreeting] = useState("");
  const [userName, setUserName] = useState("");
  const [audits, setAudits] = useState([]);
  const [ongoingAudits, setOngoingAudits] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [clientsData, setClientsData] = useState({});
  const [branchesData, setBranchesData] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch audits from Firebase collection 'audits'
        const auditRef = collection(db, "audits");
        
        // Real-time listener for updates on audits
        const unsubscribe = onSnapshot(auditRef, (snapshot) => {
          const auditData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setAudits(auditData); // Update audits with real-time data
        });

        // Fetch ongoing audits from AsyncStorage
        const ongoingAuditsData = await AsyncStorage.getItem("ongoingAudits");
        if (ongoingAuditsData) {
          setOngoingAudits(JSON.parse(ongoingAuditsData));
        }

        // Fetch clients from 'clients' collection
        const clientsRef = collection(db, "clients");
        const clientSnapshot = await getDocs(clientsRef);
        const clients = {};
        clientSnapshot.docs.forEach((doc) => {
          clients[doc.id] = doc.data().name;
        });
        setClientsData(clients);

        // Fetch branches from 'branches' collection
        const branchesRef = collection(db, "branches");
        const branchSnapshot = await getDocs(branchesRef);
        const branches = branchSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBranchesData(branches);

        // Fetch tasks from 'tasks' collection
        const tasksRef = collection(db, "tasks");
        const taskSnapshot = await getDocs(tasksRef);
        const taskData = taskSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTodayTasks(taskData.filter(task => task.status === 'today'));
        setCompletedTasks(taskData.filter(task => task.status === 'completed'));

        // Fetch the logged-in user's ID
        const userDoc = await firebase.firestore().collection('Profile').where("email", "==", userEmail).get();
        if (!userDoc.empty) {
          const userId = userDoc.docs[0].id;
          setUserId(userId); // Set the logged-in user's document ID
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      }

      // Set greeting based on time
      const currentTime = new Date().getHours();
      setGreeting(currentTime < 12 ? "Good Morning" : currentTime < 19 ? "Good Afternoon " : "Good Evening");
      setUserName(userEmail ? userEmail.split("@")[0] : "User");
    };

    loadData();

    // Clean up the listener when the component unmounts
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };

  }, [userEmail]);

  const getAvatar = (Client) => {
    const firstLetter = Client ? Client.charAt(0).toUpperCase() : "Ⓐ";
    return firstLetter;
  };

  const acceptAudit = async (auditId) => {
    try {
      // Ensure userId is available before proceeding
      if (!userId) {
        console.log("User ID is not available.");
        return;
      }

      // Update the audit to mark it as accepted
      const auditRef = doc(db, "audits", auditId);
      await updateDoc(auditRef, {
        auditorId: userId, // Update the auditorId in the audit document
        isAccepted: true, // Mark the audit as accepted
      });

      // Log audit acceptance
      console.log(`Audit ${auditId} accepted and marked with auditorId ${userId}`);

      // Add the auditId to the 'AcceptedAudits' array in the user's profile
      const userRef = doc(db, "Profile", userId);

      // Use arrayUnion to safely add the audit ID to the AcceptedAudits field
      await updateDoc(userRef, {
        AcceptedAudits: arrayUnion(auditId),
      });

      // Log successful update to user's profile
      console.log(`Audit ID ${auditId} added to user's AcceptedAudits field!`);

    } catch (error) {
      console.error("Error accepting audit:", error);
    }
  };

  const completeAudit = async (auditId) => {
    try {
      const auditRef = doc(db, "audits", auditId);
      const auditSnapshot = await getDoc(auditRef);
      const auditData = auditSnapshot.data();

      if (auditData.isAccepted) {
        await updateDoc(auditRef, {
          isCompleted: true,
        });

        console.log("Audit marked as complete!");
      } else {
        console.log("Audit is not accepted, cannot mark as complete.");
      }
    } catch (error) {
      console.error("Error completing audit:", error);
    }
  };

  const filteredAudits = audits.filter((audit) => {
    if (selectedStatus && audit.status !== selectedStatus) {
      return false;
    }
    if (filterLocation && audit.location !== filterLocation) {
      return false;
    }
    if (searchTerm && !audit.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <View style={styles.fullScreen}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View>
          {userId ? (
            <Text>Welcome, User ID: {userId}</Text>
          ) : (
            <Text>.</Text>
          )}
        </View>
  
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>{greeting}, {userName}</Text>
        </View>
  
        <View style={styles.container}>
          <View style={styles.taskBoxesContainer}>
            <TouchableOpacity style={styles.taskBox}>
              <TouchableOpacity onPress={() => navigation.navigate("UserInfo")}>
                <Ionicons name="calendar" size={30} color="black" style={styles.icon} />
                <Text style={styles.taskBoxTitle}>Today's Tasks</Text>
                <Text style={styles.taskBoxContent}>{todayTasks.length} Tasks</Text>
              </TouchableOpacity>
            </TouchableOpacity>
  
            <TouchableOpacity style={styles.taskBox}>
              <TouchableOpacity onPress={() => navigation.navigate("Ongoing")}>
                <Ionicons name="play-circle" size={30} color="black" style={styles.icon} />
                <Text style={styles.taskBoxTitle}>Ongoing Tasks</Text>
                <Text style={styles.taskBoxContent}>{ongoingAudits.length} Tasks</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
  
          <TouchableOpacity style={styles.taskBox2}>
            <TouchableOpacity onPress={() => navigation.navigate("Completed-Tasks")}>
              <Ionicons name="checkmark-circle" size={30} color="black" style={styles.icon} />
              <Text style={styles.taskBoxTitle}>Completed Tasks</Text>
              <Text style={styles.taskBoxContent}>{completedTasks.length} Tasks</Text>
            </TouchableOpacity>
          </TouchableOpacity>
  
          <View style={styles.upcomingAuditsContainer}>
            <Text style={styles.upcomingAuditsText}>Upcoming Audits</Text>
  
            <FlatList
              data={filteredAudits}
              renderItem={({ item }) => {
                const clientName = clientsData[item.clientId] || "Unknown Client";
                const branch = branchesData.find((branch) => branch.id === item.branchId);
                const branchCity = branch ? branch.city : "Unknown Location";
  
                return (
                  <TouchableOpacity
                    style={styles.auditItem}
                    onPress={() => navigation.navigate("AuditDetails", { audit: item })}
                  >
                    <View style={styles.clientImageContainer}>
                      <Text style={styles.clientImage}>{getAvatar(item.auditorId)}</Text>
                    </View>
                    <View style={styles.auditContent}>
                      <Text style={styles.auditTitle}>Audit: {item.auditName}</Text>
                      <Text style={styles.clientName}>Client: {clientName}</Text>
                      <Text style={styles.branch}>Branch: {branchCity}</Text>
                    </View>
                    <View style={styles.actionButtonsContainer}>
                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => acceptAudit(item.id)}
                      >
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.rejectButton}
                        onPress={() => console.log("Reject audit")}
                      >
                        <Text style={styles.rejectButtonText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item) => item.id}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
  
const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  greetingContainer: {
    padding: 20,
    backgroundColor: "#fff",
  },
  greetingText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  container: {
    flex: 1,
    margin: 10,
  },
  taskBoxesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  taskBox: {
    backgroundColor: "#fff",
    padding: 10,
    width: "48%",
    borderRadius: 10,
    alignItems: "center",
  },
  taskBox2: {
    backgroundColor: "#fff",
    padding: 10,
    width: "100%",
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  taskBoxTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  taskBoxContent: {
    fontSize: 14,
    color: "#555",
  },
  upcomingAuditsContainer: {
    marginBottom: 20,
  },
  upcomingAuditsText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  auditItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    marginVertical: 5,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  clientImageContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  clientImage: {
    backgroundColor: "#dcdcdc",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    lineHeight: 40,
    fontSize: 18,
  },
  auditContent: {
    flex: 1,
  },
  auditTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  clientName: {
    fontSize: 14,
    color: "#555",
  },
  branch: {
    fontSize: 14,
    color: "#555",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
    padding: 8,
    borderRadius: 5,
    marginRight: 10,
  },
  rejectButton: {
    backgroundColor: "#f44336",
    padding: 8,
    borderRadius: 5,
  },
  acceptButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  rejectButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default HomeScreen;
