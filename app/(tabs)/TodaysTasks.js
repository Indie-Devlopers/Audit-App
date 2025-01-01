// import React, { useState, useEffect } from "react";
// import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, Image, ActivityIndicator } from "react-native";
// import { getFirestore, doc, getDoc, getDocs, collection, updateDoc } from "firebase/firestore";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { app } from "./firebaseConfig"; // Your Firebase config file
// import MaterialIcons from "react-native-vector-icons/MaterialIcons";
// import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import moment from 'moment'; // Import moment.js for date formatting

// const db = getFirestore(app);

// export default function TodaysTasks({ navigation }) {
//   const [todaysAudits, setTodaysAudits] = useState([]);
//   const [loading, setLoading] = useState(true);  // State to manage loading status
//   const todayDate = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

//   useEffect(() => {
//     const getUserId = async () => {
//       try {
//         const userId = await AsyncStorage.getItem("userId");
//         if (userId) {
//           console.log("Retrieved User ID:", userId);
//           fetchTodaysAudits(userId);
//         } else {
//           console.error("User ID not found in AsyncStorage");
//         }
//       } catch (error) {
//         console.error("Error fetching user ID:", error);
//       }
//     };

//     getUserId();
//   }, []);

//   const fetchTodaysAudits = async (userId) => {
//     try {
//       console.log("Fetching audits for date:", todayDate);

//       const userRef = doc(db, "Profile", userId);
//       const acceptedAuditsRef = collection(userRef, "acceptedAudits");
//       const acceptedAuditsSnapshot = await getDocs(acceptedAuditsRef);

//       const audits = [];

//       for (const auditDoc of acceptedAuditsSnapshot.docs) {
//         const { auditId } = auditDoc.data();

//         // Fetch audit details
//         const auditRef = doc(db, "audits", auditId);
//         const auditSnapshot = await getDoc(auditRef);
//         if (!auditSnapshot.exists()) continue;
//         const auditData = auditSnapshot.data();

//         // Fetch branch details
//         const branchRef = doc(db, "branches", auditData.branchId);
//         const branchSnapshot = await getDoc(branchRef);
//         const branchDetails = branchSnapshot.exists() ? branchSnapshot.data() : {};

//         // Fetch client details
//         const clientRef = doc(db, "clients", auditData.clientId);
//         const clientSnapshot = await getDoc(clientRef);
//         const clientDetails = clientSnapshot.exists() ? clientSnapshot.data() : {};

//         audits.push({
//           id: auditId,
//           ...auditData,
//           branchDetails,
//           clientDetails,
//         });
//       }

//       setTodaysAudits(audits);
//       setLoading(false); // Set loading to false once data is fetched
//     } catch (error) {
//       console.error("Error fetching today's audits:", error);
//       setLoading(false); // Ensure loading state is turned off in case of error
//     }
//   };

//   const handleGenerateReport = (auditId, auditName) => {
//     navigation.navigate("ReportScreen", { auditId, auditName });
//   };

//   const handleComplete = async (audit) => {
//     try {
//       const auditRef = doc(db, "audits", audit.id);
//       await updateDoc(auditRef, { isComplete: true });

//       Alert.alert("Task Completed", "This task has been marked as completed.");
//       fetchTodaysAudits(await AsyncStorage.getItem("userId")); // Refresh the list of today's audits
//     } catch (error) {
//       console.error("Error completing audit:", error);
//     }
//   };

//   const renderAudit = ({ item: audit }) => (
//     <View style={styles.auditCard}>
//       {/* Header Section */}
//       <View style={styles.header}>
//         <Image
//           source={require("./Images/building.png")}
//           style={{ width: 34, height: 34 }}
//         />
//         <View style={styles.title}>
//           <Text style={styles.companyName}>{audit.clientDetails?.name || "Client Name"}</Text>
//           <Text style={styles.branchName}>{audit.branchDetails?.name || "Branch Name"}</Text>
//         </View>
//       </View>

//       {/* Details Section */}
//       <View style={styles.details}>
//         <View style={styles.detail}>
//           <MaterialIcons name="location-on" size={24} color="#189ab4" />
//           <Text style={styles.detailText}>{audit.branchDetails?.city || "City Not Specified"}</Text>
//         </View>
//         <View style={styles.detail}>
//           <MaterialCommunityIcons name="shield-search" size={24} color="#189ab4" />
//           <Text style={styles.detailText}>{audit.auditType || "Audit Type Not Specified"}</Text>
//         </View>
//         <View style={styles.detail}>
//           <MaterialIcons name="event" size={24} color="#189ab4" />
//           <Text style={styles.detailText}>
//             Date: {moment().format('YYYY-MM-DD')}
//           </Text>
//         </View>
//       </View>

//       {/* Button Section */}
//       <View style={styles.buttonContainer}>
        

