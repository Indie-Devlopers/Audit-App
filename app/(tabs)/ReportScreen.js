import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { db } from './firebaseConfig';
import { doc, setDoc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ReportScreen = ({ route }) => {
  const navigation = useNavigation();
  const [scanDate, setScanDate] = useState(null);
  const [hardCopyDate, setHardCopyDate] = useState(null);
  const [softCopyDate, setSoftCopyDate] = useState(null);
  const [photoDate, setPhotoDate] = useState(null);

  const [auditId, setAuditId] = useState(route?.params?.auditId || '');
  const [userId, setUserId] = useState(route?.params?.userId || '');

  const [showScanDatePicker, setShowScanDatePicker] = useState(false);
  const [showHardCopyDatePicker, setShowHardCopyDatePicker] = useState(false);
  const [showSoftCopyDatePicker, setShowSoftCopyDatePicker] = useState(false);
  const [showPhotoDatePicker, setShowPhotoDatePicker] = useState(false);

  useEffect(() => {
    const fetchSavedDates = async () => {
      const docRef = doc(db, 'audits', auditId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.reportDates) {
          setScanDate(data.reportDates.scan ? new Date(data.reportDates.scan) : null);
          setHardCopyDate(data.reportDates.hard ? new Date(data.reportDates.hard) : null);
          setSoftCopyDate(data.reportDates.soft ? new Date(data.reportDates.soft) : null);
          setPhotoDate(data.reportDates.photo ? new Date(data.reportDates.photo) : null);
        }
      }
    };

    if (auditId) {
      fetchSavedDates();
    }
  }, [auditId]);

  const handleSaveAndComplete = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.error('User ID not found!');
        return;
      }

      const completedAuditsRef = doc(db, 'Profile', userId, 'completedAudits', auditId);
      const reportDatesRef = doc(db, 'Profile', userId, 'completedAudits', auditId, 'ReportDates', 'dates');

      const datesArray = [
        { key: 'softCopyDate', date: softCopyDate ? softCopyDate.toISOString() : '' },
        { key: 'scanDate', date: scanDate ? scanDate.toISOString() : '' },
        { key: 'photoDate', date: photoDate ? photoDate.toISOString() : '' },
        { key: 'hardCopyDate', date: hardCopyDate ? hardCopyDate.toISOString() : '' },
      ];

      const updateAudit = updateDoc(doc(db, 'audits', auditId), {
        isCompleted: true,
        isSubmitted: true,
        dates: datesArray,
        submittedBy: userId,
      });

      const updateReportDates = setDoc(
        reportDatesRef,
        {
          scanDate: scanDate ? scanDate.toISOString() : '',
          hardCopyDate: hardCopyDate ? hardCopyDate.toISOString() : '',
          photoDate: photoDate ? photoDate.toISOString() : '',
          completedAt: new Date(),
        },
        { merge: true }
      );

      const userProfileRef = doc(db, 'Profile', userId);
      const userProfileSnap = await getDoc(userProfileRef);

      if (userProfileSnap.exists()) {
        const userProfileData = userProfileSnap.data();
        const completedCount = (userProfileData.completedCounter || 0) + 1;

        const updateUserProfile = updateDoc(userProfileRef, {
          completedCounter: completedCount,
        });

        const deleteAcceptedAudit = deleteDoc(doc(db, 'Profile', userId, 'acceptedAudits', auditId));

        const setCompletedAudit = setDoc(doc(db, 'Profile', userId, 'completedAudits', auditId), {
          auditId,
          completedAt: new Date(),
        });

        const ongoingCounter = Math.max(0, (userProfileData.ongoingCounter || 0) - 1);
        const updateOngoingCounter = updateDoc(userProfileRef, {
          ongoingCounter: ongoingCounter,
        });

        await Promise.all([
          updateAudit,
          updateReportDates,
          updateUserProfile,
          deleteAcceptedAudit,
          setCompletedAudit,
          updateOngoingCounter,
        ]);

        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [
              { name: 'HomeScreen' }, // Ensure this matches the name in your navigator
              { name: 'CompletedTasks', params: { auditId, isCompleted: true } },
            ],
          })
        );
      }
    } catch (error) {
      alert('Error saving and completing audit');
    }
  };

  const renderDatePicker = (date, setDate, show, setShow) => (
    <>
      {show && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            const currentDate = selectedDate || date;
            setShow(Platform.OS === 'ios');
            setDate(currentDate);
          }}
          minimumDate={new Date(2000, 0, 1)}
          maximumDate={new Date(2100, 11, 31)}
        />
      )}
    </>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Select Dates for Reports</Text>
      <View style={styles.dateSection}>
        <Text style={styles.sectionTitle}>Soft Copy Date</Text>
        <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowSoftCopyDatePicker(true)}>
          <Text style={styles.dateText}>{softCopyDate ? softCopyDate.toDateString() : 'Select Date'}</Text>
        </TouchableOpacity>
        {renderDatePicker(softCopyDate, setSoftCopyDate, showSoftCopyDatePicker, setShowSoftCopyDatePicker)}
      </View>
      <View style={styles.dateSection}>
        <Text style={styles.sectionTitle}>Scan Date</Text>
        <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowScanDatePicker(true)}>
          <Text style={styles.dateText}>{scanDate ? scanDate.toDateString() : 'Select Date'}</Text>
        </TouchableOpacity>
        {renderDatePicker(scanDate, setScanDate, showScanDatePicker, setShowScanDatePicker)}
      </View>
      <View style={styles.dateSection}>
        <Text style={styles.sectionTitle}>Photo Date</Text>
        <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowPhotoDatePicker(true)}>
          <Text style={styles.dateText}>{photoDate ? photoDate.toDateString() : 'Select Date'}</Text>
        </TouchableOpacity>
        {renderDatePicker(photoDate, setPhotoDate, showPhotoDatePicker, setShowPhotoDatePicker)}
      </View>
      <View style={styles.dateSection}>
        <Text style={styles.sectionTitle}>Hard Copy Date</Text>
        <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowHardCopyDatePicker(true)}>
          <Text style={styles.dateText}>{hardCopyDate ? hardCopyDate.toDateString() : 'Select Date'}</Text>
        </TouchableOpacity>
        {renderDatePicker(hardCopyDate, setHardCopyDate, showHardCopyDatePicker, setShowHardCopyDatePicker)}
      </View>
      <TouchableOpacity style={styles.saveAndCompleteButton} onPress={handleSaveAndComplete}>
        <Text style={styles.saveAndCompleteButtonText}>Save & Complete</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'flex-start',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginVertical: 20,
  },
  dateSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  datePickerButton: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    color: '#0071c5',
  },
  saveAndCompleteButton: {
    marginTop: 30,
    backgroundColor: '#0071c5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveAndCompleteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ReportScreen;