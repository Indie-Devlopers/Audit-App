import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, limit, startAfter, orderBy, where } from 'firebase/firestore';
import { db } from './firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const PAGE_SIZE = 10;

// Utility: Convert string to Title Case
function toTitleCase(str) {
  return str.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

const UpcomingAudits = ({ navigation }) => {
  const [upcomingAudits, setUpcomingAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisibleAudit, setLastVisibleAudit] = useState(null);
  const [clientsData, setClientsData] = useState({});
  const [branchesMap, setBranchesMap] = useState({});
  const [auditTypes, setAuditTypes] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filterAuditType, setFilterAuditType] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    setUpcomingAudits([]);
    setLastVisibleAudit(null);
    setHasMore(true);
    fetchUpcomingAudits(true);
    fetchBranchesAndClients();
    fetchAuditTypes();
  }, []);

  // Add useEffect to refetch audits when all filters are cleared
  useEffect(() => {
    if (!filterAuditType && !filterDate && !filterCity && !filterClient) {
      setLoading(true);
      fetchUpcomingAudits(true);
    }
  }, [filterAuditType, filterDate, filterCity, filterClient]);

  const fetchBranchesAndClients = async () => {
    try {
      const branchesSnapshot = await getDocs(collection(db, "branches"));
      const branchesLookup = {};
      branchesSnapshot.forEach(doc => {
        branchesLookup[doc.id] = doc.data();
      });
      setBranchesMap(branchesLookup);

      const clientsSnapshot = await getDocs(collection(db, "clients"));
      const clientsLookup = {};
      clientsSnapshot.forEach(doc => {
        clientsLookup[doc.id] = doc.data().name;
      });
      setClientsData(clientsLookup);
    } catch (error) {
      console.error("Error fetching branches and clients:", error);
    }
  };

  const fetchAuditTypes = async () => {
    try {
      const auditTypesSnapshot = await getDocs(collection(db, 'auditType'));
      setAuditTypes(auditTypesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching audit types:', error);
    }
  };

  const fetchUpcomingAudits = async (reset = false) => {
    try {
      if (reset) setLoading(true);
      const userId = await AsyncStorage.getItem("userId");
      const acceptedAuditsRef = collection(db, "Profile", userId, "acceptedAudits");
      const acceptedAuditsSnapshot = await getDocs(acceptedAuditsRef);
      const acceptedAuditIds = acceptedAuditsSnapshot.docs.map(doc => doc.data().auditId);

      const auditsRef = collection(db, "audits");
      let constraints = [orderBy("date", "desc"), limit(PAGE_SIZE)];
      if (filterAuditType) constraints.push(where("auditTypeId", "==", filterAuditType));
      if (filterCity) constraints.push(where("city", "==", toTitleCase(filterCity)));
      if (filterClient) constraints.push(where("clientId", "==", filterClient));
      // Date filter: if filterDate is set, filter for that date
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
            date: auditData.date,
            branchId: auditData.branchId,
            clientId: auditData.clientId,
            branchName: auditData.branchName,
            auditTypeId: auditData.auditTypeId,
            isAcceptedByUser: isAccepted  // ✅ Add this flag

          });
        }
      });
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

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      fetchUpcomingAudits();
    }
  };

  const handleApplyFilters = () => {
    setUpcomingAudits([]);
    setLastVisibleAudit(null);
    setHasMore(true);
    fetchUpcomingAudits(true);
    setFilterVisible(false);
  };

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

  const renderAudit = ({ item }) => (
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
              {/* <Text style={styles.branchName} numberOfLines={1}>
                {branchesMap[item.branchId]?.name || 'Unknown Location'}
              </Text> */}
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
              <Text style={{ fontSize: 12, color: '#1976D2', fontWeight: 'bold', alignSelf: 'flex-start', marginLeft: 8 }}>
                {typeof item.date === 'string' ? (new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })) : ''}
              </Text>
            ) : null}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="event-busy" size={64} color="#666" />
      <Text style={styles.emptyText}>No upcoming audits available</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#00796B', '#004D40']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.headerTitle}>Available Audits</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  style={{ marginRight: 10, padding: 8, borderRadius: 8, backgroundColor: '#fff' }}
                  onPress={() => setFilterVisible(true)}
                >
                  <Ionicons name="funnel-outline" size={20} color="#00796B" />
                </TouchableOpacity>
                {(filterAuditType || filterDate || filterCity || filterClient) && (
                  <TouchableOpacity
                    style={{ marginRight: 0, padding: 8, borderRadius: 8, backgroundColor: '#fff' }}
                    onPress={handleClearFilters}
                  >
                    <Ionicons name="close-circle" size={20} color="#E53935" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View style={styles.headerLine} />
            <Text style={styles.headerSubtitle}>Browse and accept new audit assignments</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <MaterialIcons name="touch-app" size={20} color="#B2DFDB" />
                <Text style={styles.statText}>Tap to view details and accept audits</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
        </View>
      ) : (
        <FlatList
          data={upcomingAudits}
          renderItem={renderAudit}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={!loading ? renderEmptyList : null}
          showsVerticalScrollIndicator={false}
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
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  headerContainer: {
    backgroundColor: '#f5f7fa',
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  headerLine: {
    width: 40,
    height: 3,
    backgroundColor: '#4DB6AC',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#B2DFDB',
    opacity: 0.9,
    marginBottom: 12,
  },
  statsContainer: {
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(178, 223, 219, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  statText: {
    color: '#B2DFDB',
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
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
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  locationText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 4,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
});

export default UpcomingAudits;
