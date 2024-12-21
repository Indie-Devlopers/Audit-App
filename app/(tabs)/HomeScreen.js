// import React, { useState, useEffect } from 'react';
// import { View, Text, TouchableOpacity, ScrollView, FlatList, Modal, TextInput, StyleSheet } from 'react-native';
// import { Ionicons,MaterialIcons } from '@expo/vector-icons';
// import { collection, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
// import { db } from './firebaseConfig';
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { fetchCompletedAuditsCount } from "./CompletedTasks";
// import { auth } from './firebaseConfig'; // Correct import for auth


// const HomeS = ({ navigation, route }) => {
//   const [userId, setUserId] = useState(null);
//   const userEmail = route?.params?.userEmail || '';
//   const [userDetails, setUserDetails] = useState(null);
//   const [greeting, setGreeting] = useState('');
//   const [audits, setAudits] = useState([]);
//   const [clientsData, setClientsData] = useState({});
//   const [branchesData, setBranchesData] = useState([]);
//   const [ongoingCounter, setOngoingCounter] = useState(0); 
//   const [filterModalVisible, setFilterModalVisible] = useState(false);
//   const [filters, setFilters] = useState({
//     date: '',    city: '',    state: '',  });
//   const [originalAudits, setOriginalAudits] = useState([]); // To store unfiltered audits
//   const [hasAcceptedAllAudits, setHasAcceptedAllAudits] = useState(false);
//   const filterAudits = async () => {
//     if (!userId) return [];

//   const acceptedAudits= await getacceptedAudits(userId);
//   const completedAudits = await getcompletedAudits(userId); 

//   useEffect(() => {
 
//     const loadData = async () => {
//       try {
//         // Fetch audits from Firebase collection 'audits'
//         const auditRef = collection(db, "audits");
//         const snapshot = await getDocs(auditRef);
//         const auditData = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setAudits(auditData);

//           const clientsRef = collection(db, 'clients');
//           const clientSnapshot = await getDocs(clientsRef);
//           const clients = {};
//           clientSnapshot.docs.forEach((doc) => {
//             clients[doc.id] = doc.data().name;
//           });
//           setClientsData(clients);

//           // Fetch branches
//           const branchesRef = collection(db, 'branches');
//           const branchSnapshot = await getDocs(branchesRef);
//           const branches = branchSnapshot.docs.map((doc) => ({
//             id: doc.id,
//             ...doc.data(),
//           }));
//           setBranchesData(branches);

        
//           const userDoc = await db.collection('Profile').where('email', '==', userEmail).get();
//           if (!userDoc.empty) {
//             const userId = userDoc.docs[0].id;
//             setUserId(userId);
//           }
//         } catch (error) {
//           console.error('Error fetching data:', error);
//         }
//       };

//       loadData();
//     }, [userEmail]);

//     // Filter out audits that the user has already accepted or completed
//     const filteredAudits = originalAudits.filter((audit) => {
//       return !acceptedAudits.includes(audit.id) && !completedAudits.includes(audit.id);
//     });

//     return filteredAudits;
//   };
//   const getacceptedAudits= async (userId) => {
//     const acceptedAuditsRef = collection(db, `Profile/${userId}/acceptedAudits`);
//     const snapshot = await getDocs(acceptedAuditsRef);
//     const acceptedAudits= snapshot.docs.map((doc) => doc.id);
//     return acceptedAudits;
//   };
//   const getcompletedAudits = async (userId) => {
//     const completedAuditsRef = collection(db, `Profile/${userId}/completedAudits`);
//     const snapshot = await getDocs(completedAuditsRef);
//     const completedAudits = snapshot.docs.map((doc) => doc.id);
//     return completedAudits;
//   };
//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         // Fetch audits
//         const auditRef = collection(db, 'audits');
//         const snapshot = await getDocs(auditRef);
//         const auditData = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setAudits(auditData);
//         setOriginalAudits(auditData); // Save the unfiltered audits

//         // Fetch clients
//         const clientsRef = collection(db, 'clients');
//         const clientSnapshot = await getDocs(clientsRef);
//         const clients = {};
//         clientSnapshot.docs.forEach((doc) => {
//           clients[doc.id] = doc.data().name;
//         });
//         setClientsData(clients);

