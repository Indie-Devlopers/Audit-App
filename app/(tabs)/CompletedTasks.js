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
import { getFirestore, doc, getDoc } from "firebase/firestore";
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

            // Enrich client data
            enrichedClients.push({
              ...client,
              branchCity,
              clientName,
            });
          }

          setEnrichedCompletedClients(enrichedClients);
        }
      } catch (error) {
        console.error("Failed to load completed clients", error);
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
