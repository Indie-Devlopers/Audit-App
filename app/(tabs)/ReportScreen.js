



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


  const handleSaveAndComplete = async () => {
    try {
      // Save Dates Functionality
      const reportDatesRef = doc(db, 'audits', auditId);
      await setDoc(
        reportDatesRef,
        {
          reportDates: {
            scan: scanDate || '',
            hard: hardCopyDate || '',
            soft: softCopyDate || '',
            photo: photoDate || '',
          },
        },
        { merge: true }
      );
  
    
  
      // Complete Functionality
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.error('User ID not found!');
        return;
      }
  
      await updateDoc(doc(db, 'audits', auditId), { isCompleted: true });
  
      const userProfileRef = doc(db, 'Profile', userId);
      const userProfileSnap = await getDoc(userProfileRef);
  
      if (userProfileSnap.exists()) {
        const userProfileData = userProfileSnap.data();
        const completedCount = (userProfileData.completedCounter || 0) + 1;
  
        await updateDoc(userProfileRef, {
          completedCounter: completedCount,
        });
  
        const acceptedAuditsRef = doc(db, 'Profile', userId, 'acceptedAudits', auditId);
        await deleteDoc(acceptedAuditsRef);
  
        await setDoc(doc(db, 'Profile', userId, 'completedAudits', auditId), {
          auditId,
          completedAt: new Date(),
        });
  
        const ongoingCounter = Math.max(0, (userProfileData.ongoingCounter || 0) - 1);
        await updateDoc(userProfileRef, {
          ongoingCounter: ongoingCounter,
        });
  
        
        navigation.navigate('CompletedTasks', { auditId, isCompleted: true });
      }
    } catch (error) {
      
      alert('Error saving and completing audit');
    }
  };
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Select Dates for Reports</Text>

      <View style={styles.row}>
        <Text style={styles.optionText}>Scan</Text>
        <DropDownPicker
          open={openScan}
          value={scanDate}
          items={Array.from({ length: 31 }, (_, i) => ({
            label: `2024-12-${i + 1}`,
            value: `2024-12-${i + 1}`,
          }))}
          setOpen={setOpenScan}
          setValue={setScanDate}
          style={styles.dropdown}
          zIndex={4000}
          dropDownContainerStyle={{ zIndex: 4000 }}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.optionText}>Hard Copy</Text>
        <DropDownPicker
          open={openHard}
          value={hardCopyDate}
          items={Array.from({ length: 31 }, (_, i) => ({
            label: `2024-12-${i + 1}`,
            value: `2024-12-${i + 1}`,
          }))}
          setOpen={setOpenHard}
          setValue={setHardCopyDate}
          style={styles.dropdown}
          zIndex={3000}
          dropDownContainerStyle={{ zIndex: 3000 }}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.optionText}>Soft Copy</Text>
        <DropDownPicker
          open={openSoft}
          value={softCopyDate}
          items={Array.from({ length: 31 }, (_, i) => ({
            label: `2024-12-${i + 1}`,
            value: `2024-12-${i + 1}`,
          }))}
          setOpen={setOpenSoft}
          setValue={setSoftCopyDate}
          style={styles.dropdown}
          zIndex={2000}
          dropDownContainerStyle={{ zIndex: 2000 }}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.optionText}>Photo</Text>
        <DropDownPicker
          open={openPhoto}
          value={photoDate}
          items={Array.from({ length: 31 }, (_, i) => ({
            label: `2024-12-${i + 1}`,
            value: `2024-12-${i + 1}`,
          }))}
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
  row: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  optionText: {
    fontSize: 18,
    color: '#555',
    marginRight: 12,
    minWidth: 120,
  },
  dropdown: {
    width: 220,
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
