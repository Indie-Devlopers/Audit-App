import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, ActivityIndicator, SafeAreaView } from "react-native";
import { getFirestore, doc, getDoc, getDocs, collection } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { app } from "./firebaseConfig";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';
import 'moment-timezone';
moment.tz.setDefault("Asia/Kolkata");

const db = getFirestore(app);

export default function TodaysTasks({ navigation }) {
  const [todayAudits, setTodayAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  useEffect(() => {
    const getUserId = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (userId) {
          fetchTodayAudits(userId);
        } else {
          console.error("User ID not found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };

    getUserId();
  }, []);

  const fetchTodayAudits = async (userId) => {
    try {
      const userRef = doc(db, "Profile", userId);
      const acceptedAuditsRef = collection(userRef, "acceptedAudits");
      const acceptedAuditsSnapshot = await getDocs(acceptedAuditsRef);

      const audits = await Promise.all(
        acceptedAuditsSnapshot.docs.map(async (auditDoc) => {
          const { auditId, date } = auditDoc.data();
          const auditDate = new Date(date);
          auditDate.setHours(0, 0, 0, 0);

          if (auditDate.getTime() !== todayDate.getTime()) return null;

          const auditRef = doc(db, "audits", auditId);
          const auditSnapshot = await getDoc(auditRef);
          if (!auditSnapshot.exists()) return null;
          const auditData = auditSnapshot.data();

          const branchRef = doc(db, "branches", auditData.branchId);
          const branchSnapshot = await getDoc(branchRef);
          const branchDetails = branchSnapshot.exists() ? branchSnapshot.data() : {};

          const clientRef = doc(db, "clients", auditData.clientId);
          const clientSnapshot = await getDoc(clientRef);
          const clientDetails = clientSnapshot.exists() ? clientSnapshot.data() : {};

          return {
            id: auditId,
            ...auditData,
            date: auditDate,
            branchDetails,
            clientDetails,
          };
        })
      );

      setTodayAudits(audits.filter(audit => audit !== null));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching today's audits:", error);
      setLoading(false);
    }
  };

  const handleAuditPress = (audit) => {
    navigation.navigate("Report", { audit });
  };

  const renderAudit = ({ item: audit, index }) => (
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

        {/* Client Badge with Serial Number */}
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
              {audit.clientDetails?.name || "Client Name"}
            </Text>
            <View style={styles.branchContainer}>
              <MaterialIcons name="business" size={16} color="#7f8c8d" style={styles.branchIcon} />
              <Text style={styles.branchName} numberOfLines={1}>
                {audit.branchDetails?.name || "Branch Name"}
              </Text>
            </View>
          </View>
          {/* <View style={styles.statusBadge}>
            <MaterialIcons name="today" size={14} color="#1976d2" style={styles.statusIcon} />
            <Text style={styles.statusText}>Today</Text>
          </View> */}
        </View>

        {/* Details Section */}
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <MaterialIcons name="location-on" size={20} color="#00796B" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailText}>{audit.branchDetails?.city || "City Not Specified"}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <MaterialCommunityIcons name="shield-search" size={20} color="#00796B" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Audit Type</Text>
              <Text style={styles.detailText}>{audit.auditType || "Audit Type Not Specified"}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <MaterialIcons name="event" size={20} color="#00796B" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailText}>
                {moment(audit.date).format('DD MMM, YYYY')}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
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
            <Text style={styles.headerTitle}>Today's Audits</Text>
            <View style={styles.headerLine} />
            <Text style={styles.headerSubtitle}>View your scheduled audits for today</Text>
          </View>
        </LinearGradient>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#00796B" style={styles.loader} />
      ) : todayAudits.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="calendar-blank" size={64} color="#B0BEC5" />
          <Text style={styles.noAuditsText}>No audits scheduled for today</Text>
        </View>
      ) : (
        <FlatList
          data={todayAudits}
          renderItem={renderAudit}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  listContainer: {
    paddingVertical: 20,
    paddingHorizontal: 0,
  },
  auditCard: {
    marginHorizontal: 16,
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
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    color: '#1976d2',
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  noAuditsText: {
    marginTop: 16,
    fontSize: 16,
    color: '#78909c',
    textAlign: 'center',
  },
});