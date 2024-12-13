// import React, { useState } from 'react';
// import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import DateTimePicker from '@react-native-community/datetimepicker'; // Importing DateTimePicker
// import { db } from './firebaseConfig'; // Assuming you have firebaseConfig.js set up
// import { doc, setDoc } from 'firebase/firestore'; // Firestore functions

// const ReportScreen = ({ route }) => {
//   const [selectedDate, setSelectedDate] = useState(new Date()); // Default to current date
//   const [showCalendar, setShowCalendar] = useState(false);
//   const [auditId, setAuditId] = useState(route?.params?.auditId || ''); // Assuming auditId comes from route params
//   const [userId, setUserId] = useState(route?.params?.userId || ''); // Assuming userId comes from route params

//   // Dates for the four options
//   const [scanDate, setScanDate] = useState('');
//   const [hardCopyDate, setHardCopyDate] = useState('');
//   const [softCopyDate, setSoftCopyDate] = useState('');
//   const [photoDate, setPhotoDate] = useState('');

//   // Handle Date Picker
//   const handleDateSelect = (type, date) => {
//     if (type === 'scan') {
//       setScanDate(date);
//     } else if (type === 'hardCopy') {
//       setHardCopyDate(date);
//     } else if (type === 'softCopy') {
//       setSoftCopyDate(date);
//     } else if (type === 'photo') {
//       setPhotoDate(date);
//     }
//     setShowCalendar(false); // Close the calendar after date selection
//   };

//   const handleSaveDates = async () => {
//     try {
//       const acceptedAuditsRef = doc(
//         db,
//         'Profile',
//         userId,
//         'acceptedAudits',
//         auditId,
//         'DateCollection',
//         'dates' // Document name
//       );

//       // Save each date in the corresponding field
//       await setDoc(acceptedAuditsRef, {
//         scanCopy: scanDate || '',
//         hardCopy: hardCopyDate || '',
//         softCopy: softCopyDate || '',
//         photo: photoDate || '',
//       });

//       alert('Dates saved successfully');
//     } catch (error) {
//       console.error('Error saving dates: ', error);
//       alert('Error saving dates');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Select Dates for Reports</Text>

//       {/* Scan */}
//       <View style={styles.row}>
//         <Text style={styles.optionText}>Scan</Text>
//         <TouchableOpacity style={styles.selectButton} onPress={() => setShowCalendar('scan')}>
//           <Text style={styles.buttonText}>Select Date</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Hard Copy */}
//       <View style={styles.row}>
//         <Text style={styles.optionText}>Hard Copy</Text>
//         <TouchableOpacity style={styles.selectButton} onPress={() => setShowCalendar('hardCopy')}>
//           <Text style={styles.buttonText}>Select Date</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Soft Copy */}
//       <View style={styles.row}>
//         <Text style={styles.optionText}>Soft Copy</Text>
//         <TouchableOpacity style={styles.selectButton} onPress={() => setShowCalendar('softCopy')}>
//           <Text style={styles.buttonText}>Select Date</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Photo */}
//       <View style={styles.row}>
//         <Text style={styles.optionText}>Photo</Text>
//         <TouchableOpacity style={styles.selectButton} onPress={() => setShowCalendar('photo')}>
//           <Text style={styles.buttonText}>Select Date</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Date Picker Modal */}
//       {showCalendar && (
//         <Modal
//           visible={showCalendar ? true : false}
//           transparent={true}
//           animationType="slide"
//           onRequestClose={() => setShowCalendar(false)}
//         >
//           <View style={styles.modalContainer}>
//             <View style={styles.modalContent}>
//               <DateTimePicker
//                 value={selectedDate}
//                 mode="date" // Ensures only the date is shown (no time)
//                 display="default"
//                 onChange={(event, date) => {
//                   setSelectedDate(date || new Date()); // Update the selected date
//                   handleDateSelect(showCalendar, date || new Date()); // Pass selected date to the correct type
//                 }}
//               />
//             </View>
//           </View>
//         </Modal>
//       )}

