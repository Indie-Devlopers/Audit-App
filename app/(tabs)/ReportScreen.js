

// import React, { useState, useEffect } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
// import DateTimePickerModal from 'react-native-modal-datetime-picker';
// import { useNavigation } from '@react-navigation/native';
// import { db } from './firebaseConfig';
// import { doc, setDoc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const ReportScreen = ({ route }) => {
//   const navigation = useNavigation();

//   const [scanDate, setScanDate] = useState('');
//   const [hardCopyDate, setHardCopyDate] = useState('');
//   const [softCopyDate, setSoftCopyDate] = useState('');
//   const [photoDate, setPhotoDate] = useState('');

//   const [auditId, setAuditId] = useState(route?.params?.auditId || '');
//   const [userId, setUserId] = useState(route?.params?.userId || '');

//   const [isDatePickerVisible, setDatePickerVisibility] = useState({
//     scan: false,
//     hard: false,
//     soft: false,
//     photo: false,
//   });

//   const handleConfirm = (date, field) => {
//     const formattedDate = date.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
//     if (field === 'scan') setScanDate(formattedDate);
//     if (field === 'hard') setHardCopyDate(formattedDate);
//     if (field === 'soft') setSoftCopyDate(formattedDate);
//     if (field === 'photo') setPhotoDate(formattedDate);
//     setDatePickerVisibility({ ...isDatePickerVisible, [field]: false });
//   };

//   const fetchSavedDates = async () => {
//     const docRef = doc(db, 'audits', auditId);
//     const docSnap = await getDoc(docRef);

//     if (docSnap.exists()) {
//       const data = docSnap.data();
//       if (data.reportDates) {
//         setScanDate(data.reportDates.scan || '');
//         setHardCopyDate(data.reportDates.hard || '');
//         setSoftCopyDate(data.reportDates.soft || '');
//         setPhotoDate(data.reportDates.photo || '');
//       }
//     }
//   };

//   useEffect(() => {
//     if (auditId) {
//       fetchSavedDates();
//     }
//   }, [auditId]);

//   const handleSaveAndComplete = async () => {
//     try {
//       const userId = await AsyncStorage.getItem('userId');
//       if (!userId) {
//         console.error('User ID not found!');
//         return;
//       }

//       const completedAuditsRef = doc(db, 'Profile', userId, 'completedAudits', auditId);
//       const reportDatesRef = doc(db, 'Profile', userId, 'completedAudits', auditId, 'ReportDates', 'dates');

//       await setDoc(
//         reportDatesRef,
//         {
//           scanDate: scanDate || '',
//           hardCopyDate: hardCopyDate || '',
//           softCopyDate: softCopyDate || '',
//           photoDate: photoDate || '',
//           completedAt: new Date(),
//         },
//         { merge: true }
//       );

//       await updateDoc(doc(db, 'audits', auditId), { isCompleted: true });

//       const userProfileRef = doc(db, 'Profile', userId);
//       const userProfileSnap = await getDoc(userProfileRef);

//       if (userProfileSnap.exists()) {
//         const userProfileData = userProfileSnap.data();
//         const completedCount = (userProfileData.completedCounter || 0) + 1;

//         await updateDoc(userProfileRef, {
//           completedCounter: completedCount,
//         });

//         const acceptedAuditsRef = doc(db, 'Profile', userId, 'acceptedAudits', auditId);
//         await deleteDoc(acceptedAuditsRef);

//         await setDoc(doc(db, 'Profile', userId, 'completedAudits', auditId), {
//           auditId,
//           completedAt: new Date(),
//         });

//         const ongoingCounter = Math.max(0, (userProfileData.ongoingCounter || 0) - 1);
//         await updateDoc(userProfileRef, {
//           ongoingCounter: ongoingCounter,
//         });

//         navigation.navigate('CompletedTasks', { auditId, isCompleted: true });
//       }
//     } catch (error) {
//       alert('Error saving and completing audit');
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Select Dates for Reports</Text>

