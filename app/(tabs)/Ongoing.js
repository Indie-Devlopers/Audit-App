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
































// import React, { useState, useEffect } from "react";
// import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
// import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
// import { app } from "./firebaseConfig"; // Import Firebase configuration

// const db = getFirestore(app); // Firestore instance

// const Ongoing = ({ navigation }) => {
//   const [ongoingAudits, setOngoingAudits] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadOngoingAudits = async () => {
//       try {
//         // Query Firestore to get audits where isAccepted is true
//         const auditsQuery = query(
//           collection(db, "audits"),
//           where("isAccepted", "==", true)
//         );
//         const querySnapshot = await getDocs(auditsQuery);

//         const fetchedAudits = [];
//         querySnapshot.forEach((docSnap) => {
//           const auditData = docSnap.data();
//           fetchedAudits.push({
//             id: docSnap.id,
//             ...auditData,
//           });
//         });

//         setOngoingAudits(fetchedAudits);
//       } catch (error) {
//         console.error("Failed to load ongoing audits", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadOngoingAudits();
//   }, []);

//   const handleComplete = async (auditId) => {
//     try {
//       const auditRef = doc(db, "audits", auditId);
//       await updateDoc(auditRef, {
//         isCompleted: true, // Set isCompleted to true
//       });

//       // Update local state to reflect completion
//       setOngoingAudits((prevAudits) =>
//         prevAudits.map((audit) =>
//           audit.id === auditId ? { ...audit, isCompleted: true } : audit
//         )
//       );
//     } catch (error) {
//       console.error("Error marking audit as complete", error);
//     }
//   };

//   const noOngoingTasks = ongoingAudits.length === 0;

//   return (
//     <ScrollView style={styles.container}>
//       {loading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#4CAF50" />
//         </View>
//       ) : noOngoingTasks ? (
//         <View style={styles.noTasksContainer}>
//           <Text style={styles.noTasksText}>No ongoing tasks</Text>
//         </View>
//       ) : (
//         ongoingAudits.map((audit) => {
//           return (
//             <View key={audit.id} style={styles.cardContainer}>
//               <TouchableOpacity
//                 style={styles.card}
//                 onPress={() =>
//                   navigation.navigate("AuditDetails", {
//                     auditId: audit.id, // Pass auditId to the AuditDetails screen
//                   })
//                 }
//               >
//                 <Text style={styles.clientName}>{audit.clientName}</Text>
//                 <Text style={styles.branchCity}>Location: {audit.branchCity}</Text>
//                 {audit.isCompleted ? (
//                   <Text style={styles.completedText}>Completed</Text>
//                 ) : (
//                   <TouchableOpacity
//                     style={styles.completeButton}
//                     onPress={() => handleComplete(audit.id)}
//                   >
//                     <Text style={styles.completeButtonText}>Complete</Text>
//                   </TouchableOpacity>
//                 )}
//               </TouchableOpacity>
//             </View>
//           );
//         })
//       )}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: "#f5f5f5",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   cardContainer: {
//     marginBottom: 15,
//   },
//   card: {
//     backgroundColor: "#ffffff",
//     padding: 20,
//     borderRadius: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//     elevation: 5,
//   },
//   clientName: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   branchCity: {
//     fontSize: 14,
//     color: "#777",
//     marginVertical: 5,
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
//   completeButton: {
//     marginTop: 10,
//     backgroundColor: "#4CAF50", // Green color for the Complete button
//     padding: 12,
//     borderRadius: 5,
//     alignItems: "center",
//   },
//   completeButtonText: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   completedText: {
//     fontSize: 16,
//     color: "#4CAF50", // Green color to indicate completion
//     fontWeight: "bold",
//   },
// });

// export default Ongoing;









// import React, { useState, useEffect } from "react";
// import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
// import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
// import { app } from "./firebaseConfig"; // Import Firebase configuration

// const db = getFirestore(app); // Firestore instance

// const Ongoing = ({ navigation }) => {
//   const [ongoingAudits, setOngoingAudits] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadOngoingAudits = async () => {
//       try {
//         // Query Firestore to get audits where isAccepted is true
//         const auditsQuery = query(
//           collection(db, "audits"),
//           where("isAccepted", "==", true)
//         );
//         const querySnapshot = await getDocs(auditsQuery);

//         const fetchedAudits = [];
//         querySnapshot.forEach((docSnap) => {
//           const auditData = docSnap.data();
//           fetchedAudits.push({
//             id: docSnap.id,
//             ...auditData,
//           });
//         });

//         setOngoingAudits(fetchedAudits);
//       } catch (error) {
//         console.error("Failed to load ongoing audits", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadOngoingAudits();
//   }, []);

//   const handleComplete = async (auditId) => {
//     try {
//       const auditRef = doc(db, "audits", auditId);
//       await updateDoc(auditRef, {
//         isCompleted: true, // Set isCompleted to true
//       });

//       // Update local state to reflect completion
//       setOngoingAudits((prevAudits) =>
//         prevAudits.map((audit) =>
//           audit.id === auditId ? { ...audit, isCompleted: true } : audit
//         )
//       );
//     } catch (error) {
//       console.error("Error marking audit as complete", error);
//     }
//   };