//       {/* Save Button */}
//       <TouchableOpacity style={styles.saveButton} onPress={handleSaveDates}>
//         <Text style={styles.saveButtonText}>Save Dates</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     justifyContent: 'center',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//     alignItems: 'center',
//   },
//   optionText: {
//     fontSize: 18,
//     color: '#000',
//   },
//   selectButton: {
//     padding: 10,
//     backgroundColor: '#4A90E2',
//     borderRadius: 5,
//   },
//   buttonText: {
//     color: '#fff',
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     padding: 20,
//     borderRadius: 10,
//     width: '80%',
//   },
//   saveButton: {
//     marginTop: 30,
//     backgroundColor: '#28A745',
//     padding: 15,
//     alignItems: 'center',
//     borderRadius: 5,
//   },
//   saveButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });

// export default ReportScreen;



// import React, { useState } from 'react';
// import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import DateTimePicker from '@react-native-community/datetimepicker'; // Importing DateTimePicker
// import { db } from './firebaseConfig'; // Assuming you have firebaseConfig.js set up
// import { doc, setDoc, collection } from 'firebase/firestore'; // Firestore functions

// const ReportScreen = ({ route }) => {
//   const [selectedDate, setSelectedDate] = useState(new Date()); // Default to current date
//   const [showCalendar, setShowCalendar] = useState(false);
//   const [auditId, setAuditId] = useState(route?.params?.auditId || ''); // Assuming auditId comes from route params
//   const [userId, setUserId] = useState(route?.params?.userId || ''); // Assuming userId comes from route params

//   // Dates for the four options
//   const [scanDate, setScanDate] = useState('');
//   const [hardCopyDate, setHardCopyDate] = useState('');
//   const [softCopyDate, setSoftCopyDate] = useState('');
//   const [photoDate, setPhotoDate] = useState('');

//   // Handle Date Picker
//   const handleDateSelect = (type, date) => {
//     if (type === 'scan') {
//       setScanDate(date);
//     } else if (type === 'hardCopy') {
//       setHardCopyDate(date);
//     } else if (type === 'softCopy') {
//       setSoftCopyDate(date);
//     } else if (type === 'photo') {
//       setPhotoDate(date);
//     }
//     setShowCalendar(false); // Close the calendar after date selection
//   };

//   const handleSaveDates = async () => {
//     try {
//       // Reference to the DateCollection -> dates document
//       const acceptedAuditsRef = doc(
//         db,
//         'Profile', 
//         userId, // Assuming userId is auditorId
//         'acceptedAudits',
//         auditId, // The selected auditId
//         'DateCollection', // The collection where dates will be stored
//         'dates' // The document where dates will be saved
//       );

//       // Save each date in the corresponding field
//       await setDoc(acceptedAuditsRef, {
//         scan: scanDate || '',
//         hard: hardCopyDate || '',
//         soft: softCopyDate || '',
//         photo: photoDate || '',
//       });

//       alert('Dates saved successfully');
//     } catch (error) {
//       console.error('Error saving dates: ', error);
//       alert('Error saving dates');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Select Dates for Reports</Text>

//       {/* Scan */}
//       <View style={styles.row}>
//         <Text style={styles.optionText}>Scan</Text>
//         <TouchableOpacity style={styles.selectButton} onPress={() => setShowCalendar('scan')}>
//           <Text style={styles.buttonText}>Select Date</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Hard Copy */}
//       <View style={styles.row}>
//         <Text style={styles.optionText}>Hard Copy</Text>
//         <TouchableOpacity style={styles.selectButton} onPress={() => setShowCalendar('hardCopy')}>
//           <Text style={styles.buttonText}>Select Date</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Soft Copy */}
//       <View style={styles.row}>
//         <Text style={styles.optionText}>Soft Copy</Text>
//         <TouchableOpacity style={styles.selectButton} onPress={() => setShowCalendar('softCopy')}>
//           <Text style={styles.buttonText}>Select Date</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Photo */}
//       <View style={styles.row}>
//         <Text style={styles.optionText}>Photo</Text>
//         <TouchableOpacity style={styles.selectButton} onPress={() => setShowCalendar('photo')}>
//           <Text style={styles.buttonText}>Select Date</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Date Picker Modal */}
//       {showCalendar && (
//         <Modal
//           visible={showCalendar ? true : false}
//           transparent={true}
//           animationType="slide"
//           onRequestClose={() => setShowCalendar(false)}
//         >
//           <View style={styles.modalContainer}>
//             <View style={styles.modalContent}>
//               <DateTimePicker
//                 value={selectedDate}
//                 mode="date" // Ensures only the date is shown (no time)
//                 display="default"
//                 onChange={(event, date) => {
//                   setSelectedDate(date || new Date()); // Update the selected date
//                   handleDateSelect(showCalendar, date || new Date()); // Pass selected date to the correct type
//                 }}
//               />
//             </View>
//           </View>
//         </Modal>
//       )}

