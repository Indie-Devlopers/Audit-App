import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "./firebaseConfig"; // Import Firebase configuration
import DateTimePicker from "@react-native-community/datetimepicker";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const AuditDetails = ({ route, navigation }) => {
  const { audit } = route.params;
  const [auditDetails, setAuditDetails] = useState(null);
  const [branchDetails, setBranchDetails] = useState(null);
  const [clientDetails, setClientDetails] = useState(null);
  const [isAcceptedByUser, setIsAcceptedByUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateConfirm = async (event, date) => {
    if (event.type === "set" && date) {
      setShowCalendar(false);
      const formattedDate = date.toISOString().split("T")[0];
      setSelectedDate(new Date(formattedDate));
  
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          console.error("User ID not found!");
          return;
        }
  
        const userProfileRef = doc(db, "Profile", userId);
        const acceptedAuditsRef = doc(userProfileRef, "acceptedAudits", audit.id);
  
        // Save the audit acceptance information in the user profile
        await setDoc(acceptedAuditsRef, {
          auditId: audit.id,
          date: formattedDate,
        });
  
        // Update the acceptedByUser field in the audit document
        const auditRef = doc(db, "audits", audit.id);
        await updateDoc(auditRef, {
          acceptedByUser: arrayUnion(userId), // Add user ID to the array
        });
  
        // Fetch the current ongoingCounter value for the user
        const userDocSnap = await getDoc(userProfileRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const currentOngoingCounter = userData.ongoingCounter || 0;
  
          // Increment the ongoingCounter
          const newOngoingCounter = currentOngoingCounter + 1;
  
          // Update the ongoingCounter field in the user's profile
          await updateDoc(userProfileRef, {
            ongoingCounter: newOngoingCounter,
          });
        }
  
        setIsAcceptedByUser(true);
        navigation.navigate("Ongoing");
      } catch (error) {
        console.error("Error accepting audit", error);
      }
    } else {
      setShowCalendar(false);
    }
  };

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
          const clientRef = doc(db, "clients", auditData.clientId);

          const [branchSnap, clientSnap] = await Promise.all([
            getDoc(branchRef),
            getDoc(clientRef)
          ]);

          if (branchSnap.exists()) {
            const branchData = branchSnap.data();
            delete branchData.clientId; // Remove unnecessary fields
            setBranchDetails(branchData);
          }

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

  const renderFields = (details, includeKeys = []) => {
    return Object.keys(details)
      .filter((key) => includeKeys.includes(key))
      .map((key) => (
        <Text key={key} style={styles.detailText}>
          {key}: {details[key]}
        </Text>
      ));
  };

  if (!auditDetails) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No audit details found</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
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
              <Text style={styles.subTitle}>Client</Text>
              <View style={styles.detail}>
                <MaterialIcons name="business" size={24} color="#189ab4" />
                <Text style={styles.detailText}>{clientDetails.name}</Text>
              </View>
              <View style={{ marginTop: 15 }}>
                <Text style={styles.subTitle}>Branch Details</Text>
                <View style={styles.detail}>
                  <MaterialIcons name="location-city" size={24} color="#189ab4" />
                  <Text style={styles.detailText}>{branchDetails.name}</Text>
                </View>
                <View style={styles.detail}>
                  <MaterialIcons name="location-on" size={24} color="#189ab4" />
                  <Text style={styles.detailText}>{branchDetails.city}</Text>
                </View>
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
    paddingHorizontal: 20,
    backgroundColor: "#f7f9fc", // Lighter background color
  },
  scrollView: {
    paddingBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#2E3A59", // Darker, more professional title color
    marginBottom: 20,
  },
  detailsSection: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E3A59", // Consistent title color for sections
    marginBottom: 10,
  },
  detail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailText: {
    fontSize: 18,
    color: "#3A3A3A", // More readable font color
    marginLeft: 10,
  },
  buttonsContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  acceptButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#4CAF50", // Green color for a more realistic button
    borderRadius: 30,
    marginBottom: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  buttonText: {
    marginLeft: 10,
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 16,
    color: "#D32F2F", // Red color for error messages
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AuditDetails;