//   const noOngoingTasks = ongoingAudits.length === 0;

//   return (
//     <ScrollView style={styles.container}>
//       {loading ? (
//         <View style={styles.loadingContainer}>
        
//         </View>
//       ) : noOngoingTasks ? (
//         <View style={styles.noTasksContainer}>
//           <Text style={styles.noTasksText}>No ongoing tasks</Text>
//         </View>
//       ) : (
//         ongoingAudits.map((audit) => {
//           return (
//             <View key={audit.id} style={styles.cardContainer}>
//               <TouchableOpacity
//                 style={styles.card}
//                 onPress={() =>
//                   navigation.navigate("AuditDetails", {
//                     auditId: audit.id, // Pass auditId to the AuditDetails screen
//                   })
//                 }
//               >
//                 <Text style={styles.clientName}>{audit.clientName}</Text>
//                 <Text style={styles.branchCity}>Location: {audit.branchCity}</Text>
//                 {audit.isCompleted ? (
//                   <Text style={styles.completedText}>Completed</Text>
//                 ) : (
//                   <TouchableOpacity
//                     style={styles.completeButton}
//                     onPress={() => handleComplete(audit.id)}
//                   >
//                     <Text style={styles.completeButtonText}>Complete</Text>
//                   </TouchableOpacity>
//                 )}
//               </TouchableOpacity>
//             </View>
//           );
//         })
//       )}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: "#f5f5f5",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   cardContainer: {
//     marginBottom: 15,
//   },
//   card: {
//     backgroundColor: "#ffffff",
//     padding: 20,
//     borderRadius: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//     elevation: 5,
//   },
//   clientName: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   branchCity: {
//     fontSize: 14,
//     color: "#777",
//     marginVertical: 5,
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
//   completeButton: {
//     marginTop: 10,
//     backgroundColor: "#4CAF50", // Green color for the Complete button
//     padding: 12,
//     borderRadius: 5,
//     alignItems: "center",
//   },
//   completeButtonText: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   completedText: {
//     fontSize: 16,
//     color: "#4CAF50", // Green color to indicate completion
//     fontWeight: "bold",
//   },
// });

// export default Ongoing;






import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView,  } from "react-native";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { app } from "./firebaseConfig"; // Import Firebase configuration

const db = getFirestore(app); // Firestore instance

const Ongoing = ({ navigation }) => {
  const [ongoingAudits, setOngoingAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOngoingAudits = async () => {
      try {
        const auditsQuery = query(
          collection(db, "audits"),
          where("isAccepted", "==", true)
        );
        const querySnapshot = await getDocs(auditsQuery);
        
        console.log('Fetched query snapshot size:', querySnapshot.size); // Debugging
        
        const fetchedAudits = [];
        querySnapshot.forEach((docSnap) => {
          const auditData = docSnap.data();
          console.log('Fetched audit data:', auditData); // Debugging
          fetchedAudits.push({
            id: docSnap.id,
            ...auditData,
          });
        });

        if (fetchedAudits.length === 0) {
          console.log("No audits available."); // Debugging
        }

        setOngoingAudits(fetchedAudits);
      } catch (error) {
        console.error("Failed to load ongoing audits", error);
      } finally {
        setLoading(false);
      }
    };

    loadOngoingAudits();
  }, []);

  const handleComplete = async (auditId) => {
    try {
      const auditRef = doc(db, "audits", auditId);
      await updateDoc(auditRef, {
        isCompleted: true, // Set isCompleted to true
      });

      // Update local state to reflect completion
      setOngoingAudits((prevAudits) =>
        prevAudits.map((audit) =>
          audit.id === auditId ? { ...audit, isCompleted: true } : audit
        )
      );
    } catch (error) {
      console.error("Error marking audit as complete", error);
    }
  };

  const noOngoingTasks = ongoingAudits.length === 0;

  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
       
        </View>
      ) : noOngoingTasks ? (
        <View style={styles.noTasksContainer}>
          <Text style={styles.noTasksText}>No ongoing tasks</Text>
        </View>
      ) : (
        ongoingAudits.map((audit) => {
          return (
            <View key={audit.id} style={styles.cardContainer}>
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  navigation.navigate("AuditDetails", {
                    auditId: audit.id, // Pass auditId to the AuditDetails screen
                  })
                }
              >
                <Text style={styles.clientName}>{audit.clientName}</Text>
                <Text style={styles.branchCity}>Location: {audit.branchCity}</Text>
                {audit.isCompleted ? (
                  <Text style={styles.completedText}>Completed</Text>
                ) : (
                  <TouchableOpacity
                    style={styles.completeButton}
                    onPress={() => handleComplete(audit.id)}
                  >
                    <Text style={styles.completeButtonText}>Complete</Text>
                  </TouchableOpacity>
                )}
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
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContainer: {
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  clientName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  branchCity: {
    fontSize: 14,
    color: "#777",
    marginVertical: 5,
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
  completeButton: {
    marginTop: 10,
    backgroundColor: "#4CAF50", // Green color for the Complete button
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  completeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  completedText: {
    fontSize: 16,
    color: "#4CAF50", // Green color to indicate completion
    fontWeight: "bold",
  },
});

export default Ongoing;
