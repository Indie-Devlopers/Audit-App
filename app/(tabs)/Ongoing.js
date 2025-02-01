import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Image } from "react-native";
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
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
        const today = new Date(); // Current date

        const auditPromises = acceptedAuditsSnap.docs.map(async (auditDoc) => {
          const auditId = auditDoc.id;

          const auditRef = doc(db, "audits", auditId);
          const auditSnap = await getDoc(auditRef);

          if (auditSnap.exists()) {
            const auditDetails = auditSnap.data();

            const branchRef = doc(db, "branches", auditDetails.branchId);
            const clientRef = doc(db, "clients", auditDetails.clientId);

            const [branchSnap, clientSnap] = await Promise.all([
              getDoc(branchRef),
              getDoc(clientRef)
            ]);

            const acceptedAuditRef = doc(db, "Profile", userId, "acceptedAudits", auditId);
            const acceptedAuditSnap = await getDoc(acceptedAuditRef);
            const acceptedAuditData = acceptedAuditSnap.data();
            const acceptedDate = acceptedAuditData ? acceptedAuditData.date : null;

            if (branchSnap.exists() && clientSnap.exists()) {
              // Include only future tasks
              if (acceptedDate && new Date(acceptedDate) > today) {
                fetchedAudits.push({
                  id: auditId,
                  ...auditDetails,
                  branchDetails: branchSnap.data(),
                  clientDetails: clientSnap.data(),
                  acceptedDate,
                });
              }
            } else {
              console.log("Branch or client details missing for audit:", auditId);
            }
          }
        });

        await Promise.all(auditPromises);

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
              <Image source={require('./Images/building.png')} style={{ width: 34, height: 34 }} />
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
    backgroundColor: "#f9f9f9",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    border: 1,
  },
  ongoingTasks: {
    backgroundColor: "#e3f2fd",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  counterText: {
    fontSize: 15,
    color: "#1976d2",
    marginTop: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    marginLeft: 10,
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  branchName: {
    fontSize: 13,
    color: "#757575",
  },
  details: {
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
    paddingTop: 10,
  },
  detail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 10,
    color: "#555",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1976d2",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  buttonText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 15,
    fontWeight: "500",
  },
  removeImage: {
    marginTop: 8,
    width: 150,
    height: 40,
    alignSelf: "center",
  },
  noTasksContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  noTasksText: {
    fontSize: 16,
    color: "#9e9e9e",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Ongoing;