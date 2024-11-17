


import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, TextInput, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { firebase } from './firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDocs, collection } from "firebase/firestore";
import { db } from "./firebaseConfig";

const { width, height } = Dimensions.get("window");

const HomeScreen = ({ navigation, route }) => {
  const userEmail = route?.params?.userEmail || "";
  const [greeting, setGreeting] = useState("");
  const [userName, setUserName] = useState("");
  const [audits, setAudits] = useState([]);
  const [ongoingAudits, setOngoingAudits] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [clientsData, setClientsData] = useState({});
  const [branchesData, setBranchesData] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(""); // Selected status for filter
  const [searchTerm, setSearchTerm] = useState(""); // Search term for filter
  const [filterLocation, setFilterLocation] = useState(""); // Location filter

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
      } catch (error) {
        console.error("Error fetching data:", error);
      }

      // Set greeting based on time
      const currentTime = new Date().getHours();
      setGreeting(currentTime < 12 ? "Good Morning" : currentTime < 19 ? "Good Afternoon " : "Good Evening");
      setUserName(userEmail ? userEmail.split("@")[0] : "User");
    };

    loadData();
  }, [userEmail]);

  const getAvatar = (Client) => {
    const firstLetter = Client ? Client.charAt(0).toUpperCase() : "Ⓐ";
    return firstLetter;
  };

  // Filter the audits based on status, location, and search term
  const filteredAudits = audits.filter((audit) => {
    // Filter by selected status
    if (selectedStatus && audit.status !== selectedStatus) {
      return false;
    }

    // Filter by location
    if (filterLocation && audit.location !== filterLocation) {
      return false;
    }

    // Filter by search term (client name or audit name)
    if (searchTerm && !audit.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    return true;
  });

  return (
    <View style={styles.fullScreen}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
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

          {/* Search Input */}
          {/* <TextInput
            style={styles.input}
            placeholder="Search audits"
            value={searchTerm}
            onChangeText={(text) => setSearchTerm(text)}
          /> */}

          {/* Location Filter */}
          {/* <TextInput
            style={styles.input}
            placeholder="Filter by location"
            value={filterLocation}
            onChangeText={(text) => setFilterLocation(text)}
          /> */}

          {/* Status Filter */}
          {/* <View style={styles.filterContainer}>
            <TouchableOpacity onPress={() => setSelectedStatus("")}>
              <Text style={styles.filterText}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedStatus("completed")}>
              <Text style={styles.filterText}>Completed</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedStatus("inProgress")}>
              <Text style={styles.filterText}>In Progress</Text>
            </TouchableOpacity>
          </View> */}

          {/* Upcoming Audits Section */}
          <View style={styles.upcomingAuditsContainer}>
            <Text style={styles.upcomingAuditsText}>Upcoming Audits</Text>

            <FlatList
              data={filteredAudits}
              renderItem={({ item }) => {
                const clientName = clientsData[item.clientId] || "Unknown Client";
                const branch = branchesData.find((branch) => branch.id === item.branchId);
                const branchCity = branch ? branch.city : "Unknown Location"; // Get city from branches data

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
                      <Text style={styles.auditDate}>{item.date}</Text>
                      <Text style={styles.auditBranchId}>Branch: {branch?.name || "Unknown Branch"}</Text>
                      <Text style={styles.auditClientId}>Client: {clientName}</Text>
                      <Text style={styles.auditCity}>Location: {branchCity}</Text> 
                      <Text style={styles.auditAuditorId}>Auditor: {item.auditorId}</Text> 
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
   backgroundColor:'white'
  },
  greetingContainer: {
    marginTop: 50,
    paddingHorizontal: 20,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  container: {
    padding: 20,
  },
  taskBoxesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
   
  },
  taskBox: {
    width: (width - 60) / 2,
    height: 120,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderRadius:15,
    borderWidth:1,
    borderColor:'gray'
  },
  taskBox2: {
    width: width - 40,
    height: 120,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderRadius:15,
   borderWidth:1,
    borderColor:'gray'
  },
  taskBoxTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskBoxContent: {
    fontSize: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  filterText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  upcomingAuditsContainer: {
    marginTop: 20,
    
    
  },
  upcomingAuditsText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  auditItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
     borderRadius:15,
   borderWidth:1,
    borderColor:'gray'
  },
  clientImageContainer: {
    backgroundColor: '#ccc',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  clientImage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  auditContent: {
    flex: 1,
  },
  auditName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  auditDate: {
    fontSize: 14,
    color: 'gray',
  },
  auditBranchId: {
    fontSize: 14,
  },
  auditClientId: {
    fontSize: 14,
  },
  auditCity: {
    fontSize: 14,
    color: 'gray',
  },
  auditAuditorId: {
    fontSize: 14,
    color: 'gray',
  },
});

export default HomeScreen;
