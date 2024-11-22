import React, { useState, useEffect } from 'react';  // Make sure it's only here, not multiple times

import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, Dimensions,Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { firebase } from './firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDocs, collection, updateDoc, doc, arrayUnion } from "firebase/firestore";
import { db } from "./firebaseConfig";
import AuditDetails from "./AuditDetails";
// import { useEffect, useState } from "react";
// import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get("window");

const HomeScreen = ({ navigation, route }) => {
  const [userId, setUserId] = useState(null);
  const userEmail = route?.params?.userEmail || "";
  const [greeting, setGreeting] = useState("");
  const [userName, setUserName] = useState("");
  const [audits, setAudits] = useState([]);
  const [ongoingAudits, setOngoingAudits] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [clientsData, setClientsData] = useState({});
  const [branchesData, setBranchesData] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  // const [userId, setUserId] = useState(""); // To store logged-in user's ID
 

  

  useEffect(() => {
 
    const loadData = async () => {
      try {
        // Fetch audits from Firebase collection 'audits'
        const auditRef = collection(db, "audits");
        const snapshot = await getDocs(auditRef);
        const auditData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAudits(auditData);

        // Fetch ongoing audits from AsyncStorage
        const ongoingAuditsData = await AsyncStorage.getItem("ongoingAudits");
        if (ongoingAuditsData) {
          setOngoingAudits(JSON.parse(ongoingAuditsData));
        }

        // Fetch clients from 'clients' collection
        const clientsRef = collection(db, "clients");
        const clientSnapshot = await getDocs(clientsRef);
        const clients = {};
        clientSnapshot.docs.forEach((doc) => {
          clients[doc.id] = doc.data().name;
        });
        setClientsData(clients);

        // Fetch branches from 'branches' collection
        const branchesRef = collection(db, "branches");
        const branchSnapshot = await getDocs(branchesRef);
        const branches = branchSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBranchesData(branches);

        // Fetch tasks from 'tasks' collection
        const tasksRef = collection(db, "tasks");
        const taskSnapshot = await getDocs(tasksRef);
        const taskData = taskSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTodayTasks(taskData.filter(task => task.status === 'today'));
        setCompletedTasks(taskData.filter(task => task.status === 'completed'));

        // Fetch the logged-in user's ID
        const userDoc = await firebase.firestore().collection('Profile').where("email", "==", userEmail).get();
        if (!userDoc.empty) {
          const userId = userDoc.docs[0].id;
          setUserId(userId); // Set the logged-in user's document ID
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      }

      // Set greeting based on time
      const currentTime = new Date().getHours();
      setGreeting(currentTime < 12 ? "Good Morning" : currentTime < 19 ? "Good Afternoon " : "Good Evening");
      setUserName(userEmail ? userEmail.split("@")[0] : "Auditor");
    };

    

    loadData();
  }, [userEmail]);

  const getAvatar = (Client) => {
    const firstLetter = Client ? Client.charAt(0).toUpperCase() : "Ⓐ";
    return firstLetter;
  };

  const acceptAudit = async (auditId) => {
    try {
      // Update the audit with auditorId and isAccepted status
      const auditRef = doc(db, "audits", auditId);
      await updateDoc(auditRef, {
        auditorId: userId, // Set the auditorId to the logged-in user's ID
        isAccepted: true, // Mark the audit as accepted
      });
  
      // Update the logged-in user's Profile with the accepted auditId
      if (userId) {
        const userRef = doc(db, "Profile", userId); // Reference to the specific user document
        await updateDoc(userRef, {
          AcceptedAudits: arrayUnion(auditId), // Add the auditId to the AcceptedAudits array
        });
  
        console.log("Audit accepted successfully!");
      } else {
        console.log("User ID is not available.");
      }
    } catch (error) {
      console.error("Error accepting audit:", error);
    }
  };
  

  const completeAudit = async (auditId) => {
    try {
      // Fetch the audit data to check if it's accepted
      const auditRef = doc(db, "audits", auditId);
      const auditSnapshot = await getDoc(auditRef);
      const auditData = auditSnapshot.data();
  
      // Only allow marking as complete if isAccepted is true
      if (auditData.isAccepted) {
        // Update the audit to mark it as complete
        await updateDoc(auditRef, {
          isCompleted: true, // Set the isCompleted field to true
        });
  
        console.log("Audit marked as complete!");
      } else {
        console.log("Audit is not accepted, cannot mark as complete.");
      }
    } catch (error) {
      console.error("Error completing audit:", error);
    }
  };
  

  // Filter the audits based on status, location, and search term
  const filteredAudits = audits.filter((audit) => {
    if (selectedStatus && audit.status !== selectedStatus) {
      return false;
    }
    if (filterLocation && audit.location !== filterLocation) {
      return false;
    }
    if (searchTerm && !audit.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

 

  const logout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => {
            // Clear any stored session or data here, like AsyncStorage or Firebase logout
            AsyncStorage.clear();
            navigation.replace("LoginScreen"); // Navigate back to the login screen
          },
        },
      ],
      { cancelable: false }
    );
  };


  return (
    
    <View style={styles.fullScreen}>
         <View>
      {userId ? (
        <Text>Welcome, User ID: {userId}</Text>
      ) : (
        <Text>.</Text>
      )}
    </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.topRightIconContainer}>
          <TouchableOpacity onPress={logout}>
            <Ionicons name="log-out" size={30} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>{greeting}, {userName}</Text>
          
        </View>

        <View style={styles.container}>
          {/* Task Boxes Section */}
          <View style={styles.taskBoxesContainer}>
            <TouchableOpacity style={styles.taskBox}>
              <TouchableOpacity onPress={() => navigation.navigate("UserInfo")}>
                <Ionicons name="calendar" size={30} color="black" style={styles.icon} />
                <Text style={styles.taskBoxTitle}>Today's Tasks</Text>
                <Text style={styles.taskBoxContent}>{todayTasks.length} Tasks</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity style={styles.taskBox}>
              <TouchableOpacity onPress={() => navigation.navigate("Ongoing")}>
                <Ionicons name="play-circle" size={30} color="black" style={styles.icon} />
                <Text style={styles.taskBoxTitle}>Ongoing Tasks</Text>
                <Text style={styles.taskBoxContent}>{ongoingAudits.length} Tasks</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.taskBox2}>
            <TouchableOpacity onPress={() => navigation.navigate("Completed-Tasks")}>
              <Ionicons name="checkmark-circle" size={30} color="black" style={styles.icon} />
              <Text style={styles.taskBoxTitle}>Completed Tasks</Text>
              <Text style={styles.taskBoxContent}>{completedTasks.length} Tasks</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Upcoming Audits Section */}
          <View style={styles.upcomingAuditsContainer}>
            <Text style={styles.upcomingAuditsText}>Upcoming Audits</Text>

            <FlatList
              data={filteredAudits}
              renderItem={({ item }) => {
                const clientName = clientsData[item.clientId] || "Unknown Client";
                const branch = branchesData.find((branch) => branch.id === item.branchId);
                const branchCity = branch ? branch.city : "Unknown Location";

                return (
                  <TouchableOpacity
                    style={styles.auditItem}
                    onPress={() => navigation.navigate("AuditDetails", { audit: item })}
                  >
                    <View style={styles.clientImageContainer}>
                      <Text style={styles.clientImage}>{getAvatar(item.auditorId)}</Text>
                    </View>
                    <View style={styles.auditContent}>
                      <Text style={styles.auditName}>{item.name}</Text>
                      <Text style={styles.auditLocation}>{clientName}</Text>
                      <Text style={styles.auditLocation}>{branchCity}</Text>
                    </View>
                    <View style={styles.actionsContainer}>
                    
                        <TouchableOpacity
                          style={styles.acceptButton}
                          onPress={() => navigation.navigate("AuditDetails", { audit: item })}
                        >
                          <Text style={styles.buttonText}>See More</Text>
                        </TouchableOpacity>
                      
                    </View>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item) => item.id}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  greetingContainer: {
    padding: 15,
    backgroundColor: "#6200ea",
  },
  greetingText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  container: {
    padding: 20,
  },
  taskBoxesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  taskBox: {
    width: (width - 60) / 2,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  taskBoxTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  taskBoxContent: {
    fontSize: 14,
    marginTop: 5,
  },
  taskBox2: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  upcomingAuditsContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 3,
  },
  topRightIconContainer: {
   marginBottom:20,
   marginRight:50
    
  },
  upcomingAuditsText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  auditItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  clientImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: "#6200ea",
    justifyContent: "center",
    alignItems: "center",
  },
  clientImage: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  auditContent: {
    flex: 1,
    paddingLeft: 10,
  },
  auditName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  auditLocation: {
    fontSize: 14,
    color: "#888",
  },
  actionsContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: "#4caf50",
    padding: 10,
    borderRadius: 5,
  },
  completeButton: {
    backgroundColor: "#4caf50",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default HomeScreen;



