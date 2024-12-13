import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
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

          if (branchSnap.exists() && clientSnap.exists()) {
            const branchDetails = branchSnap.data();

            // Exclude clientId from branchDetails
            delete branchDetails.clientId;

            fetchedAudits.push({
              id: auditId,
              ...auditData,
              branchDetails,
              clientDetails: clientSnap.data(),
            });
          } else {
            console.log("Missing details for audit:", auditId);
          }
        }

        setCompletedAudits(fetchedAudits);
      } catch (error) {
        console.error("Failed to load completed audits", error);
      } finally {
        setLoading(false);
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
