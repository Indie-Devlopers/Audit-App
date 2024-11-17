// import React, { useState, useEffect } from "react";
// import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons } from "@expo/vector-icons";

// const AuditDetails = ({ route, navigation }) => {
//   const { audit } = route.params;
//   const [notes, setNotes] = useState("");

//   const handleAccept = async () => {
//     try {
//       const ongoingClients = await AsyncStorage.getItem("ongoingClients");
//       const parsedOngoingClients = ongoingClients ? JSON.parse(ongoingClients) : {};
//       parsedOngoingClients[audit.id] = { ...audit, notes };
      
//       await AsyncStorage.setItem("ongoingClients", JSON.stringify(parsedOngoingClients));

//       // Navigate back to ongoing page
//       navigation.navigate("Ongoing");
//     } catch (error) {
//       console.error("Error saving accepted audit", error);
//     }
//   };

//   const handleRemove = () => {
//     // Navigate back without saving the audit
//     navigation.goBack();
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>{audit.name}</Text>
//       <Text style={styles.subTitle}>Location: {audit.location}</Text>
//       <Text style={styles.subTitle}>Date of Audit: {audit.date}</Text>

//       <TextInput
//         style={styles.notesInput}
//         placeholder="Add your notes here"
//         value={notes}
//         onChangeText={setNotes}
//       />

//       <View style={styles.buttonsContainer}>
//         <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
//           <Ionicons name="checkmark-circle" size={24} color="white" />
//           <Text style={styles.buttonText}>Accept</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
//           <Ionicons name="remove-circle" size={24} color="white" />
//           <Text style={styles.buttonText}>Remove</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     justifyContent: "center",
//     backgroundColor: "#fff",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
//   subTitle: {
//     fontSize: 18,
//     marginBottom: 10,
//   },
//   notesInput: {
//     height: 100,
//     borderColor: "#ccc",
//     borderWidth: 1,
//     marginBottom: 20,
//     padding: 10,
//     borderRadius: 5,
//   },
//   buttonsContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   acceptButton: {
//     backgroundColor: "#4CAF50",
//     padding: 15,
//     borderRadius: 5,
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   removeButton: {
//     backgroundColor: "#F44336",
//     padding: 15,
//     borderRadius: 5,
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   buttonText: {
//     color: "white",
//     marginLeft: 10,
//     fontSize: 16,
//   },
// });

// export default AuditDetails;




import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { getFirestore, doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { app } from './firebaseConfig'; // Import Firebase configuration

const db = getFirestore(app);

const AuditDetails = ({ route, navigation }) => {
  const { audit } = route.params; // Getting the audit passed from the previous screen
  const [notes, setNotes] = useState(""); // State for storing notes
  const [auditDetails, setAuditDetails] = useState(null); // State to store fetched audit details
  const [branchCity, setBranchCity] = useState(""); // State for branch city
  const [clientName, setClientName] = useState(""); // State for client name

  // Fetch audit data and related info when component mounts
  useEffect(() => {
    const fetchAuditDetails = async () => {
      try {
        // Fetch audit details
        const auditRef = doc(db, "audits", audit.id);
        const auditSnap = await getDoc(auditRef);

        if (auditSnap.exists()) {
          const auditData = auditSnap.data();
          setAuditDetails(auditData);

          // Fetch branch city
          const branchRef = doc(db, "branches", auditData.branchId);
          const branchSnap = await getDoc(branchRef);
          if (branchSnap.exists()) {
            setBranchCity(branchSnap.data().city);
          }

          // Fetch client name
          const clientRef = doc(db, "clients", auditData.clientId);
          const clientSnap = await getDoc(clientRef);
          if (clientSnap.exists()) {
            setClientName(clientSnap.data().name);
          }
        } else {
          console.log("Audit not found!");
        }
      } catch (error) {
        console.error("Error fetching audit details:", error);
      }
    };

    fetchAuditDetails();
  }, [audit.id]);

  const handleAccept = async () => {
    try {
      // Get ongoingClients from AsyncStorage
      const ongoingClients = await AsyncStorage.getItem("ongoingClients");
      const parsedOngoingClients = ongoingClients ? JSON.parse(ongoingClients) : {};
      parsedOngoingClients[audit.id] = { ...audit, notes };

      // Save updated ongoingClients to AsyncStorage
      await AsyncStorage.setItem("ongoingClients", JSON.stringify(parsedOngoingClients));

      // Firebase: Update the isAccepted field and notes in Firestore
      const auditRef = doc(db, "audits", audit.id);
      await updateDoc(auditRef, {
        isAccepted: true, // Set isAccepted to true
        notes: notes,     // Store the notes provided by the user
      });

      // Navigate to ongoing tasks screen
      navigation.navigate("Ongoing");
    } catch (error) {
      console.error("Error saving accepted audit", error);
    }
  };

  const handleRemove = () => {
    // Navigate back without saving the audit
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {auditDetails ? (
        <>
          <Text style={styles.title}>{auditDetails.name}</Text>
          <Text style={styles.subTitle}>Location: {branchCity}</Text>
          <Text style={styles.subTitle}>Date of Audit: {auditDetails.date}</Text>
          <Text style={styles.subTitle}>Client: {clientName}</Text>

          {/* Display the additional fields */}
          {/* <Text style={styles.subTitle}>Auditor ID: {auditDetails.auditorId}</Text> */}
          {/* <Text style={styles.subTitle}>Branch ID: {auditDetails.branchId}</Text>
          <Text style={styles.subTitle}>Client ID: {auditDetails.clientId}</Text> */}

          <TextInput
            style={styles.notesInput}
            placeholder="Add your notes here"
            value={notes}
            onChangeText={setNotes}
          />

          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
              <Ionicons name="checkmark-circle" size={24} color="white" />
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
              <Ionicons name="remove-circle" size={24} color="white" />
              <Text style={styles.buttonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  notesInput: {
    height: 100,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
    borderRadius: 5,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  removeButton: {
    backgroundColor: "#F44336",
    padding: 15,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    marginLeft: 10,
    fontSize: 16,
  },
});

export default AuditDetails;
