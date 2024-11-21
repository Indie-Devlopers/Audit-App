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
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { app } from './firebaseConfig'; // Import Firebase configuration

const db = getFirestore(app);

const AuditDetails = ({ route, navigation }) => {
  const { audit } = route.params; // Getting the audit passed from the previous screen
  const [notes, setNotes] = useState(""); // State for storing notes
  const [auditDetails, setAuditDetails] = useState(null); // State to store fetched audit details
  const [branchDetails, setBranchDetails] = useState(null); // State for storing branch details
  const [clientDetails, setClientDetails] = useState(null); // State for storing client details
  const [isAcceptedByUser, setIsAcceptedByUser] = useState(false); // State to check if the user has accepted the audit
  const [loading, setLoading] = useState(true); // Loading state

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

          // Check if the user has already accepted the audit
          const userId = await AsyncStorage.getItem("userId");
          if (userId && auditData.acceptedBy && auditData.acceptedBy === userId) {
            setIsAcceptedByUser(true);
          }

          // Fetch branch details based on branchId
          const branchRef = doc(db, "branches", auditData.branchId);
          const branchSnap = await getDoc(branchRef);
          if (branchSnap.exists()) {
            setBranchDetails(branchSnap.data());
          } else {
            console.log("Branch not found!");
          }

          // Fetch client details based on clientId
          const clientRef = doc(db, "clients", auditData.clientId);
          const clientSnap = await getDoc(clientRef);
          if (clientSnap.exists()) {
            setClientDetails(clientSnap.data());
          } else {
            console.log("Client not found!");
          }
        } else {
          console.log("Audit not found!");
        }

        setLoading(false); // Stop loading once data is fetched
      } catch (error) {
        console.error("Error fetching audit details:", error);
        setLoading(false); // Stop loading in case of error
      }
    };

    fetchAuditDetails();
  }, [audit.id]);

  const handleAccept = async () => {
    try {
      // Firebase: Update the isAccepted field and notes in Firestore
      const auditRef = doc(db, "audits", audit.id);
      await updateDoc(auditRef, {
        isAccepted: true, // Set isAccepted to true
        notes: notes,     // Store the notes provided by the user
        acceptedBy: await AsyncStorage.getItem("userId") // Save the userId of the person accepting
      });

      // Update the local state
      setIsAcceptedByUser(true);

      // Navigate to ongoing tasks screen
      navigation.navigate("Ongoing");
    } catch (error) {
      console.error("Error accepting audit", error);
    }
  };

  const handleUnaccept = async () => {
    try {
      // Firebase: Update the isAccepted field to false (unaccept)
      const auditRef = doc(db, "audits", audit.id);
      await updateDoc(auditRef, {
        isAccepted: false, // Set isAccepted to false (unaccepted)
        acceptedBy: null,  // Remove the user from acceptedBy
      });

      // Update the local state
      setIsAcceptedByUser(false);

      // Navigate back to the previous screen
      navigation.goBack();
    } catch (error) {
      console.error("Error unaccepting audit", error);
    }
  };

  const handleRemove = async () => {
    try {
      // Firebase: Remove the audit or user's association with the audit
      const auditRef = doc(db, "audits", audit.id);
      await updateDoc(auditRef, {
        acceptedBy: null, // Removing the association
      });

      // Navigate back or update the UI accordingly
      navigation.goBack();
    } catch (error) {
      console.error("Error removing audit", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Function to display all fields of an object dynamically
  const renderFields = (data) => {
    return Object.keys(data).map((key) => (
      <Text key={key} style={styles.detailText}>
        {key}: {data[key]}
      </Text>
    ));
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {auditDetails && branchDetails && clientDetails ? (
          <>
            <View style={styles.detailsSection}>
              <Text style={styles.subTitle}>Audit Details:</Text>
              <Text style={styles.detailText}>Audit Name: {auditDetails.name}</Text>
            </View>

            <View style={styles.detailsSection}>
              <Text style={styles.subTitle}>Branch Details:</Text>
              {renderFields(branchDetails)} 
            </View>

            <View style={styles.detailsSection}>
              <Text style={styles.subTitle}>Client Details:</Text>
              {renderFields(clientDetails)} 
            </View>

            <TextInput
              style={styles.notesInput}
              placeholder="Add your notes here"
              value={notes}
              onChangeText={setNotes}
            />

            <View style={styles.buttonsContainer}>
              {/* Accept/Unaccept Button */}
              {!isAcceptedByUser ? (
                <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                  <Text style={styles.buttonText}>Accept Audit</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.rejectButton} onPress={handleUnaccept}>
                  <Ionicons name="close-circle" size={24} color="white" />
                  <Text style={styles.buttonText}>Unaccept Audit</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Remove Button */}
            <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
              <Ionicons name="trash-bin" size={24} color="white" />
              <Text style={styles.buttonText}>Remove Audit</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text>No data found!</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  subTitle: {
    fontSize: 18,
    marginBottom: 5,
  },
  detailsSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 5,
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
  rejectButton: {
    backgroundColor: "#F44336",
    padding: 15,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  removeButton: {
    backgroundColor: "#FF9800",
    padding: 15,
    borderRadius: 5,
    marginTop: 15,
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