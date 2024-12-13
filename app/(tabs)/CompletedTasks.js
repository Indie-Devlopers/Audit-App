<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
=======
// import React, { useState, useEffect } from "react";
// import { View, Text, StyleSheet, ScrollView } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const CompletedTasks = () => {
//   const [completedClients, setCompletedClients] = useState([]);

//   useEffect(() => {
//     const loadCompletedClients = async () => {
//       try {
//         const savedCompletedClients = await AsyncStorage.getItem("completedClients");
//         if (savedCompletedClients) {
//           setCompletedClients(JSON.parse(savedCompletedClients));
//         }
//       } catch (error) {
//         console.error("Failed to load completed clients", error);
//       }
//     };

//     loadCompletedClients();
//   }, []);

//   return (
//     <ScrollView style={styles.container}>
//       {completedClients.length > 0 ? (
//         completedClients.map((client, index) => (
//           <View key={index} style={styles.clientContainer}>
//             <Text style={styles.clientText}>Name: {client.name}</Text>
//             <Text style={styles.clientText}>Audit Number: {client.auditNumber}</Text>
//             <Text style={styles.clientText}>City: {client.city}</Text>
//             <Text style={styles.clientText}>Date of Audit: {client.dateOfAudit}</Text>
//           </View>
//         ))
//       ) : (
//         <Text style={styles.noTasksText}>No completed tasks yet!</Text>
//       )}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   clientContainer: {
//     backgroundColor: "#e0e0e0",
//     padding: 15,
//     borderRadius: 5,
//     marginBottom: 10,
//   },
//   clientText: {
//     fontSize: 16,
//   },
//   noTasksText: {
//     fontSize: 18,
//     color: "gray",
//     textAlign: "center",
//   },
// });

// export default CompletedTasks;








import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection } from "firebase/firestore";
>>>>>>> b9f48e99e16895170955d10a15b6812dc1f2c671
import { app } from "./firebaseConfig"; // Import Firebase configuration

const db = getFirestore(app); // Firestore instance

// Reusable function to fetch the count of completed audits
const fetchCompletedAuditsCount = async () => {
  try {
    const auditsQuery = query(
      collection(db, "audits"),
      where("isCompleted", "==", true)
    );
    const querySnapshot = await getDocs(auditsQuery);
    return querySnapshot.size; // Return the count of completed audits
  } catch (error) {
    console.error("Failed to fetch completed audits count:", error);
    return 0; // Return 0 on error
  }
};

