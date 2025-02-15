import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { doc, getDoc, collection, getDocs, onSnapshot, query, where } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "./firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';
import 'moment-timezone';
import { useFocusEffect } from '@react-navigation/native';
moment.tz.setDefault("Asia/Kolkata"); // Set Indian timezone

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
  const [notSubmittedCounter, setNotSubmittedCounter] = useState(0);
  const [incompleteCount, setIncompleteCount] = useState(0);
  const unsubscribeAcceptedAuditsRef = useRef(null);
  const unsubscribeAuditsRef = useRef(null);

  const fetchIncompleteCount = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;

      let incompleteCounter = 0;
      let notSubmittedCounter = 0;

      // Get accepted audits
      const acceptedAuditsRef = collection(db, "Profile", userId, "acceptedAudits");
      const acceptedSnapshot = await getDocs(acceptedAuditsRef);

      // Get today's date at start of day in IST
      const today = moment().tz("Asia/Kolkata").startOf('day');

      // Process each accepted audit
      for (const acceptedDoc of acceptedSnapshot.docs) {
        const acceptedData = acceptedDoc.data();
        const auditId = acceptedData.auditId;
        const acceptedDate = moment(acceptedData.date).tz("Asia/Kolkata").startOf('day');

        // Get the audit details
        const auditRef = doc(db, "audits", auditId);
        const auditSnap = await getDoc(auditRef);

        if (!auditSnap.exists()) continue;

        const auditData = auditSnap.data();

        // Skip if audit is completed
        if (auditData.isCompleted) continue;

        // Get reportDate array
        const reportDate = auditData.reportDate || [
          { type: 'scanDate', date: null, isSubmitted: false, submittedBy: '' },
          { type: 'hardCopyDate', date: null, isSubmitted: false, submittedBy: '' },
          { type: 'softCopyDate', date: null, isSubmitted: false, submittedBy: '' },
          { type: 'photoDate', date: null, isSubmitted: false, submittedBy: '' }
        ];

        // Count submitted reports
        const submittedCount = reportDate.filter(report => report.isSubmitted).length;

        // For not submitted counter: audit date is today or past AND no reports submitted
        if (!acceptedDate.isAfter(today) && submittedCount === 0) {
          notSubmittedCounter++;
        }
        // For incomplete counter: at least one report submitted but not all
        else if (submittedCount > 0 && submittedCount < reportDate.length) {
          incompleteCounter++;
        }
      }

      setIncompleteCount(incompleteCounter);
      setNotSubmittedCounter(notSubmittedCounter);
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  }, []);

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
          const acceptedAudits = snapshot.docs.map((doc) => doc.data());
          const acceptedAuditIds = acceptedAudits.map(audit => audit.auditId);
          setAcceptedTasks(acceptedAuditIds);
  
          // Get today's date in Indian timezone
          const today = moment().tz("Asia/Kolkata").startOf('day');
          console.log("Today's date (IST):", today.format('YYYY-MM-DD HH:mm:ss Z'));
  
          let todayAuditCount = 0;
          let futureAuditCount = 0;
          let notSubmittedCount = 0;
          let incompleteCount = 0;
  
          // Get all accepted audits' report dates
          const reportDatesPromises = acceptedAuditIds.map(async (auditId) => {
            const reportDatesRef = doc(db, 'Profile', userId, 'acceptedAudits', auditId, 'ReportDates', 'dates');
            const reportDatesSnap = await getDoc(reportDatesRef);
            return {
              auditId,
              dates: reportDatesSnap.exists() ? reportDatesSnap.data() : null
            };
          });
  
          const reportDates = await Promise.all(reportDatesPromises);
  
          // Count incomplete audits (missing any of the four report dates)
          reportDates.forEach(({ dates }) => {
            if (dates) {
              const hasAllDates = dates.scanDate && dates.hardCopyDate && 
                                 dates.softCopyDate && dates.photoDate;
              if (!hasAllDates) {
                incompleteCount += 1;
              }
            } else {
              // If no dates at all, it's incomplete
              incompleteCount += 1;
            }
          });
  
          // First get all non-submitted audits from main audits collection
          const auditsRef = collection(db, "audits");
          const q = query(auditsRef, where("isSubmitted", "==", false));
          const nonSubmittedAuditsSnapshot = await getDocs(q);
  
          // Check which non-submitted audits are in user's acceptedAudits and are today/past
          for (const doc of nonSubmittedAuditsSnapshot.docs) {
            if (acceptedAuditIds.includes(doc.id)) {
              // Find the corresponding accepted audit to get its date
              const acceptedAudit = acceptedAudits.find(audit => audit.auditId === doc.id);
              if (acceptedAudit && acceptedAudit.date) {
                const auditDate = moment(acceptedAudit.date).tz("Asia/Kolkata").startOf('day');
                // Only count if the audit is today or past
                if (!auditDate.isAfter(today)) {
                  notSubmittedCount += 1;
                }
              }
            }
          }
  
          // Process accepted audits for other counters
          for (const audit of acceptedAudits) {
            if (audit.isRejected) continue;
  
            if (audit.date) {
              const auditDate = moment(audit.date).tz("Asia/Kolkata").startOf('day');
              console.log("Audit date (IST):", auditDate.format('YYYY-MM-DD HH:mm:ss Z'));
  
              if (auditDate.isSame(today, 'day')) {
                // Only today's audits
                todayAuditCount += 1;
              } else if (auditDate.isAfter(today, 'day')) {
                // Future audit
                futureAuditCount += 1;
              }
            }
          }
  
          setTodaysTasks(todayAuditCount);
          setOngoingCounter(futureAuditCount);
          setNotSubmittedCounter(notSubmittedCount);
          setIncompleteCount(incompleteCount);
  
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
        // console.error("Error fetching data:", error);
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

    // console.log("clientsSnapshot:::::::::",fetchedClients)
  };

  const fetchUpcomingAudits = async (completedTasksList, acceptedTasksList) => {
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

  // Refresh counts when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchIncompleteCount();
      // ... other fetch functions
    }, [fetchIncompleteCount])
  );

  return (
    <View style={styles.container}>
      <LinearGradient 
        colors={['#00796B', '#00796B99']}
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
        <ScrollView showsVerticalScrollIndicator={false}>
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
                    <Text style={styles.cardTitle}>Incomplete</Text>
                    <Text style={styles.cardCounter}>{incompleteCount}</Text>
                  </View>
                </View>
              </CardGradient>
            </View>
          </View>

          <View style={styles.upcomingSection}>
            <Text style={styles.sectionTitle}>Upcoming Audits</Text>
            <View style={styles.upcomingAuditsContainer}>
              {upcomingAudits.length > 0 ? (
                <FlatList
                  horizontal
                  data={upcomingAudits}
                  renderItem={renderAudit}
                  keyExtractor={(item) => item.id}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.auditsList}
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
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  headerContainer: {
    paddingVertical: 8,
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
    marginTop: 8,
    paddingHorizontal: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  upcomingAuditsContainer: {
    height: 120,
    marginLeft: -15,
  },
  auditsList: {
    paddingLeft: 15,
    paddingRight: 15,
  },
  auditCard: {
    width: 300,
    height: 100,
    marginRight: 15,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: '#fff',
  },
  cardGradient: {
    flex: 1,
    borderRadius: 16,
    padding: 10,
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
    justifyContent: 'center',
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
    paddingHorizontal: 0,
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    margin: 15,
  },
  noAuditsImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 10,
    opacity: 0.8,
  },
  noAuditsText: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    fontWeight: '500',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;