//         // Fetch branches
//         const branchesRef = collection(db, 'branches');
//         const branchSnapshot = await getDocs(branchesRef);
//         const branches = branchSnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setBranchesData(branches);

//         // Fetch user ID from Profile collection based on email
//         const userDoc = await db.collection('Profile').where('email', '==', userEmail).get();
//         if (!userDoc.empty) {
//           const userId = userDoc.docs[0].id;
//           setUserId(userId);

//           // Set user name for greeting
//           setUserName(userEmail ? userEmail.split('@')[0] : 'Auditor');
//         }
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       }

//       const currentTime = new Date().getHours();
//       setGreeting(currentTime < 12 ? 'Good Morning Auditor' : currentTime < 19 ? 'Good Afternoon Auditor ' : 'Good Evening Auditor');
//     };
  
//     loadData();
//   }, [userEmail]);

//   useEffect(() => {
//     if (userId && originalAudits.length > 0) {
//       filterAudits().then((filtered) => {
//         setAudits(filtered); // Update the audits state with the filtered audits
//       });
//     }
//   }, [userId, originalAudits]);

//   useEffect(() => {
//     const checkIfAcceptedAll = async () => {
//       if (userId) {
//         const userProfileDoc = await db.collection('Profile').doc(userId).get();
//         const acceptedAudits= userProfileDoc.data()?.acceptedAudits|| [];

//         const allAuditIds = filteredAudits.map((audit) => audit.id);

//         // Check if the user has accepted all upcoming audits
//         const hasAcceptedAll = allAuditIds.every((id) => acceptedAudits.includes(id));

//         setHasAcceptedAllAudits(hasAcceptedAll);
//       }
//     };

//     // Ensure we are only checking when the audits are fully loaded
//     if (filteredAudits.length > 0 && userId) {
//       checkIfAcceptedAll();
//     }
//   }, [filteredAudits, userId]); // Re-run this when filteredAudits or userId changes

//   // Filtered Audits should exclude the audits that the user has already accepted
//   const filteredAudits = audits.filter((audit) => {
//     return !audit.acceptedBy || !audit.acceptedBy.includes(userId);
//   });


//   useEffect(() => {
//     const fetchAudits = async () => {
//       // Fetch audits data (assuming data fetching logic from Firebase here)
//     };

//     fetchAudits();
//   }, []);

//   const today = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
//   const todayAudits = originalAudits.filter((audit) => {
//     const auditDate = audit.date || '';
//     return (
//       auditDate === today &&
//       (!audit.acceptedBy || !audit.acceptedBy.includes(userId))
//     );
//   });

 


//   // Filter for ongoing audits
//   // Ongoing component (updated filter logic)
//   const loadOngoingAudits = async () => {
//     try {
//       const auditsQuery = query(collection(db, "audits")); // No filter here

//       const querySnapshot = await getDocs(auditsQuery);

//       const fetchedAudits = [];
//       for (const docSnap of querySnapshot.docs) {
//         const auditData = docSnap.data();
//         const auditId = docSnap.id;

//         // Fetch auditor's accepted audits from Profile collection
//         const auditorDocRef = doc(db, "Profile", auditData.auditorId); // Assuming auditorId is in auditData
//         const auditorDocSnap = await getDoc(auditorDocRef);

//         if (auditorDocSnap.exists()) {
//           const acceptedAudits= auditorDocSnap.data().acceptedAudits|| []; // Default to empty array if no acceptedAuditsfield
//           if (acceptedAudits.indexOf(auditId) !== -1) { // Check if the auditId is in acceptedAudits
//             // Fetch branch details
//             const branchRef = doc(db, "branches", auditData.branchId);
//             const branchSnap = await getDoc(branchRef);

//             // Fetch client details
//             const clientRef = doc(db, "clients", auditData.clientId);
//             const clientSnap = await getDoc(clientRef);

//             if (branchSnap.exists() && clientSnap.exists()) {
//               const branchDetails = branchSnap.data();

//               // Exclude clientId from branchDetails
//               delete branchDetails.clientId;

//               fetchedAudits.push({
//                 id: auditId,
//                 ...auditData,
//                 branchDetails,
//                 clientDetails: clientSnap.data(),
//               });
//             } else {
//               console.log("Missing details for audit:", auditId);
//             }
//           }
//         }
//       }

