import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, Image, ActivityIndicator } from "react-native";
import { getFirestore, doc, getDoc, getDocs, collection, updateDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { app } from "./firebaseConfig"; // Your Firebase config file
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import moment from 'moment'; // Import moment.js for date formatting

const db = getFirestore(app);

export default function PastTasks({ navigation }) {
  const [pastAudits, setPastAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const todayDate = new Date(); // Current date
  todayDate.setHours(0, 0, 0, 0); // Set time to midnight for comparison

  useEffect(() => {
    const getUserId = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (userId) {
          console.log("Retrieved User ID:", userId);
          fetchPastAudits(userId);
        } else {
          console.error("User ID not found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };

    getUserId();
  }, []);

  const fetchPastAudits = async (userId) => {
    try {
      console.log("Fetching audits for date <=", todayDate.toISOString().split("T")[0]);

      const userRef = doc(db, "Profile", userId);
      const acceptedAuditsRef = collection(userRef, "acceptedAudits");
      const acceptedAuditsSnapshot = await getDocs(acceptedAuditsRef);

      const audits = await Promise.all(
        acceptedAuditsSnapshot.docs.map(async (auditDoc) => {
          const { auditId, date } = auditDoc.data(); // Extract date along with auditId

          // Convert the date string to a Date object
          const auditDate = new Date(date); // This will parse the "YYYY-MM-DD" format correctly
          auditDate.setHours(0, 0, 0, 0);
          if (auditDate > todayDate) return null; // Only include today's and past audits

          // Fetch audit details
          const auditRef = doc(db, "audits", auditId);
          const auditSnapshot = await getDoc(auditRef);
          if (!auditSnapshot.exists()) return null;
          const auditData = auditSnapshot.data();
          console.log("auditData:::::", auditData);
          // Exclude audits where isSubmitted is true
          if (auditData.isSubmitted) return null;

          // Fetch branch details
          const branchRef = doc(db, "branches", auditData.branchId);
          const branchSnapshot = await getDoc(branchRef);
          const branchDetails = branchSnapshot.exists() ? branchSnapshot.data() : {};

          // Fetch client details
          const clientRef = doc(db, "clients", auditData.clientId);
          const clientSnapshot = await getDoc(clientRef);
          const clientDetails = clientSnapshot.exists() ? clientSnapshot.data() : {};

          return {
            id: auditId,
            ...auditData,
            date: auditDate,
            branchDetails,
            clientDetails,
          };
        })
      );

      setPastAudits(audits.filter(audit => audit !== null));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching past audits:", error);
      setLoading(false);
    }
  };

  const handleGenerateReport = (auditId, auditName) => {
    navigation.navigate("ReportScreen", { auditId, auditName });
  };

  const handleComplete = async (audit) => {
    try {
      const auditRef = doc(db, "audits", audit.id);
      await updateDoc(auditRef, { isComplete: true });
    
      Alert.alert("Task Completed", "This task has been marked as completed.");
      fetchPastAudits(await AsyncStorage.getItem("userId")); // Refresh the list of past audits
    } catch (error) {
      console.error("Error completing audit:", error);
    }
  };

  const renderAudit = ({ item: audit }) => (
    <View style={styles.auditCard}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image
          source={require("./Images/building.png")}
          style={{ width: 34, height: 34 }}
        />
        <View style={styles.title}>
          <Text style={styles.companyName}>{audit.clientDetails?.name || "Client Name"}</Text>
          <Text style={styles.branchName}>{audit.branchDetails?.name || "Branch Name"}</Text>
        </View>
      </View>

      {/* Details Section */}
      <View style={styles.details}>
        <View style={styles.detail}>
          <MaterialIcons name="location-on" size={24} color="#189ab4" />
          <Text style={styles.detailText}>{audit.branchDetails?.city || "City Not Specified"}</Text>
        </View>
        <View style={styles.detail}>
          <MaterialCommunityIcons name="shield-search" size={24} color="#189ab4" />
          <Text style={styles.detailText}>{audit.auditType || "Audit Type Not Specified"}</Text>
        </View>
        <View style={styles.detail}>
          <MaterialIcons name="event" size={24} color="#189ab4" />
          <Text style={styles.detailText}>
            {moment(audit.date).format('DD-MM-YYYY')}
          </Text>
        </View>
      </View>

      {/* Button Section */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => handleGenerateReport(audit.id, audit.auditName)}>
          <Image
            source={require("./Images/Accept.png")}
            style={styles.completeButtonImage}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Not Submitted Audits</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#189ab4" style={styles.loader} />
      ) : pastAudits.length === 0 ? (
        <Text style={styles.noAuditsText}>No audits for today or past</Text>
      ) : (
        <FlatList
          data={pastAudits}
          renderItem={renderAudit}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    padding: 10,
  },
  headerText: {
    fontSize: 20,
    backgroundColor: "#e57373",
    width: "100%",
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 10,
    margin:0,
    color: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    border:2,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  auditCard: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    marginLeft: 10,
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  branchName: {
    fontSize: 14,
    color: "#555",
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
    marginLeft: 8,
    fontSize: 14,
    color: "#555",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  completeButtonImage: {
    width: 180,
    height: 50,
    resizeMode: "contain",
  },
  noAuditsText: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
    marginTop: 20,
  },
});