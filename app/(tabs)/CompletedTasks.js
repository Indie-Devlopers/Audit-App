// import React, { useState, useEffect } from "react";
// import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
// import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
// import { getAuth } from "firebase/auth";
// import { app } from "./firebaseConfig"; // Import Firebase configuration

// const db = getFirestore(app); // Firestore instance

// // Reusable function to fetch the count of completed audits
// const fetchCompletedAuditsCount = async () => {
//   try {
//     const auditsQuery = query(
//       collection(db, "audits"),
//       where("isCompleted", "==", true)
//     );
//     const querySnapshot = await getDocs(auditsQuery);
//     return querySnapshot.size; // Return the count of completed audits
//   } catch (error) {
//     console.error("Failed to fetch completed audits count:", error);
//     return 0; // Return 0 on error
//   }
// };

// const CompletedTasks = () => {
//   const [completedAudits, setCompletedAudits] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [userId, setUserId] = useState(null);

//   // Fetch the userId from Firebase Authentication
//   useEffect(() => {
//     const auth = getAuth();
//     const user = auth.currentUser;
//     if (user) {
//       setUserId(user.uid); // Store the userId in the state
//     }
//   }, []);

//   // Fetch completed audits
//   useEffect(() => {
//     const loadCompletedAudits = async () => {
//       try {
//         const auditsQuery = query(
//           collection(db, "audits"),
//           where("isCompleted", "==", true) // Fetch only completed audits
//         );
//         const querySnapshot = await getDocs(auditsQuery);

//         const fetchedAudits = [];
//         for (const docSnap of querySnapshot.docs) {
//           const auditData = docSnap.data();
//           const auditId = docSnap.id;

//           // Fetch branch details
//           const branchRef = doc(db, "branches", auditData.branchId);
//           const branchSnap = await getDoc(branchRef);

//           // Fetch client details
//           const clientRef = doc(db, "clients", auditData.clientId);
//           const clientSnap = await getDoc(clientRef);

//           if (branchSnap.exists() && clientSnap.exists()) {
//             const branchDetails = branchSnap.data();

//             // Exclude clientId from branchDetails
//             delete branchDetails.clientId;

//             fetchedAudits.push({
//               id: auditId,
//               ...auditData,
//               branchDetails,
//               clientDetails: clientSnap.data(),
//             });
//           } else {
//             console.log("Missing details for audit:", auditId);
//           }
//         }

//         setCompletedAudits(fetchedAudits);
//       } catch (error) {
//         console.error("Failed to load completed audits", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadCompletedAudits();
//   }, []);

//   // Function to render all fields dynamically
//   const renderFields = (data) => {
//     if (!data) {
//       return <Text>No details available</Text>; // Fallback message
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
//               <Text style={styles.clientName}>{audit.clientName}</Text>

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



// import React, { useState, useEffect } from "react";
// import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
// import {
//   getFirestore,
//   collection,
//   query,
//   where,
//   getDocs,
//   doc,
//   getDoc,
// } from "firebase/firestore";
// import { getAuth } from "firebase/auth";
// import { app } from "./firebaseConfig"; // Import Firebase configuration

// const db = getFirestore(app); // Firestore instance
// const auth = getAuth(app); // Firebase Authentication instance

// const CompletedTasks = () => {
//   const [completedAudits, setCompletedAudits] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [completedCounter, setCompletedCounter] = useState(0);

//   useEffect(() => {
//     const fetchUserCompletedAudits = async () => {
//       try {
//         const user = auth.currentUser; // Get currently logged-in user
//         if (!user) {
//           console.error("No user is logged in");
//           return;
//         }

//         const userId = user.uid; // Retrieve user ID
//         const userProfileRef = doc(db, "Profile", userId);
//         const completedAuditsRef = collection(userProfileRef, "completedAudits");

//         // Fetch audit IDs from 'completedAudits' subcollection
//         const completedAuditDocs = await getDocs(completedAuditsRef);
//         const completedAuditIds = completedAuditDocs.docs.map((doc) => doc.id);

//         if (completedAuditIds.length === 0) {
//           console.log("No completed audits found for this user.");
//           setLoading(false);
//           return;
//         }

