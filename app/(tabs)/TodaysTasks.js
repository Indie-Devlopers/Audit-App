// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   Alert,
// } from "react-native";
// import { getFirestore, doc, getDocs, query, collection, where, updateDoc } from "firebase/firestore";
// import { app } from "./firebaseConfig"; // Firebase configuration
// import DateTimePicker from "@react-native-community/datetimepicker";
// import { Timestamp } from "firebase/firestore";
// // Initialize Firestore
// const db = getFirestore(app);

// export default function TodaysTasks({ navigation }) {
//   const [todaysAudits, setTodaysAudits] = useState([]);
//   const [showClock, setShowClock] = useState(false);
//   const [selectedAudit, setSelectedAudit] = useState(null);
//   const [selectedTime, setSelectedTime] = useState(new Date());

//   const todayDate = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

//   useEffect(() => {
//     fetchTodaysAudits();
//   }, []);

//   const fetchTodaysAudits = async () => {
//     try {
//       const auditsRef = collection(db, "audits");
//       const q = query(auditsRef, where("date", "==", todayDate)); // Assuming "date" is the field storing the task date
//       const querySnapshot = await getDocs(q);

//       const audits = [];
//       querySnapshot.forEach((doc) => {
//         audits.push({ id: doc.id, ...doc.data() });
//       });

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
//       await updateDoc(auditRef, {
//         isComplete: true,
//       });

//       Alert.alert("Task Completed", "This task has been marked as completed.");
//       fetchTodaysAudits(); // Refresh the list
//     } catch (error) {
//       console.error("Error completing audit:", error);
//     }
//   };

//   // const onTimeChange = (event, selectedTime) => {
//   //   setShowClock(false);

//   //   if (event.type === "set" && selectedTime) {
//   //     Alert.alert("Time Set", `Time for this audit is set to ${selectedTime.toLocaleTimeString()}`);
//   //     // Optionally, update the time in the database
//   //   }
//   // };

//   const onTimeChange = async (event, selectedTime) => {
//     setShowClock(false);
  
//     if (event.type === "set" && selectedTime) {
//       // Convert the selected time to a Firebase Timestamp
//       const firebaseTimestamp = Timestamp.fromDate(selectedTime);
      
//       // Update the selected time in Firestore for the current audit
//       try {
//         const auditRef = doc(db, "audits", selectedAudit.id);
//         await updateDoc(auditRef, {
//           time: firebaseTimestamp, // Store the time as a timestamp
//         });
  
//         Alert.alert("Time Set", `Time for this audit is set to ${selectedTime.toLocaleTimeString()}`);
//       } catch (error) {
//         console.error("Error setting time for audit:", error);
//       }
//     }
//   };
//   const renderAudit = ({ item }) => (
//     <View style={styles.auditCard}>
//       <Text style={styles.auditText}>Client ID: {item.clientId}</Text>
//       <Text style={styles.auditText}>Branch ID: {item.branchId}</Text>
//       {/* <Text style={styles.auditText}>Accepted By: {item.authored}</Text> */}
//       <Text style={styles.auditText}>Date: {item.date}</Text>

//       <View style={styles.buttonContainer}>
//         <TouchableOpacity
//           style={styles.setTimeButton}
//           onPress={() => handleSetTime(item)}
//         >
//           <Text style={styles.buttonText}>Set Time</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={styles.completeButton}
//           onPress={() => handleComplete(item)}
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
//   auditCard: {
//     backgroundColor: "#fff",
//     padding: 15,
//     marginVertical: 8,
//     borderRadius: 8,
//     elevation: 2,
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



import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, Timestamp } from "firebase/firestore";
import { app } from "./firebaseConfig"; // Firebase configuration
import { getAuth } from "firebase/auth"; // Firebase Authentication for getting the logged-in user ID
import DateTimePicker from "@react-native-community/datetimepicker";

// Initialize Firestore
const db = getFirestore(app);

export default function TodaysTasks() {
  const [todaysAudits, setTodaysAudits] = useState([]);
  const [showClock, setShowClock] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [selectedTime, setSelectedTime] = useState(new Date());

  const todayDate = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
  const auth = getAuth(); // Firebase Auth instance to get logged-in user info
  const auditorId = auth.currentUser?.uid; // Get the logged-in user's UID

  useEffect(() => {
    if (auditorId) {
      fetchTodaysAudits();
    }
  }, [auditorId]);

  // Fetch audits for today based on the logged-in user's auditorId
  const fetchTodaysAudits = async () => {
    try {
      // Firestore path: /Profile/{auditorId}/acceptedAudits
      const acceptedAuditsRef = collection(db, "Profile", auditorId, "acceptedAudits");

      // Query to find the audits that match today's date
      const q = query(acceptedAuditsRef, where("date", "==", todayDate));

      const querySnapshot = await getDocs(q);

      const audits = [];
      querySnapshot.forEach((doc) => {
        const auditData = doc.data();
        audits.push({ id: doc.id, ...auditData });
      });

      setTodaysAudits(audits);
    } catch (error) {
      console.error("Error fetching today's audits:", error);
    }
  };

  // Handle setting time for a selected audit
  const handleSetTime = (audit) => {
    setSelectedAudit(audit);
    setShowClock(true);
  };

  // Mark audit as completed
  const handleComplete = async (audit) => {
    try {
      const auditRef = doc(db, "Profile", auditorId, "acceptedAudits", audit.id);
      await updateDoc(auditRef, {
        isComplete: true,
      });

      Alert.alert("Task Completed", "This task has been marked as completed.");
      fetchTodaysAudits(); // Refresh the list
    } catch (error) {
      console.error("Error completing audit:", error);
    }
  };

  // Handle time selection
  const onTimeChange = async (event, selectedTime) => {
    setShowClock(false);

    if (event.type === "set" && selectedTime) {
      // Convert the selected time to a Firebase Timestamp
      const firebaseTimestamp = Timestamp.fromDate(selectedTime);

      // Update the selected time in Firestore for the current audit
      try {
        const auditRef = doc(db, "Profile", auditorId, "acceptedAudits", selectedAudit.id);
        await updateDoc(auditRef, {
          time: firebaseTimestamp, // Store the time as a timestamp
        });

        Alert.alert("Time Set", `Time for this audit is set to ${selectedTime.toLocaleTimeString()}`);
      } catch (error) {
        console.error("Error setting time for audit:", error);
      }
    }
  };

  // Render each audit
  const renderAudit = ({ item }) => (
    <View style={styles.auditCard}>
      <Text style={styles.auditText}>Client ID: {item.clientId}</Text>
      <Text style={styles.auditText}>Branch ID: {item.branchId}</Text>
      <Text style={styles.auditText}>Date: {item.date}</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.setTimeButton}
          onPress={() => handleSetTime(item)}
        >
          <Text style={styles.buttonText}>Set Time</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => handleComplete(item)}
        >
          <Text style={styles.buttonText}>Complete</Text>
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
  auditText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  setTimeButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
  },
  completeButton: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  noAuditsText: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
    marginTop: 20,
  },
});
