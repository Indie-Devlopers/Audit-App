// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   FlatList,
// } from "react-native";
// import { doc, getDoc, collection, getDocs } from "firebase/firestore";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { db } from "./firebaseConfig";
// import { Ionicons } from "@expo/vector-icons";

// const HomeScreen = ({ navigation }) => {
//   const [ongoingCounter, setOngoingCounter] = useState(0);
//   const [upcomingAudits, setUpcomingAudits] = useState([]);
//   const [todaysTasks, setTodaysTasks] = useState(0);
//   const [acceptedTasks, setAcceptedTasks] = useState([]);
//   const [userName, setUserName] = useState("");
//   const [greeting, setGreeting] = useState("");
//   const [branchesData, setBranchesData] = useState([]);
//   const [clientsData, setClientsData] = useState({});
//   const isDataFetched = useRef(false); // To prevent redundant calls

//   // Function to fetch user profile
//   const fetchUserProfile = async (userId) => {
//     try {
//       const profileRef = doc(db, "Profile", userId);
//       const profileDoc = await getDoc(profileRef);

//       if (profileDoc.exists()) {
//         const profileData = profileDoc.data();
//         setOngoingCounter(profileData?.ongoingCounter || 0);
//         setUserName(profileData?.name || "User");
//       } else {
//         console.log("User profile not found");
//       }
//     } catch (error) {
//       console.error("Error fetching user profile:", error);
//     }
//   };

//   // Function to fetch accepted tasks
//   const fetchAcceptedTasks = async (userId) => {
//     try {
//       const acceptedAuditsSnapshot = await getDocs(
//         collection(db, "Profile", userId, "acceptedAudits")
//       );
//       const tasks = [];
//       let todayCount = 0;

//       const today = new Date();
//       acceptedAuditsSnapshot.forEach((doc) => {
//         const auditData = doc.data();
//         tasks.push(auditData.auditId);

//         const auditDate = new Date(auditData.date);
//         if (
//           auditDate.getFullYear() === today.getFullYear() &&
//           auditDate.getMonth() === today.getMonth() &&
//           auditDate.getDate() === today.getDate()
//         ) {
//           todayCount++;
//         }
//       });

//       setAcceptedTasks(tasks);
//       setTodaysTasks(todayCount);
//     } catch (error) {
//       console.error("Error fetching accepted tasks:", error);
//     }
//   };

//   // Function to fetch upcoming audits
//   const fetchUpcomingAudits = async (acceptedTasksList) => {
//     try {
//       const auditsSnapshot = await getDocs(collection(db, "audits"));
//       const upcoming = [];

//       auditsSnapshot.forEach((doc) => {
//         const auditData = doc.data();
//         if (!auditData.isAccepted && !acceptedTasksList.includes(doc.id)) {
//           upcoming.push({
//             id: doc.id,
//             title: auditData.title,
//             city: auditData.city,
//             date: auditData.date,
//             branchId: auditData.branchId,
//             clientId: auditData.clientId,
//           });
//         }
//       });

//       setUpcomingAudits(upcoming);
//       console.log("upcoming", upcoming)
//     } catch (error) {
//       console.error("Error fetching upcoming audits:", error);
//     }
//   };

//   // Function to fetch all required data
//   const fetchData = async () => {
//     try {
//       if (isDataFetched.current) return; // Prevent multiple fetches
//       isDataFetched.current = true;

//       const userId = await AsyncStorage.getItem("userId");
//       if (userId) {
//         await fetchUserProfile(userId);
//         await fetchAcceptedTasks(userId);
//       } else {
//         console.log("No user logged in");
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   // Set greeting based on the time
//   const updateGreeting = () => {
//     const hour = new Date().getHours();
//     if (hour < 12) {
//       setGreeting("Good Morning");
//     } else if (hour < 18) {
//       setGreeting("Good Afternoon");
//     } else {
//       setGreeting("Good Evening");
//     }
//   };

//   useEffect(() => {
//     fetchData();
//     updateGreeting();
//   }, []); // Empty dependency array to run only once

