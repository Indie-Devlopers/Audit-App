import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  Alert,
  BackHandler
} from "react-native";
import { doc, getDoc, collection, getDocs, onSnapshot, query, where } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "./firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';
import 'moment-timezone';
import { useFocusEffect, useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
moment.tz.setDefault("Asia/Kolkata"); // Set Indian timezone

const HomeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();
  const [ongoingCounter, setOngoingCounter] = useState(0);
  const [upcomingAudits, setUpcomingAudits] = useState([]);
  const [todaysTasks, setTodaysTasks] = useState(0);
  const [notSubmittedCounter, setNotSubmittedCounter] = useState(0);
  const [incompleteCount, setIncompleteCount] = useState(0);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [branchesData, setBranchesData] = useState([]);
  const [clientsData, setClientsData] = useState({});
  const [branchesMap, setBranchesMap] = useState({});

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          console.log("No user logged in");
          return;
        }

        // Fetch user name
        const profileRef = doc(db, "Profile", userId);
        const profileDoc = await getDoc(profileRef);
        if (profileDoc.exists()) {
          const name = profileDoc.data()?.name || "User";
          setUserName(name);
        }

        // Fetch all data in parallel
        await Promise.all([
          fetchBranchesAndClients(),
          fetchCounters(),
          fetchUpcomingAudits()
        ]);

      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      const refreshData = async () => {
        try {
          await Promise.all([
            fetchCounters(),
            fetchUpcomingAudits()
          ]);
        } catch (error) {
          console.error("Error refreshing data:", error);
        }
      };

      refreshData();
    }, [])
  );

  useEffect(() => {
    const backAction = () => {
      if (isFocused) {
        Alert.alert(
          'Exit App',
          'Are you sure you want to exit?',
          [
            {
              text: 'Cancel',
              onPress: () => null,
              style: 'cancel',
            },
            {
              text: 'Exit',
              onPress: () => BackHandler.exitApp(),
              style: 'destructive',
            },
          ],
          { cancelable: false }
        );
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [isFocused]);

  const fetchCounters = async () => {
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const today = moment().tz("Asia/Kolkata").startOf('day');
      const acceptedAuditsRef = collection(db, "Profile", userId, "acceptedAudits");
      const acceptedSnapshot = await getDocs(acceptedAuditsRef);
      
      let notSubmittedCount = 0;
      let incompleteCount = 0;
      let todayCount = 0;
      let futureCount = 0;

      // Get all accepted audits data at once
      const auditsPromises = acceptedSnapshot.docs.map(async (acceptedDoc) => {
        const acceptedData = acceptedDoc.data();
        const auditRef = doc(db, "audits", acceptedData.auditId);
        return getDoc(auditRef);
      });

      const auditSnapshots = await Promise.all(auditsPromises);

      // Process each audit
      acceptedSnapshot.docs.forEach((acceptedDoc, index) => {
        const acceptedData = acceptedDoc.data();
        const auditSnap = auditSnapshots[index];
        
        if (!auditSnap.exists()) return;

        const acceptedDate = moment(acceptedData.date).tz("Asia/Kolkata").startOf('day');
        const auditData = auditSnap.data();

        // Count today's and future audits
        if (acceptedDate.isSame(today, 'day')) {
          todayCount++;
        } else if (acceptedDate.isAfter(today)) {
          futureCount++;
          return; // Skip future audits for not submitted/incomplete counts
        }

        const reportDate = auditData.reportDate || [
          { type: 'scanDate', date: null, isSubmitted: false },
          { type: 'hardCopyDate', date: null, isSubmitted: false },
          { type: 'softCopyDate', date: null, isSubmitted: false },
          { type: 'photoDate', date: null, isSubmitted: false }
        ];

        const submittedCount = reportDate.filter(report => report.isSubmitted).length;

        if (submittedCount === 0) {
          notSubmittedCount++;
        } else if (submittedCount > 0 && submittedCount < 4) {
          incompleteCount++;
        }
      });

      setTodaysTasks(todayCount);
      setOngoingCounter(futureCount);
      setNotSubmittedCounter(notSubmittedCount);
      setIncompleteCount(incompleteCount);

    } catch (error) {
      console.error("Error fetching counters:", error);
    } finally {
      setLoading(false);
    }
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

    // console.log("clientsSnapshot:::::::::",fetchedClients)
  };

  const fetchUpcomingAudits = async () => {
    try {
      // Get user's accepted audits
      const userId = await AsyncStorage.getItem("userId");
      const acceptedAuditsRef = collection(db, "Profile", userId, "acceptedAudits");
      const acceptedAuditsSnapshot = await getDocs(acceptedAuditsRef);
      const acceptedAuditIds = acceptedAuditsSnapshot.docs.map(doc => doc.data().auditId);

      // Get all audits
      const auditsSnapshot = await getDocs(collection(db, "audits"));
      const fetchedUpcomingAudits = [];

      // Process each audit
      for (const doc of auditsSnapshot.docs) {
        const auditData = doc.data();
        const auditId = doc.id;

        // Show audit if:
        // 1. auditId is NOT in acceptedAudits collection OR
        // 2. isSubmitted is true
        if (!acceptedAuditIds.includes(auditId) && !auditData.isSubmitted) {
          fetchedUpcomingAudits.push({
            id: auditId,
            title: auditData.title,
            city: auditData.city,
            date: auditData.date,
            branchId: auditData.branchId,
            clientId: auditData.clientId,
          });
        }
      }

      setUpcomingAudits(fetchedUpcomingAudits);
    } catch (error) {
      console.error("Error fetching upcoming audits:", error);
    }
  };

  const CardGradient = ({ colors, children, onPress, style }) => (
    <TouchableOpacity style={[styles.cardBase, style]} onPress={onPress}>
      <LinearGradient
        colors={colors}
        style={styles.gradientContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {children}
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderAudit = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('AuditDetails', { audit: item })}
      style={styles.auditCard}
    >
      <LinearGradient
        colors={['#ffffff', '#f8f9fa']}
        style={styles.cardGradient}
      >
        <View style={styles.cardContent}>
          <View style={styles.imageContainer}>
            <LinearGradient
              colors={['#4A90E2', '#357ABD']}
              style={styles.imageGradient}
            >
              <Ionicons name="business" size={24} color="#fff" />
            </LinearGradient>
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.auditTitle} numberOfLines={1}>
              {clientsData[item.clientId] || 'Unknown Client'}
            </Text>
            <Text style={styles.branchName} numberOfLines={1}>
              {branchesMap[item.branchId]?.name || 'Unknown Location'}
            </Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={14} color="#4A90E2" />
              <Text style={styles.locationText} numberOfLines={1}>
                {branchesMap[item.branchId]?.city || 'Unknown City'}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerFixed}>
      <LinearGradient 
        colors={['#00796B', '#00796B99']}
        style={styles.headerContainer}
      >
        <Text style={styles.headerText}>
          Welcome {userName}!
        </Text>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <View style={styles.cardRow}>
          <CardGradient
            colors={['#00796B', '#004D40']}
            onPress={() => navigation.navigate("TodaysTasks")}
            style={styles.cardShadow}
          >
            <View style={styles.cardContentWrapper}>
              <View style={styles.iconContainer}>
                <Ionicons name="calendar" size={24} color="#fff" />
              </View>
              <View style={styles.cardTextWrapper}>
                <Text style={styles.cardTitle}>Today's Audits</Text>
                <Text style={styles.cardCounter}>{todaysTasks > 0 ? todaysTasks : "0"}</Text>
              </View>
            </View>
          </CardGradient>

          <CardGradient
            colors={['#1976D2', '#0D47A1']}
            onPress={() => navigation.navigate("Ongoing")}
            style={styles.cardShadow}
          >
            <View style={styles.cardContentWrapper}>
              <View style={styles.iconContainer}>
                <Ionicons name="play-circle" size={24} color="#fff" />
              </View>
              <View style={styles.cardTextWrapper}>
                <Text style={styles.cardTitle}>Future Audits</Text>
                <Text style={styles.cardCounter}>{ongoingCounter}</Text>
              </View>
            </View>
          </CardGradient>
        </View>

        <View style={styles.cardRow}>
          <CardGradient
            colors={['#E53935', '#C62828']}
            onPress={() => navigation.navigate("NotSubmitted")}
            style={styles.cardShadow}
          >
            <View style={styles.cardContentWrapper}>
              <View style={styles.iconContainer}>
                <Ionicons name="alert-circle" size={24} color="#fff" />
              </View>
              <View style={styles.cardTextWrapper}>
                <Text style={styles.cardTitle}>Not Submitted</Text>
                <Text style={styles.cardCounter}>{notSubmittedCounter}</Text>
              </View>
            </View>
          </CardGradient>

          <CardGradient
            colors={['#FF9800', '#F57C00']}
            onPress={() => navigation.navigate("IncompleteTasks")}
            style={styles.cardShadow}
          >
            <View style={styles.cardContentWrapper}>
              <View style={styles.iconContainer}>
                <Ionicons name="warning-outline" size={24} color="#fff" />
              </View>
              <View style={styles.cardTextWrapper}>
                <Text style={styles.cardTitle}>Half Submitted</Text>
                <Text style={styles.cardCounter}>{incompleteCount}</Text>
              </View>
            </View>
          </CardGradient>
        </View>
      </View>

      <View style={styles.upcomingSection}>
        <View style={styles.upcomingHeader}>
          <Text style={styles.sectionTitle}>Available Audits</Text>
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('UpcomingAudits')}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyUpcoming = () => (
    <View style={styles.noAuditsContainer}>
      <MaterialIcons name="event-busy" size={64} color="#666" />
      <Text style={styles.noAuditsText}>No upcoming audits available</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
        </View>
      ) : (
        <>
          {renderHeader()}
          <FlatList
            data={upcomingAudits}
            renderItem={renderAudit}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyUpcoming}
            style={styles.flatListStyle}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  headerFixed: {
    backgroundColor: "#f5f7fa",
    zIndex: 1,
  },
  headerContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  statsContainer: {
    padding: 10,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 15,
    marginVertical: 8,
  },
  cardBase: {
    width: '48%',
    borderRadius: 15,
    overflow: 'hidden',
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  gradientContainer: {
    padding: 15,
    borderRadius: 15,
  },
  cardContentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTextWrapper: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    opacity: 0.9,
    marginBottom: 4,
  },
  cardCounter: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  upcomingSection: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: '#f5f7fa',
  },
  upcomingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  viewAllButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#00796B',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  flatListStyle: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContainer: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  auditCard: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardGradient: {
    borderRadius: 16,
    padding: 16,
  },
  imageContainer: {
    width: 50,
    height: 50,
    marginRight: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  auditTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 6,
  },
  branchName: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 8,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  locationText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 4,
    fontWeight: '500',
  },
  noAuditsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noAuditsText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
});

export default HomeScreen;