//       {/* Save Button */}
//       <TouchableOpacity style={styles.saveButton} onPress={handleSaveDates}>
//         <Text style={styles.saveButtonText}>Save Dates</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     justifyContent: 'center',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//     alignItems: 'center',
//   },
//   optionText: {
//     fontSize: 18,
//     color: '#000',
//   },
//   selectButton: {
//     padding: 10,
//     backgroundColor: '#4A90E2',
//     borderRadius: 5,
//   },
//   buttonText: {
//     color: '#fff',
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     padding: 20,
//     borderRadius: 10,
//     width: '80%',
//   },
//   saveButton: {
//     marginTop: 30,
//     backgroundColor: '#28A745',
//     padding: 15,
//     alignItems: 'center',
//     borderRadius: 5,
//   },
//   saveButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });

// export default ReportScreen;










// import React, { useState } from 'react';
// import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import DateTimePicker from '@react-native-community/datetimepicker'; // Importing DateTimePicker
// import { db } from './firebaseConfig'; // Assuming you have firebaseConfig.js set up
// import { doc, setDoc } from 'firebase/firestore'; // Firestore functions

// const ReportScreen = ({ route }) => {
//   const [selectedDate, setSelectedDate] = useState(new Date()); // Default to current date
//   const [showCalendar, setShowCalendar] = useState(false);
//   const [auditId, setAuditId] = useState(route?.params?.auditId || ''); // Assuming auditId comes from route params
//   const [userId, setUserId] = useState(route?.params?.userId || ''); // Assuming userId comes from route params

//   // Dates for the four options
//   const [scanDate, setScanDate] = useState('');
//   const [hardCopyDate, setHardCopyDate] = useState('');
//   const [softCopyDate, setSoftCopyDate] = useState('');
//   const [photoDate, setPhotoDate] = useState('');

//   // Handle Date Picker
//   const handleDateSelect = (type, date) => {
//     if (type === 'scan') {
//       setScanDate(date);
//     } else if (type === 'hardCopy') {
//       setHardCopyDate(date);
//     } else if (type === 'softCopy') {
//       setSoftCopyDate(date);
//     } else if (type === 'photo') {
//       setPhotoDate(date);
//     }
//     setShowCalendar(false); // Close the calendar after date selection
//   };

//   const handleSaveDates = async () => {
//     try {
//       // Construct the Firestore document reference dynamically
//       const reportDatesRef = doc(
//         db,                  // Firestore instance
//         'Profile',           // Collection: Profile
//         userId,              // User ID (auditor's user ID)
//         'acceptedAudits',    // Subcollection: acceptedAudits
//         auditId,             // Audit ID (the selected audit's ID)
//         'ReportDates',       // Subcollection: ReportDates (where dates will be stored)
//         'reportDate'         // Document ID (this can be 'reportDate', or dynamically generated)
//       );

//       // Save the selected dates into the 'reportDate' document in 'ReportDates'
//       await setDoc(reportDatesRef, {
//         scan: scanDate || '',      // Save the scan date
//         hard: hardCopyDate || '',  // Save the hard copy date
//         soft: softCopyDate || '',  // Save the soft copy date
//         photo: photoDate || '',    // Save the photo date
//       });

