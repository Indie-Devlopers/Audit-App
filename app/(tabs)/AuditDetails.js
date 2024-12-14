



import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc, setDoc, collection } from "firebase/firestore";
import { db } from "./firebaseConfig"; // Import Firebase configuration

import DateTimePicker from "@react-native-community/datetimepicker";

const AuditDetails = ({ route, navigation }) => {
  const { audit } = route.params;
  const [auditDetails, setAuditDetails] = useState(null);
  const [branchDetails, setBranchDetails] = useState(null);
  const [clientDetails, setClientDetails] = useState(null);
  const [isAcceptedByUser, setIsAcceptedByUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Handle date selection and save the report dates under acceptedAudits > {auditId}
  const handleDateConfirm = async (event, date) => {
    if (event.type === "set" && date) {
      setShowCalendar(false);
      const formattedDate = date.toISOString().split("T")[0]; // Format the date to yyyy-mm-dd
      setSelectedDate(new Date(formattedDate));

      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          console.error("User ID not found!");
          return;
        }

        // Reference to the user's Profile and acceptedAudits sub-collection
        const userProfileRef = doc(db, "Profile", userId);

        // Reference to the specific audit under acceptedAudits
        const acceptedAuditsRef = doc(userProfileRef, "acceptedAudits", audit.id);

        // Create or update the accepted audit document under acceptedAudits > {auditId}
        await setDoc(acceptedAuditsRef, {
          auditId: audit.id,
          date: formattedDate,
          isCompleted: false, // Initially set to false
        });

        // Commenting out the creation of the ReportDates subcollection kyuki abhi isme changes jkarne hai 
        
        // const reportDatesRef = collection(acceptedAuditsRef, "ReportDates");

        // Add the dates to the ReportDates collection as documents
        // await setDoc(doc(reportDatesRef, "scan"), { date: formattedDate });
        // await setDoc(doc(reportDatesRef, "hard"), { date: formattedDate });
        // await setDoc(doc(reportDatesRef, "soft"), { date: formattedDate });
        // await setDoc(doc(reportDatesRef, "photo"), { date: formattedDate });

        // Mark the audit as accepted by the user and navigate to Ongoing screen
        setIsAcceptedByUser(true);
        navigation.navigate("Ongoing");
      } catch (error) {
        console.error("Error accepting audit", error);
      }
    } else {
      setShowCalendar(false);
    }
  };

  // Fetch audit details from Firebase
  useEffect(() => {
    const fetchAuditDetails = async () => {
      try {
        const auditRef = doc(db, "audits", audit.id);
        const auditSnap = await getDoc(auditRef);
        if (auditSnap.exists()) {
          const auditData = auditSnap.data();
          setAuditDetails(auditData);

          const userId = await AsyncStorage.getItem("userId");
          if (userId && auditData.acceptedBy && auditData.acceptedBy === userId) {
            setIsAcceptedByUser(true);
          }

          const branchRef = doc(db, "branches", auditData.branchId);
          const branchSnap = await getDoc(branchRef);
          if (branchSnap.exists()) {
            const branchData = branchSnap.data();
            delete branchData.clientId;
            setBranchDetails(branchData);
          }

          const clientRef = doc(db, "clients", auditData.clientId);
          const clientSnap = await getDoc(clientRef);
          if (clientSnap.exists()) {
            setClientDetails(clientSnap.data());
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching audit details:", error);
        setLoading(false);
      }
    };

    fetchAuditDetails();
  }, [audit.id]);

  const handleAccept = () => {
    setShowCalendar(true);
  };

  const renderFields = (details) => {
    return Object.keys(details).map((key) => (
      <Text key={key} style={styles.detailText}>
        {key}: {details[key]}
      </Text>
    ));
  };

  if (!auditDetails) {
    return (
      <View style={styles.container}>
        <Text>No audit details found</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {auditDetails && branchDetails && clientDetails ? (
          <>
            <Text style={styles.title}>{auditDetails.title}</Text>
            <View style={styles.detailsSection}>
              <Text style={styles.subTitle}>Client Details:</Text>
              {renderFields(clientDetails)}
              <View style={{ marginTop: 10 }}>
                <Text style={styles.subTitle}>Branch Details:</Text>
                {renderFields(branchDetails)}
              </View>
            </View>

            <View style={styles.buttonsContainer}>
              {!isAcceptedByUser && (
                <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                  <Text style={styles.buttonText}>Accept Audit</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        ) : (
          <Text style={styles.errorText}>No data found!</Text>
        )}
      </ScrollView>

      {showCalendar && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateConfirm}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  scrollView: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  detailsSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  subTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  detailText: {
    fontSize: 16,
    color: "#555",
    marginVertical: 5,
  },
  buttonsContainer: {
    marginTop: 60,
  },
  acceptButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Centers content inside the button
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "green",
    borderRadius: 25,
    marginBottom: 20,
    position: "absolute", // For absolute positioning
    top: "50%", // Centers it vertically
    left: "50%", // Centers it horizontally
    transform: [{ translateX: -75 }, { translateY: -30 }], // Adjust for exact center (button size)
  },
  
  buttonText: {
    marginLeft: 10,
    color: "white",
    fontSize: 16,
  },
  ongoingContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f4f4f4",
    borderRadius: 5,
  },
  ongoingText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
});

export default AuditDetails;
