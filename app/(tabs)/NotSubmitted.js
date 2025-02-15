import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, ActivityIndicator } from "react-native";
import { getFirestore, doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "./firebaseConfig";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import moment from 'moment-timezone';
import { LinearGradient } from 'expo-linear-gradient';

const NotSubmitted = ({ navigation }) => {
  const [notSubmittedAudits, setNotSubmittedAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotSubmittedAudits();
  }, []);

  const fetchNotSubmittedAudits = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.error("User ID not found");
        setLoading(false);
        return;
      }

      // Get today's date at start of day in IST
      const today = moment().tz("Asia/Kolkata").startOf('day');

      // Get accepted audits for the user
      const acceptedAuditsRef = collection(db, "Profile", userId, "acceptedAudits");
      const acceptedSnapshot = await getDocs(acceptedAuditsRef);
      
      const filteredAudits = [];

      // Process each accepted audit
      for (const acceptedDoc of acceptedSnapshot.docs) {
        const acceptedData = acceptedDoc.data();
        const auditId = acceptedData.auditId;
        const acceptedDate = moment(acceptedData.date).tz("Asia/Kolkata").startOf('day');

        // Skip if audit date is in future
        if (acceptedDate.isAfter(today)) {
          continue;
        }

        // Get the audit details from audits collection
        const auditRef = doc(db, "audits", auditId);
        const auditSnap = await getDoc(auditRef);

        if (!auditSnap.exists()) continue;

        const auditData = auditSnap.data();

        // Get reportDate array, initialize if doesn't exist
        const reportDate = auditData.reportDate || [
          { type: 'scanDate', date: null, isSubmitted: false, submittedBy: '' },
          { type: 'hardCopyDate', date: null, isSubmitted: false, submittedBy: '' },
          { type: 'softCopyDate', date: null, isSubmitted: false, submittedBy: '' },
          { type: 'photoDate', date: null, isSubmitted: false, submittedBy: '' }
        ];

        // Count submitted reports
        const submittedCount = reportDate.filter(report => report.isSubmitted).length;

        // Only include audits with zero submitted reports
        if (submittedCount > 0) continue;

        // Get branch details
        const branchRef = doc(db, "branches", auditData.branchId);
        const branchSnap = await getDoc(branchRef);
        const branchData = branchSnap.exists() ? branchSnap.data() : {};

        // Get client details
        const clientRef = doc(db, "clients", auditData.clientId);
        const clientSnap = await getDoc(clientRef);
        const clientData = clientSnap.exists() ? clientSnap.data() : {};

        // Add to filtered audits
        filteredAudits.push({
          id: auditId,
          ...auditData,
          reportDate,
          date: acceptedData.date,
          branchDetails: branchData,
          clientDetails: clientData
        });
      }

      setNotSubmittedAudits(filteredAudits);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching not submitted audits:", error);
      setLoading(false);
    }
  };

  const renderAuditItem = ({ item }) => (
    <TouchableOpacity
      style={styles.auditCard}
      onPress={() => navigation.navigate("Report", { 
        audit: {
          id: item.id,
          clientName: item.clientDetails?.name,
          branchName: item.branchDetails?.name,
          auditType: item.auditType,
          date: item.date,
          reportDate: item.reportDate
        }
      })}
    >
      <LinearGradient
        colors={['#ffffff', '#f8f9fa']}
        style={styles.cardGradient}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.clientName}>{item.clientDetails?.name || 'Unknown Client'}</Text>
          <Text style={styles.date}>{moment(item.date).format('DD MMM, YYYY')}</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.branchName}>{item.branchDetails?.name || 'Unknown Branch'}</Text>
          <Text style={styles.auditType}>{item.auditType}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00796B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#00796B', '#004D40']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Not Submitted Audits</Text>
      </LinearGradient>

      <FlatList
        data={notSubmittedAudits}
        renderItem={renderAuditItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="clipboard-check-outline" size={50} color="#00796B" />
            <Text style={styles.emptyText}>No pending audits</Text>
          </View>
        }
      />
    </View>
  );
};

export default NotSubmitted;

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
    margin: 0,
    color: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    border: 2,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  listContainer: {
    padding: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#555",
  },
  cardGradient: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clientName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  date: {
    fontSize: 14,
    color: "#555",
  },
  cardContent: {
    marginTop: 10,
  },
  auditType: {
    fontSize: 14,
    color: "#555",
  },
}); 