//       // Success alert
//       alert('Dates saved successfully');
//     } catch (error) {
//       // Error handling
//       console.error('Error saving dates: ', error);
//       alert('Error saving dates');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Select Dates for Reports</Text>

//       {/* Scan */}
//       <View style={styles.row}>
//         <Text style={styles.optionText}>Scan</Text>
//         <TouchableOpacity style={styles.selectButton} onPress={() => setShowCalendar('scan')}>
//           <Text style={styles.buttonText}>Select Date</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Hard Copy */}
//       <View style={styles.row}>
//         <Text style={styles.optionText}>Hard Copy</Text>
//         <TouchableOpacity style={styles.selectButton} onPress={() => setShowCalendar('hardCopy')}>
//           <Text style={styles.buttonText}>Select Date</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Soft Copy */}
//       <View style={styles.row}>
//         <Text style={styles.optionText}>Soft Copy</Text>
//         <TouchableOpacity style={styles.selectButton} onPress={() => setShowCalendar('softCopy')}>
//           <Text style={styles.buttonText}>Select Date</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Photo */}
//       <View style={styles.row}>
//         <Text style={styles.optionText}>Photo</Text>
//         <TouchableOpacity style={styles.selectButton} onPress={() => setShowCalendar('photo')}>
//           <Text style={styles.buttonText}>Select Date</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Date Picker Modal */}
//       {showCalendar && (
//         <Modal
//           visible={showCalendar ? true : false}
//           transparent={true}
//           animationType="slide"
//           onRequestClose={() => setShowCalendar(false)}
//         >
//           <View style={styles.modalContainer}>
//             <View style={styles.modalContent}>
//               <DateTimePicker
//                 value={selectedDate}
//                 mode="date" // Ensures only the date is shown (no time)
//                 display="default"
//                 onChange={(event, date) => {
//                   setSelectedDate(date || new Date()); // Update the selected date
//                   handleDateSelect(showCalendar, date || new Date()); // Pass selected date to the correct type
//                 }}
//               />
//             </View>
//           </View>
//         </Modal>
//       )}

//       {/* Save Button */}
//       <TouchableOpacity style={styles.saveButton} onPress={handleSaveDates}>
//         <Text style={styles.saveButtonText}>Save Dates</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     justifyContent: 'center',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//     alignItems: 'center',
//   },
//   optionText: {
//     fontSize: 18,
//     color: '#000',
//   },
//   selectButton: {
//     padding: 10,
//     backgroundColor: '#4A90E2',
//     borderRadius: 5,
//   },
//   buttonText: {
//     color: '#fff',
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     padding: 20,
//     borderRadius: 10,
//     width: '80%',
//   },
//   saveButton: {
//     marginTop: 30,
//     backgroundColor: '#28A745',
//     padding: 15,
//     alignItems: 'center',
//     borderRadius: 5,
//   },
//   saveButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });

// export default ReportScreen;










// import React, { useState } from 'react';
// import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
// import DateTimePicker from '@react-native-community/datetimepicker'; // Importing DateTimePicker
// import { db } from './firebaseConfig'; // Assuming you have firebaseConfig.js set up
// import { doc, setDoc } from 'firebase/firestore'; // Firestore functions

// const ReportScreen = ({ route }) => {
//   const [selectedDate, setSelectedDate] = useState(new Date()); // Default to current date
//   const [showCalendar, setShowCalendar] = useState(false);
//   const [auditId, setAuditId] = useState(route?.params?.auditId || ''); // Assuming auditId comes from route params
//   const [userId, setUserId] = useState(route?.params?.userId || ''); // Assuming userId comes from route params

//   // Dates for the four options
//   const [scanDate, setScanDate] = useState('');
//   const [hardCopyDate, setHardCopyDate] = useState('');
//   const [softCopyDate, setSoftCopyDate] = useState('');
//   const [photoDate, setPhotoDate] = useState('');

