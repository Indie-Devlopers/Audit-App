import React, { useState, useEffect, useRef } from "react";
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
import { doc, getDoc, collection, getDocs, onSnapshot } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "./firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';  // Updated import
const HomeScreen = ({ navigation }) => {
  const [ongoingCounter, setOngoingCounter] = useState(0);
  const [upcomingAudits, setUpcomingAudits] = useState([]);
  const [todaysTasks, setTodaysTasks] = useState(0);
  const [acceptedTasks, setAcceptedTasks] = useState([]);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [branchesData, setBranchesData] = useState([]);
  const [clientsData, setClientsData] = useState({});
  const [branchesMap, setBranchesMap] = useState({});
  const unsubscribeAcceptedAuditsRef = useRef(null);
  const unsubscribeAuditsRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          console.log("No user logged in");
          return;
        }
  
        const profileRef = doc(db, "Profile", userId);
        const profileDoc = await getDoc(profileRef);
  
        if (!profileDoc.exists()) {
          console.log("User profile not found");
          return;
        }
  
        const name = profileDoc.data()?.name || "User";
        setUserName(name);
        let acceptedTasksList = [];
  
        // Real-time listener for accepted tasks
        const acceptedAuditsRef = collection(db, "Profile", userId, "acceptedAudits");
        unsubscribeAcceptedAuditsRef.current = onSnapshot(acceptedAuditsRef, async (snapshot) => {
          acceptedTasksList = snapshot.docs.map((doc) => doc.data().auditId);
          setAcceptedTasks(acceptedTasksList);
  
          const today = new Date();
  
          // Calculate counts
          let todayAndPastAuditCount = 0;
          let futureAuditCount = 0;
  
          for (const auditDoc of snapshot.docs) {
            const auditData = auditDoc.data();
          console.log("auditData:::::", auditData)
            const auditRef = doc(db, "audits", auditData.auditId);
            const auditSnapshot = await getDoc(auditRef);
            // const auditSnapshot = await getDoc(auditRef);
        
           
            const auditDataActaul = auditSnapshot.data();
         console.log("auditDataActaul.isSubmitted:::::", auditDataActaul.isSubmitted)
           
            if (auditData.date) {
              const auditDate = new Date(auditData.date);
              if (auditDate <= today) {
                if (!auditDataActaul.isSubmitted){
                todayAndPastAuditCount += 1;}
              } else {
                futureAuditCount += 1;
              }
            }
          }
  
          // Set the counters
          setTodaysTasks(todayAndPastAuditCount);
          setOngoingCounter(futureAuditCount); // Future audits counter
  
          // Fetch upcoming audits whenever accepted tasks change
          const completedTasksList = await fetchCompletedTasks(userId);
          await fetchUpcomingAudits(completedTasksList, acceptedTasksList);
        });
  
        // Real-time listener for audits collection
        const auditsRef = collection(db, "audits");
        unsubscribeAuditsRef.current = onSnapshot(auditsRef, async () => {
          const completedTasksList = await fetchCompletedTasks(userId);
          await fetchUpcomingAudits(completedTasksList, acceptedTasksList);
        });
  
        // Fetch completed tasks
        const completedTasksList = await fetchCompletedTasks(userId);
  
        // Fetch branches and clients
        await fetchBranchesAndClients();
  
        // Fetch upcoming audits initially
        await fetchUpcomingAudits(completedTasksList, acceptedTasksList);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  
    return () => {
      if (unsubscribeAcceptedAuditsRef.current) {
        unsubscribeAcceptedAuditsRef.current();
      }
      if (unsubscribeAuditsRef.current) {
        unsubscribeAuditsRef.current();
      }
    };
  }, []);
  
  const fetchCompletedTasks = async (userId) => {
    const completedAuditsSnapshot = await getDocs(collection(db, "Profile", userId, "completedAudits"));
    return completedAuditsSnapshot.docs.map(doc => doc.data().auditId);
  };

  const fetchBranchesAndClients = async () => {
    const branchesSnapshot = await getDocs(collection(db, "branches"));
    const fetchedBranches = [];
    const branchesLookup = {};
    branchesSnapshot.forEach(doc => {
      const branchData = doc.data();
      fetchedBranches.push(branchData);
      branchesLookup[doc.id] = branchData;
    });
    setBranchesData(fetchedBranches);
    setBranchesMap(branchesLookup);

    const clientsSnapshot = await getDocs(collection(db, "clients"));
    const fetchedClients = {};
    clientsSnapshot.forEach(doc => {
      fetchedClients[doc.id] = doc.data().name;
    });
    setClientsData(fetchedClients);

    console.log("clientsSnapshot:::::::::",fetchedClients)
  };

  const fetchUpcomingAudits = async (completedTasksList, acceptedTasksList) => {
    const auditsSnapshot = await getDocs(collection(db, "audits"));
    const fetchedUpcomingAudits = [];
    auditsSnapshot.forEach(doc => {
      const auditData = doc.data();
      // console.log("auditData:::", auditData)
      if (!auditData.isAccepted && !acceptedTasksList.includes(doc.id) && !completedTasksList.includes(doc.id)) {
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
  };

  return (
    <View style={styles.container}>
<LinearGradient 
  colors={['#00796B', '#00796B99']} // Single teal blue color with adjusted opacity for gradient effect
  style={styles.headerContainer}
>
      <Text style={styles.headerText}>
        Welcome {userName}!
      </Text>
    </LinearGradient>

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
        <View style={styles.cardContentWrapper}>
          <Ionicons name="calendar" size={22} color="#4A90E2" />
          <View style={styles.cardTextWrapper}>
            <Text style={styles.cardTitle}>Today and Past Audits</Text>
            <Text style={styles.cardContent}>
              {todaysTasks > 0 ? todaysTasks : "0"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, styles.ongoingTasks]}
        onPress={() => navigation.navigate("Ongoing")}
      >
        <View style={styles.cardContentWrapper}>
          <Ionicons name="play-circle" size={22} color="#FFC107" />
          <View style={styles.cardTextWrapper}>
            <Text style={styles.cardTitle}>Future Audits</Text>
            <Text style={styles.cardContent}>{ongoingCounter}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
    <Text style={styles.subHeader}>Upcoming Audits</Text>
<View style={styles.upcomingAuditsContainer}>
  {upcomingAudits.length > 0 ? (
    <FlatList
      data={upcomingAudits}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => navigation.navigate('AuditDetails', { audit: item })}
          style={styles.auditCard}
        >
          <View style={styles.cardContainer}>
            {/* Left Side: Building Image */}
            <View style={styles.imageContainer}>
              <Image
                source={require("./Images/building.png")}
                style={styles.image}
              />
            </View>

            {/* Right Side: Client Name and Branch Name */}
            <View style={styles.textContainer}>
              <Text style={styles.auditTitle}>
                {clientsData[item.clientId] || 'Unknown Client'}
              </Text>
              <Text style={styles.branchName}>
                {branchesMap[item.branchId]?.name || 'Unknown Location'}
              </Text>
            </View>

            {/* Location Info */}

          </View>
          <View style={styles.auditLocationContainer}>
              <Ionicons
                name="location-outline"
                size={16}
                color="#4A90E2"
                style={styles.locationIcon}
              />
              <Text style={styles.auditLocation}>
                {branchesMap[item.branchId]?.city || 'Unknown Location'}
              </Text>
            </View>
        </TouchableOpacity>
      )}
      keyExtractor={(item) => item.id}
    />
  ) : (
    <View style={styles.noAuditsContainer}>
      <Image
        source={require('./Images/nua.jpg')}
        style={styles.noAuditsImage}
      />
      <Text style={styles.noAuditsText}>No upcoming audits available</Text>
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
  headerContainer: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    marginHorizontal: 8,
    elevation: 5, // Adds a shadow for Android
    shadowColor: '#000', // Adds a shadow for iOS
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  headerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'sans-serif-medium', // Customize the font family
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
    textAlign:"center",
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





  upcomingAuditsContainer:{
    padding:10
  },
  screenConatiner:{
    padding: 15
  },
  cardContainer: {
    flexDirection: "row", // Align image and text side by side
    alignItems: "center",
    padding: 15,
    paddingBottom: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#007FFF",
    borderRadius: 10,
    backgroundColor: "#fff",
   // elevation: 5, // Shadow for Android

  },
  imageContainer: {
    marginRight: 15, // Add space between image and text
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 5, // Rounded corners for image
  },
  textContainer: {
    flex: 1, // Take up remaining space
    justifyContent: "center",
  },
  clientName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  branchName: {
    fontSize: 16,
    color: "#555",
  },









  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 15,
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  completedTasks: {
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  ongoingTasks: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  cardContentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTextWrapper: {
    marginLeft: 10,
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cardContent: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },









  subHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E3A59',
    marginVertical: 15,
  },
  upcomingAuditsContainer: {
    marginBottom: 20,
  },
  auditCard: {
    marginBottom: 15,
    marginHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2, // For Android shadow
  },
  cardContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom:8,
    alignItems: 'center',
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  textContainer: {
    flex: 1,
    marginLeft: 15,
  },
  auditTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E3A59',
  },
  branchName: {
    fontSize: 14,
    color: '#808080',
    marginTop: 5,
  },
  auditLocationContainer: {
    padding: 12,
    paddingTop: 0,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  locationIcon: {
    marginRight: 5,
  },
  auditLocation: {
    fontSize: 14,
    color: '#4A90E2',
  },
  noAuditsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  noAuditsImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  noAuditsText: {
    fontSize: 16,
    color: '#808080',
    textAlign: 'center',
  },

    subHeader: {
      fontSize: 18, // Slightly larger for prominence
      fontWeight: '600', // Semi-bold for modern aesthetic
      color: '', // White text for high contrast and clarity
      marginHorizontal: 15,
      marginVertical:10,
       // Adds space above and below for balance
      textAlign: 'left', //left Center the text for a clean, symmetric look
      
    },

});

export default HomeScreen;