//   useEffect(() => {
//     fetchUpcomingAudits(acceptedTasks);
//   }, [acceptedTasks]); // Fetch upcoming audits only when accepted tasks change

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>{greeting}, Auditor!</Text>
//       <ScrollView>
//         <View style={styles.cardRow}>
//           <TouchableOpacity
//             style={[styles.card, styles.completedTasks]}
//             onPress={() => navigation.navigate("TodaysTasks")}
//           >
//             <Ionicons name="calendar" size={30} color="#4A90E2" />
//             <Text style={styles.cardTitle}>Today's Tasks</Text>
//             <Text style={styles.cardContent}>
//               {todaysTasks > 0 ? todaysTasks : "0"}
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.card, styles.ongoingTasks]}
//             onPress={() => navigation.navigate("Ongoing")}
//           >
//             <Ionicons name="play-circle" size={30} color="#FFC107" />
//             <Text style={styles.cardTitle}>Accepted Tasks</Text>
//             <Text style={styles.cardContent}>{ongoingCounter}</Text>
//           </TouchableOpacity>
//         </View>

//         <Text style={styles.subHeader}>Upcoming Audits</Text>
//         <View style={styles.upcomingAuditsContainer}>
//           {upcomingAudits.length > 0 ? (
//             <FlatList
//               data={upcomingAudits}
//               renderItem={({ item }) => (
//                 <View style={styles.auditItem}>
//                   <Ionicons name="document-text" size={24} color="#4A90E2" />
//                   <View style={styles.auditContent}>
//                     <Text style={styles.auditTitle}>{item.title}</Text>
//                     <Text style={styles.auditCity}>City: {item.city}</Text>
//                     <Text style={styles.auditDate}>Date: {item.date}</Text>
//                     <Text style={styles.auditClient}>
//                       Client: {clientsData[item.clientId] || "Unknown"}
//                     </Text>
//                   </View>
//                   <TouchableOpacity
//                     style={styles.seeMoreButton}
//                     onPress={() =>
//                       navigation.navigate("AuditDetails", { audit: item })
//                     }
//                   >
//                     <Text style={styles.seeMoreButtonText}>See More </Text>
//                   </TouchableOpacity>
//                 </View>
//               )}
//               keyExtractor={(item) => item.id}
//             />
//           ) : (
//             <Text>No upcoming audits available</Text>
//           )}
//         </View>
//       </ScrollView>
//     </View>
//   );
// };



// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 16,
//     backgroundColor: "#fff",
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 20,
//     color: "#333",
//   },
//   subHeader: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 10,
//     color: "#333",
//     marginTop: 20,
//   },
//   cardRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 20,
//   },

//   subHeader: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   upcomingAuditsContainer: {
//     paddingHorizontal: 10,
//   },
//   auditItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//     padding: 10,
//     backgroundColor: '#f9f9f9',
//     borderRadius: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   auditContent: {
//     marginLeft: 10,
//     flex: 1,
//   },
//   auditTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   auditCity: {
//     fontSize: 14,
//     color: '#555',
//   },
//   auditDate: {
//     fontSize: 14,
//     color: '#555',
//   },
//   auditLocationContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   auditLocation: {
//     fontSize: 14,
//     color: '#555',
//     marginLeft: 5,
//   },
//   auditClient: {
//     fontSize: 14,
//     color: '#555',
//   },
//   seeMoreButton: {
//     marginTop: 10,
//     flexDirection: 'row',
//     justifyContent: "flex-end",
   
//     marginLeft: 100,
//     paddingVertical: 5,
//     paddingHorizontal: 10,
//     backgroundColor: '#4A90E2',
//     borderRadius: 5,
//   },
//   seeMoreButtonText: {
//     color: '#fff',
//     fontSize: 14,
//   },


