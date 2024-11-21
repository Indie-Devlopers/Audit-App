// import React, { useState, useEffect } from "react";
// import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const Ongoing = ({ navigation }) => {
//   const [clients, setClients] = useState({});

//   // Load ongoing clients from AsyncStorage
//   useEffect(() => {
//     const loadClients = async () => {
//       try {
//         const storedClients = await AsyncStorage.getItem("ongoingClients");
//         if (storedClients) {
//           setClients(JSON.parse(storedClients));
//         }
//       } catch (error) {
//         console.error("Failed to load ongoing clients", error);
//       }
//     };

//     loadClients();
//   }, []);

//   // Handle completion of task
//   const handleComplete = async (clientKey) => {
//     const completedClient = clients[clientKey];

//     // Save completed task to AsyncStorage
//     try {
//       const existingCompletedClients = await AsyncStorage.getItem("completedClients");
//       const completedClients = existingCompletedClients ? JSON.parse(existingCompletedClients) : [];
//       completedClients.push(completedClient);
//       await AsyncStorage.setItem("completedClients", JSON.stringify(completedClients));

//       // Remove the task from ongoing tasks
//       const updatedClients = { ...clients };
//       delete updatedClients[clientKey];
//       setClients(updatedClients);

//       // Save updated ongoing clients
//       await AsyncStorage.setItem("ongoingClients", JSON.stringify(updatedClients));

//       // Navigate to Completed Tasks screen
//       navigation.navigate("CompletedTasks");
//     } catch (error) {
//       console.error("Error saving completed task", error);
//     }
//   };

//   // Check if there are any ongoing tasks
//   const noOngoingTasks = Object.keys(clients).length === 0;

//   return (
//     <ScrollView style={styles.container}>
//       {noOngoingTasks ? (
//         <View style={styles.noTasksContainer}>
//           <Text style={styles.noTasksText}>No ongoing tasks</Text>
//         </View>
//       ) : (
//         Object.keys(clients).map((clientKey) => (
//           <View key={clientKey} style={styles.optionContainer}>
//             <TouchableOpacity
//               style={styles.option}
//               onPress={() => navigation.navigate("ClientDetails", { client: clients[clientKey] })}
//             >
//               <Text style={styles.optionText}>{clients[clientKey].name}</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.completeButton}
//               onPress={() => handleComplete(clientKey)}
//             >
//               <Ionicons name="checkmark-circle" size={24} color="green" />
//               <Text>Complete</Text>
//             </TouchableOpacity>
//           </View>
//         ))
//       )}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   optionContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   option: {
//     backgroundColor: "#f0f0f0",
//     padding: 15,
//     borderRadius: 5,
//     flex: 1,
//     marginRight: 10,
//   },
//   optionText: {
//     fontSize: 16,
//   },
//   completeButton: {
//     flexDirection: "row",
//     alignItems: "center",
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
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, doc, getDoc, updateDoc, setDoc, collection } from "firebase/firestore";
import { app } from "./firebaseConfig"; // Import Firebase configuration

const db = getFirestore(app); // Firestore instance

const Ongoing = ({ navigation }) => {
  const [ongoingAudits, setOngoingAudits] = useState({});

  // Load ongoing audits from AsyncStorage and enrich with Firestore data
  useEffect(() => {
    const loadOngoingAudits = async () => {
      try {
        const storedAudits = await AsyncStorage.getItem("ongoingAudits");
        if (storedAudits) {
          const parsedAudits = JSON.parse(storedAudits);
          if (Object.keys(parsedAudits).length > 0) {
            const enrichedAudits = {};

            for (const auditId of Object.keys(parsedAudits)) {
              const audit = parsedAudits[auditId];

              // Only fetch audits that are accepted (isAccepted = true)
              if (audit.isAccepted) {
                // Enrich audit with client and branch info
                const branchRef = doc(db, "branches", audit.branchId);
                const branchSnap = await getDoc(branchRef);
                const branchCity = branchSnap.exists() ? branchSnap.data().city : "Unknown City";

                const clientRef = doc(db, "clients", audit.clientId);
                const clientSnap = await getDoc(clientRef);
                const clientName = clientSnap.exists() ? clientSnap.data().name : "Unknown Client";

                enrichedAudits[auditId] = {
                  ...audit,
                  branchCity,
                  clientName,
                };
              }
            }

            setOngoingAudits(enrichedAudits);
          }
        }
      } catch (error) {
        console.error("Failed to load ongoing audits", error);
      }
    };

    loadOngoingAudits();
  }, []);

  // Handle completion of a task
  const handleComplete = async (auditId) => {
    const completedAudit = ongoingAudits[auditId];

    try {
      // Create a new document in the CompletedAudits collection in Firestore
      const completedAuditRef = doc(collection(db, "CompletedAudits"));
      await setDoc(completedAuditRef, completedAudit);

      // Remove the audit from ongoing audits
      const updatedAudits = { ...ongoingAudits };
      delete updatedAudits[auditId];
      setOngoingAudits(updatedAudits);

      // Update AsyncStorage with the new ongoing audits
      await AsyncStorage.setItem("ongoingAudits", JSON.stringify(updatedAudits));

      // Optionally update 'isComplete' field in the Firestore audits collection (if needed)
      const auditRef = doc(db, "audits", auditId);
      await updateDoc(auditRef, {
        isComplete: true,
      });

      // Navigate to Completed Tasks screen
      navigation.navigate("Completed-Tasks");
    } catch (error) {
      console.error("Error completing task", error);
    }
  };

  const noOngoingTasks = Object.keys(ongoingAudits).length === 0;

  return (
    <ScrollView style={styles.container}>
      {noOngoingTasks ? (
        <View style={styles.noTasksContainer}>
          <Text style={styles.noTasksText}>No ongoing tasks</Text>
        </View>
      ) : (
        Object.keys(ongoingAudits).map((auditId) => {
          const audit = ongoingAudits[auditId];
          return (
            <View key={auditId} style={styles.optionContainer}>
              <TouchableOpacity
                style={styles.option}
                onPress={() =>
                  navigation.navigate("AuditDetails", {
                    audit: audit,
                  })
                }
              >
                <Text style={styles.optionText}>{audit.clientName}</Text>
                <Text style={styles.optionText}>Location: {audit.branchCity}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.completeButton}
                onPress={() => handleComplete(auditId)}
              >
                <Ionicons name="checkmark-circle" size={24} color="green" />
                <Text>Complete</Text>
              </TouchableOpacity>
            </View>
          );
        })
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  option: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  optionText: {
    fontSize: 16,
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  noTasksContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  noTasksText: {
    fontSize: 18,
    color: "gray",
  },
});

export default Ongoing;
