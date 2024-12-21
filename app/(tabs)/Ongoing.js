



// import React, { useState, useEffect } from "react";
// import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
// import { getFirestore, collection, query, getDocs, doc, getDoc, updateDoc, setDoc, deleteDoc } from "firebase/firestore"; 
// import AsyncStorage from "@react-native-async-storage/async-storage"; 
// import { app } from "./firebaseConfig"; 
// import Ionicons from 'react-native-vector-icons/Ionicons'; 
// const db = getFirestore(app);

// const Ongoing = ({ navigation }) => {
//   const [ongoingAudits, setOngoingAudits] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [ongoingCounter, setOngoingCounter] = useState(0);

//   useEffect(() => {
//     const loadOngoingAudits = async () => {
//       setLoading(true);
//       try {
//         const userId = await AsyncStorage.getItem("userId");
//         if (!userId) {
//           console.error("User ID not found!");
//           return;
//         }

//         const userAcceptedRef = collection(doc(db, "Profile", userId), "acceptedAudits");
//         const acceptedAuditsSnap = await getDocs(userAcceptedRef);

//         const fetchedAudits = [];
//         for (const auditDoc of acceptedAuditsSnap.docs) {
//           // const auditData = auditDoc.data();
//           const auditId = auditDoc.id;
     
//           // Fetch full audit details from the main `audits` collection
//           const auditRef = doc(db, "audits", auditId);
//           const auditSnap = await getDoc(auditRef);

//           if (auditSnap.exists()) {
//             const auditDetails = auditSnap.data();

//             // Fetch branch details
//             const branchRef = doc(db, "branches", auditDetails.branchId);
//             const branchSnap = await getDoc(branchRef);

//             // Fetch client details
//             const clientRef = doc(db, "clients", auditDetails.clientId);
//             const clientSnap = await getDoc(clientRef);

//             if (branchSnap.exists() && clientSnap.exists()) {
//               fetchedAudits.push({
//                 id: auditId,
//                 ...auditDetails,
//                 branchDetails: branchSnap.data(),
//                 clientDetails: clientSnap.data(),
//               });
//             } else {
//               console.log("Branch or client details missing for audit:", auditId);
//             }
//           }
//         }

//         setOngoingAudits(fetchedAudits);
//         setOngoingCounter(fetchedAudits.length); 

//         // Update the ongoingCounter and completedCounter based on the audit IDs present
//         const userProfileRef = doc(db, "Profile", userId);
//         const userProfileSnap = await getDoc(userProfileRef);
//         if (userProfileSnap.exists()) {
//           const userProfileData = userProfileSnap.data();

//           const ongoingCounter = acceptedAuditsSnap.size; // Number of accepted audits
//           const completedCounter = userProfileData.completedCounter || 0;

//           // Update the user profile counters
//           await updateDoc(userProfileRef, {
//             ongoingCounter: ongoingCounter,
//             completedCounter: completedCounter,
//           });
//         }

//       } catch (error) {
//         console.error("Error loading ongoing audits:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadOngoingAudits();
//   }, []); 

  

        

//   const handleRemove = async (auditId, auditName) => {
//     try {
//       const userId = await AsyncStorage.getItem("userId");
//       if (!userId) {
//         console.error("User ID not found!");
//         return;
//       }

//       // Mark the audit as rejected in the "audits" collection
//       await updateDoc(doc(db, "audits", auditId), { isRejected: true });

//       // Remove the auditId from acceptedAuditsinside Profile -> userId -> acceptedAudits
//       const acceptedAuditsRef = doc(db, "Profile", userId);
//       const acceptedAuditsSnap = await getDoc(acceptedAuditsRef);
//       const acceptedAuditsData = acceptedAuditsSnap.data();

//       const acceptedAuditsList = acceptedAuditsData?.acceptedAudits|| [];
//       const updatedacceptedAudits= acceptedAuditsList.filter(
//         (id) => id !== auditId
//       );

//       // Update the acceptedAuditscollection
//       await updateDoc(acceptedAuditsRef, {
//         acceptedAudits: updatedAcceptedAudits,
//       });

//       // Decrease the ongoingCounter by 1
//       const userProfileRef = doc(db, "Profile", userId);
//       const userProfileSnap = await getDoc(userProfileRef);
//       const userProfileData = userProfileSnap.data();
//       const ongoingCounter = Math.max(0, (userProfileData.ongoingCounter || 0) - 1);

//       // Update the ongoingCounter
//       await updateDoc(userProfileRef, {
//         ongoingCounter: ongoingCounter,
//       });

//       // Remove the audit from the ongoing list in the UI
//       setOngoingAudits((prev) => prev.filter((audit) => audit.id !== auditId));

