



// import React, { useState, useEffect } from "react";
// import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert,Image } from "react-native";
// import { getFirestore, doc, getDocs, collection, updateDoc, query, where } from "firebase/firestore";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { app } from "./firebaseConfig"; // Your Firebase config file
// import DateTimePicker from '@react-native-community/datetimepicker';
// import Ionicons from 'react-native-vector-icons/Ionicons'; 
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import { FontAwesome5 } from '@expo/vector-icons'; // Import for icons

// const db = getFirestore(app);

// export default function TodaysTasks() {
//   const [todaysAudits, setTodaysAudits] = useState([]);
//   const [selectedAudit, setSelectedAudit] = useState(null);
//   const [selectedTime, setSelectedTime] = useState(new Date());
//   const [showClock, setShowClock] = useState(false);
//   const todayDate = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

//   useEffect(() => {
//     const getUserId = async () => {
//       try {
//         const userId = await AsyncStorage.getItem("userId");
//         if (userId) {
//           console.log("Retrieved User ID:", userId);
//           fetchTodaysAudits(userId);
//         } else {
//           console.error("User ID not found in AsyncStorage");
//         }
//       } catch (error) {
//         console.error("Error fetching user ID:", error);
//       }
//     };

//     getUserId();
//   }, []);

//   const fetchTodaysAudits = async (userId) => {
//     try {
//       console.log("Fetching audits for date:", todayDate);

//       const userRef = doc(db, "Profile", userId);
//       const acceptedAuditsRef = collection(userRef, "acceptedAudits");

//       const q = query(acceptedAuditsRef, where("date", "==", todayDate));
//       const querySnapshot = await getDocs(q);

//       const audits = [];
//       console.log("Query Snapshot Size:", querySnapshot.size);

//       querySnapshot.forEach((doc) => {
//         console.log("Audit Found:", doc.id, doc.data());
//         audits.push({ id: doc.id, ...doc.data() });
//       });

//       if (audits.length === 0) {
//         console.log("No audits for today");
//       }

//       setTodaysAudits(audits);
//     } catch (error) {
//       console.error("Error fetching today's audits:", error);
//     }
//   };

//   const handleSetTime = (audit) => {
//     setSelectedAudit(audit);
//     setShowClock(true);
//   };

//   const handleComplete = async (audit) => {
//     try {
//       const auditRef = doc(db, "audits", audit.id);
//       await updateDoc(auditRef, { isComplete: true });

//       Alert.alert("Task Completed", "This task has been marked as completed.");
//       fetchTodaysAudits(); // Refresh the list of today's audits
//     } catch (error) {
//       console.error("Error completing audit:", error);
//     }
//   };

//   const onTimeChange = async (event, selectedTime) => {
//     setShowClock(false);

//     if (event.type === "set" && selectedTime) {
//       const auditRef = doc(db, "Profile", selectedAudit.userId);
//       const acceptedAuditRef = doc(auditRef, "acceptedAudits", selectedAudit.id);

//       try {
//         await updateDoc(acceptedAuditRef, {
//           time: selectedTime,
//           isCompleted: false,
//           auditId: selectedAudit.id,
//         });

//         Alert.alert("Time Set", `Time for this audit is set to ${selectedTime.toLocaleTimeString()}`);
//         fetchTodaysAudits();
//       } catch (error) {
//         console.error("Error updating audit time:", error);
//       }
//     }
//   };

//   const renderAudit = ({ item: audit }) => (
//     <View style={styles.auditCard}>
//       {/* Header Section */}
//       <View style={styles.header}>
//         <Image
//           source={require('./Images/building.png')}
//           style={{ width: 34, height: 34 }}
//         />
//         <View style={styles.title}>
//           <Text style={styles.companyName}>{audit.clientDetails?.name || "Tata Motors"}</Text>
//           <Text style={styles.branchName}>{audit.branchDetails?.name || "A"}</Text>
//         </View>
//       </View>
  
//       {/* Details Section */}
//       <View style={styles.details}>
//         <View style={styles.detail}>
//           <MaterialIcons name="location-on" size={24} color="#189ab4" />
//           <Text style={styles.detailText}>{audit.branchDetails?.city || "Bishnupur"}</Text>
//         </View>
//         <View style={styles.detail}>
//           <MaterialCommunityIcons name="shield-search" size={24} color="#189ab4" />
//           <Text style={styles.detailText}>{audit.auditType || "General Audit"}</Text>
//         </View>
//         <View style={styles.detail}>
//           <MaterialIcons name="event" size={24} color="#189ab4" />
//           <Text style={styles.detailText}>
//             Date: {audit.acceptedDate || "2024-12-18"}
//           </Text>
//         </View>
//       </View>
  