//       setOngoingAudits(fetchedAudits);
//     } catch (error) {
//       console.error("Failed to load ongoing audits", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const fetchOngoingCounter = async () => {
//       try {
//         const userId = auth.currentUser?.uid; // Get the logged-in user's ID

//         if (userId) {
//           // Get the document in Profile collection based on the logged-in user's ID
//           const profileRef = doc(firestore, 'Profile', userId); 
//           const profileDoc = await getDoc(profileRef);

//           if (profileDoc.exists()) {
//             // Access ongoingCounter from the auditor sub-collection in Profile
//             const ongoingCount = profileDoc.data()?.ongoingCounter || 0; // Default to 0 if the field doesn't exist
//             setOngoingCounter(ongoingCount); // Update state with the ongoing counter value
//           } else {
//             console.log('User profile not found');
//           }
//         } else {
//           console.log('No user logged in');
//         }
//       } catch (error) {
//         console.error('Error fetching ongoing counter:', error);
//       }
//     };

//     fetchOngoingCounter();
//   }, []);

//   useEffect(() => {
//     const fetchOngoingAudits = async () => {
//       const auditsRef = firebase.firestore().collection('audits');
//       const querySnapshot = await auditsRef.where('status', '==', 'ongoing').get();
//       setOngoingCounter(querySnapshot.size); //  yha pe it Sets the ongoingCounter to the number of ongoing audits
//     };

//     fetchOngoingAudits();
//   }, []);

//   useEffect(() => {
//     loadOngoingAudits();
//   }, []);

//   const applyFilters = () => {
//     let filtered = originalAudits; // Start with unfiltered audits

//     if (filters.date) {
//       filtered = filtered.filter((audit) => audit.date === filters.date);
//     }

//     if (filters.city) {
//       filtered = filtered.filter(
//         (audit) =>
//           branchesData.find((branch) => branch.id === audit.branchId)?.city === filters.city
//       );
//     }

//     if (filters.state) {
//       filtered = filtered.filter(
//         (audit) =>
//           branchesData.find((branch) => branch.id === audit.branchId)?.state === filters.state
//       );
//     }

//     setAudits(filtered);
//     setFilterModalVisible(false);
//   };


//   // Reset filters
//   const resetFilters = () => {
//     setFilters({
//       date: '',
//       city: '',
//       state: '',
//     });
//     setAudits(originalAudits); // Reset to unfiltered audits
//     setFilterModalVisible(false);
//   };
//   useEffect(() => {
//     // Fetch user details from Firestore Profile collection
//     const fetchUserDetails = async () => {
//       try {
//         const userDoc = await firestore()
//           .collection('Profile')
//           .doc(userId)
//           .get();
        
//         if (userDoc.exists) {
//           setUserDetails(userDoc.data());
//         } else {
//           console.log('User not found');
//         }
//       } catch (error) {
//         console.error('Error fetching user details:', error);
//       }
//     };

//     fetchUserDetails();
//   }, [userId]);

//   useEffect(() => {
//     const fetchUserPreferences = async () => {
//       if (userId) {
//         try {
//           const userDoc = await db.collection('Profile').doc(userId).get();
//           const userData = userDoc.data();
//           const userCity = userData?.preferredCity;  // Assuming 'preferredCity' is stored in the profile
//           const userState = userData?.preferredState;  // Assuming 'preferredState' is stored in the profile

//           setFilters((prevFilters) => ({
//             ...prevFilters,
//             city: userCity || '',
//             state: userState || '',
//           }));
//         } catch (error) {
//           console.error('Error fetching user preferences:', error);
//         }
//       }
//     };

//     fetchUserPreferences();
//   }, [userId]);  // Fetch only when the userId is available


//   useEffect(() => {
//     const loadCompletedAuditsCount = async () => {
//       const count = await fetchCompletedAuditsCount();
//       setCompletedAuditsCount(count);
//     };
//     loadCompletedAuditsCount();
//   }, []);
//   useEffect(() => {
//     const fetchOngoingAudits = async () => {
//       try {
//         const auditsQuery = query(collection(db, 'audits')); // No filter here
//         const querySnapshot = await getDocs(auditsQuery);

//         const fetchedAudits = [];
//         for (const docSnap of querySnapshot.docs) {
//           const auditData = docSnap.data();
//           const auditId = docSnap.id;