//   // Handle Date Picker
//   const handleDateSelect = (type, date) => {
//     if (type === 'scan') {
//       setScanDate(date);
//     } else if (type === 'hardCopy') {
//       setHardCopyDate(date);
//     } else if (type === 'softCopy') {
//       setSoftCopyDate(date);
//     } else if (type === 'photo') {
//       setPhotoDate(date);
//     }
//     setShowCalendar(false); // Close the calendar after date selection
//   };

//   const handleSaveDates = async () => {
//     try {
//       // Correctly reference the ReportDates collection inside the auditId
//       const reportDatesRef = doc(
//         db,                        // Firestore instance
//         'Profile',                 // Collection: Profile
//         userId,                    // User ID (auditor's user ID)
//         'acceptedAudits',          // Subcollection: acceptedAudits
//         auditId,                   // Audit ID (the selected audit's ID)
//         'ReportDates'              // Subcollection: ReportDates
//       );

//       // Save the selected dates into the ReportDates document
//       await setDoc(reportDatesRef, {
//         scan: scanDate || '',      // Save the scan date
//         hard: hardCopyDate || '',  // Save the hard copy date
//         soft: softCopyDate || '',  // Save the soft copy date
//         photo: photoDate || '',    // Save the photo date
//       });

//       // Success alert
//       alert('Dates saved successfully');
//     } catch (error) {
//       // Error handling
//       console.error('Error saving dates: ', error);
//       alert('Error saving dates');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Select Dates for Reports</Text>

//       {/* Scan */}
//       <View style={styles.row}>
//         <Text style={styles.optionText}>Scan</Text>
//         <TouchableOpacity style={styles.selectButton} onPress={() => setShowCalendar('scan')}>
//           <Text style={styles.buttonText}>Select Date</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Hard Copy */}
//       <View style={styles.row}>
//         <Text style={styles.optionText}>Hard Copy</Text>
//         <TouchableOpacity style={styles.selectButton} onPress={() => setShowCalendar('hardCopy')}>
//           <Text style={styles.buttonText}>Select Date</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Soft Copy */}
//       <View style={styles.row}>
//         <Text style={styles.optionText}>Soft Copy</Text>
//         <TouchableOpacity style={styles.selectButton} onPress={() => setShowCalendar('softCopy')}>
//           <Text style={styles.buttonText}>Select Date</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Photo */}
//       <View style={styles.row}>
//         <Text style={styles.optionText}>Photo</Text>
//         <TouchableOpacity style={styles.selectButton} onPress={() => setShowCalendar('photo')}>
//           <Text style={styles.buttonText}>Select Date</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Date Picker Modal */}
//       {showCalendar && (
//         <Modal
//           visible={showCalendar ? true : false}
//           transparent={true}
//           animationType="slide"
//           onRequestClose={() => setShowCalendar(false)}
//         >
//           <View style={styles.modalContainer}>
//             <View style={styles.modalContent}>
//               <DateTimePicker
//                 value={selectedDate}
//                 mode="date" // Ensures only the date is shown (no time)
//                 display="default"
//                 onChange={(event, date) => {
//                   setSelectedDate(date || new Date()); // Update the selected date
//                   handleDateSelect(showCalendar, date || new Date()); // Pass selected date to the correct type
//                 }}
//               />
//             </View>
//           </View>
//         </Modal>
//       )}

//       {/* Save Button */}
//       <TouchableOpacity style={styles.saveButton} onPress={handleSaveDates}>
//         <Text style={styles.saveButtonText}>Save Dates</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     justifyContent: 'center',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//     alignItems: 'center',
//   },
//   optionText: {
//     fontSize: 18,
//     color: '#000',
//   },
//   selectButton: {
//     padding: 10,
//     backgroundColor: '#4A90E2',
//     borderRadius: 5,
//   },
//   buttonText: {
//     color: '#fff',
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     padding: 20,
//     borderRadius: 10,
//     width: '80%',
//   },
//   saveButton: {
//     marginTop: 30,
//     backgroundColor: '#28A745',
//     padding: 15,
//     alignItems: 'center',
//     borderRadius: 5,
//   },
//   saveButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });

// export default ReportScreen;