//       {/* Button Section */}
//       <View style={styles.buttonContainer}>

//         <TouchableOpacity
//           style={styles.completeButton}
//           onPress={() => handleComplete(audit)}
//         >
//           <Text style={styles.buttonText}>Complete</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
  

//   return (
//     <View style={styles.container}>
//       {todaysAudits.length === 0 ? (
//         <Text style={styles.noAuditsText}>No audits for today</Text>
//       ) : (
//         <FlatList
//           data={todaysAudits}
//           renderItem={renderAudit}
//           keyExtractor={(item) => item.id}
//         />
//       )}

//       {showClock && (
//         <DateTimePicker
//           value={selectedTime}
//           mode="time"
//           display="default"
//           onChange={onTimeChange}
//         />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f8f8f8",
//     padding: 10,
//   },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     padding: 16,
//     marginVertical: 8,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   auditCard: {
//     backgroundColor: "#fff",
//     padding: 15,
//     marginVertical: 8,
//     borderRadius: 8,
//     elevation: 2,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   title: {
//     marginLeft: 10,
//   },
//    details: {
//     marginVertical: 8,
//   },
//   detail: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 6,
//   },
//   companyName: {
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   branchName: {
//     fontSize: 14,
//     color: "#555",
//   },
//   auditText: {
//     fontSize: 16,
//     color: "#333",
//     marginBottom: 5,
//   },
//   buttonContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 10,
//   },
//   setTimeButton: {
//     backgroundColor: "#007bff",
//     padding: 10,
//     borderRadius: 5,
//   },
//   completeButton: {
//     backgroundColor: "#28a745",
//     padding: 10,
//     borderRadius: 5,
//   },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
//   noAuditsText: {
//     fontSize: 18,
//     color: "#555",
//     textAlign: "center",
//     marginTop: 20,
//   },
// });



import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, Image,navigate } from "react-native";
import { getFirestore, doc, getDocs, collection, updateDoc, query, where } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { app } from "./firebaseConfig"; // Your Firebase config file
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons'; 


const db = getFirestore(app);

export default function TodaysTasks({ navigation }) {
  const [todaysAudits, setTodaysAudits] = useState([]);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showClock, setShowClock] = useState(false);
  const todayDate = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

  useEffect(() => {
    const getUserId = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (userId) {
          console.log("Retrieved User ID:", userId);
          fetchTodaysAudits(userId);
        } else {
          console.error("User ID not found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };

    getUserId();
  }, []);

  const handleGenerateReport = (auditId, auditName) => {
    navigation.navigate("ReportScreen", { auditId, auditName });
  };

  const fetchTodaysAudits = async (userId) => {
    try {
      console.log("Fetching audits for date:", todayDate);

      const userRef = doc(db, "Profile", userId);
      const acceptedAuditsRef = collection(userRef, "acceptedAudits");

      const q = query(acceptedAuditsRef, where("date", "==", todayDate));
      const querySnapshot = await getDocs(q);

      const audits = [];
      console.log("Query Snapshot Size:", querySnapshot.size);

      querySnapshot.forEach((doc) => {
        console.log("Audit Found:", doc.id, doc.data());
        audits.push({ id: doc.id, ...doc.data() });
      });

      if (audits.length === 0) {
        console.log("No audits for today");
      }

      setTodaysAudits(audits);
    } catch (error) {
      console.error("Error fetching today's audits:", error);
    }
  };

  const handleComplete = async (audit) => {
    try {
      const auditRef = doc(db, "audits", audit.id);
      await updateDoc(auditRef, { isComplete: true });

      Alert.alert("Task Completed", "This task has been marked as completed.");
      fetchTodaysAudits(); // Refresh the list of today's audits
    } catch (error) {
      console.error("Error completing audit:", error);
    }
  };

  const renderAudit = ({ item: audit }) => (
    <View style={styles.auditCard}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image
          source={require('./Images/building.png')}
          style={{ width: 34, height: 34 }}
        />
        <View style={styles.title}>
          <Text style={styles.companyName}>{audit.clientDetails?.name || "Tata Motors"}</Text>
          <Text style={styles.branchName}>{audit.branchDetails?.name || "A"}</Text>
        </View>
      </View>

      {/* Details Section */}
      <View style={styles.details}>
        <View style={styles.detail}>
          <MaterialIcons name="location-on" size={24} color="#189ab4" />
          <Text style={styles.detailText}>{audit.branchDetails?.city || "Bishnupur"}</Text>
        </View>
        <View style={styles.detail}>
          <MaterialCommunityIcons name="shield-search" size={24} color="#189ab4" />
          <Text style={styles.detailText}>{audit.auditType || "General Audit"}</Text>
        </View>
        <View style={styles.detail}>
          <MaterialIcons name="event" size={24} color="#189ab4" />
          <Text style={styles.detailText}>
            Date: {audit.acceptedDate || "2024-12-21"}
          </Text>
        </View>
      </View>

      {/* Button Section */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleGenerateReport(audit.id, audit.auditName)}>
          <Ionicons name="document-text" size={20} color="green" />
          <Text style={styles.buttonText}>Generate Report</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleComplete(audit)}>
          <Image
            source={require('./Images/Accept.png')} // Add your button image here
            style={styles.completeButtonImage}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {todaysAudits.length === 0 ? (
        <Text style={styles.noAuditsText}>No audits for today</Text>
      ) : (
        <FlatList
          data={todaysAudits}
          renderItem={renderAudit}
          keyExtractor={(item) => item.id}
        />
      )}

      {showClock && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    padding: 10,
  },
  auditCard: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    
  },
  button: {
        backgroundColor: "white",
        padding: 7,
        borderRadius: 5,
        flex: 1,
        borderWidth:2,
        borderColor:'green',
        marginHorizontal: 3,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
      },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    marginLeft: 10,
  },
  details: {
    marginVertical: 8,
  },
  detail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  buttonText: {
        marginLeft: 8,
        color: "green",
        fontSize: 14,
      },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  branchName: {
    fontSize: 14,
    color: "#555",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  completeButtonImage: {
    width: 180,
    height: 50,
    resizeMode: "contain",
  },
  noAuditsText: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
    marginTop: 20,
  },
});


