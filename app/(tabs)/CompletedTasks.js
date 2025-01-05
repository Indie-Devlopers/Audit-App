
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Button,
} from "react-native";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { app } from "./firebaseConfig";
import { TouchableOpacity } from "react-native-gesture-handler";

const db = getFirestore(app);

const CompletedTasks = () => {
  const [completedAudits, setCompletedAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedCounter, setCompletedCounter] = useState(0);
  const [userId, setUserId] = useState(null);

  const navigation = useNavigation(); // Hook for navigation

  // Fetch completed audit IDs
  const fetchCompletedAuditIds = async (userId) => {
    try {
      const completedRef = collection(db, "Profile", userId, "completedAudits");
      const completedSnapshot = await getDocs(completedRef);
      return completedSnapshot.docs.map((doc) => doc.id);
    } catch (error) {
      console.error("Error fetching completed audit IDs:", error);
      return [];
    }
  };

  // Fetch branch and client details
  const fetchAuditDetails = async (audit) => {
    try {
      const branchRef = doc(db, "branches", audit.branchId);
      const clientRef = doc(db, "clients", audit.clientId);

      const branchSnapshot = await getDoc(branchRef);
      const clientSnapshot = await getDoc(clientRef);

      if (!branchSnapshot.exists() || !clientSnapshot.exists()) {
        throw new Error("Branch or Client not found.");
      }

      const branchData = branchSnapshot.data();
      const clientData = clientSnapshot.data();

      return {
        branchDetails: branchData,
        clientDetails: clientData,
      };
    } catch (error) {
      console.error("Error fetching audit details:", error);
      return { branchDetails: {}, clientDetails: {} };
    }
  };

  // Fetch audits by IDs
  const fetchAuditsByIds = async (ids) => {
    try {
      const auditsQuery = query(collection(db, "audits"), where("__name__", "in", ids));
      const querySnapshot = await getDocs(auditsQuery);

      const allAudits = [];
      for (const doc of querySnapshot.docs) {
        const auditData = { id: doc.id, ...doc.data() };
        const { branchDetails, clientDetails } = await fetchAuditDetails(auditData);
        allAudits.push({ ...auditData, branchDetails, clientDetails });
      }
      return allAudits;
    } catch (error) {
      console.error("Error fetching audits by IDs:", error);
      return [];
    }
  };

  useEffect(() => {
    const loadCompletedAudits = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (!storedUserId) return;
        setUserId(storedUserId);

        const completedAuditIds = await fetchCompletedAuditIds(storedUserId);
        if (completedAuditIds.length === 0) return;

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
  }, []);

  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : (
        <View style={styles.screenContainer}>
          <View style={styles.counterContainer}>
            <Text style={styles.counterText}>{completedCounter} completed tasks</Text>
          
          </View>
         
          {completedAudits.length === 0 ? (
            <View style={styles.noTasksContainer}>
              <Text style={styles.noTasksText}>No completed tasks</Text>
            </View>
          ) : (
            completedAudits.map((audit) => (
              <View key={audit.id} style={styles.cardContainer}>
                <View style={styles.imageContainer}>
                  <Image
                    source={require("./Images/building.png")}
                    style={styles.image}
                  />
                </View>
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
  container: { flex: 1 },
  screenContainer: { padding: 15 },
  counterContainer: { marginBottom: 10 },
  counterText: { fontSize: 18, fontWeight: "bold", marginBottom:20 },
  noTasksContainer: { alignItems: "center", marginTop: 20 },
  noTasksText: { fontSize: 16, color: "#555" },
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  imageContainer: { marginRight: 15 },
  image: { width: 50, height: 50, borderRadius: 5 },
  textContainer: { flex: 1, justifyContent: "center" },
  clientName: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  branchName: { fontSize: 16, color: "#555" },
});

export default CompletedTasks;
