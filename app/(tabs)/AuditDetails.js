import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "./firebaseConfig";
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

        await setDoc(acceptedAuditsRef, {
          auditId: audit.id,
          date: formattedDate,
        });

        const auditRef = doc(db, "audits", audit.id);
        await updateDoc(auditRef, {
          acceptedByUser: arrayUnion(userId),
        });

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
          if (userId && auditData.acceptedBy && auditData.acceptedBy.includes(userId)) {
            setIsAcceptedByUser(true);
          }

          const branchRef = doc(db, "branches", auditData.branchId);
          const branchSnap = await getDoc(branchRef);
          if (branchSnap.exists()) {
            setBranchDetails(branchSnap.data());
          }
          console.log("dffdfdfdf",branchSnap.data());

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

  const renderFields = (details, includeKeys = []) => {
    return includeKeys.map((key) => (
      <Text key={key} style={styles.detailText}>
        <Text style={styles.fieldTitle}>{key.toUpperCase()}: </Text>
        {details[key] || "N/A"}
      </Text>
    ));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {auditDetails && branchDetails && clientDetails ? (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>{auditDetails.title}</Text>
              <Ionicons
                name="clipboard"
                size={32}
                color="#4A90E2"
                style={styles.headerIcon}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.subTitle}>Client Details</Text>
              {renderFields(clientDetails, ["name"])}
            </View>

            <View style={styles.card}>
              <Text style={styles.subTitle}>Branch Details</Text>
              {renderFields(branchDetails, ["name", "city"])}
            </View>

            <View style={styles.card}>
              <Text style={styles.subTitle}>Audit Information</Text>
              {renderFields(auditDetails, ["description", "schedule"])}
            </View>

            <View style={styles.buttonsContainer}>
              {!isAcceptedByUser ? (
                <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
                  <Ionicons name="checkmark-done" size={20} color="white" />
                  <Text style={styles.buttonText}>Accept Audit</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.statusText}>
                  You've already accepted this audit!
                </Text>
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
    backgroundColor: "#f9fafc",
  },
  scrollView: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerIcon: {
    marginLeft: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2E3A59",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  subTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4A90E2",
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    color: "#3A3A3A",
    marginBottom: 5,
  },
  fieldTitle: {
    fontWeight: "600",
    color: "#555",
  },
  buttonsContainer: {
    alignItems: "center",
    marginTop: 30,
  },
  acceptButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 30,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  statusText: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "600",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#D32F2F",
    textAlign: "center",
  },
});

export default AuditDetails;