//         // Query the audits collection to fetch only the completed audits
//         const auditsQuery = query(
//           collection(db, "audits"),
//           where("__name__", "in", completedAuditIds) // Fetch audits where ID matches
//         );

//         const querySnapshot = await getDocs(auditsQuery);

//         const fetchedAudits = [];
//         for (const docSnap of querySnapshot.docs) {
//           const auditData = docSnap.data();
//           const auditId = docSnap.id;

//           // Fetch branch details
//           const branchRef = doc(db, "branches", auditData.branchId);
//           const branchSnap = await getDoc(branchRef);

//           // Fetch client details
//           const clientRef = doc(db, "clients", auditData.clientId);
//           const clientSnap = await getDoc(clientRef);

//           if (branchSnap.exists() && clientSnap.exists()) {
//             fetchedAudits.push({
//               id: auditId,
//               ...auditData,
//               branchDetails: branchSnap.data(),
//               clientDetails: clientSnap.data(),
//             });
//           }
//         }

//         setCompletedAudits(fetchedAudits);
//         setCompletedCounter(fetchedAudits.length);
//       } catch (error) {
//         console.error("Failed to load completed audits:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserCompletedAudits();
//   }, []);

//   const renderFields = (data) => {
//     if (!data) return <Text>No details available</Text>;
//     return Object.keys(data).map((key) => (
//       <Text key={key} style={styles.detailText}>
//         {key}: {data[key]}
//       </Text>
//     ));
//   };

//   return (
//     <ScrollView style={styles.container}>
//       {loading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#4CAF50" />
//         </View>
//       ) : completedAudits.length === 0 ? (
//         <View style={styles.noTasksContainer}>
//           <Text style={styles.noTasksText}>No completed tasks found</Text>
//         </View>
//       ) : (
//         <View>
//           <View style={styles.counterContainer}>
//             <Text style={styles.counterText}>{completedCounter} completed tasks</Text>
//           </View>
//           {completedAudits.map((audit) => (
//             <View key={audit.id} style={styles.cardContainer}>
//               <Text style={styles.clientName}>{audit.clientName}</Text>
//               <View style={styles.detailsSection}>
//                 <Text style={styles.subTitle}>Branch Details:</Text>
//                 {renderFields(audit.branchDetails)}

//                 <Text style={[styles.subTitle, { marginTop: 10 }]}>Client Details:</Text>
//                 {renderFields(audit.clientDetails)}
//               </View>
//             </View>
//           ))}
//         </View>
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
//   counterContainer: {
//     padding: 10,
//     backgroundColor: "#e0f7fa",
//     borderRadius: 5,
//     marginBottom: 10,
//   },
//   counterText: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#00796b",
//   },
//   cardContainer: {
//     marginBottom: 30,
//     padding: 10,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 5,
//     backgroundColor: "#f9f9f9",
//   },
//   detailsSection: {
//     marginTop: 10,
//   },
//   clientName: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   subTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#555",
//   },
//   detailText: {
//     fontSize: 14,
//     color: "#777",
//     marginBottom: 3,
//   },
//   noTasksContainer: {
//     flex: 1,
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



import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image } from "react-native";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { app } from "./firebaseConfig"; // Firebase configuration

