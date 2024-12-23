import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image
} from "react-native";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "./firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

const HomeScreen = ({ navigation }) => {
  const [ongoingCounter, setOngoingCounter] = useState(0);
  const [upcomingAudits, setUpcomingAudits] = useState([]);
  const [todaysTasks, setTodaysTasks] = useState(0); // Change from [] to 0
  const [acceptedTasks, setAcceptedTasks] = useState([]);
  const [userName, setUserName] = useState("");
  const [greeting, setGreeting] = useState("");
  const [branchesData, setBranchesData] = useState([]);
  const [clientsData, setClientsData] = useState({});
  const [loading, setLoading] = useState(true); // Add loading state
  const [branchesMap, setBranchesMap] = useState({}); // Added map for quick lookup

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");

        if (userId) {
          const profileRef = doc(db, "Profile", userId);
          const profileDoc = await getDoc(profileRef);

          if (profileDoc.exists()) {
            const ongoingCount = profileDoc.data()?.ongoingCounter || 0;
            setOngoingCounter(ongoingCount);

            const name = profileDoc.data()?.name || "User ";
            setUserName(name);

            const acceptedAuditsSnapshot = await getDocs(
              collection(db, "Profile", userId, "acceptedAudits")
            );
            const acceptedTasksList = [];
            acceptedAuditsSnapshot.forEach((doc) => {
              acceptedTasksList.push(doc.data().auditId);
            });
            setAcceptedTasks(acceptedTasksList);

            const today = new Date();
            let todaysAuditCount = 0;
            acceptedAuditsSnapshot.forEach((doc) => {
              const auditData = doc.data();
              const auditDate = new Date(auditData.date);
              if (
                auditDate.getFullYear() === today.getFullYear() &&
                auditDate.getMonth() === today.getMonth() &&
                auditDate.getDate() === today.getDate()
              ) {
                todaysAuditCount++;
              }
            });
            setTodaysTasks(todaysAuditCount);

            // Fetch branches data
            const branchesSnapshot = await getDocs(collection(db, "branches"));
            const fetchedBranches = [];
            const branchesLookup = {}; // Map for quick lookup
            branchesSnapshot.forEach((doc) => {
              const branchData = doc.data();
              fetchedBranches.push(branchData);
              branchesLookup[doc.id] = branchData; // Mapping by branch ID
            });
            setBranchesData(fetchedBranches);
            setBranchesMap(branchesLookup); // Set the map for fast access

            // Fetch clients data
            const clientsSnapshot = await getDocs(collection(db, "clients"));
            const fetchedClients = {};
            clientsSnapshot.forEach((doc) => {
              fetchedClients[doc.id] = doc.data().name;
            });
            setClientsData(fetchedClients);

            // Fetch upcoming audits
            const auditsSnapshot = await getDocs(collection(db, "audits"));
            const fetchedUpcomingAudits = [];
            auditsSnapshot.forEach((doc) => {
              const auditData = doc.data();
              if (!auditData.isAccepted && !acceptedTasksList.includes(doc.id)) {
                fetchedUpcomingAudits.push({
                  id: doc.id,
                  title: auditData.title,
                  city: auditData.city,
                  date: auditData.date,
                  branchId: auditData.branchId,
                  clientId: auditData.clientId,
                });
              }
            });
            setUpcomingAudits(fetchedUpcomingAudits);

            // Set loading to false once all data is fetched
            setLoading(false);
          } else {
            console.log("User profile not found");
            setLoading(false);
          }
        } else {
          console.log("No user logged in");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();

    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) {
        setGreeting("Good Morning");
      } else if (hour < 18) {
        setGreeting("Good Afternoon");
      } else {
        setGreeting("Good Evening");
      }
    };

    updateGreeting();
  }, [acceptedTasks]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {greeting}, Auditor!
      </Text>

      {/* Show ActivityIndicator while loading */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
        </View>
      ) : (
        <ScrollView>
          <View style={styles.cardRow}>
            <TouchableOpacity
              style={[styles.card, styles.completedTasks]}
              onPress={() => navigation.navigate("TodaysTasks")}
            >
              <Ionicons name="calendar" size={30} color="#4A90E2" />
              <Text style={styles.cardTitle}>Today's Tasks</Text>
              <Text style={styles.cardContent}>
                {todaysTasks > 0 ? todaysTasks : "0"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, styles.ongoingTasks]}
              onPress={() => navigation.navigate("Ongoing")}
            >
              <Ionicons name="play-circle" size={30} color="#FFC107" />
              <Text style={styles.cardTitle}>Accepted Tasks</Text>
              <Text style={styles.cardContent}>{ongoingCounter}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subHeader}>Upcoming Audits</Text>
          <View style={styles.upcomingAuditsContainer}>
            {upcomingAudits.length > 0 ? (
              <FlatList
                data={upcomingAudits}
                renderItem={({ item }) => (
                  <View style={styles.auditItem}>
                    <View style={styles.auditContent}>
                      <Text style={styles.auditTitle}>{item.title}</Text>

                      <View style={styles.auditLocationContainer}>
                        <Ionicons name="location-outline" size={16} color="darkblue" style={styles.locationIcon} />
                        <Text style={styles.auditLocation}>
                          {branchesMap[item.branchId]?.city || 'Unknown Location'}
                        </Text>
                      </View>
                      <Text style={styles.auditClient}>
                        {clientsData[item.clientId] || 'Unknown Client'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.seeMoreButton}
                      onPress={() => navigation.navigate('AuditDetails', { audit: item })}
                    >
                      <Text style={styles.seeMoreButtonText}>See More Info</Text>
                    </TouchableOpacity>
                  </View>
                )}
                keyExtractor={(item) => item.id}
              />
            ) : (
              <View style={styles.noAuditsContainer}>
                <Image
                  source={require('./Images/nua.jpg')} // Add your image path here
                  style={styles.noAuditsImage}
                />
                <Text>No upcoming audits available</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  noAuditsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  noAuditsImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  subHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    marginTop: 20,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },
  completedTasks: {
    backgroundColor: "#F4F4F4",
  },
  ongoingTasks: {
    backgroundColor: "#FFF3E0",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
  },
  cardContent: {
    fontSize: 18,
    marginTop: 4,
  },
  auditItem: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#ddd",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 1,
  },
  auditContent: {
    marginBottom: 10,
  },
  auditTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  auditLocationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  locationIcon: {
    marginRight: 5,
  },
  auditLocation: {
    fontSize: 14,
    color: "darkblue",
  },
  auditClient: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  seeMoreButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    alignItems: "center",
  },
  seeMoreButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default HomeScreen;