//       // Navigate to the RejectedAudits screen
//       navigation.navigate("RejectedAudits", { auditName, isRejected: true });
//     } catch (error) {
//       console.error("Error removing audit:", error);
//     }
//   };



//   const handleGenerateReport = (auditId, auditName) => {
//     // Navigate to the ReportScreen with the auditId and auditName as params
//     navigation.navigate("ReportScreen", { auditId, auditName });
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
//         <TouchableOpacity style={[styles.card, styles.ongoingTasks]}>
//          <Text style={styles.cardTitle}>Accepted Audits</Text>
//          <Text style={styles.counterText}>{ongoingCounter} ongoing audits</Text>
//        </TouchableOpacity>
//       {loading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#4CAF50" />
//         </View>
//       ) : ongoingAudits.length === 0 ? (
//         <View style={styles.noTasksContainer}>
//           <Text style={styles.noTasksText}>No ongoing tasks</Text>
//         </View>
//       ) : (
//         ongoingAudits.map((audit) => (
//           <View key={audit.id} style={styles.card}>
//             <Text style={styles.cardTitle}>{audit.auditName}</Text>

//             <View style={styles.detailsSection}>
//               <Text style={styles.subTitle}>Client Details:</Text>
//               {renderFields(audit.clientDetails)}
//               <Text style={{ marginTop: 10 }}></Text>
//               <Text style={styles.subTitle}>Branch Details:</Text>
//               {renderFields(audit.branchDetails, ["clientId"])}
//             </View>

//             <View style={styles.buttonContainer}>
            

