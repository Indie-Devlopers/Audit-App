import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Image } from "react-native";
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { app } from "./firebaseConfig";
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from "@react-navigation/native";

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

          // Fetch full audit details from the main `audits` collection
          const auditRef = doc(db, "audits", auditId);
          const auditSnap = await getDoc(auditRef);

          if (auditSnap.exists()) {
            const auditDetails = auditSnap.data();

            // Fetch branch details
            const branchRef = doc(db, "branches", auditDetails.branchId);
            const branchSnap = await getDoc(branchRef);

            // Fetch client details
            const clientRef = doc(db, "clients", auditDetails.clientId);
            const clientSnap = await getDoc(clientRef);

            // Fetch the date from acceptedAudits subcollection
            const acceptedAuditDoc = auditDoc.data();
            let auditDate = "Not Assigned"; // Default value in case no date is found

            // Directly use the date if it's stored as a string in "yy/mm/dd" format
            if (acceptedAuditDoc.date) {
              auditDate = acceptedAuditDoc.date; // Simply use the saved date string
            }

            if (branchSnap.exists() && clientSnap.exists()) {
              fetchedAudits.push({
                id: auditId,
                auditName: auditDetails.auditName,
                branchDetails: branchSnap.data(),
                clientDetails: clientSnap.data(),
                acceptedDate: auditDate,
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

      // Mark the audit as rejected in the "audits" collection
      await updateDoc(doc(db, "audits", auditId), { isRejected: true });

      // Remove the auditId from acceptedAudits inside Profile -> userId -> acceptedAudits
      const acceptedAuditsRef = doc(db, "Profile", userId);
      const acceptedAuditsSnap = await getDoc(acceptedAuditsRef);
      const acceptedAuditsData = acceptedAuditsSnap.data();
      const acceptedAuditsList = acceptedAuditsData?.acceptedAudits || [];
      const updatedAcceptedAudits = acceptedAuditsList.filter(
        (id) => id !== auditId
      );

      // Update the acceptedAudits collection
      await updateDoc(acceptedAuditsRef, {
        acceptedAudits: updatedAcceptedAudits,
      });

      // Decrease the ongoingCounter by 1
      const userProfileRef = doc(db, "Profile", userId);
      const userProfileSnap = await getDoc(userProfileRef);
      const userProfileData = userProfileSnap.data();
      const ongoingCounter = Math.max(0, (userProfileData.ongoingCounter || 0) - 1);

      // Update the ongoingCounter
      await updateDoc(userProfileRef, {
        ongoingCounter: ongoingCounter,
      });

      // Remove the audit from the ongoing list in the UI
      setOngoingAudits((prev) => prev.filter((audit) => audit.id !== auditId));

      // Navigate to the RejectedAudits screen
      navigation.navigate("RejectedAudits", { auditName, isRejected: true });
    } catch (error) {
      console.error("Error removing audit:", error);
    }
  };

  const handleGenerateReport = (auditId, auditName) => {
    // Navigate to the ReportScreen with the auditId and auditName as params
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
            <Text style={styles.cardTitle}>{audit.auditName}</Text>
            <View style={styles.header}>
              <Image source={require('./Images/building.png')} style={{ width: 34, height: 34 }} />
              <View style={styles.title}>
                <Text style={styles.companyName}>{audit.clientDetails.name || "Tata Motors"}</Text>
                <Text style={styles.branchName}>{audit.branchDetails.name || "Unknown"}</Text>
              </View>
            </View>
            <View style={styles.details}>
              <View style={styles.detail}>
                <MaterialIcons name="location-on" size={24} color="#189ab4" />
                <Text style={styles.detailText}>{audit.branchDetails.city || "Unknown Location"}</Text>
              </View>
              <View style={styles.detail}>
                <MaterialCommunityIcons name="shield-search" size={24} color="#189ab4" />
                <Text style={styles.detailText}>{audit.auditType || "General Audit"}</Text>
              </View>
              <View style={styles.detail}>
                <MaterialIcons name="event" size={24} color="#189ab4" />
                <Text style={styles.detailText}>
                  Date: {audit.acceptedDate || "Not Assigned"}
                </Text>
              </View>
            </View>
            <View style={styles.buttonContainer}>
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













// // Import necessary libraries and Firebase functions
// import React, { useState, useEffect, useCallback } from "react";
// import { 
//   View, 
//   Text, 
//   TouchableOpacity, 
//   StyleSheet, 
//   ScrollView, 
//   ActivityIndicator, 
//   Image 
// } from "react-native";
// import { 
//   getFirestore, 
//   collection, 
//   query, 
//   getDocs, 
//   doc, 
//   getDoc, 
//   updateDoc, 
//   deleteDoc 
// } from "firebase/firestore"; 
// import AsyncStorage from "@react-native-async-storage/async-storage"; 
// import { app } from "./firebaseConfig"; 
// import Ionicons from 'react-native-vector-icons/Ionicons'; 
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import { useFocusEffect } from "@react-navigation/native";

// const db = getFirestore(app);

// const Ongoing = ({ navigation }) => {
//   const [ongoingAudits, setOngoingAudits] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [ongoingCounter, setOngoingCounter] = useState(0);

//   const loadOngoingAudits = useCallback(async () => {
//     setLoading(true);
//     try {
//       const userId = await AsyncStorage.getItem("userId");
//       if (!userId) {
//         console.error("User ID not found!");
//         return;
//       }

//       const userAcceptedRef = collection(doc(db, "Profile", userId), "acceptedAudits");
//       const acceptedAuditsSnap = await getDocs(userAcceptedRef);

//       const fetchedAudits = [];
//       for (const auditDoc of acceptedAuditsSnap.docs) {
//         const auditId = auditDoc.id;

//         const auditRef = doc(db, "audits", auditId);
//         const auditSnap = await getDoc(auditRef);

//         if (auditSnap.exists()) {
//           const auditDetails = auditSnap.data();

//           const branchRef = doc(db, "branches", auditDetails.branchId);
//           const branchSnap = await getDoc(branchRef);

//           const clientRef = doc(db, "clients", auditDetails.clientId);
//           const clientSnap = await getDoc(clientRef);

//           const acceptedAuditRef = doc(db, "Profile", userId, "acceptedAudits", auditId);
//           const acceptedAuditSnap = await getDoc(acceptedAuditRef);
//           const acceptedAuditData = acceptedAuditSnap.data();
//           const acceptedDate = acceptedAuditData ? acceptedAuditData.date : null;

//           if (branchSnap.exists() && clientSnap.exists()) {
//             fetchedAudits.push({
//               id: auditId,
//               ...auditDetails,
//               branchDetails: branchSnap.data(),
//               clientDetails: clientSnap.data(),
//               acceptedDate,
//             });
//           } else {
//             console.log("Branch or client details missing for audit:", auditId);
//           }
//         }
//       }

//       setOngoingAudits(fetchedAudits);
//       setOngoingCounter(fetchedAudits.length);
//     } catch (error) {
//       console.error("Error loading ongoing audits:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadOngoingAudits();
//   }, [loadOngoingAudits]);

//   useFocusEffect(
//     useCallback(() => {
//       loadOngoingAudits();
//     }, [loadOngoingAudits])
//   );

//   const handleRemove = async (auditId, auditName) => {
//     try {
//       const userId = await AsyncStorage.getItem("userId");
//       if (!userId) {
//         console.error("User ID not found!");
//         return;
//       }

//       // Move audit to completed tasks
//       const completedAuditsRef = doc(db, "Profile", userId, "completedTasks", auditId);
//       const acceptedAuditRef = doc(db, "Profile", userId, "acceptedAudits", auditId);
//       const acceptedAuditSnap = await getDoc(acceptedAuditRef);

//       if (acceptedAuditSnap.exists()) {
//         const acceptedData = acceptedAuditSnap.data();
//         await updateDoc(completedAuditsRef, acceptedData);
//         await deleteDoc(acceptedAuditRef);

//         await updateDoc(doc(db, "audits", auditId), { isCompleted: true });

//         setOngoingAudits((prev) => prev.filter((audit) => audit.id !== auditId));
//         setOngoingCounter((prevCounter) => prevCounter - 1);
//       } else {
//         console.error("Audit does not exist in acceptedAudits.");
//       }

//       navigation.navigate("RejectedAudits", { auditName, isRejected: true });
//     } catch (error) {
//       console.error("Error removing audit:", error);
//     }
//   };

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
//             <View style={styles.header}>
//               <Image source={require('./Images/building.png')} style={{ width: 34, height: 34 }} />
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
//                 <Text style={styles.detailText}>
//                   Date: {audit.acceptedDate || "Not Assigned"}
//                 </Text>
//               </View>
//             </View>

//             <View style={styles.buttonContainer}>
//               <TouchableOpacity onPress={() => handleRemove(audit.id, audit.auditName)}>
//                 <Image source={require('./Images/Reject.png')} style={styles.removeImage} />
//               </TouchableOpacity>
//             </View>
//           </View>
//         ))
//       )}
//     </ScrollView>
//   );
// };

//   const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       padding: 16,
//       backgroundColor: "#f5f5f5",
//     },
//     removeImage: {
//       marginTop:30,
//       width: 200,
//       height: 50,
//     },
//     card: {
//       backgroundColor: "#fff",
//       borderRadius: 8,
//       padding: 16,
//       marginVertical: 8,
//       shadowColor: "#000",
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: 0.1,
//       shadowRadius: 4,
//       elevation: 2,
//     },
//     ongoingTasks: {
//       backgroundColor: "#e0f7fa",
//     },
//     cardTitle: {
//       fontSize: 18,
//       fontWeight: "bold",
//     },
//     counterText: {
//       fontSize: 16,
//       color: "#00796b",
//     },
//     header: {
//       flexDirection: "row",
//       marginBottom: 10,
//       alignItems: "center",
//     },
//     title: {
//       flex: 1,
//     },
//     companyName: {
//       fontSize: 16,
//       fontWeight: "bold",
//     },
//     branchName: {
//       fontSize: 14,
//       color: "#666",
//     },
//     details: {
//       marginVertical: 8,
//     },
//     detail: {
//       flexDirection: "row",
//       alignItems: "center",
//       marginBottom: 6,
//     },
//     detailText: {
//       fontSize: 14,
//       marginLeft: 8,
//     },
//     buttonContainer: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//     },
//     button: {
//       flexDirection: "row",
//       alignItems: "center",
//       backgroundColor: "#00796b",
//       paddingVertical: 8,
//       paddingHorizontal: 12,
//       borderRadius: 4,
//     },
//     removeButton: {
//       backgroundColor: "#d32f2f",
//     },
//     buttonText: {
//       color: "#fff",
//       marginLeft: 6,
//     },
//     noTasksContainer: {
//       alignItems: "center",
//       marginTop: 50,
//     },
//     noTasksText: {
//       fontSize: 18,
//       color: "#666",
//     },
//     loadingContainer: {
//       flex: 1,
//       justifyContent: "center",
//       alignItems: "center",
//     },
//   });

//   export default Ongoing;







