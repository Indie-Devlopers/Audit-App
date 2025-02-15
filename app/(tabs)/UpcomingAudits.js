import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const UpcomingAudits = ({ navigation }) => {
  const [upcomingAudits, setUpcomingAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clientsData, setClientsData] = useState({});
  const [branchesMap, setBranchesMap] = useState({});

  useEffect(() => {
    fetchUpcomingAudits();
    fetchBranchesAndClients();
  }, []);

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

  const fetchUpcomingAudits = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem("userId");
      const acceptedAuditsRef = collection(db, "Profile", userId, "acceptedAudits");
      const acceptedAuditsSnapshot = await getDocs(acceptedAuditsRef);
      const acceptedAuditIds = acceptedAuditsSnapshot.docs.map(doc => doc.data().auditId);

      const auditsSnapshot = await getDocs(collection(db, "audits"));
      const fetchedUpcomingAudits = [];

      auditsSnapshot.docs.forEach(doc => {
        const auditData = doc.data();
        const auditId = doc.id;

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
      });

      setUpcomingAudits(fetchedUpcomingAudits);
    } catch (error) {
      console.error("Error fetching upcoming audits:", error);
    } finally {
      setLoading(false);
    }
  };

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
            <Text style={styles.headerTitle}>Available Audits</Text>
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
          ListEmptyComponent={renderEmptyList}
          showsVerticalScrollIndicator={false}
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
    backgroundColor: '#f8f9fa',
    paddingVertical: 4,
    paddingHorizontal: 8,
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
});

export default UpcomingAudits;
