


import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation } from '@react-navigation/native';
import { db } from './firebaseConfig';
import { doc, setDoc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ReportScreen = ({ route }) => {
  const navigation = useNavigation();
  const [scanDate, setScanDate] = useState('');
  const [hardCopyDate, setHardCopyDate] = useState('');
  const [softCopyDate, setSoftCopyDate] = useState('');
  const [photoDate, setPhotoDate] = useState('');

  const [auditId, setAuditId] = useState(route?.params?.auditId || '');
  const [userId, setUserId] = useState(route?.params?.userId || '');

  const [openScan, setOpenScan] = useState(false);
  const [openHard, setOpenHard] = useState(false);
  const [openSoft, setOpenSoft] = useState(false);
  const [openPhoto, setOpenPhoto] = useState(false);

  useEffect(() => {
    const fetchSavedDates = async () => {
      const docRef = doc(db, 'audits', auditId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.reportDates) {
          setScanDate(data.reportDates.scan || '');
          setHardCopyDate(data.reportDates.hard || '');
          setSoftCopyDate(data.reportDates.soft || '');
          setPhotoDate(data.reportDates.photo || '');
        }
      }
    };

    if (auditId) {
      fetchSavedDates();
    }
  }, [auditId]);

  const generateDateItems = (year) => {
    return Array.from({ length: 31 }, (_, i) => ({
      label: `${year}-12-${i + 1}`,
      value: `${year}-12-${i + 1}`,
    }));
  };

  const handleSaveAndComplete = async () => {
    try {
      // Save Dates to the Profile > userId > completedAudits subcollection > ReportDates subcollection
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.error('User ID not found!');
        return;
      }

      // Get the reference to the completedAudits subcollection and ReportDates subcollection
      const completedAuditsRef = doc(db, 'Profile', userId, 'completedAudits', auditId);
      const reportDatesRef = doc(db, 'Profile', userId, 'completedAudits', auditId, 'ReportDates', 'dates');

      // Save the report dates in the ReportDates subcollection
      await setDoc(
        reportDatesRef,
        {
          scanDate: scanDate || '',
          hardCopyDate: hardCopyDate || '',
          softCopyDate: softCopyDate || '',
          photoDate: photoDate || '',
          completedAt: new Date(),
        },
        { merge: true }  // Use merge to avoid overwriting existing fields
      );

      // Mark the audit as completed in the 'audits' collection
      await updateDoc(doc(db, 'audits', auditId), { isCompleted: true });

      const userProfileRef = doc(db, 'Profile', userId);
      const userProfileSnap = await getDoc(userProfileRef);

      if (userProfileSnap.exists()) {
        const userProfileData = userProfileSnap.data();
        const completedCount = (userProfileData.completedCounter || 0) + 1;

        // Update the completedCounter in the user's profile
        await updateDoc(userProfileRef, {
          completedCounter: completedCount,
        });

        // Remove the audit from the acceptedAudits subcollection
        const acceptedAuditsRef = doc(db, 'Profile', userId, 'acceptedAudits', auditId);
        await deleteDoc(acceptedAuditsRef);

        // Move it to the completedAudits subcollection
        await setDoc(doc(db, 'Profile', userId, 'completedAudits', auditId), {
          auditId,
          completedAt: new Date(),
        });

        // Update ongoing counter
        const ongoingCounter = Math.max(0, (userProfileData.ongoingCounter || 0) - 1);
        await updateDoc(userProfileRef, {
          ongoingCounter: ongoingCounter,
        });

        // Navigate to CompletedTasks screen
        navigation.navigate('CompletedTasks', { auditId, isCompleted: true });
      }
    } catch (error) {
      alert('Error saving and completing audit');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Select Dates for Reports</Text>

      <View style={styles.dateSection}>
        <Text style={styles.sectionTitle}>Scan Date</Text>
        <DropDownPicker
          open={openScan}
          value={scanDate}
          items={generateDateItems(new Date().getFullYear())}
          setOpen={setOpenScan}
          setValue={setScanDate}
          style={styles.dropdown}
          zIndex={4000}
          dropDownContainerStyle={{ zIndex: 4000 }}
        />
      </View>

      <View style={styles.dateSection}>
        <Text style={styles.sectionTitle}>Hard Copy Date</Text>
        <DropDownPicker
          open={openHard}
          value={hardCopyDate}
          items={generateDateItems(new Date().getFullYear())}
          setOpen={setOpenHard}
          setValue={setHardCopyDate}
          style={styles.dropdown}
          zIndex={3000}
          dropDownContainerStyle={{ zIndex: 3000 }}
        />
      </View>

      <View style={styles.dateSection}>
        <Text style={styles.sectionTitle}>Soft Copy Date</Text>
        <DropDownPicker
          open={openSoft}
          value={softCopyDate}
          items={generateDateItems(new Date().getFullYear())}
          setOpen={setOpenSoft}
          setValue={setSoftCopyDate}
          style={styles.dropdown}
          zIndex={2000}
          dropDownContainerStyle={{ zIndex: 2000 }}
        />
      </View>

      <View style={styles.dateSection}>
        <Text style={styles.sectionTitle}>Photo Date</Text>
        <DropDownPicker
          open={openPhoto}
          value={photoDate}
          items={generateDateItems(new Date().getFullYear())}
          setOpen={setOpenPhoto}
          setValue={setPhotoDate}
          style={styles.dropdown}
          zIndex={1000}
          dropDownContainerStyle={{ zIndex: 1000 }}
        />
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
  dropdown: {
    width: '100%',
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
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