//       {['scan', 'hard', 'soft', 'photo'].map((field) => (
//         <View style={styles.dateSection} key={field}>
//           <Text style={styles.sectionTitle}>{`${field.charAt(0).toUpperCase() + field.slice(1)} Date`}</Text>
//           <TouchableOpacity
//             style={styles.datePickerButton}
//             onPress={() => setDatePickerVisibility({ ...isDatePickerVisible, [field]: true })}
//           >
//             <Text style={styles.datePickerButtonText}>
//               {field === 'scan' && scanDate}
//               {field === 'hard' && hardCopyDate}
//               {field === 'soft' && softCopyDate}
//               {field === 'photo' && photoDate}
//               {!(field === 'scan' && scanDate) && !(field === 'hard' && hardCopyDate) && !(field === 'soft' && softCopyDate) && !(field === 'photo' && photoDate) && 'Select Date'}
//             </Text>
//           </TouchableOpacity>
//           <DateTimePickerModal
//             isVisible={isDatePickerVisible[field]}
//             mode="date"
//             onConfirm={(date) => handleConfirm(date, field)}
//             onCancel={() => setDatePickerVisibility({ ...isDatePickerVisible, [field]: false })}
//           />
//         </View>
//       ))}

//       <TouchableOpacity style={styles.saveAndCompleteButton} onPress={handleSaveAndComplete}>
//         <Text style={styles.saveAndCompleteButtonText}>Save & Complete</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 16,
//     backgroundColor: '#f5f5f5',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#333',
//     textAlign: 'center',
//     marginVertical: 20,
//   },
//   dateSection: {
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#555',
//     marginBottom: 10,
//   },
//   datePickerButton: {
//     backgroundColor: '#0071c5',
//     paddingVertical: 10,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   datePickerButtonText: {
//     color: '#fff',
//     fontSize: 16,
//   },
//   saveAndCompleteButton: {
//     backgroundColor: '#0071c5',
//     paddingVertical: 14,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   saveAndCompleteButtonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: '600',
//   },
// });

// export default ReportScreen;








import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
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
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [currentField, setCurrentField] = useState(null);

  const [auditId, setAuditId] = useState(route?.params?.auditId || '');

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

  const handleConfirm = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    if (currentField === 'scan') setScanDate(formattedDate);
    if (currentField === 'hard') setHardCopyDate(formattedDate);
    if (currentField === 'soft') setSoftCopyDate(formattedDate);
    if (currentField === 'photo') setPhotoDate(formattedDate);
    setDatePickerVisibility(false);
    setCurrentField(null);
  };

  const handleSaveAndComplete = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.error('User ID not found!');
        return;
      }

      const completedAuditsRef = doc(db, 'Profile', userId, 'completedAudits', auditId);
      await setDoc(
        completedAuditsRef,
        {
          reportDates: {
            scan: scanDate,
            hard: hardCopyDate,
            soft: softCopyDate,
            photo: photoDate,
          },
          completedAt: new Date(),
        },
        { merge: true }
      );

      await updateDoc(doc(db, 'audits', auditId), { isCompleted: true });
      navigation.navigate('CompletedTasks', { auditId, isCompleted: true });
    } catch (error) {
      alert('Error saving and completing audit');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Report Dates</Text>

      <View style={styles.dateSection}>
        <Text style={styles.label}>Scan Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => {
            setDatePickerVisibility(true);
            setCurrentField('scan');
          }}
        >
          <Text style={styles.dateText}>{scanDate || 'Select Date'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dateSection}>
        <Text style={styles.label}>Hard Copy Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => {
            setDatePickerVisibility(true);
            setCurrentField('hard');
          }}
        >
          <Text style={styles.dateText}>{hardCopyDate || 'Select Date'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dateSection}>
        <Text style={styles.label}>Soft Copy Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => {
            setDatePickerVisibility(true);
            setCurrentField('soft');
          }}
        >
          <Text style={styles.dateText}>{softCopyDate || 'Select Date'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dateSection}>
        <Text style={styles.label}>Photo Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => {
            setDatePickerVisibility(true);
            setCurrentField('photo');
          }}
        >
          <Text style={styles.dateText}>{photoDate || 'Select Date'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveAndComplete}>
        <Text style={styles.saveButtonText}>Save & Complete</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={() => setDatePickerVisibility(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#343a40',
    textAlign: 'center',
    marginBottom: 20,
  },
  dateSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    color: '#495057',
    marginBottom: 8,
  },
  dateButton: {
    backgroundColor: '#e9ecef',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ced4da',
  },
  dateText: {
    fontSize: 16,
    color: '#495057',
  },
  saveButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ReportScreen;
