



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
      <View style={styles.screenConatiner}>
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
              {/* Left Side: Building Image */}
              <View style={styles.imageContainer}>
                <Image
                  source={require("./Images/building.png")}
                  style={styles.image}
                />
              </View>
          
              {/* Right Side: Client Name and Branch Name */}
              <View style={styles.textContainer}>
                <Text style={styles.clientName}>{audit.clientDetails.name}</Text>
                <Text style={styles.branchName}>Branch: {audit.branchDetails.name}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    )}
  </ScrollView>
  
  );
};

const styles = StyleSheet.create({
  screenConatiner:{
    padding: 15
  },
  cardContainer: {
    flexDirection: "row", // Align image and text side by side
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#fff",
  //  elevation: 5, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  imageContainer: {
    marginRight: 15, // Add space between image and text
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 5, // Rounded corners for image
  },
  textContainer: {
    flex: 1, // Take up remaining space
    justifyContent: "center",
  },
  clientName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  branchName: {
    fontSize: 16,
    color: "#555",
  },
});

export default CompletedTasks;
