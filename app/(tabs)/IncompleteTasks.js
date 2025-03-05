import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, getDocs, doc, getDoc, query, limit } from 'firebase/firestore';
import { db } from './firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import 'moment-timezone';
import { useFocusEffect } from '@react-navigation/native';

const IncompleteTasks = ({ navigation }) => {
  const [incompleteAudits, setIncompleteAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  const cache = useMemo(() => ({
    clientCache: {},
    branchCache: {},
  }), []);

  const fetchIncompleteAudits = useCallback(async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const acceptedAuditsRef = collection(db, "Profile", userId, "acceptedAudits");
      const auditsQuery = query(acceptedAuditsRef, limit(20)); // Limit to 20 tasks for faster loading
      const acceptedSnapshot = await getDocs(auditsQuery);

      const auditPromises = acceptedSnapshot.docs.map(async (acceptedDoc) => {
        const acceptedData = acceptedDoc.data();
        const auditId = acceptedData.auditId;

        const auditRef = doc(db, "audits", auditId);
        const auditSnap = await getDoc(auditRef);

        if (!auditSnap.exists()) return null;

        const auditData = auditSnap.data();

        // Skip if audit is completed
        if (auditData.isCompleted) return null;

        // Get reportDate array
        const reportDate = auditData.reportDate || [
          { type: 'scanDate', date: null, isSubmitted: false, submittedBy: '' },
          { type: 'hardCopyDate', date: null, isSubmitted: false, submittedBy: '' },
          { type: 'excelFormat', date: null, isSubmitted: false, submittedBy: '' },
          { type: 'photoDate', date: null, isSubmitted: false, submittedBy: '' }
        ];

        // Count submitted reports
        const submittedCount = reportDate.filter(report => report.isSubmitted).length;

        // Skip if no reports are submitted or all reports are submitted
        if (submittedCount === 0 || submittedCount === reportDate.length) return null;

        // Get branch and client data in parallel using Promise.all
        const branchDataPromise = cache.branchCache[auditData.branchId]
          ? Promise.resolve(cache.branchCache[auditData.branchId])
          : getDoc(doc(db, "branches", auditData.branchId)).then(branchSnap => branchSnap.exists() ? branchSnap.data() : {});

        const clientDataPromise = cache.clientCache[auditData.clientId]
          ? Promise.resolve(cache.clientCache[auditData.clientId])
          : getDoc(doc(db, "clients", auditData.clientId)).then(clientSnap => clientSnap.exists() ? clientSnap.data() : {});

        // Use Promise.all to fetch both client and branch data in parallel
        const [branchData, clientData] = await Promise.all([branchDataPromise, clientDataPromise]);

        // Cache the results for future use
        cache.branchCache[auditData.branchId] = branchData;
        cache.clientCache[auditData.clientId] = clientData;

        return {
          id: auditId,
          ...auditData,
          reportDate,
          date: acceptedData.date,
          branchDetails: branchData,
          clientDetails: clientData
        };
      });

      // Wait for all audit data to be fetched
      const fetchedAudits = await Promise.all(auditPromises);

      // Filter out null results
      const validAudits = fetchedAudits.filter(audit => audit !== null);
      setIncompleteAudits(validAudits);
    } catch (error) {
      console.error('Error fetching incomplete audits:', error);
    } finally {
      setLoading(false);
    }
  }, [cache]);

  useFocusEffect(
    useCallback(() => {
      fetchIncompleteAudits();
    }, [fetchIncompleteAudits])
  );

  const getCompletionStatus = (reportDate) => {
    const total = reportDate.length;
    const completed = reportDate.filter(report => report.isSubmitted).length;
    return `${completed}/${total} Completed`;
  };

  const renderAuditItem = ({ item }) => (
    <TouchableOpacity
      style={styles.auditCard}
      onPress={() => navigation.navigate('Report', {
        title: "Submit Reports",
        isCommingFormCompleted : true,
        audit: {

          id: item.id,
          clientName: item.clientDetails?.name,
          branchName: item.branchDetails?.name,
          auditTypeId: item.auditTypeId,
          date: item.date,
          reportDate: item.reportDate
        }
      })}
    >
      <LinearGradient
        colors={['#ffffff', '#f8f9fa']}
        style={styles.cardGradient}
      >
        <View style={styles.cardHeader}>
          <View style={styles.clientInfo}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="business" size={24} color="#1976D2" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.clientName}>{item.clientDetails?.name || 'Unknown Client'}</Text>
              <Text style={styles.date}>
                {moment(item.date).format('DD MMM, YYYY')}
              </Text>
            </View>
          </View>
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>{getCompletionStatus(item.reportDate)}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.locationRow}>
            <MaterialCommunityIcons name="office-building" size={20} color="#666" />
            <Text style={styles.locationText}>{item.branchDetails?.name || 'Unknown Branch'}</Text>
          </View>
          <View style={styles.locationRow}>
            <MaterialIcons name="location-on" size={20} color="#666" />
            <Text style={styles.locationText}>{item.branchDetails?.city || 'Unknown Location'}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00796B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#00796B', '#004D40']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Incomplete Tasks</Text>
      </LinearGradient>

      {incompleteAudits.length > 0 ? (
        <FlatList
          data={incompleteAudits}
          renderItem={renderAuditItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="assignment-turned-in" size={64} color="#00796B" />
          <Text style={styles.emptyText}>No incomplete tasks</Text>
        </View>
      )}
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    paddingTop: 15,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  auditCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardGradient: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  statusContainer: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#F57C00',
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    marginTop: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#2c3e50',
    marginLeft: 8,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default IncompleteTasks; 