//           // Check if the audit is ongoing
//           if (auditData.status === 'ongoing') {
//             fetchedAudits.push(auditData);
//           }
//         }

//         setOngoingAudits(fetchedAudits);
//         setOngoingCounter(fetchedAudits.length); // Set the ongoing counter
//       } catch (error) {
//         console.error('Failed to load ongoing audits', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOngoingAudits();
//   }, []); // Runs once when the component mounts


//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//     <View style={styles.row}>
//   <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>
//     {greeting}
//   </Text>

// </View>


//       {/* Filter Modal */}
//       <Modal visible={filterModalVisible} transparent={true} animationType="slide">
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Filter Audits</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Date (YYYY-MM-DD)"
//               value={filters.date}
//               onChangeText={(text) => setFilters({ ...filters, date: text })}
//             />
//             <TextInput
//               style={styles.input}
//               placeholder="City"
//               value={filters.city}
//               onChangeText={(text) => setFilters({ ...filters, city: text })}
//             />
//             <TextInput
//               style={styles.input}
//               placeholder="State"
//               value={filters.state}
//               onChangeText={(text) => setFilters({ ...filters, state: text })}
//             />
//             <View style={styles.modalActions}>
//               <TouchableOpacity style={styles.modalButton} onPress={applyFilters}>
//                 <Text style={styles.modalButtonText}>Apply</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.modalButton, styles.resetButton]}
//                 onPress={resetFilters}
//               >
//                 <Text style={styles.modalButtonText}>Reset</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* Cards Row */}

//       <Text style={{ fontSize: 18, fontWeight: 'bold', colr: 'black' }}>Categories</Text>
//       <View style={styles.row}>
//         <TouchableOpacity
//           style={[styles.card, styles.todayTasks]}
//           onPress={() => navigation.navigate('TodaysTasks')}
//         >
//           <Ionicons name="calendar" size={30} color="#4A90E2" style={styles.icon} />
//           <Text style={styles.cardTitle}>Today's Audits</Text>
//           <Text style={styles.cardContent}>{todayAudits.length > 0 ? todayAudits.length : '0'}</Text>
//         </TouchableOpacity>

      
//     <TouchableOpacity
//       style={[styles.card, styles.ongoingTasks]}
//       onPress={() => navigation.navigate('Ongoing')}
//     >
//       <Ionicons name="play-circle" size={30} color="#FF9F00" style={styles.icon} />
//       <Text style={styles.cardTitle}>Accepted Audits</Text>
//       <Text style={styles.cardContent}>
//         {userDetails ? (
//           <>
//             <Text>Email: {userDetails.email}</Text>
//             <Text>Location: {userDetails.city}, {userDetails.state}</Text>
//             <Text>Preferred Audits: {userDetails.preferredAudits}</Text>
//             {/* Add any other fields you want to display */}
//           </>
//         ) : (
//           'Loading user details...'
//         )}
//       </Text>
//     </TouchableOpacity>


     
//       </View>


//       {/* Upcoming Audits Section */}
//       <View style={styles.upcomingAuditsContainer}>
//         <Text style={styles.upcomingAuditsTitle}>Upcoming Audits</Text>
//         {hasAcceptedAllAudits ? (
//           <View style={styles.noAuditsContainer}>
//             <Image source={require('./Images/nua.jpg')} style={styles.noAuditsImage} />
//             <Text style={styles.noAuditsText}>You have accepted all upcoming audits</Text>
//           </View>
//         ) :
//           (
//             <FlatList
//               data={audits}
//               renderItem={({ item }) => (
//                 <View style={styles.auditCard}>
//                   <View style={styles.auditDetails}>
//                     <Text style={styles.auditTitle}>{item.name}</Text>
//                     <Text style={styles.auditClient}>
//                       {clientsData[item.clientId] || 'Unknown Client'}
//                     </Text>
//                     <View style={styles.auditLocationContainer}>
//                       <Ionicons name="location-outline" size={16} color="blue" style={styles.locationIcon} />
//                       <Text style={styles.auditLocation}>
//                         {branchesData.find((branch) => branch.id === item.branchId)?.city || 'Unknown Location'}
//                       </Text>
//                     </View>
//                   </View>
//                   <TouchableOpacity
//                     style={styles.seeMoreButton}
//                     onPress={() => navigation.navigate('AuditDetails', { audit: item })}
//                   >
//                     <Text style={styles.seeMoreButtonText}>See More Info</Text>
//                   </TouchableOpacity>
//                 </View>
//               )}
//               keyExtractor={(item) => item.id}
//             />
            
            
//           )}
//       </View>
//     </ScrollView>
//   );
// };



// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 16,
//     backgroundColor: '#F0F4F8',
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//     marginTop: 30,
//   },
//   greetingText: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   card: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 16,
//     marginHorizontal: 4,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOpacity: 0.2,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   cardTitle: {
//     fontSize: 16,
//     textAlign: 'center',
//     marginBottom: 8,
//     color: '#000',
//   },
//   cardContent: {
//     fontSize: 16,
//     color: '#000',
//     textAlign: 'center',
//   },
//   icon: {
//     marginBottom: 8,
//   },
//   todayTasks: {
//     backgroundColor: '#EAF4FF',
//   },
//   ongoingTasks: {
//     backgroundColor: '#FFF4E5',
//   },
//   completedTasks: {
//     backgroundColor: '#E8F8E9',
//   },
//   upcomingAuditsContainer: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 10,
//     padding: 15,
//     marginTop: 20,
//     marginHorizontal: 10,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 3 },
//     shadowRadius: 5,
//     elevation: 5,
//   },
//   upcomingAuditsTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     color: '#333',
//   },
//   auditCard: {
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     padding: 15,
//     marginBottom: 10,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   auditDetails: {
//     flex: 1,
//     paddingLeft: 10,
//   },
//   auditTitle: {
//     fontSize: 16,    
    
// fontWeight: '600',
//       marginBottom: 5,
//       color: '#4A90E2',
//     },
//     auditClient: {
//       fontSize: 14,
//       color: '#666',
//     },
//     auditLocationContainer: {
//       flexDirection: 'row',
//       alignItems: 'center',
//     },
//     locationIcon: {
//       marginRight: 4,
//     },
//     auditLocation: {
//       fontSize: 14,
//       color: '#666',
//     },
//     seeMoreButton: {
//       backgroundColor: '#4A90E2',
//       paddingVertical: 6,
//       paddingHorizontal: 12,
//       borderRadius: 8,
//       alignItems: 'center',
//     },
//     seeMoreButtonText: {
//       color: '#fff',
//       fontSize: 14,
//     },
//     noAuditsContainer: {
//       alignItems: 'center',
//       marginTop: 20,
//     },
//     noAuditsImage: {
//       width: 100,
//       height: 100,
//       marginBottom: 10,
//     },
//     noAuditsText: {
//       fontSize: 16,
//       textAlign: 'center',
//       color: '#666',
//     },
//     filterButton: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       backgroundColor: '#EAF4FF',
//       padding: 10,
//       borderRadius: 8,
//       alignSelf: 'flex-end',
//     },
//     modalContainer: {
//       flex: 1,
//       justifyContent: 'center',
//       backgroundColor: 'rgba(0,0,0,0.5)',
//     },
//     modalContent: {
//       backgroundColor: '#fff',
//       margin: 20,
//       padding: 20,
//       borderRadius: 12,
//       shadowColor: '#000',
//       shadowOpacity: 0.3,
//       shadowOffset: { width: 0, height: 2 },
//       shadowRadius: 4,
//       elevation: 5,
//     },
//     modalTitle: {
//       fontSize: 18,
//       fontWeight: 'bold',
//       marginBottom: 10,
//       color: '#333',
//     },
//     input: {
//       borderBottomWidth: 1,
//       borderBottomColor: '#ccc',
//       marginBottom: 10,
//       padding: 8,
//       fontSize: 16,
//     },
//     modalActions: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       marginTop: 10,
//     },
//     modalButton: {
//       padding: 10,
//       backgroundColor: '#4A90E2',
//       borderRadius: 8,
//       flex: 1,
//       marginHorizontal: 5,
//       alignItems: 'center',
//     },
//     modalButtonText: {
//       color: '#fff',
//       fontSize: 16,
//     },
//     resetButton: {
//       backgroundColor: '#FF6B6B',
//     },
//     categoriesTitle: {
//       fontSize: 20,
//       fontWeight: 'bold',
//       marginBottom: 10,
//       color: '#333',
//     },
//   });
  