const CompletedTasks = () => {
  const [completedAudits, setCompletedAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Fetch the userId from Firebase Authentication
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setUserId(user.uid); // Store the userId in the state
    }
  }, []);

  // Fetch completed audits
  useEffect(() => {
    const loadCompletedAudits = async () => {
      try {
        const auditsQuery = query(
          collection(db, "audits"),
          where("isCompleted", "==", true) // Fetch only completed audits
        );
        const querySnapshot = await getDocs(auditsQuery);

        const fetchedAudits = [];
        for (const docSnap of querySnapshot.docs) {
          const auditData = docSnap.data();
          const auditId = docSnap.id;

          // Fetch branch details
          const branchRef = doc(db, "branches", auditData.branchId);
          const branchSnap = await getDoc(branchRef);

          // Fetch client details
          const clientRef = doc(db, "clients", auditData.clientId);
          const clientSnap = await getDoc(clientRef);

<<<<<<< HEAD
          if (branchSnap.exists() && clientSnap.exists()) {
            const branchDetails = branchSnap.data();

            // Exclude clientId from branchDetails
            delete branchDetails.clientId;

            fetchedAudits.push({
              id: auditId,
              ...auditData,
              branchDetails,
              clientDetails: clientSnap.data(),
=======
            // Fetch audit information
            const auditRef = doc(db, "audits", client.auditId); // Assuming you have an auditId field
            const auditSnap = await getDoc(auditRef);

            if (auditSnap.exists()) {
              const auditData = auditSnap.data();

              // If the audit is completed, move it to CompletedAudits collection
              if (auditData.isCompleted) {
                // Add the audit to the CompletedAudits collection
                const completedAuditRef = doc(db, "CompletedAudits", client.auditId);
                await setDoc(completedAuditRef, {
                  ...auditData,
                  acceptedBy: client.acceptedBy, // You can retrieve this based on the logged-in user or stored data
                  name: client.clientName, // Client name
                  location: branchCity, // Branch location (city)
                  AcceptedAudits: [client.auditId],  // Array to store accepted audits
                  date: new Date().toISOString(), // Current date when the task is marked completed
                });

                // Optionally, remove the completed audit from the original collection (audits)
                await updateDoc(auditRef, { isCompleted: true });

                // Optionally, delete from the original collection after moving
                // await deleteDoc(auditRef);
              }
            }

            // Enrich client data to show in UI
            enrichedClients.push({
              ...client,
              branchCity,
              clientName,
>>>>>>> b9f48e99e16895170955d10a15b6812dc1f2c671
            });
          } else {
            console.log("Missing details for audit:", auditId);
          }
        }

        setCompletedAudits(fetchedAudits);
      } catch (error) {
<<<<<<< HEAD
        console.error("Failed to load completed audits", error);
      } finally {
        setLoading(false);
=======
        console.error("Error fetching data:", error);
>>>>>>> b9f48e99e16895170955d10a15b6812dc1f2c671
      }
    };

    loadCompletedAudits();
  }, []);

  // Function to render all fields dynamically
  const renderFields = (data) => {
    if (!data) {
      return <Text>No details available</Text>; // Fallback message
    }
    return Object.keys(data).map((key) => (
      <Text key={key} style={styles.detailText}>
        {key}: {data[key]}
      </Text>
    ));
  };

  const noCompletedTasks = completedAudits.length === 0;

  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : noCompletedTasks ? (
        <View style={styles.noTasksContainer}>
          <Text style={styles.noTasksText}>No completed tasks</Text>
        </View>
      ) : (
        completedAudits.map((audit) => (
          <View key={audit.id} style={styles.cardContainer}>
            <View>
              <Text style={styles.clientName}>{audit.clientName}</Text>

              <View style={styles.detailsSection}>
                <Text style={styles.subTitle}>Branch Details:</Text>
                {renderFields(audit.branchDetails)}

                <View style={{ marginTop: 20 }}>
                  <Text style={styles.subTitle}>Client Details:</Text>
                  {renderFields(audit.clientDetails)}
                </View>
              </View>
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

export default CompletedTasks;


















// import React, { useState, useEffect } from "react";
// import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
// import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
// import { getAuth } from "firebase/auth";
// import { app } from "./firebaseConfig"; // Import Firebase configuration

// const db = getFirestore(app); // Firestore instance

// const CompletedTasks = () => {
//   const [completedAudits, setCompletedAudits] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Fetch the userId from Firebase Authentication
//   useEffect(() => {
//     const fetchAuditorProfile = async () => {
//       const auth = getAuth();
//       const user = auth.currentUser;
//       if (user) {
//         const userId = user.uid; // Get the logged-in user's ID

//         try {
//           // Step 1: Fetch the Profile document of the auditor using userId
//           const profileRef = doc(db, "profiles", userId); // "profiles" is where auditor data is stored
//           const profileSnap = await getDoc(profileRef);

//           if (profileSnap.exists()) {
//             // Step 2: Fetch the completedAudits sub-collection for that Profile
//             const completedAuditRef = collection(profileRef, "completedAudits");
//             const auditSnapshot = await getDocs(completedAuditRef);

//             const fetchedAudits = [];
//             for (const auditDoc of auditSnapshot.docs) {
//               const auditData = auditDoc.data();
//               const auditId = auditDoc.id; // Get the audit ID

//               // Step 3: Fetch branch details based on branchId
//               const branchRef = doc(db, "branches", auditData.branchId);
//               const branchSnap = await getDoc(branchRef);

//               // Step 4: Fetch client details based on clientId
//               const clientRef = doc(db, "clients", auditData.clientId);
//               const clientSnap = await getDoc(clientRef);

//               if (branchSnap.exists() && clientSnap.exists()) {
//                 const branchDetails = branchSnap.data();
//                 // Exclude clientId from branchDetails
//                 delete branchDetails.clientId;

//                 fetchedAudits.push({
//                   id: auditId,
//                   ...auditData,
//                   branchDetails,
//                   clientDetails: clientSnap.data(),
//                 });
//               } else {
//                 console.log("Missing details for audit:", auditId);
//               }
//             }

//             // Update the state with the fetched audits
//             setCompletedAudits(fetchedAudits);
//           } else {
//             console.log("No profile found for user:", userId);
//           }
//         } catch (error) {
//           console.error("Failed to load auditor profile or completed audits", error);
//         }
//       }
//       setLoading(false); // End loading after the data is fetched
//     };

//     fetchAuditorProfile(); // Fetch the data when the component mounts
//   }, []); // Empty dependency array ensures this runs once when the component mounts

//   // Function to render fields dynamically
//   const renderFields = (data) => {
//     if (!data) {
//       return <Text>No details available</Text>; // Fallback message if no data exists
//     }
//     return Object.keys(data).map((key) => (
//       <Text key={key} style={styles.detailText}>
//         {key}: {data[key]}
//       </Text>
//     ));
//   };

//   const noCompletedTasks = completedAudits.length === 0;

//   return (
//     <ScrollView style={styles.container}>
//       {loading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#4CAF50" />
//         </View>
//       ) : noCompletedTasks ? (
//         <View style={styles.noTasksContainer}>
//           <Text style={styles.noTasksText}>No completed tasks</Text>
//         </View>
//       ) : (
//         completedAudits.map((audit) => (
//           <View key={audit.id} style={styles.cardContainer}>
//             <View>
//               <Text style={styles.clientName}>{audit.clientDetails.clientName}</Text>

//               <View style={styles.detailsSection}>
//                 <Text style={styles.subTitle}>Branch Details:</Text>
//                 {renderFields(audit.branchDetails)}

//                 <View style={{ marginTop: 20 }}>
//                   <Text style={styles.subTitle}>Client Details:</Text>
//                   {renderFields(audit.clientDetails)}
//                 </View>
//               </View>
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

// export default CompletedTasks;