//             <TouchableOpacity
//                 style={styles.button}
//                 onPress={() => handleGenerateReport(audit.id, audit.auditName)}
//               ><Ionicons name="document-text" size={20} color="white" />
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
//   ongoingTasks: {
//     backgroundColor: "#e0f7fa",
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   counterText: {
//     fontSize: 16,
//     color: "#00796b",
//   },
//   detailText: {
//     fontSize: 14,
//     marginVertical: 4,
//   },
//   buttonContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 10,
//   },
//   button: {
//     backgroundColor: "#00796b",
//     padding: 10,
//     borderRadius: 5,
//     flex: 1,
//     marginHorizontal: 5,
//     alignItems: "center",
//     flexDirection: "row",
//     justifyContent: "center",
//   },
//   removeButton: {
//     backgroundColor: "#d32f2f",
//   },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "bold",
//     marginLeft: 5,
//   },
// });

// export default Ongoing;




// import React, { useState, useEffect } from "react";
// import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
// import { getFirestore, collection, query, getDocs, doc, getDoc, updateDoc, setDoc, deleteDoc } from "firebase/firestore"; 
// import AsyncStorage from "@react-native-async-storage/async-storage"; 
// import { app } from "./firebaseConfig"; 
// import Ionicons from 'react-native-vector-icons/Ionicons'; 
// const db = getFirestore(app);

// const Ongoing = ({ navigation }) => {
//   const [ongoingAudits, setOngoingAudits] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [ongoingCounter, setOngoingCounter] = useState(0);

//   useEffect(() => {
//     const loadOngoingAudits = async () => {
//       setLoading(true);
//       try {
//         const userId = await AsyncStorage.getItem("userId");
//         if (!userId) {
//           console.error("User ID not found!");
//           return;
//         }

//         const userAcceptedRef = collection(doc(db, "Profile", userId), "acceptedAudits");
//         const acceptedAuditsSnap = await getDocs(userAcceptedRef);

//         const fetchedAudits = [];
//         for (const auditDoc of acceptedAuditsSnap.docs) {
//           const auditId = auditDoc.id;
     
//           // Fetch full audit details from the main `audits` collection
//           const auditRef = doc(db, "audits", auditId);
//           const auditSnap = await getDoc(auditRef);

//           if (auditSnap.exists()) {
//             const auditDetails = auditSnap.data();

//             // Fetch branch details
//             const branchRef = doc(db, "branches", auditDetails.branchId);
//             const branchSnap = await getDoc(branchRef);

//             // Fetch client details
//             const clientRef = doc(db, "clients", auditDetails.clientId);
//             const clientSnap = await getDoc(clientRef);

//             // Fetch the date when the audit was accepted from the subcollection
//             const acceptedAuditRef = doc(db, "Profile", userId, "acceptedAudits", auditId);
//             const acceptedAuditSnap = await getDoc(acceptedAuditRef);
//             const acceptedAuditData = acceptedAuditSnap.data();
//             const acceptedDate = acceptedAuditData ? acceptedAuditData.date : null;

//             if (branchSnap.exists() && clientSnap.exists()) {
//               fetchedAudits.push({
//                 id: auditId,
//                 ...auditDetails,
//                 branchDetails: branchSnap.data(),
//                 clientDetails: clientSnap.data(),
//                 acceptedDate: acceptedDate,
//               });
//             } else {
//               console.log("Branch or client details missing for audit:", auditId);
//             }
//           }
//         }

//         setOngoingAudits(fetchedAudits);
//         setOngoingCounter(fetchedAudits.length); 
//       } catch (error) {
//         console.error("Error loading ongoing audits:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadOngoingAudits();
//   }, []); 

//   const handleRemove = async (auditId, auditName) => {
//     try {
//       const userId = await AsyncStorage.getItem("userId");
//       if (!userId) {
//         console.error("User ID not found!");
//         return;
//       }

//       // Mark the audit as rejected in the "audits" collection
//       await updateDoc(doc(db, "audits", auditId), { isRejected: true });

//       // Remove the auditId from acceptedAuditsinside Profile -> userId -> acceptedAudits
//       const acceptedAuditsRef = doc(db, "Profile", userId);
//       const acceptedAuditsSnap = await getDoc(acceptedAuditsRef);
//       const acceptedAuditsData = acceptedAuditsSnap.data();

//       const acceptedAuditsList = acceptedAuditsData?.acceptedAudits|| [];
//       const updatedacceptedAudits= acceptedAuditsList.filter(
//         (id) => id !== auditId
//       );

//       // Update the acceptedAuditscollection
//       await updateDoc(acceptedAuditsRef, {
//         acceptedAudits: updatedAcceptedAudits,
//       });

//       // Remove the audit from the ongoing list in the UI
//       setOngoingAudits((prev) => prev.filter((audit) => audit.id !== auditId));
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
//       <TouchableOpacity style={[styles.card, styles.ongoingTasks]}>
//         <Text style={styles.cardTitle}>Accepted Audits</Text>
//         <Text style={styles.counterText}>{ongoingCounter} ongoing audits</Text>
//       </TouchableOpacity>

//       {loading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#4CAF50" />
//         </View>
//       ) : ongoingAudits.length === 0 ? (
//         <View style={styles.noTasksContainer}>
//           <Text style={styles.noTasksText}>No ongoing tasks</Text>
//         </View>
//       ) : (
//         ongoingAudits.map((audit) => (
//           <View key={audit.id} style={styles.card}>
//             <Text style={styles.cardTitle}>{audit.auditName}</Text>

//             <View style={styles.detailsSection}>
             

//               {/* Adding Branch Name, Location, Audit Type, and Accepted Date */}
//               <Text style={styles.subTitle}>Branch Name: {audit.branchDetails?.name}</Text>
//               <Text style={styles.subTitle}>Location: {audit.branchDetails?.city}</Text>
//               <Text style={styles.subTitle}>Audit Type: {audit.auditType}</Text>
//               <Text style={styles.subTitle}>Accepted Date: {audit.acceptedDate ? audit.acceptedDate : "N/A"}</Text>
//             </View>

//             <View style={styles.buttonContainer}>
//               <TouchableOpacity
//                 style={styles.button}
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
//   ongoingTasks: {
//     backgroundColor: "#e0f7fa",
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   counterText: {
//     fontSize: 16,
//     color: "#00796b",
//   },
//   detailText: {
//     fontSize: 14,
//     marginVertical: 4,
//   },
//   subTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginTop: 10,
//   },
//   buttonContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 10,
//   },
//   button: {
//     backgroundColor: "#00796b",
//     padding: 10,
//     borderRadius: 5,
//     flex: 1,
//     marginHorizontal: 5,
//     alignItems: "center",
//     flexDirection: "row",
//     justifyContent: "center",
//   },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "bold",
//     marginLeft: 5,
//   },
// });

// export default Ongoing;






























import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Image } from "react-native";
import { getFirestore, collection, query, getDocs, doc, getDoc, updateDoc } from "firebase/firestore"; 
import AsyncStorage from "@react-native-async-storage/async-storage"; 
import { app } from "./firebaseConfig"; 
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const db = getFirestore(app);

const Ongoing = ({ navigation }) => {
  const [ongoingAudits, setOngoingAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ongoingCounter, setOngoingCounter] = useState(0);

  useEffect(() => {
    const loadOngoingAudits = async () => {
      setLoading(true);
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          console.error("User ID not found!");
          return;
        }

        const userAcceptedRef = collection(doc(db, "Profile", userId), "acceptedAudits");
        const acceptedAuditsSnap = await getDocs(userAcceptedRef);

        const fetchedAudits = [];
        for (const auditDoc of acceptedAuditsSnap.docs) {
          const auditId = auditDoc.id;

          const auditRef = doc(db, "audits", auditId);
          const auditSnap = await getDoc(auditRef);

          if (auditSnap.exists()) {
            const auditDetails = auditSnap.data();

            const branchRef = doc(db, "branches", auditDetails.branchId);
            const branchSnap = await getDoc(branchRef);

            const clientRef = doc(db, "clients", auditDetails.clientId);
            const clientSnap = await getDoc(clientRef);

            const acceptedAuditRef = doc(db, "Profile", userId, "acceptedAudits", auditId);
            const acceptedAuditSnap = await getDoc(acceptedAuditRef);
            const acceptedAuditData = acceptedAuditSnap.data();
            const acceptedDate = acceptedAuditData ? acceptedAuditData.date : null;

            if (branchSnap.exists() && clientSnap.exists()) {
              fetchedAudits.push({
                id: auditId,
                ...auditDetails,
                branchDetails: branchSnap.data(),
                clientDetails: clientSnap.data(),
                acceptedDate,
              });
            } else {
              console.log("Branch or client details missing for audit:", auditId);
            }
          }
        }

        setOngoingAudits(fetchedAudits);
        setOngoingCounter(fetchedAudits.length);
      } catch (error) {
        console.error("Error loading ongoing audits:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOngoingAudits();
  }, []); 

  const handleRemove = async (auditId, auditName) => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        console.error("User ID not found!");
        return;
      }

      await updateDoc(doc(db, "audits", auditId), { isRejected: true });

      const acceptedAuditsRef = doc(db, "Profile", userId, "acceptedAudits", auditId);
      await updateDoc(acceptedAuditsRef, { isRejected: true });

      setOngoingAudits((prev) => prev.filter((audit) => audit.id !== auditId));
      navigation.navigate("RejectedAudits", { auditName, isRejected: true });
    } catch (error) {
      console.error("Error removing audit:", error);
    }
  };

  const handleGenerateReport = (auditId, auditName) => {
    navigation.navigate("ReportScreen", { auditId, auditName });
  };

  const renderFields = (data, excludeKeys = []) =>
    data
      ? Object.entries(data)
          .filter(([key]) => !excludeKeys.includes(key))
          .map(([key, value]) => (
            <Text key={key} style={styles.detailText}>
              {key}: {value}
            </Text>
          ))
      : <Text>No details available</Text>;

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={[styles.card, styles.ongoingTasks]}>
        <Text style={styles.cardTitle}>Accepted Audits</Text>
        <Text style={styles.counterText}>{ongoingCounter} ongoing audits</Text>
      </TouchableOpacity>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : ongoingAudits.length === 0 ? (
        <View style={styles.noTasksContainer}>
          <Text style={styles.noTasksText}>No ongoing tasks</Text>
        </View>
      ) : (
        ongoingAudits.map((audit) => (
          <View key={audit.id} style={styles.card}>
            <View style={styles.header}>
             
             <Image source={require('./Images/building.png')} style={{width: 34, height: 34}} />
             
             <View style={styles.title}>
               <Text style={styles.companyName}>{audit.clientDetails.name || "Tata Motors"}</Text>
               <Text style={styles.branchName}> {audit.branchDetails.name || "Unknown"}</Text> 
             </View>
           </View>

            <View style={styles.details}>
              <View style={styles.detail}>
                <MaterialIcons name="location-on" size={24} color="#189ab4" />
                <Text style={styles.detailText}>{audit.branchDetails.city || "Unknown Location"}</Text>
              </View>
              <View style={styles.detail}>
                <MaterialCommunityIcons name="shield-search" size={24} color="#189ab4" />
                <Text style={styles.detailText}> {audit.auditType || "General Audit"}</Text>
              </View>
              <View style={styles.detail}>
                <MaterialIcons name="event" size={24} color="#189ab4" />
                <Text style={styles.detailText}>
                  Date: {audit.acceptedDate || "Not Assigned"}
                </Text>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              {/* <TouchableOpacity
                style={styles.button}
                onPress={() => handleGenerateReport(audit.id, audit.auditName)}
              >
                <Ionicons name="document-text" size={20} color="white" />
                <Text style={styles.buttonText}>Generate Report</Text>
              </TouchableOpacity> */}

              {/* Replacing TouchableOpacity with Image */}
              <TouchableOpacity onPress={() => handleRemove(audit.id, audit.auditName)}>
                <Image source={require('./Images/Reject.png')} style={styles.removeImage} />
              </TouchableOpacity>
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
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  removeImage: {
    marginTop:30,
    width: 200,
    height: 50,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ongoingTasks: {
    backgroundColor: "#e0f7fa",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  counterText: {
    fontSize: 16,
    color: "#00796b",
  },
  header: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
  },
  title: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  branchName: {
    fontSize: 14,
    color: "#666",
  },
  details: {
    marginVertical: 8,
  },
  detail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00796b",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  removeButton: {
    backgroundColor: "#d32f2f",
  },
  buttonText: {
    color: "#fff",
    marginLeft: 6,
  },
  noTasksContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  noTasksText: {
    fontSize: 18,
    color: "#666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Ongoing;







