import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, SafeAreaView, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { app } from './firebaseConfig';
import { Calendar } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment-timezone';

// Set default timezone to India
moment.tz.setDefault('Asia/Kolkata');

const db = getFirestore(app);

const CalendarScreen = () => {
  const [markedDates, setMarkedDates] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [auditCount, setAuditCount] = useState(0);
  const [selectedAudits, setSelectedAudits] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loadingAudits, setLoadingAudits] = useState(false);
  const [isLoadingModal, setIsLoadingModal] = useState(false);

  useEffect(() => {
    loadAcceptedDates();
  }, []);

  const loadAcceptedDates = async () => {
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        console.error("User ID not found!");
        return;
      }

      const userAcceptedRef = collection(doc(db, "Profile", userId), "acceptedAudits");
      const acceptedAuditsSnap = await getDocs(userAcceptedRef);

      const dates = {};
      let count = 0;

      // Get today's date in Indian timezone
      const today = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
      
      // Mark today's date
      dates[today] = {
        marked: true,
        dotColor: '#00796B',
        selectedDotColor: '#ffffff',
        selected: true,
        selectedColor: '#B2DFDB',
      };

      for (const doc of acceptedAuditsSnap.docs) {
        const auditData = doc.data();
        const auditDate = auditData.date;
        
        if (auditDate) {
          const formattedDate = moment(auditDate).format('YYYY-MM-DD');
          if (formattedDate === today) {
            // If audit is scheduled for today, merge with today's styling
            dates[formattedDate] = {
              ...dates[formattedDate],
              selected: true,
              marked: true,
              selectedColor: '#00796B',
              dotColor: '#004D40'
            };
          } else {
            dates[formattedDate] = {
              selected: true,
              marked: true,
              selectedColor: '#00796B',
              dotColor: '#004D40'
            };
          }
          count++;
        }
      }

      setMarkedDates(dates);
      setAuditCount(count);
    } catch (error) {
      console.error("Error loading accepted dates:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAuditsForDate = async (date) => {
    setLoadingAudits(true);
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;

      const userAcceptedRef = collection(doc(db, "Profile", userId), "acceptedAudits");
      const acceptedAuditsSnap = await getDocs(userAcceptedRef);

      const auditsForDate = [];
      
      for (const docSnap of acceptedAuditsSnap.docs) {
        const auditData = docSnap.data();
        const auditDate = moment(auditData.date).format('YYYY-MM-DD');
        
        if (auditDate === date) {
          const auditRef = doc(db, "audits", auditData.auditId);
          const auditSnap = await getDoc(auditRef);
          
          if (auditSnap.exists()) {
            const fullAuditData = auditSnap.data();
            
            const clientRef = doc(db, "clients", fullAuditData.clientId);
            const branchRef = doc(db, "branches", fullAuditData.branchId);
            
            const [clientSnap, branchSnap] = await Promise.all([
              getDoc(clientRef),
              getDoc(branchRef)
            ]);

            auditsForDate.push({
              id: auditData.auditId,
              ...fullAuditData,
              clientDetails: clientSnap.exists() ? clientSnap.data() : null,
              branchDetails: branchSnap.exists() ? branchSnap.data() : null
            });
          }
        }
      }

      setSelectedAudits(auditsForDate);
      setShowModal(true);
    } catch (error) {
      console.error("Error loading audits for date:", error);
    } finally {
      setLoadingAudits(false);
    }
  };

  const onDayPress = async (day) => {
    setIsLoadingModal(true);
    setSelectedDate(day.dateString);
    await loadAuditsForDate(day.dateString);
    setIsLoadingModal(false);
  };

  const renderAuditModal = () => (
    <Modal
      visible={showModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowModal(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowModal(false)}
      >
        <View style={styles.modalContent}>
          <LinearGradient
            colors={['#00796B', '#004D40']}
            style={styles.modalHeader}
          >
            <Text style={styles.modalTitle}>
              Audits on {moment(selectedDate).format('DD MMM, YYYY')}
            </Text>
          </LinearGradient>

          <View style={styles.modalBody}>
            {loadingAudits ? (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="large" color="#00796B" />
                <Text style={styles.loadingText}>Loading audits...</Text>
              </View>
            ) : selectedAudits.length > 0 ? (
              <ScrollView 
                style={styles.auditsScrollView}
                showsVerticalScrollIndicator={false}
              >
                {selectedAudits.map((audit, index) => (
                  <View key={audit.id} style={styles.auditItem}>
                    <View style={styles.auditNumberBadge}>
                      <Text style={styles.auditNumber}>{index + 1}</Text>
                    </View>
                    <View style={styles.auditDetails}>
                      {/* <Text style={styles.auditName}>
                        {audit.name || "Audit Name"}
                      </Text> */}
                      <Text style={styles.auditClientName}>
                        {audit.clientDetails?.name || "Client Name"}
                      </Text>
                      <Text style={styles.auditBranchName}>
                        {audit.branchDetails?.name || "Branch Name"}
                      </Text>
                      {/* <Text style={styles.auditType}>
                        {audit.auditType || "Audit Type"}
                      </Text> */}
                    </View>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.noAuditsContainer}>
                <MaterialCommunityIcons name="calendar-blank" size={48} color="#B0BEC5" />
                <Text style={styles.noAuditsText}>No audits scheduled for this date</Text>
              </View>
            )}
          </View>

          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowModal(false)}
          >
            <LinearGradient
              colors={['#00796B', '#004D40']}
              style={styles.closeButtonGradient}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00796B" />
          <Text style={styles.loadingText}>Loading calendar...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#00796B', '#004D40']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Audit Calendar</Text>
            <View style={styles.headerLine} />
            <Text style={styles.headerSubtitle}>Track your scheduled audits</Text>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.calendarContainer}>
        <View style={styles.statsCard}>
          <LinearGradient
            colors={['#ffffff', '#f8f9fa']}
            style={styles.statsGradient}
          >
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="calendar-check" size={24} color="#00796B" />
              <Text style={styles.statNumber}>{auditCount}</Text>
              <Text style={styles.statLabel}>Scheduled Audits</Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.calendarCard}>
          <Calendar
            markedDates={markedDates}
            onDayPress={onDayPress}
            theme={{
              calendarBackground: 'transparent',
              textSectionTitleColor: '#2c3e50',
              selectedDayBackgroundColor: '#00796B',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#00796B',
              todayBackgroundColor: '#B2DFDB',
              dayTextColor: '#2c3e50',
              textDisabledColor: '#d9e1e8',
              dotColor: '#004D40',
              selectedDotColor: '#ffffff',
              arrowColor: '#00796B',
              monthTextColor: '#2c3e50',
              textDayFontWeight: '500',
              textMonthFontWeight: '700',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 13,
            }}
            style={styles.calendar}
          />
        </View>

    
      </View>

      {/* Loading Overlay */}
      {isLoadingModal && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#00796B" />
            <Text style={styles.loadingText}>Loading audits...</Text>
          </View>
        </View>
      )}

      {renderAuditModal()}
    </SafeAreaView>
  );
};

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  calendarContainer: {
    flex: 1,
    padding: 16,
    paddingBottom: 80,
  },
  statsCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  calendarCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  calendar: {
    paddingBottom: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 60,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#004D40',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalBody: {
    maxHeight: '70%',
  },
  auditsScrollView: {
    padding: 16,
  },
  auditItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  auditNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00796B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  auditNumber: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  auditDetails: {
    flex: 1,
  },
  auditName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  auditClientName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 2,
  },
  auditBranchName: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  auditType: {
    fontSize: 13,
    color: '#00796B',
    fontWeight: '500',
  },
  noAuditsContainer: {
    padding: 24,
    alignItems: 'center',
  },
  noAuditsText: {
    marginTop: 12,
    color: '#7f8c8d',
    fontSize: 16,
    textAlign: 'center',
  },
  closeButton: {
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  closeButtonGradient: {
    padding: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalLoadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default CalendarScreen;