//   card: {
//     flex: 1,
//     backgroundColor: "#FFFFFF",
//     borderRadius: 12,
//     padding: 16,
//     marginHorizontal: 8,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOpacity: 0.2,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   completedTasks: {
//     backgroundColor: "#EAF4FF",
//   },
//   ongoingTasks: {
//     backgroundColor: "#FFF4E5",
//   },
//   cardTitle: {
//     fontSize: 16,
//     textAlign: "center",
//     marginBottom: 8,
//     color: "#000",
//   },
//   cardContent: {
//     fontSize: 16,
//     color: "#000",
//     textAlign: "center",
//   },
//   auditItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 10,
//     backgroundColor: "#f0f8ff",
//     padding: 10,
//     borderRadius: 8,
//   },
//   auditContent: {
//     marginLeft: 10,
//   },
//   auditTitle: {
//     fontWeight: "bold",
//     fontSize: 16,
//     color: "#4A90E2", // Blue for the audit title
//   },
//   auditCity: {
//     fontSize: 14,
//     color: "#333",
//   },
//   auditDate: {
//     fontSize: 14,
//     color: "#333",
//   },
// });



// export default HomeScreen;
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "./firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

const HomeScreen = ({ navigation }) => {
  const [ongoingCounter, setOngoingCounter] = useState(0);
  const [upcomingAudits, setUpcomingAudits] = useState([]);
  const [todaysTasks, setTodaysTasks] = useState(0);
  const [acceptedTasks, setAcceptedTasks] = useState([]);
  const [userName, setUserName] = useState("");
  const [greeting, setGreeting] = useState("");
  const [branchesData, setBranchesData] = useState([]);
  const [clientsData, setClientsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [branchesMap, setBranchesMap] = useState({});

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

            const name = profileDoc.data()?.name || "User";
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

            const branchesSnapshot = await getDocs(collection(db, "branches"));
            const fetchedBranches = [];
            const branchesLookup = {};
            branchesSnapshot.forEach((doc) => {
              const branchData = doc.data();
              fetchedBranches.push(branchData);
              branchesLookup[doc.id] = branchData;
            });
            setBranchesData(fetchedBranches);
            setBranchesMap(branchesLookup);

            const clientsSnapshot = await getDocs(collection(db, "clients"));
            const fetchedClients = {};
            clientsSnapshot.forEach((doc) => {
              fetchedClients[doc.id] = doc.data().name;
            });
            setClientsData(fetchedClients);

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
      <Text style={styles.header}>{greeting}, Auditor!</Text>

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
                    <View style={styles.auditRow}>
                      <View style={styles.auditLeft}>
                        <Text style={styles.auditTitle}>{item.title}</Text>
                        <View style={styles.auditLocationContainer}>
                          <Ionicons
                            name="location-outline"
                            size={16}
                            color="darkblue"
                            style={styles.locationIcon}
                          />
                          <Text style={styles.auditLocation}>
                            {branchesMap[item.branchId]?.city ||
                              "Unknown Location"}
                          </Text>
                        </View>
                        <Text style={styles.auditClient}>
                          {clientsData[item.clientId] || "Unknown Client"}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.seeMoreButton}
                        onPress={() =>
                          navigation.navigate("AuditDetails", { audit: item })
                        }
                      >
                        <Text style={styles.seeMoreButtonText}>
                          See More 
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                keyExtractor={(item) => item.id}
              />
            ) : (
              <View style={styles.noAuditsContainer}>
                <Image
                  source={require("./Images/nua.jpg")}
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
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  noAuditsImage: {
    width: 150,
    height: 150,
    resizeMode: "contain",
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
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  auditRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  auditLeft: {
    flex: 1,
  },
  auditTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  auditLocationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationIcon: {
    marginRight: 4,
  },
  auditLocation: {
    fontSize: 14,
    color: "gray",
  },
  auditClient: {
    fontSize: 14,
    marginLeft:18,
    color: "gray",
    marginTop: 4,
  },
  seeMoreButton: {
    alignSelf: "flex-start",
    backgroundColor: "#4A90E2",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  seeMoreButtonText: {
    color: "#fff",
    fontWeight: "bold",
   
  },
  upcomingAuditsContainer: {
    marginTop: 10,
  },
});

export default HomeScreen;