// import React, { useState, useEffect } from "react";
// import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Image } from "react-native";
// import { getFirestore, collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { app } from "./firebaseConfig";
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// const db = getFirestore(app);

// const TodaysTasks = ({ navigation }) => {
//   const [todaysAudits, setTodaysAudits] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [todaysCounter, setTodaysCounter] = useState(0);

//   useEffect(() => {
//     const loadTodaysAudits = async () => {
//       setLoading(true);
//       try {
//         const userId = await AsyncStorage.getItem("userId");
//         if (!userId) {
//           console.error("User ID not found!");
//           return;
//         }

//         const todayDate = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

//         // Query to get accepted audits from the acceptedAudits sub-collection
//         const userAcceptedRef = collection(doc(db, "Profile", userId), "acceptedAudits");
//         const acceptedAuditsSnap = await getDocs(userAcceptedRef);

//         const fetchedAudits = [];
//         for (const auditDoc of acceptedAuditsSnap.docs) {
//           const auditId = auditDoc.id;

//           const auditRef = doc(db, "audits", auditId);
//           const auditSnap = await getDoc(auditRef);

//           if (auditSnap.exists()) {
//             const auditDetails = auditSnap.data();

//             // Check if the audit date matches today's date
//             const auditDate = auditDetails.date;

//             // If the audit date is a Timestamp, convert it to string (YYYY-MM-DD)
//             let auditDateString = "";
//             if (auditDate && auditDate.toDate) {
//               // Timestamp conversion
//               auditDateString = auditDate.toDate().toISOString().split("T")[0];
//             } else if (typeof auditDate === "string") {
//               // If it's already a string, use it as is
//               auditDateString = auditDate;
//             }

//             if (auditDateString === todayDate) {
//               const branchRef = doc(db, "branches", auditDetails.branchId);
//               const branchSnap = await getDoc(branchRef);

//               const clientRef = doc(db, "clients", auditDetails.clientId);
//               const clientSnap = await getDoc(clientRef);

//               const acceptedAuditRef = doc(db, "Profile", userId, "acceptedAudits", auditId);
//               const acceptedAuditSnap = await getDoc(acceptedAuditRef);
//               const acceptedDate = acceptedAuditSnap.data() ? acceptedAuditSnap.data().date : null;

//               if (branchSnap.exists() && clientSnap.exists()) {
//                 fetchedAudits.push({
//                   id: auditId,
//                   ...auditDetails,
//                   branchDetails: branchSnap.data(),
//                   clientDetails: clientSnap.data(),
//                   acceptedDate,
//                 });
//               } else {
//                 console.log("Branch or client details missing for audit:", auditId);
//               }
//             }
//           }
//         }

