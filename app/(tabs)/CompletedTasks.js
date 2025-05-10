import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, BackHandler, TouchableOpacity } from "react-native";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { app } from "./firebaseConfig";
import moment from 'moment-timezone';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const db = getFirestore(app);

const CompletedTasks = () => {
  const [completedAudits, setCompletedAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchCompletedAudits();
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.navigate('HomeScreen', { screen: 'DashBoard' });
      return true;
    });

    return () => backHandler.remove();
  }, [navigation]);

  const fetchCompletedAudits = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        setLoading(false);
        return;
      }

      const auditsRef = collection(db, "audits");
      const auditsSnapshot = await getDocs(auditsRef);

      const auditsData = [];

      const clientIds = [];
      const auditTypeIds = [];

      auditsSnapshot.docs.forEach((auditDoc) => {
        const auditData = auditDoc.data();
        if (
          auditData.isCompleted &&
          Array.isArray(auditData.acceptedByUser) &&
          auditData.acceptedByUser.includes(userId)
        ) {
          auditsData.push({
            id: auditDoc.id,
            ...auditData,
          });
          clientIds.push(auditData.clientId);
          auditTypeIds.push(auditData.auditTypeId);
        }
      });

      const uniqueClientIds = [...new Set(clientIds)];
      const uniqueAuditTypeIds = [...new Set(auditTypeIds)];

      const clientPromises = uniqueClientIds.map((clientId) =>
        getDoc(doc(db, "clients", clientId))
      );
      const auditTypePromises = uniqueAuditTypeIds.map((auditTypeId) =>
        getDoc(doc(db, "auditType", auditTypeId))
      );

      const [clientSnapshots, auditTypeSnapshots] = await Promise.all([
        Promise.all(clientPromises),
        Promise.all(auditTypePromises),
      ]);

      auditsData.forEach((audit) => {
        const clientData = clientSnapshots.find((snap) => snap.id === audit.clientId)?.data();
        const auditTypeData = auditTypeSnapshots.find((snap) => snap.id === audit.auditTypeId)?.data();

        audit.clientDetails = clientData || {};
        audit.auditTypeName = auditTypeData?.name || 'Unknown Audit Type';

        // Include city and state from the audit data
        audit.branchDetails = {
          name: audit.branchName || 'Branch not available',
          location: audit.city || 'City not available',
          state: audit.state || 'State not available'
        };
      });

      auditsData.sort((a, b) =>
        moment(b.completedDate).valueOf() - moment(a.completedDate).valueOf()
      );

      setCompletedAudits(auditsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching completed audits:", error);
      setLoading(false);
    }
  };

  const renderAuditCard = ({ item, index }) => (
    <View style={styles.auditCard}>
      <LinearGradient
        colors={['#ffffff', '#f8f9fa']}
        style={styles.cardGradient}
      >
        {/* Top Accent Bar */}
        <LinearGradient
          colors={['#00796B', '#004D40']}
          style={styles.accentBar}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />

        {/* Serial Number Badge */}
        <View style={styles.clientBadgeContainer}>
          <LinearGradient
            colors={['#00796B', '#004D40']}
            style={styles.clientBadge}
          >
            <Text style={styles.clientInitial}>
              {(index + 1).toString()}
            </Text>
          </LinearGradient>
        </View>

        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.clientInfo}>
            <Text style={styles.companyName} numberOfLines={1}>
              {item.clientDetails?.name || "Client Name"}
            </Text>
            <View style={styles.branchContainer}>
              <MaterialCommunityIcons name="domain" size={16} color="#7f8c8d" style={styles.branchIcon} />
              <Text style={styles.branchName} numberOfLines={1}>
                {item.branchDetails?.name || "Branch"}
              </Text>
            </View>
          </View>
          {/* <View style={styles.statusBadge}>
            <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" style={styles.statusIcon} />
            <Text style={styles.statusText}>Completed</Text>
          </View> */}
        </View>

        {/* Details Section */}
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <MaterialCommunityIcons name="map-marker" size={20} color="#00796B" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailText}>
                {item.branchDetails?.location || 'City Not Specified'}, {item.branchDetails?.state || 'State Not Specified'}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <MaterialCommunityIcons name="clipboard-text" size={20} color="#00796B" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Audit Type</Text>
              <Text style={styles.detailText}>
                {item.auditTypeName || "Audit Type Not Specified"}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <MaterialCommunityIcons name="calendar-check" size={20} color="#00796B" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Completed Date</Text>
              <Text style={styles.detailText}>
                {moment(item.completedDate).format('DD MMM, YYYY')}
              </Text>
            </View>
          </View>

          {item.externalAuditors && item.externalAuditors.length > 0 && (
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <MaterialCommunityIcons name="account-group" size={20} color="#00796B" />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>External Auditors</Text>
                <Text style={styles.detailText}>
                  {item.externalAuditors.map(auditor => auditor.name).join(', ') || 'No auditors assigned'}
                </Text>
              </View>
            </View>
          )}

