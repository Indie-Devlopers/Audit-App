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


            <View style={styles.card}>
              
              {renderFields(clientDetails, ["name"])}
              {renderFields(branchDetails, ["name", "city"])}
            </View>





            <View style={styles.buttonsContainer}>
              {!isAcceptedByUser ? (
                <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
                  <Ionicons name="checkmark-circle" size={20} color="white" />
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
    backgroundColor: "#f3f4f6",
  },
  scrollView: {
    padding: 15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: "#e4e4e4",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#374151",
    marginLeft: 10,
  },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 5,
  },
  fieldTitle: {
    fontWeight: "600",
    color: "#6b7280",
  },
  buttonsContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  acceptButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16a34a",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  statusText: {
    fontSize: 16,
    color: "#10b981",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
    textAlign: "center",
  },
});

export default AuditDetails;