//   export default HomeS

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "./firebaseConfig";
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const [ongoingCounter, setOngoingCounter] = useState(0);
  const [upcomingAudits, setUpcomingAudits] = useState([]);
  const [todaysTasks, setTodaysTasks] = useState(0);
  const [acceptedTasks, setAcceptedTasks] = useState([]);
  const [userName, setUserName] = useState("");
  const [branchesData, setBranchesData] = useState([]);
  const [clientsData, setClientsData] = useState({});
  const [hasAcceptedAllAudits, setHasAcceptedAllAudits] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");

        if (userId) {
          // Fetch Profile document for the logged-in user
          const profileRef = doc(db, "Profile", userId);
          const profileDoc = await getDoc(profileRef);

          if (profileDoc.exists()) {
            // Set ongoingCounter and user name based on the profile data
            const ongoingCount = profileDoc.data()?.ongoingCounter || 0;
            setOngoingCounter(ongoingCount);

            const name = profileDoc.data()?.name || "User";
            setUserName(name);

            // Fetch accepted audits and check for today's tasks
            const acceptedAuditsSnapshot = await getDocs(
              collection(db, "Profile", userId, "acceptedAudits")
            );

            const today = new Date();
            let todaysAuditCount = 0;
            let acceptedAuditIds = [];

            acceptedAuditsSnapshot.forEach((doc) => {
              const auditData = doc.data();
              const auditDate = new Date(auditData.date);
              acceptedAuditIds.push(doc.id); // Collect accepted audit IDs

              if (
                auditDate.getFullYear() === today.getFullYear() &&
                auditDate.getMonth() === today.getMonth() &&
                auditDate.getDate() === today.getDate()
              ) {
                todaysAuditCount++;
              }
            });

            setTodaysTasks(todaysAuditCount); // Update the state with today's audit count

            // Fetch all audits and filter out those already accepted
            const auditsSnapshot = await getDocs(collection(db, "audits"));
            const fetchedUpcomingAudits = [];
            auditsSnapshot.forEach((doc) => {
              const auditData = doc.data();
              // Only add audits that are not yet accepted and are not in the accepted audits list
              if (!auditData.isAccepted && !acceptedAuditIds.includes(doc.id)) {
                fetchedUpcomingAudits.push({
                  id: doc.id,
                  title: auditData.title,
                  city: auditData.city,
                  date: auditData.date,
                  clientId: auditData.clientId,
                  branchId: auditData.branchId,
                });
              }
            });

            setUpcomingAudits(fetchedUpcomingAudits);
            setHasAcceptedAllAudits(fetchedUpcomingAudits.length === 0); // Check if all audits have been accepted
          } else {
            console.log("User profile not found");
          }
        } else {
          console.log("No user logged in");
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);


  useEffect(() => {
    const fetchAudits = async () => {
      // Fetch audits data (assuming data fetching logic from Firebase here)
    };

    fetchAudits();
  }, []);



  const today = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
  const todayAudits = originalAudits.filter((audit) => {
    const auditDate = audit.date || '';
    return (
      auditDate === today &&
      (!audit.acceptedBy || !audit.acceptedBy.includes(userId))
    );
  });

  useEffect(() => {
    if (userId) {
      // Filter completed audits based on `isCompleted` and check if `acceptedBy` includes the userId
      const completedByUser = audits.filter((audit) => {
        return audit.isCompleted && audit.acceptedBy && audit.acceptedBy.includes(userId);
      });
      setCompletedAuditsCount(completedByUser.length); // Set the count of completed audits
    }
  }, [audits, userId]);


  // Filter for ongoing audits
  // Ongoing component (updated filter logic)
  const loadOngoingAudits = async () => {
    try {
      const auditsQuery = query(collection(db, "audits")); // No filter here

      const querySnapshot = await getDocs(auditsQuery);

      const fetchedAudits = [];
      for (const docSnap of querySnapshot.docs) {
        const auditData = docSnap.data();
        const auditId = docSnap.id;

        // Fetch auditor's accepted audits from Profile collection
        const auditorDocRef = doc(db, "Profile", auditData.auditorId); // Assuming auditorId is in auditData
        const auditorDocSnap = await getDoc(auditorDocRef);

        if (auditorDocSnap.exists()) {
          const acceptedAudits = auditorDocSnap.data().AcceptedAudits || []; // Default to empty array if no AcceptedAudits field
          if (acceptedAudits.indexOf(auditId) !== -1) { // Check if the auditId is in acceptedAudits
            // Fetch branch details
            const branchRef = doc(db, "branches", auditData.branchId);
            const branchSnap = await getDoc(branchRef);

            // Fetch client details
            const clientRef = doc(db, "clients", auditData.clientId);
            const clientSnap = await getDoc(clientRef);

            if (branchSnap.exists() && clientSnap.exists()) {
              const branchDetails = branchSnap.data();

              // Exclude clientId from branchDetails
              delete branchDetails.clientId;

              fetchedAudits.push({
                id: auditId,
                ...auditData,
                branchDetails,
                clientDetails: clientSnap.data(),
              });
            } else {
              console.log("Missing details for audit:", auditId);
            }
          }
        }
      }

      setOngoingAudits(fetchedAudits);
    } catch (error) {
      console.error("Failed to load ongoing audits", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchOngoingCounter = async () => {
      try {
        const userId = auth.currentUser?.uid; // Get the logged-in user's ID

        if (userId) {
          // Get the document in Profile collection based on the logged-in user's ID
          const profileRef = doc(firestore, 'Profile', userId, 'auditor', userId); 
          const profileDoc = await getDoc(profileRef);

          if (profileDoc.exists()) {
            // Access ongoingCounter from the auditor sub-collection in Profile
            const ongoingCount = profileDoc.data()?.ongoingCounter || 0; // Default to 0 if the field doesn't exist
            setOngoingCounter(ongoingCount); // Update state with the ongoing counter value
          } else {
            console.log('User profile not found');
          }
        } else {
          console.log('No user logged in');
        }
      } catch (error) {
        console.error('Error fetching ongoing counter:', error);
      }
    };

    fetchOngoingCounter();
  }, []);

  useEffect(() => {
    const fetchOngoingAudits = async () => {
      const auditsRef = firebase.firestore().collection('audits');
      const querySnapshot = await auditsRef.where('status', '==', 'ongoing').get();
      setOngoingCounter(querySnapshot.size); //  yha pe it Sets the ongoingCounter to the number of ongoing audits
    };

    fetchOngoingAudits();
  }, []);



  useEffect(() => {
    loadOngoingAudits();
  }, []);



  const applyFilters = () => {
    let filtered = originalAudits; // Start with unfiltered audits

    if (filters.date) {
      filtered = filtered.filter((audit) => audit.date === filters.date);
    }

    if (filters.city) {
      filtered = filtered.filter(
        (audit) =>
          branchesData.find((branch) => branch.id === audit.branchId)?.city === filters.city
      );
    }

    if (filters.state) {
      filtered = filtered.filter(
        (audit) =>
          branchesData.find((branch) => branch.id === audit.branchId)?.state === filters.state
      );
    }

    setAudits(filtered);
    setFilterModalVisible(false);
  };


  // Reset filters
  const resetFilters = () => {
    setFilters({
      date: '',
      city: '',
      state: '',
    });
    setAudits(originalAudits); // Reset to unfiltered audits
    setFilterModalVisible(false);
  };

  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (userId) {
        try {
          const userDoc = await db.collection('Profile').doc(userId).get();
          const userData = userDoc.data();
          const userCity = userData?.preferredCity;  // Assuming 'preferredCity' is stored in the profile
          const userState = userData?.preferredState;  // Assuming 'preferredState' is stored in the profile

          setFilters((prevFilters) => ({
            ...prevFilters,
            city: userCity || '',
            state: userState || '',
          }));
        } catch (error) {
          console.error('Error fetching user preferences:', error);
        }
      }
    };

    fetchUserPreferences();
  }, [userId]);  // Fetch only when the userId is available


  useEffect(() => {
    const loadCompletedAuditsCount = async () => {
      const count = await fetchCompletedAuditsCount();
      setCompletedAuditsCount(count);
    };
    loadCompletedAuditsCount();
  }, []);
  useEffect(() => {
    const fetchOngoingAudits = async () => {
      try {
        const auditsQuery = query(collection(db, 'audits')); // No filter here
        const querySnapshot = await getDocs(auditsQuery);

        const fetchedAudits = [];
        for (const docSnap of querySnapshot.docs) {
          const auditData = docSnap.data();
          const auditId = docSnap.id;

          // Check if the audit is ongoing
          if (auditData.status === 'ongoing') {
            fetchedAudits.push(auditData);
          }
        }

        setOngoingAudits(fetchedAudits);
        setOngoingCounter(fetchedAudits.length); // Set the ongoing counter
      } catch (error) {
        console.error('Failed to load ongoing audits', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOngoingAudits();
  }, []); // Runs once when the component mounts


  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome Auditor!</Text>

      {/* Today's Tasks Section */}
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.card, styles.completedTasks]}
          onPress={() => navigation.navigate("TodaysTasks")}
        >
          <Ionicons name="calendar" size={30} color="#4A90E2" style={styles.icon} />
          <Text style={styles.cardTitle}>Today's Tasks</Text>
          <Text style={styles.cardContent}>
            {todaysTasks > 0 ? todaysTasks : "0"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Accepted Tasks Section */}
      <TouchableOpacity
        style={[styles.card, styles.ongoingTasks]}
        onPress={() => navigation.navigate('Ongoing')}
      >
        <Ionicons name="play-circle" size={30} color="#FFC107" style={styles.icon} />
        <Text style={styles.cardTitle}>Accepted Tasks</Text>
        {ongoingCounter !== null && (
          <Text style={styles.counter}>{ongoingCounter}</Text>
        )}
      </TouchableOpacity>

      {/* Upcoming Audits Section */}
      <View style={styles.upcomingAuditsContainer}>
        <Text style={styles.upcomingAuditsTitle}>Upcoming Audits</Text>
        {hasAcceptedAllAudits ? (
          <View style={styles.noAuditsContainer}>
            <Image source={require('./Images/nua.jpg')} style={styles.noAuditsImage} />
            <Text style={styles.noAuditsText}>You have accepted all upcoming audits</Text>
          </View>
        ) : (
          <FlatList
            data={upcomingAudits}
            renderItem={({ item }) => (
              <View style={styles.auditCard}>
                <View style={styles.auditDetails}>
                  <Text style={styles.auditTitle}>{item.name}</Text>
                  <Text style={styles.auditClient}>
                      {clientsData[item.clientId] || 'Unknown Client'}
                    </Text>
                    <View style={styles.auditLocationContainer}>
                       <Ionicons name="location-outline" size={16} color="blue" style={styles.locationIcon} />
                       <Text style={styles.auditLocation}>
                        {branchesData.find((branch) => branch.id === item.branchId)?.city || 'Unknown Location'}
                      </Text>
                    </View>
                </View>
                <TouchableOpacity
                  style={styles.seeMoreButton}
                  onPress={() => navigation.navigate("AuditDetails", { audit: item })}
                >
                  <Text style={styles.seeMoreButtonText}>See More Info</Text>
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item) => item.id}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#F0F4F8',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 30,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  ongoingTasks: {
    backgroundColor: '#FFF4E5',
  },
  completedTasks: {
    backgroundColor: '#E8F8E9',
  },
  auditClient: {
          fontSize: 14,
          color: '#666',
        },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  upcomingAuditsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    color: '#333',
  },
  noAuditsContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  noAuditsImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  noAuditsText: {
    fontSize: 16,
    color: '#888',
    marginTop: 10,
  },
  auditCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#f0f8ff", 
    padding: 10,
    borderRadius: 8,
  },
  auditDetails: {
    flex: 1,
    paddingLeft: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF4FF',
    padding: 10,
    
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  filterButtonText: { color: '#4A90E2', marginLeft: 8 },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { borderBottomWidth: 1, marginBottom: 10 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-around' },
  modalButton: { padding: 10 },
  modalButtonText: { color: '#4A90E2' },
  

  auditTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A90E2",
  },
  auditCity: {
    fontSize: 14,
    color: "#333",
  },
  auditDate: {
    fontSize: 14,
    color: "#333",
  },
  seeMoreButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#4A90E2',
    borderRadius: 5,
  },
  seeMoreButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { borderBottomWidth: 1, marginBottom: 10 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-around' },
  modalButton: { padding: 10 },
  modalButtonText: { color: '#4A90E2' },
  

});

export default HomeScreen;



