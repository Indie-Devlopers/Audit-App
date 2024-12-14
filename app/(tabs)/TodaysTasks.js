// import React, { useState, useEffect } from "react";
// import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from "react-native";
// import { getFirestore, doc, getDocs, collection, updateDoc, query, where } from "firebase/firestore";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { app } from "./firebaseConfig"; // Your Firebase config file

// const db = getFirestore(app);

// export default function TodaysTasks() {
//   const [todaysAudits, setTodaysAudits] = useState([]);
//   const [selectedAudit, setSelectedAudit] = useState(null);
//   const [selectedTime, setSelectedTime] = useState(new Date());
//   const [showClock, setShowClock] = useState(false);
//   const todayDate = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

//   useEffect(() => {
//     const getUserId = async () => {
//       try {
//         const userId = await AsyncStorage.getItem("userId");
//         if (userId) {
//           fetchTodaysAudits(userId); // Fetch today's audits for the logged-in user
//         } else {
//           console.error("User ID not found in AsyncStorage");
//         }
//       } catch (error) {
//         console.error("Error fetching user ID:", error);
//       }
//     };

//     getUserId(); // Call function to get user ID and fetch audits
//   }, []);

//   const fetchTodaysAudits = async (userId) => {
//     try {
//       const userRef = doc(db, "Profile", userId);
//       const acceptedAuditsRef = collection(userRef, "acceptedAudits");

//       const q = query(acceptedAuditsRef, where("date", "==", todayDate));
//       const querySnapshot = await getDocs(q);

//       const audits = [];
//       querySnapshot.forEach((doc) => {
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
//       const auditRef = doc(db, "audits", selectedAudit.id);
//       await updateDoc(auditRef, {
//         time: selectedTime,
//       });

//       Alert.alert("Time Set", `Time for this audit is set to ${selectedTime.toLocaleTimeString()}`);
//     }
//   };

//   const renderAudit = ({ item }) => (
//     <View style={styles.auditCard}>
//       <Text style={styles.auditText}>Client ID: {item.clientId}</Text>
//       <Text style={styles.auditText}>Branch ID: {item.branchId}</Text>
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




import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from "react-native";
import { getFirestore, doc, getDocs, collection, updateDoc, query, where } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { app } from "./firebaseConfig"; // Your Firebase config file
import DateTimePicker from '@react-native-community/datetimepicker';

const db = getFirestore(app);

export default function TodaysTasks() {
  const [todaysAudits, setTodaysAudits] = useState([]);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showClock, setShowClock] = useState(false);
  const todayDate = new Date().toISOString().split("T")[0]; 

  useEffect(() => {
    const getUserId = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (userId) {
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

  const fetchTodaysAudits = async (userId) => {
    try {
      const userRef = doc(db, "Profile", userId);
      const acceptedAuditsRef = collection(userRef, "acceptedAudits");

      const q = query(acceptedAuditsRef, where("date", "==", todayDate));
      const querySnapshot = await getDocs(q);

      const audits = [];
      querySnapshot.forEach((doc) => {
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

  const handleSetTime = (audit) => {
    setSelectedAudit(audit);
    setShowClock(true);
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

  const onTimeChange = async (event, selectedTime) => {
    setShowClock(false);

    if (event.type === "set" && selectedTime) {
      const auditRef = doc(db, "Profile", selectedAudit.userId);
      const acceptedAuditRef = doc(auditRef, "acceptedAudits", selectedAudit.id);

      // Save the selected time along with isCompleted and auditId
      await updateDoc(acceptedAuditRef, {
        time: selectedTime,
        isCompleted: false, // You can set isCompleted to false initially if needed
        auditId: selectedAudit.id,
      });

      Alert.alert("Time Set", `Time for this audit is set to ${selectedTime.toLocaleTimeString()}`);
    }
  };

  const renderAudit = ({ item }) => (
    <View style={styles.auditCard}>
      {/* <Text style={styles.auditText}>Client ID: {item.clientId}</Text> */}
      <Text style={styles.auditText}>Branch ID: {item.branchId}</Text>
      <Text style={styles.auditText}>Date: {item.date}</Text>
      <Text style={styles.auditText}>name: {item.name}</Text>
      <Text style={styles.auditText}>City: {item.City}</Text>

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