//         setTodaysAudits(fetchedAudits);
//         setTodaysCounter(fetchedAudits.length);
//       } catch (error) {
//         console.error("Error loading today's audits:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadTodaysAudits();
//   }, []);

//   const handleGenerateReport = (auditId, auditName) => {
//     navigation.navigate("ReportScreen", { auditId, auditName });
//   };

//   const handleRemove = async (auditId, auditName) => {
//     try {
//       const userId = await AsyncStorage.getItem("userId");
//       if (!userId) {
//         console.error("User ID not found!");
//         return;
//       }

//       await updateDoc(doc(db, "audits", auditId), { isRejected: true });

//       const acceptedAuditsRef = doc(db, "Profile", userId, "acceptedAudits", auditId);
//       await updateDoc(acceptedAuditsRef, { isRejected: true });

//       setTodaysAudits((prev) => prev.filter((audit) => audit.id !== auditId));
//       navigation.navigate("RejectedAudits", { auditName, isRejected: true });
//     } catch (error) {
//       console.error("Error removing audit:", error);
//     }
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
//       <TouchableOpacity style={[styles.card, styles.todaysTasks]}>
//         <Text style={styles.cardTitle}>Today's Audits</Text>
//         <Text style={styles.counterText}>{todaysCounter} audits for today</Text>
//       </TouchableOpacity>
//       {loading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#4CAF50" />
//         </View>
//       ) : todaysAudits.length === 0 ? (
//         <View style={styles.noTasksContainer}>
//           <Text style={styles.noTasksText}>No audits for today</Text>
//         </View>
//       ) : (
//         todaysAudits.map((audit) => (
//           <View key={audit.id} style={styles.card}>
//             <View style={styles.header}>
//               <Image source={require('./Images/building.png')} style={{width: 34, height: 34}} />
//               <View style={styles.title}>
//                 <Text style={styles.companyName}>{audit.clientDetails.name || "Tata Motors"}</Text>
//                 <Text style={styles.branchName}>{audit.branchDetails.name || "Unknown"}</Text>
//               </View>
//             </View>

//             <View style={styles.details}>
//               <View style={styles.detail}>
//                 <MaterialIcons name="location-on" size={24} color="#189ab4" />
//                 <Text style={styles.detailText}>{audit.branchDetails.city || "Unknown Location"}</Text>
//               </View>
//               <View style={styles.detail}>
//                 <MaterialCommunityIcons name="shield-search" size={24} color="#189ab4" />
//                 <Text style={styles.detailText}>{audit.auditType || "General Audit"}</Text>
//               </View>
//               <View style={styles.detail}>
//                 <MaterialIcons name="event" size={24} color="#189ab4" />
//                 <Text style={styles.detailText}>Date: {audit.acceptedDate || "Not Assigned"}</Text>
//               </View>
//             </View>

//             <View style={styles.buttonContainer}>
//               <TouchableOpacity
//                 style={styles.button}
//                 onPress={() => handleGenerateReport(audit.id, audit.auditName)}
//               >
//                 <Ionicons name="document-text" size={20} color="white" />
//                 <Text style={styles.buttonText}>Generate Report</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[styles.button, styles.removeButton]}
//                 onPress={() => handleRemove(audit.id, audit.auditName)}
//               >
//                 <Ionicons name="trash" size={20} color="white" />
//                 <Text style={styles.buttonText}>Remove</Text>
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
//     padding: 16,
//     backgroundColor: "#f5f5f5",
//   },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     padding: 16,
//     marginVertical: 8,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   todaysTasks: {
//     backgroundColor: "#e0f7fa",
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#00796b",
//   },
//   counterText: {
//     fontSize: 16,
//     color: "#00796b",
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   title: {
//     marginLeft: 10,
//   },
//   companyName: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   branchName: {
//     fontSize: 14,
//     color: "#666",
//   },
//   details: {
//     marginVertical: 8,
//   },
//   detail: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   detailText: {
//     marginLeft: 8,
//     fontSize: 14,
//     color: "#333",
//   },
//   buttonContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   button: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#00796b",
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 4,
//   },
//   removeButton: {
//     backgroundColor: "#d32f2f",
//   },
//   buttonText: {
//     marginLeft: 8,
//     color: "#fff",
//     fontSize: 14,
//   },
//   loadingContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 20,
//   },
//   noTasksContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 20,
//   },
//   noTasksText: {
//     fontSize: 18,
//     color: "#666",
//   },
// });

// export default TodaysTasks;
