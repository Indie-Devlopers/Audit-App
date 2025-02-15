import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image } from "react-native";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { app } from "./firebaseConfig";
import moment from 'moment-timezone';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const db = getFirestore(app);

const CompletedTasks = () => {
  const [completedAudits, setCompletedAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletedAudits();
  }, []);

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

      for (const auditDoc of auditsSnapshot.docs) {
        const auditData = auditDoc.data();
        
        if (auditData.isCompleted && 
            auditData.acceptedByUser && 
            auditData.acceptedByUser.includes(userId)) {
          
          // Get branch details
          const branchRef = doc(db, "branches", auditData.branchId);
          const branchSnap = await getDoc(branchRef);
          const branchData = branchSnap.exists() ? branchSnap.data() : {};

          // Get client details
          const clientRef = doc(db, "clients", auditData.clientId);
          const clientSnap = await getDoc(clientRef);
          const clientData = clientSnap.exists() ? clientSnap.data() : {};

          // Get audit type details
          const auditTypeRef = doc(db, "auditType", auditData.auditTypeId);
          const auditTypeSnap = await getDoc(auditTypeRef);
          const auditTypeData = auditTypeSnap.exists() ? auditTypeSnap.data() : {};

          auditsData.push({
            id: auditDoc.id,
            ...auditData,
            branchDetails: {
              ...branchData,
              location: branchData.city || 'City not available'
            
            },
            clientDetails: clientData,
            auditTypeName: auditTypeData.name || 'Unknown Audit Type'
          });
        }
      }

      // Sort by completedDate in descending order
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

  const renderAuditCard = ({ item }) => (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={['#ffffff', '#f8f9fa']}
        style={styles.cardGradient}
      >
        {/* Header Section */}
        <View style={styles.cardHeader}>
          <View style={styles.clientInfo}>
            <MaterialCommunityIcons name="domain" size={24} color="#00796B" />
            <View style={styles.headerText}>
              <Text style={styles.clientName}>{item.clientDetails?.name || 'Unknown Client'}</Text>
              <Text style={styles.completedDate}>
                Completed on: {moment(item.completedDate).format('DD MMM, YYYY')}
              </Text>
            </View>
          </View>
          <View style={styles.statusBadge}>
            <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.statusText}>Completed</Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
            <Text style={styles.infoText}>
              {item.branchDetails?.city || 'City not available'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="clipboard-text" size={20} color="#666" />
            <Text style={styles.infoText}>{item.auditTypeName}</Text>
          </View>
          
          {/* Report Status Section */}
          <View style={styles.reportsContainer}>
            {item.reportDate?.map((report, index) => (
              <View key={index} style={styles.reportItem}>
                <MaterialCommunityIcons 
                  name={
                    report.type === 'scanDate' ? 'scanner' :
                    report.type === 'hardCopyDate' ? 'file-document-outline' :
                    report.type === 'softCopyDate' ? 'file-pdf' :
                    'image-outline'
                  }
                  size={18}
                  color="#00796B"
                />
                <Text style={styles.reportDate}>
                  {moment(report.date).format('DD MMM')}
                </Text>
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
      <LinearGradient
        colors={['#00796B', '#004D40']}
        style={styles.header}
      >
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
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  counterBadge: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  counterText: {
    color: '#00796B',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  cardContainer: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardGradient: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  completedDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#4CAF50',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#444',
  },
  reportsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  reportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  reportDate: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
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
    paddingTop: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});

export default CompletedTasks;