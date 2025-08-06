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
  BackHandler,
  TextInput
} from "react-native";
import { doc, getDoc, collection, getDocs, onSnapshot, query, where, limit, startAfter, orderBy } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "./firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';
import 'moment-timezone';
import { useFocusEffect, useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
moment.tz.setDefault("Asia/Kolkata"); // Set Indian timezone

const PAGE_SIZE = 10;

// Utility: Convert string to Title Case
function toTitleCase(str) {
  return str.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

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
  const [lastVisibleAudit, setLastVisibleAudit] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [auditTypes, setAuditTypes] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filterAuditType, setFilterAuditType] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  console.log("dfdfdf", upcomingAudits)
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
          fetchUpcomingAudits(true) // Initial fetch for upcoming audits
        ]);

      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchAuditTypes();
  }, []);

  const fetchAuditTypes = async () => {
    try {
      const auditTypesSnapshot = await getDocs(collection(db, 'auditType'));
      setAuditTypes(auditTypesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching audit types:', error);
    }
  };

  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      const refreshData = async () => {
        try {
          await Promise.all([
            fetchCounters(),
            fetchUpcomingAudits(true) // Reset and refetch upcoming audits on focus
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

      // Get all branches and clients data in parallel
      const branchesPromise = getDocs(collection(db, "branches"));
      const clientsPromise = getDocs(collection(db, "clients"));

      const [branchesSnapshot, clientsSnapshot] = await Promise.all([branchesPromise, clientsPromise]);

      // Create a map for branches and clients
      const branchesLookup = {};
      branchesSnapshot.forEach(doc => {
        branchesLookup[doc.id] = doc.data();
      });

      const clientsLookup = {};
      clientsSnapshot.forEach(doc => {
        clientsLookup[doc.id] = doc.data().name;
      });

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
          { type: 'excelFormat', date: null, isSubmitted: false },
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
      setBranchesMap(branchesLookup);
      setClientsData(clientsLookup);

    } catch (error) {
      console.error("Error fetching counters:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update fetchUpcomingAudits to use filters
  const fetchUpcomingAudits = async (reset = false) => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;

      const acceptedAuditsRef = collection(db, "Profile", userId, "acceptedAudits");
      const acceptedAuditsSnapshot = await getDocs(acceptedAuditsRef);
      const acceptedAuditIds = acceptedAuditsSnapshot.docs.map(doc => doc.data().auditId);

      const auditsRef = collection(db, "audits");
      let constraints = [orderBy("createDate", "desc"), limit(PAGE_SIZE)];
      if (filterAuditType) constraints.push(where("auditTypeId", "==", filterAuditType));
      if (filterCity) constraints.push(where("city", "==", toTitleCase(filterCity)));
      if (filterClient) constraints.push(where("clientId", "==", filterClient));
      if (filterDate) constraints.push(where("date", "==", filterDate));
      if (!reset && lastVisibleAudit) {
        constraints.push(startAfter(lastVisibleAudit));
      }
      let auditsQuery = query(auditsRef, ...constraints);
      const auditsSnapshot = await getDocs(auditsQuery);
      let fetchedUpcomingAudits = [];
      auditsSnapshot.docs.forEach(doc => {
        const auditData = doc.data();
        const auditId = doc.id;
        const isAccepted = Array.isArray(auditData.acceptedByUser) && auditData.acceptedByUser.length > 0;
        if (!acceptedAuditIds.includes(auditId) && !auditData.isSubmitted) {
          fetchedUpcomingAudits.push({
            id: auditId,
            title: auditData.title,
            city: auditData.city,
            state: auditData.state,
            date: auditData.date,
            branchName: auditData.branchName,
            branchId: auditData.branchId,
            clientId: auditData.clientId,
            createDate: auditData.createDate || "2000-01-01T00:00:00.000Z",
            auditTypeId: auditData.auditTypeId,
            isAcceptedByUser: isAccepted  // ✅ Add this flag
          });
        }
      });
      fetchedUpcomingAudits.sort((a, b) => new Date(b.createDate) - new Date(a.createDate));
      if (reset) {
        setUpcomingAudits(fetchedUpcomingAudits);
      } else {
        setUpcomingAudits(prev => [
          ...prev,
          ...fetchedUpcomingAudits.filter(newAudit => !prev.some(audit => audit.id === newAudit.id))
        ]);
      }
      setLastVisibleAudit(auditsSnapshot.docs[auditsSnapshot.docs.length - 1]);
      setHasMore(auditsSnapshot.docs.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching upcoming audits:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleApplyFilters = () => {
    setUpcomingAudits([]);
    setLastVisibleAudit(null);
    setHasMore(true);
    fetchUpcomingAudits(true);
    setFilterVisible(false);
  };

  // Add useEffect to refetch audits when all filters are cleared
  useEffect(() => {
    if (!filterAuditType && !filterDate && !filterCity && !filterClient) {
      setLoading(true);
      fetchUpcomingAudits(true);
    }
  }, [filterAuditType, filterDate, filterCity, filterClient]);

  const handleClearFilters = () => {
    setFilterAuditType('');
    setFilterDate('');
    setFilterCity('');
    setFilterClient('');
    setUpcomingAudits([]);
    setLastVisibleAudit(null);
    setHasMore(true);
    setLoading(true);
    fetchUpcomingAudits(true); // Always fetch all audits after clearing
    if (filterVisible) setFilterVisible(false);
  };

  // Initial load and reset on focus
  useEffect(() => {
    setUpcomingAudits([]);
    setLastVisibleAudit(null);
    setHasMore(true);
    fetchUpcomingAudits(true);
  }, []);

  // Load more handler
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      fetchUpcomingAudits();
    }
  };

  useEffect(() => {
    let unsubscribe = fetchUpcomingAudits(); // Call function to get the unsubscribe function

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe(); // Cleanup listener properly
      }
    };
  }, []);


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

const renderAudit = ({ item }) => {
  // const isAccepted = Array.isArray(item.acceptedByUser) && item.acceptedByUser.length > 0;

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('AuditDetails', { audit: item })}
      style={styles.auditCard}
    >
      <LinearGradient
        colors={item.isAcceptedByUser? ['#d4edda', '#e1ffe8ff'] : ['#ffffff', '#f8f9fa']} // green if accepted, white otherwise
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

          <View style={[styles.textContainer, { flex: 1, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.auditTitle} numberOfLines={1}>
                {clientsData[item.clientId] || 'Unknown Client'}
              </Text>

              <View style={styles.branchContainer}>
                <Ionicons name="business-outline" size={14} color="#4A90E2" />
                <Text style={styles.branchText} numberOfLines={1}>
                  {item.branchName || 'Unknown Branch'}
                </Text>
              </View>

              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={14} color="#4A90E2" />
                <Text style={styles.locationText} numberOfLines={1}>
                  {item.city || 'Unknown City'}
                </Text>
              </View>
            </View>

            {item.date ? (
              <Text style={{
                fontSize: 12,
                color: '#1976D2',
                fontWeight: 'bold',
                alignSelf: 'flex-start',
                marginLeft: 8
              }}>
                {typeof item.date === 'string'
                  ? new Date(item.date).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })
                  : ''}
              </Text>
            ) : null}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};


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
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={{ marginRight: 8, padding: 8, borderRadius: 8, backgroundColor: '#fff' }}
              onPress={() => setFilterVisible(true)}
            >
              <Ionicons name="funnel-outline" size={20} color="#00796B" />
            </TouchableOpacity>
            {(filterAuditType || filterDate || filterCity || filterClient) && (
              <TouchableOpacity
                style={{ marginRight: 8, padding: 8, borderRadius: 8, backgroundColor: '#fff' }}
                onPress={handleClearFilters}
              >
                <Ionicons name="close-circle" size={20} color="#E53935" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('UpcomingAudits')}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
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
            ListEmptyComponent={!loading ? renderEmptyUpcoming : null}
            style={styles.flatListStyle}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              hasMore ? (
                <TouchableOpacity onPress={handleLoadMore} style={{ padding: 16, alignItems: 'center' }} disabled={loadingMore}>
                  {loadingMore ? <ActivityIndicator size="small" color="#00796B" /> : <Text style={{ color: '#00796B', fontWeight: '600' }}>Load More</Text>}
                </TouchableOpacity>
              ) : null
            }
          />
        </>
      )}
      {/* Filter Modal */}
      {filterVisible && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 10, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '90%' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>Filter Audits</Text>
            <Text style={{ color: '#666', fontSize: 13, marginBottom: 12 }}>You can filter audits by client, type, city, or date. All filters are optional.</Text>
            <Text style={{ marginBottom: 4 }}>Client</Text>
            <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 12 }}>
              <Picker
                selectedValue={filterClient}
                onValueChange={setFilterClient}
              >
                <Picker.Item label="All" value="" />
                {Object.entries(clientsData).map(([id, name]) => (
                  <Picker.Item key={id} label={name} value={id} />
                ))}
              </Picker>
            </View>
            <Text style={{ marginBottom: 4 }}>Audit Type</Text>
            <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 12 }}>
              <Picker
                selectedValue={filterAuditType}
                onValueChange={setFilterAuditType}
              >
                <Picker.Item label="All" value="" />
                {auditTypes.map(type => (
                  <Picker.Item key={type.id} label={type.name} value={type.id} />
                ))}
              </Picker>
            </View>
            <Text style={{ marginBottom: 4 }}>City</Text>
            <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 12 }}>
              <TextInput
                placeholder="Enter city"
                value={filterCity}
                onChangeText={setFilterCity}
                style={{ padding: 8 }}
              />
            </View>
            <Text style={{ marginBottom: 4 }}>Date</Text>
            <TouchableOpacity
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 12, padding: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: filterDate ? '#222' : '#aaa' }}>{filterDate || 'Select date'}</Text>
              {filterDate ? (
                <TouchableOpacity onPress={() => setFilterDate('')} style={{ marginLeft: 8 }}>
                  <Ionicons name="close-circle" size={18} color="#E53935" />
                </TouchableOpacity>
              ) : null}
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={filterDate ? new Date(filterDate) : new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) {
                    const yyyy = date.getFullYear();
                    const mm = String(date.getMonth() + 1).padStart(2, '0');
                    const dd = String(date.getDate()).padStart(2, '0');
                    setFilterDate(`${yyyy}-${mm}-${dd}`);
                  }
                }}
              />
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              <TouchableOpacity onPress={handleApplyFilters} style={{ backgroundColor: '#00796B', padding: 10, borderRadius: 8, flex: 1, marginRight: 8 }}>
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>Apply</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleClearFilters} style={{ backgroundColor: '#B0BEC5', padding: 10, borderRadius: 8, flex: 1 }}>
                <Text style={{ color: '#333', textAlign: 'center', fontWeight: 'bold' }}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    height: 70
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
    marginBottom: 0,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'left',
    // backgroundColor: '#f8f9fa',
    // paddingVertical: 4,
    // paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    flex: 1,
    marginRight: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 4,
    fontWeight: '500',
    flex: 1,
  },
  branchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    // paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    flex: 1,
  },
  branchLabel: {
    fontSize: 12,
    color: '#4A90E2',
    marginLeft: 4,
    fontWeight: '600',
  },
  branchText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 4,
    fontWeight: '500',
    flex: 1,
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