import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker'; // Importing DateTimePicker
import { db } from './firebaseConfig'; // Assuming you have firebaseConfig.js set up
import { doc, setDoc } from 'firebase/firestore'; // Firestore functions

const ReportScreen = ({ route }) => {
  const [selectedDate, setSelectedDate] = useState(new Date()); // Default to current date
  const [showCalendar, setShowCalendar] = useState(false);
  const [auditId, setAuditId] = useState(route?.params?.auditId || ''); // Assuming auditId comes from route params
  const [userId, setUserId] = useState(route?.params?.userId || ''); // Assuming userId comes from route params

  // Dates for the four options
  const [scanDate, setScanDate] = useState('');
  const [hardCopyDate, setHardCopyDate] = useState('');
  const [softCopyDate, setSoftCopyDate] = useState('');
  const [photoDate, setPhotoDate] = useState('');

  // Handle Date Picker
  const handleDateSelect = (type, date) => {
    if (type === 'scan') {
      setScanDate(date);
    } else if (type === 'hardCopy') {
      setHardCopyDate(date);
    } else if (type === 'softCopy') {
      setSoftCopyDate(date);
    } else if (type === 'photo') {
      setPhotoDate(date);
    }
    setShowCalendar(false); // Close the calendar after date selection
  };

  const handleSaveDates = async () => {
    try {
      // Correctly reference the ReportDates collection directly inside the 'audits' collection
      const reportDatesRef = doc(
        db,                        // Firestore instance
        'audits',                  // Collection: audits
        auditId,                   // Audit ID (the selected audit's ID)
      );

      // Save the selected dates into the ReportDates field inside the audit document
      await setDoc(reportDatesRef, {
        reportDates: {
          scan: scanDate || '',      // Save the scan date
          hard: hardCopyDate || '',  // Save the hard copy date
          soft: softCopyDate || '',  // Save the soft copy date
          photo: photoDate || '',    // Save the photo date
        },
      }, { merge: true });  // Merge to avoid overwriting existing fields

      // Success alert
      alert('Dates saved successfully');
    } catch (error) {
      // Error handling
      console.error('Error saving dates: ', error);
      alert('Error saving dates');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Dates for Reports</Text>

      {/* Scan */}
      <View style={styles.row}>
        <Text style={styles.optionText}>Scan</Text>
        <TouchableOpacity style={styles.selectButton} onPress={() => setShowCalendar('scan')}>
          <Text style={styles.buttonText}>Select Date</Text>
        </TouchableOpacity>
      </View>

      {/* Hard Copy */}
      <View style={styles.row}>
        <Text style={styles.optionText}>Hard Copy</Text>
        <TouchableOpacity style={styles.selectButton} onPress={() => setShowCalendar('hardCopy')}>
          <Text style={styles.buttonText}>Select Date</Text>
        </TouchableOpacity>
      </View>

      {/* Soft Copy */}
      <View style={styles.row}>
        <Text style={styles.optionText}>Soft Copy</Text>
        <TouchableOpacity style={styles.selectButton} onPress={() => setShowCalendar('softCopy')}>
          <Text style={styles.buttonText}>Select Date</Text>
        </TouchableOpacity>
      </View>

      {/* Photo */}
      <View style={styles.row}>
        <Text style={styles.optionText}>Photo</Text>
        <TouchableOpacity style={styles.selectButton} onPress={() => setShowCalendar('photo')}>
          <Text style={styles.buttonText}>Select Date</Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      {showCalendar && (
        <Modal
          visible={showCalendar ? true : false}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCalendar(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <DateTimePicker
                value={selectedDate}
                mode="date" // Ensures only the date is shown (no time)
                display="default"
                onChange={(event, date) => {
                  setSelectedDate(date || new Date()); // Update the selected date
                  handleDateSelect(showCalendar, date || new Date()); // Pass selected date to the correct type
                }}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveDates}>
        <Text style={styles.saveButtonText}>Save Dates</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 18,
    color: '#000',
  },
  selectButton: {
    padding: 10,
    backgroundColor: '#4A90E2',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: '#28A745',
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReportScreen;