const db = getFirestore(app);

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
  const [completedCounter, setCompletedCounter] = useState(0);
  const [userId, setUserId] = useState(null); // State for userId

  // Fetch the completed audit IDs for the logged-in user
  const fetchCompletedAuditIds = async (userId) => {
    try {
      const completedRef = collection(db, "Profile", userId, "completedAudits");
      const completedSnapshot = await getDocs(completedRef);

      const auditIds = completedSnapshot.docs.map((doc) => doc.id);
      console.log("Completed Audit IDs:", auditIds); // Log to verify fetched IDs
      return auditIds;
    } catch (error) {
      console.error("Error fetching completed audit IDs:", error);
      return [];
    }
  };

  // Fetch the branch and client details based on the audit's branchId and clientId
  const fetchAuditDetails = async (audit) => {
    try {
      const branchRef = doc(db, "branches", audit.branchId);
      const clientRef = doc(db, "clients", audit.clientId);

      // Fetch branch and client details
      const branchSnapshot = await getDoc(branchRef);
      const clientSnapshot = await getDoc(clientRef);

      if (!branchSnapshot.exists() || !clientSnapshot.exists()) {
        throw new Error("Branch or Client not found.");
      }

      const branchData = branchSnapshot.data();
      const clientData = clientSnapshot.data();

      // Exclude clientId from branch details
      const { clientId, ...branchDetails } = branchData;

      return {
        branchDetails,
        clientDetails: clientData
      };
    } catch (error) {
      console.error("Error fetching audit details:", error);
      return { branchDetails: {}, clientDetails: {} };
    }
  };

  const fetchAuditsByIds = async (ids) => {
    try {
      const chunkArray = (arr, size) => {
        const result = [];
        for (let i = 0; i < arr.length; i += size) {
          result.push(arr.slice(i, i + size));
        }
        return result;
      };

      const chunks = chunkArray(ids, 10);
      const allAudits = [];

      for (const chunk of chunks) {
        const auditsQuery = query(collection(db, "audits"), where("__name__", "in", chunk));
        const querySnapshot = await getDocs(auditsQuery);

        for (const doc of querySnapshot.docs) {
          const auditData = { id: doc.id, ...doc.data() };
          const { branchDetails, clientDetails } = await fetchAuditDetails(auditData);

          allAudits.push({
            ...auditData,
            branchDetails,
            clientDetails
          });
        }
      }

      console.log("Fetched Audits with Details:", allAudits); // Log audits fetched
      return allAudits;
    } catch (error) {
      console.error("Error fetching audits by IDs:", error);
      return [];
    }
  };

  // Fetch the userId from AsyncStorage
  useEffect(() => {
    const loadCompletedAudits = async () => {
      try {
        // Retrieve userId from AsyncStorage
        const storedUserId = await AsyncStorage.getItem("userId");

        if (!storedUserId) {
          console.error("User not logged in.");
          return;
        }

        setUserId(storedUserId); // Set the userId state when found

        // Fetch completed audit IDs for the logged-in user
        const completedAuditIds = await fetchCompletedAuditIds(storedUserId);

        if (completedAuditIds.length === 0) {
          console.log("No completed audits found.");
          setCompletedAudits([]);
          setCompletedCounter(0);
          return;
        }

        // Fetch audit details by IDs
        const audits = await fetchAuditsByIds(completedAuditIds);

        setCompletedAudits(audits);
        setCompletedCounter(audits.length);
      } catch (error) {
        console.error("Error loading completed audits:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCompletedAudits();
  }, []); // Empty dependency array, so it runs once after component mounts

  const renderFields = (data) => {
    if (!data) return <Text>No details available</Text>;
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
      ) : (
        <View>
          <View style={styles.counterContainer}>
            <Text style={styles.counterText}>{completedCounter} completed tasks</Text>
          </View>
          {noCompletedTasks ? (
            <View style={styles.noTasksContainer}>
              <Text style={styles.noTasksText}>No completed tasks</Text>
            </View>
          ) : (
            completedAudits.map((audit) => (
              <View key={audit.id} style={styles.cardContainer}>
                

                <View style={styles.detailsRow}>
                  <Image source={require('./Images/building.png')} style={{ width: 34, height: 34 }} />
                  <Text style={styles.subTitle}>  Branch Details</Text>
                </View>

                {renderFields(audit.branchDetails)}
<View style = {{marginTop:20}}></View>
                <View style={styles.detailsRow}>
                  <Image source={require('./Images/client.jpg')} style={{ width: 34, height: 34 }} />
                  <Text style={styles.subTitle}>   Client Details</Text>
                </View>

  {renderFields(audit.clientDetails)}
              </View>
            ))
          )}
        </View>
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
  counterContainer: {
    padding: 10,
    backgroundColor: "#e0f7fa",
    borderRadius: 5,
    marginBottom: 10,
  },
  counterText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00796b",
  },
  detailsRow: {
    flexDirection: "row", // This will align the image and text horizontally
    alignItems: "center",  // This ensures both image and text are vertically centered
    marginBottom: 10,
  },
  cardContainer: {
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  clientName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  detailsSection: {
    marginTop: 10,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#555",
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginVertical: 10,
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
