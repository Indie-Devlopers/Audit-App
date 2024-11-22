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
import { app } from "./firebaseConfig"; // Import Firebase configuration

const db = getFirestore(app); // Firestore instance

const CompletedTasks = () => {
  const [enrichedCompletedClients, setEnrichedCompletedClients] = useState([]);

  useEffect(() => {
    const loadCompletedClients = async () => {
      try {
        const savedCompletedClients = await AsyncStorage.getItem("completedClients");
        if (savedCompletedClients) {
          const parsedClients = JSON.parse(savedCompletedClients);
          const enrichedClients = [];

          for (const client of parsedClients) {
            // Validate clientId and branchId
            if (!client.clientId || !client.branchId) {
              console.warn(`Invalid data for client: Missing clientId or branchId`);
              continue;
            }

            // Fetch branch city
            const branchRef = doc(db, "branches", client.branchId);
            const branchSnap = await getDoc(branchRef);
            const branchCity = branchSnap.exists() ? branchSnap.data().city : "Unknown City";

            // Fetch client name
            const clientRef = doc(db, "clients", client.clientId);
            const clientSnap = await getDoc(clientRef);
            const clientName = clientSnap.exists() ? clientSnap.data().name : "Unknown Client";

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
            });
          }

          setEnrichedCompletedClients(enrichedClients);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    loadCompletedClients();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {enrichedCompletedClients.length > 0 ? (
        enrichedCompletedClients.map((client, index) => (
          <View key={index} style={styles.clientContainer}>
            <Text style={styles.clientText}>Name: {client.clientName}</Text>
            <Text style={styles.clientText}>Audit Number: {client.branchId}</Text>
            <Text style={styles.clientText}>City: {client.branchCity}</Text>
            <Text style={styles.clientText}>Date of Audit: {client.date}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noTasksText}>No completed tasks yet!</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  clientContainer: {
    backgroundColor: "#e0e0e0",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  clientText: {
    fontSize: 16,
  },
  noTasksText: {
    fontSize: 18,
    color: "gray",
    textAlign: "center",
  },
});

export default CompletedTasks;
