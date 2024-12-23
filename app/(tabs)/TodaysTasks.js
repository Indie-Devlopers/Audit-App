



import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, Image,navigate } from "react-native";
import { getFirestore, doc, getDocs, collection, updateDoc, query, where } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { app } from "./firebaseConfig"; // Your Firebase config file
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons'; 


const db = getFirestore(app);

export default function TodaysTasks({ navigation }) {
  const [todaysAudits, setTodaysAudits] = useState([]);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showClock, setShowClock] = useState(false);
  const todayDate = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

  useEffect(() => {
    const getUserId = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (userId) {
          console.log("Retrieved User ID:", userId);
          fetchTodaysAudits(userId);
        } else {
          console.error("User ID not found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };

    getUserId();
  }, []);

  const handleGenerateReport = (auditId, auditName) => {
    navigation.navigate("ReportScreen", { auditId, auditName });
  };

  const fetchTodaysAudits = async (userId) => {
    try {
      console.log("Fetching audits for date:", todayDate);

      const userRef = doc(db, "Profile", userId);
      const acceptedAuditsRef = collection(userRef, "acceptedAudits");

      const q = query(acceptedAuditsRef, where("date", "==", todayDate));
      const querySnapshot = await getDocs(q);

      const audits = [];
      console.log("Query Snapshot Size:", querySnapshot.size);

      querySnapshot.forEach((doc) => {
        console.log("Audit Found:", doc.id, doc.data());
        audits.push({ id: doc.id, ...doc.data() });
      });

      if (audits.length === 0) {
        console.log("No audits for today");
      }

      setTodaysAudits(audits);
    } catch (error) {
      console.error("Error fetching today's audits:", error);
    }
  };

  const handleComplete = async (audit) => {
    try {
      const auditRef = doc(db, "audits", audit.id);
      await updateDoc(auditRef, { isComplete: true });

      Alert.alert("Task Completed", "This task has been marked as completed.");
      fetchTodaysAudits(); // Refresh the list of today's audits
    } catch (error) {
      console.error("Error completing audit:", error);
    }
  };

  const renderAudit = ({ item: audit }) => (
    <View style={styles.auditCard}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image
          source={require('./Images/building.png')}
          style={{ width: 34, height: 34 }}
        />
        <View style={styles.title}>
          <Text style={styles.companyName}>{audit.clientDetails?.name || "Tata Motors"}</Text>
          <Text style={styles.branchName}>{audit.branchDetails?.name || "A"}</Text>
        </View>
      </View>

      {/* Details Section */}
      <View style={styles.details}>
        <View style={styles.detail}>
          <MaterialIcons name="location-on" size={24} color="#189ab4" />
          <Text style={styles.detailText}>{audit.branchDetails?.city || "Bishnupur"}</Text>
        </View>
        <View style={styles.detail}>
          <MaterialCommunityIcons name="shield-search" size={24} color="#189ab4" />
          <Text style={styles.detailText}>{audit.auditType || "General Audit"}</Text>
        </View>
        <View style={styles.detail}>
          <MaterialIcons name="event" size={24} color="#189ab4" />
          <Text style={styles.detailText}>
            Date: {audit.acceptedDate || "2024-12-21"}
          </Text>
        </View>
      </View>

      {/* Button Section */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleGenerateReport(audit.id, audit.auditName)}>
          <Ionicons name="document-text" size={20} color="green" />
          <Text style={styles.buttonText}>Generate Report</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleComplete(audit)}>
          <Image
            source={require('./Images/Accept.png')} // Add your button image here
            style={styles.completeButtonImage}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {todaysAudits.length === 0 ? (
        <Text style={styles.noAuditsText}>No audits for today</Text>
      ) : (
        <FlatList
          data={todaysAudits}
          renderItem={renderAudit}
          keyExtractor={(item) => item.id}
        />
      )}

      {showClock && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          display="default"
          onChange={onTimeChange}
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
  auditCard: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    
  },
  button: {
        backgroundColor: "white",
        padding: 7,
        borderRadius: 5,
        flex: 1,
        borderWidth:2,
        borderColor:'green',
        marginHorizontal: 3,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
      },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    marginLeft: 10,
  },
  details: {
    marginVertical: 8,
  },
  detail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  buttonText: {
        marginLeft: 8,
        color: "green",
        fontSize: 14,
      },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  branchName: {
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