<View style={styles.reportsContainer}>
            {item.reportDate?.map((report, index) => (
              <View key={index} style={styles.reportItem}>
                <MaterialCommunityIcons
                  name={
                    report.type === 'scanDate' ? 'scanner' :
                      report.type === 'hardCopyDate' ? 'file-document-outline' :
                        report.type === 'excelFormat' ? 'file-excel-box' :
                          'image-outline'
                  }
                  size={18}
                  color="#00796B"
                />
                <TouchableOpacity
                  onPress={() => navigation.navigate('Report', {
                    title: "Update Report",
                    isCommingFormCompleted: false,
                    audit: {
                      id: item.id,
                      clientName: item.clientDetails?.name,
                      branchName: item.branchDetails?.name,
                      auditTypeId: item.auditTypeId,
                      date: report.date,
                      reportDate: item.reportDate
                    }
                  })}
                >
                  <Text style={styles.reportDate}>
                    {moment(report.date).format('DD MMM')}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>
    </View>
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
      <LinearGradient colors={['#00796B', '#004D40']} style={styles.header}>
        <Text style={styles.headerTitle}>Completed Audits</Text>
        <View style={styles.counterBadge}>
          <Text style={styles.counterText}>{completedAudits.length}</Text>
        </View>
      </LinearGradient>

      <FlatList
        data={completedAudits}
        renderItem={renderAuditCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="clipboard-check-outline" size={50} color="#00796B" />
            <Text style={styles.emptyText}>No completed audits yet</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  counterBadge: { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  counterText: { color: '#00796B', fontWeight: 'bold', fontSize: 16 },
  listContainer: { padding: 16, paddingTop: 8 },
  cardContainer: { marginBottom: 16, borderRadius: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardGradient: { borderRadius: 12, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  clientInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerText: { marginLeft: 12, flex: 1 },
  clientName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  completedDate: { fontSize: 14, color: '#666', marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#4CAF50', marginLeft: 4, fontSize: 14, fontWeight: '500' },
  cardContent: { padding: 16 },
  infoRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12,
    paddingHorizontal: 4
  },
  infoText: { 
    marginLeft: 8, 
    fontSize: 16, 
    color: '#444',
    flex: 1
  },
  labelText: {
    fontWeight: 'bold',
    marginRight: 4
  },
  reportsContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    paddingLeft: 5, 
    backgroundColor: '#f8f8f8', 
    borderRadius: 8 
  },
  reportItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 8, 
    paddingHorizontal: 12, 
    borderRadius: 6, 
    marginRight: 8, 
    marginBottom: 8, 
    borderWidth: 1, 
    borderColor: '#e0e0e0' 
  },
  reportDate: { marginLeft: 6, fontSize: 14, color: '#666' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 40 },
  emptyText: { marginTop: 12, fontSize: 16, color: '#666' },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 2,
    fontWeight: '500',
  },
  detailText: {
    fontSize: 15,
    color: '#34495e',
    fontWeight: '500',
  },
  auditCard: {
    marginHorizontal: 0,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  cardGradient: {
    position: 'relative',
  },
  accentBar: {
    height: 4,
    width: '100%',
  },
  clientBadgeContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  clientBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clientInitial: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingTop: 20,
  },
  clientInfo: {
    flex: 1,
    marginRight: 50,
  },
  companyName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 6,
  },
  branchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  branchIcon: {
    marginRight: 4,
  },
  branchName: {
    fontSize: 15,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    color: '#4CAF50',
    fontSize: 13,
    fontWeight: '600',
  },
  details: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: 'rgba(248, 249, 250, 0.7)',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 2,
    fontWeight: '500',
  },
  detailText: {
    fontSize: 15,
    color: '#34495e',
    fontWeight: '500',
  },
});

export default CompletedTasks;