//         <TouchableOpacity  onPress={() => handleGenerateReport(audit.id, audit.auditName)}>
//           <Image
//             source={require("./Images/Accept.png")}
//             style={styles.completeButtonImage}
//           />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       {loading ? (
//         // Activity Indicator while data is loading
//         <ActivityIndicator size="large" color="#189ab4" style={styles.loader} />
//       ) : todaysAudits.length === 0 ? (
//         <Text style={styles.noAuditsText}>No audits for today</Text>
//       ) : (
//         <FlatList
//           data={todaysAudits}
//           renderItem={renderAudit}
//           keyExtractor={(item) => item.id}
//         />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f8f8f8",
//     padding: 10,
//   },
//   loader: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     height: "100%",
//   },
//   auditCard: {
//     backgroundColor: "#fff",
//     padding: 15,
//     marginVertical: 8,
//     borderRadius: 8,
//     elevation: 2,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   title: {
//     marginLeft: 10,
//   },
//   companyName: {
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   branchName: {
//     fontSize: 14,
//     color: "#555",
//   },
//   details: {
//     marginVertical: 8,
//   },
//   detail: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 6,
//   },
//   detailText: {
//     marginLeft: 8,
//     fontSize: 14,
//     color: "#555",
//   },
//   buttonContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 10,
//   },
//   button: {
//     backgroundColor: "white",
//     padding: 7,
//     borderRadius: 5,
//     flex: 1,
//     borderWidth: 2,
//     borderColor: "green",
//     marginHorizontal: 3,
//     alignItems: "center",
//     flexDirection: "row",
//     justifyContent: "center",
//   },
//   buttonText: {
//     marginLeft: 8,
//     color: "green",
//     fontSize: 14,
//   },
//   completeButtonImage: {
//     width: 180,
//     height: 50,
//     resizeMode: "contain",
//   },
//   noAuditsText: {
//     fontSize: 18,
//     color: "#555",
//     textAlign: "center",
//     marginTop: 20,
//   },
// });





import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, Image, ActivityIndicator } from "react-native";
import { getFirestore, doc, getDoc, getDocs, collection, updateDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { app } from "./firebaseConfig"; // Your Firebase config file
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import moment from 'moment'; // Import moment.js for date formatting

const db = getFirestore(app);

export default function TodaysTasks({ navigation }) {
  const [todaysAudits, setTodaysAudits] = useState([]);
  const [loading, setLoading] = useState(true); // State to manage loading status
  const todayDate = moment().format('DD-MM-YYYY');

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
  const getTodayDateInIST = () => {
    const date = new Date();
    const offset = 5.5 * 60 * 60 * 1000; // IST offset (UTC +5:30)
    const adjustedDate = new Date(date.getTime() + offset); // Adjusting to IST
  
    // Return the date in "YYYY-MM-DD" format (without time part)
    return adjustedDate.toISOString().split("T")[0];
  };

  const fetchTodaysAudits = async (userId) => {
    try {
      const todayDate = getTodayDateInIST(); // Get today's date in IST
      console.log("Fetching audits for date:", todayDate);
  
      const userRef = doc(db, "Profile", userId);
      const acceptedAuditsRef = collection(userRef, "acceptedAudits");
      const acceptedAuditsSnapshot = await getDocs(acceptedAuditsRef);
  
      const audits = [];
  
      for (const auditDoc of acceptedAuditsSnapshot.docs) {
        const { auditId, date } = auditDoc.data();
  
        // Only include audits scheduled for today
        if (date === todayDate) {
          // Fetch audit details
          const auditRef = doc(db, "audits", auditId);
          const auditSnapshot = await getDoc(auditRef);
          if (!auditSnapshot.exists()) continue;
          const auditData = auditSnapshot.data();
  
          // Fetch branch details
          const branchRef = doc(db, "branches", auditData.branchId);
          const branchSnapshot = await getDoc(branchRef);
          const branchDetails = branchSnapshot.exists() ? branchSnapshot.data() : {};
  
          // Fetch client details
          const clientRef = doc(db, "clients", auditData.clientId);
          const clientSnapshot = await getDoc(clientRef);
          const clientDetails = clientSnapshot.exists() ? clientSnapshot.data() : {};
  
          audits.push({
            id: auditId,
            ...auditData,
            branchDetails,
            clientDetails,
          });
        }
      }
  
      setTodaysAudits(audits);
      setLoading(false); // Set loading to false once data is fetched
    } catch (error) {
      console.error("Error fetching today's audits:", error);
      setLoading(false); // Ensure loading state is turned off in case of error
    }
  };
     
          

  const handleGenerateReport = (auditId, auditName) => {
    navigation.navigate("ReportScreen", { auditId, auditName });
  };

  const renderAudit = ({ item: audit }) => (
    <View style={styles.auditCard}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image
          source={require("./Images/building.png")}
          style={{ width: 34, height: 34 }}
        />
        <View style={styles.title}>
          <Text style={styles.companyName}>{audit.clientDetails?.name || "Client Name"}</Text>
          <Text style={styles.branchName}>{audit.branchDetails?.name || "Branch Name"}</Text>
        </View>
      </View>

      {/* Details Section */}
      <View style={styles.details}>
        <View style={styles.detail}>
          <MaterialIcons name="location-on" size={24} color="#189ab4" />
          <Text style={styles.detailText}>{audit.branchDetails?.city || "City Not Specified"}</Text>
        </View>
        <View style={styles.detail}>
          <MaterialCommunityIcons name="shield-search" size={24} color="#189ab4" />
          <Text style={styles.detailText}>{audit.auditType || "Audit Type Not Specified"}</Text>
        </View>
        <View style={styles.detail}>
          <MaterialIcons name="event" size={24} color="#189ab4" />
          <Text style={styles.detailText}>
            Date: {todayDate}
          </Text>
        </View>
      </View>

      {/* Button Section */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => handleGenerateReport(audit.id, audit.auditName)}>
          <Image
            source={require("./Images/Accept.png")}
            style={styles.completeButtonImage}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        // Activity Indicator while data is loading
        <ActivityIndicator size="large" color="#189ab4" style={styles.loader} />
      ) : todaysAudits.length === 0 ? (
        <Text style={styles.noAuditsText}>No audits for today</Text>
      ) : (
        <FlatList
          data={todaysAudits}
          renderItem={renderAudit}
          keyExtractor={(item) => item.id}
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
});
