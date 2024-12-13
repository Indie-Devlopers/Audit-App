<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, Modal, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { fetchCompletedAuditsCount } from "./CompletedTasks";
import { getAuth } from 'firebase/auth';
=======
import React, { useState, useEffect } from 'react';  // Make sure it's only here, not multiple times

import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, Dimensions,Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { firebase } from './firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDocs, collection, updateDoc, doc, arrayUnion } from "firebase/firestore";
import { db } from "./firebaseConfig";
import AuditDetails from "./AuditDetails";
// import { useEffect, useState } from "react";
// import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get("window");
>>>>>>> b9f48e99e16895170955d10a15b6812dc1f2c671

const HomeScreen = ({ navigation, route }) => {
  
  const [completedAuditsCount, setCompletedAuditsCount] = useState(0);
  const [userId, setUserId] = useState(null);
  const userEmail = route?.params?.userEmail || '';
  const [greeting, setGreeting] = useState('');
  const [userName, setUserName] = useState('');
  const [audits, setAudits] = useState([]);
  const [clientsData, setClientsData] = useState({});
  const [branchesData, setBranchesData] = useState([]);
<<<<<<< HEAD
  const [loading, setLoading] = useState(true);
  const [ongoingCounter, setOngoingCounter] = useState(0);
  const [ongoingAudits, setOngoingAudits] = useState([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    date: '',
    city: '',
    state: '',
  });
  const [originalAudits, setOriginalAudits] = useState([]); // To store unfiltered audits
  const [hasAcceptedAllAudits, setHasAcceptedAllAudits] = useState(false);

  const loadUserData = async () => {
    try {
      const userDoc = await db.collection('Profile').where('email', '==', userEmail).get();
      if (!userDoc.empty) {
        const userId = userDoc.docs[0].id;
        setUserId(userId);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };




  const filterAudits = async () => {
    if (!userId) return [];

    const acceptedAudits = await getAcceptedAudits(userId);
    const completedAudits = await getCompletedAudits(userId);


    useEffect(() => {
      const loadData = async () => {
        try {
          // Fetch audits
          const auditRef = collection(db, 'audits');
          const snapshot = await getDocs(auditRef);
          const auditData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setAudits(auditData);
          setOriginalAudits(auditData);
=======
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  // const [userId, setUserId] = useState(""); // To store logged-in user's ID
 

  

  useEffect(() => {
 
    const loadData = async () => {
      try {
        // Fetch audits from Firebase collection 'audits'
        const auditRef = collection(db, "audits");
        const snapshot = await getDocs(auditRef);
        const auditData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAudits(auditData);
>>>>>>> b9f48e99e16895170955d10a15b6812dc1f2c671

          const clientsRef = collection(db, 'clients');
          const clientSnapshot = await getDocs(clientsRef);
          const clients = {};
          clientSnapshot.docs.forEach((doc) => {
            clients[doc.id] = doc.data().name;
          });
          setClientsData(clients);

          // Fetch branches
          const branchesRef = collection(db, 'branches');
          const branchSnapshot = await getDocs(branchesRef);
          const branches = branchSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setBranchesData(branches);

        
          const userDoc = await db.collection('Profile').where('email', '==', userEmail).get();
          if (!userDoc.empty) {
            const userId = userDoc.docs[0].id;
            setUserId(userId);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      loadData();
    }, [userEmail]);

    // Filter out audits that the user has already accepted or completed
    const filteredAudits = originalAudits.filter((audit) => {
      return !acceptedAudits.includes(audit.id) && !completedAudits.includes(audit.id);
    });

    return filteredAudits;
  };
  const getAcceptedAudits = async (userId) => {
    const acceptedAuditsRef = collection(db, `Profile/${userId}/AcceptedAudits`);
    const snapshot = await getDocs(acceptedAuditsRef);
    const acceptedAudits = snapshot.docs.map((doc) => doc.id);
    return acceptedAudits;
  };
  const getCompletedAudits = async (userId) => {
    const completedAuditsRef = collection(db, `Profile/${userId}/CompletedAudits`);
    const snapshot = await getDocs(completedAuditsRef);
    const completedAudits = snapshot.docs.map((doc) => doc.id);
    return completedAudits;
  };
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch audits
        const auditRef = collection(db, 'audits');
        const snapshot = await getDocs(auditRef);
        const auditData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAudits(auditData);
        setOriginalAudits(auditData); // Save the unfiltered audits

        // Fetch clients
        const clientsRef = collection(db, 'clients');
        const clientSnapshot = await getDocs(clientsRef);
        const clients = {};
        clientSnapshot.docs.forEach((doc) => {
          clients[doc.id] = doc.data().name;
        });
        setClientsData(clients);

        // Fetch branches
        const branchesRef = collection(db, 'branches');
        const branchSnapshot = await getDocs(branchesRef);
        const branches = branchSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBranchesData(branches);

        // Fetch user ID from Profile collection based on email
        const userDoc = await db.collection('Profile').where('email', '==', userEmail).get();
        if (!userDoc.empty) {
          const userId = userDoc.docs[0].id;
          setUserId(userId);

          // Set user name for greeting
          setUserName(userEmail ? userEmail.split('@')[0] : 'Auditor');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }

      const currentTime = new Date().getHours();
<<<<<<< HEAD
      setGreeting(currentTime < 12 ? 'Good Morning Auditor' : currentTime < 19 ? 'Good Afternoon Auditor ' : 'Good Evening Auditor');
=======
      setGreeting(currentTime < 12 ? "Good Morning" : currentTime < 19 ? "Good Afternoon " : "Good Evening");
      setUserName(userEmail ? userEmail.split("@")[0] : "Auditor");
>>>>>>> b9f48e99e16895170955d10a15b6812dc1f2c671
    };

    

    loadData();
  }, [userEmail]);

<<<<<<< HEAD


  useEffect(() => {
    if (userId && originalAudits.length > 0) {
      filterAudits().then((filtered) => {
        setAudits(filtered); // Update the audits state with the filtered audits
      });
    }
  }, [userId, originalAudits]);

  useEffect(() => {
    const checkIfAcceptedAll = async () => {
      if (userId) {
        const userProfileDoc = await db.collection('Profile').doc(userId).get();
        const acceptedAudits = userProfileDoc.data()?.AcceptedAudits || [];

        const allAuditIds = filteredAudits.map((audit) => audit.id);

        // Check if the user has accepted all upcoming audits
        const hasAcceptedAll = allAuditIds.every((id) => acceptedAudits.includes(id));

        setHasAcceptedAllAudits(hasAcceptedAll);
      }
    };

    // Ensure we are only checking when the audits are fully loaded
    if (filteredAudits.length > 0 && userId) {
      checkIfAcceptedAll();
    }
  }, [filteredAudits, userId]); // Re-run this when filteredAudits or userId changes

  // Filtered Audits should exclude the audits that the user has already accepted
=======
  const getAvatar = (Client) => {
    const firstLetter = Client ? Client.charAt(0).toUpperCase() : "Ⓐ";
    return firstLetter;
  };

  const acceptAudit = async (auditId) => {
    try {
      // Update the audit with auditorId and isAccepted status
      const auditRef = doc(db, "audits", auditId);
      await updateDoc(auditRef, {
        auditorId: userId, // Set the auditorId to the logged-in user's ID
        isAccepted: true, // Mark the audit as accepted
      });
  
      // Update the logged-in user's Profile with the accepted auditId
      if (userId) {
        const userRef = doc(db, "Profile", userId); // Reference to the specific user document
        await updateDoc(userRef, {
          AcceptedAudits: arrayUnion(auditId), // Add the auditId to the AcceptedAudits array
        });
  
        console.log("Audit accepted successfully!");
      } else {
        console.log("User ID is not available.");
      }
    } catch (error) {
      console.error("Error accepting audit:", error);
    }
  };
  

  const completeAudit = async (auditId) => {
    try {
      // Fetch the audit data to check if it's accepted
      const auditRef = doc(db, "audits", auditId);
      const auditSnapshot = await getDoc(auditRef);
      const auditData = auditSnapshot.data();
  
      // Only allow marking as complete if isAccepted is true
      if (auditData.isAccepted) {
        // Update the audit to mark it as complete
        await updateDoc(auditRef, {
          isCompleted: true, // Set the isCompleted field to true
        });
  
        console.log("Audit marked as complete!");
      } else {
        console.log("Audit is not accepted, cannot mark as complete.");
      }
    } catch (error) {
      console.error("Error completing audit:", error);
    }
  };
  

  // Filter the audits based on status, location, and search term
>>>>>>> b9f48e99e16895170955d10a15b6812dc1f2c671
  const filteredAudits = audits.filter((audit) => {
    return !audit.acceptedBy || !audit.acceptedBy.includes(userId);
  });

<<<<<<< HEAD

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
      setOngoingCounter(querySnapshot.size); // Sets the ongoingCounter to the number of ongoing audits
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
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greetingText}>
          {greeting}, {userName}!
        </Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="filter" size={24} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal visible={filterModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Audits</Text>
            <TextInput
              style={styles.input}
              placeholder="Date (YYYY-MM-DD)"
              value={filters.date}
              onChangeText={(text) => setFilters({ ...filters, date: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="City"
              value={filters.city}
              onChangeText={(text) => setFilters({ ...filters, city: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="State"
              value={filters.state}
              onChangeText={(text) => setFilters({ ...filters, state: text })}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalButton} onPress={applyFilters}>
                <Text style={styles.modalButtonText}>Apply</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.resetButton]}
                onPress={resetFilters}
              >
                <Text style={styles.modalButtonText}>Reset</Text>
=======
 

  const logout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => {
            // Clear any stored session or data here, like AsyncStorage or Firebase logout
            AsyncStorage.clear();
            navigation.replace("LoginScreen"); // Navigate back to the login screen
          },
        },
      ],
      { cancelable: false }
    );
  };


  return (
    
    <View style={styles.fullScreen}>
         <View>
      {userId ? (
        <Text>Welcome, User ID: {userId}</Text>
      ) : (
        <Text>.</Text>
      )}
    </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.topRightIconContainer}>
          <TouchableOpacity onPress={logout}>
            <Ionicons name="log-out" size={30} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>{greeting}, {userName}</Text>
          
        </View>

        <View style={styles.container}>
          {/* Task Boxes Section */}
          <View style={styles.taskBoxesContainer}>
            <TouchableOpacity style={styles.taskBox}>
              <TouchableOpacity onPress={() => navigation.navigate("UserInfo")}>
                <Ionicons name="calendar" size={30} color="black" style={styles.icon} />
                <Text style={styles.taskBoxTitle}>Today's Tasks</Text>
                <Text style={styles.taskBoxContent}>{todayTasks.length} Tasks</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity style={styles.taskBox}>
              <TouchableOpacity onPress={() => navigation.navigate("Ongoing")}>
                <Ionicons name="play-circle" size={30} color="black" style={styles.icon} />
                <Text style={styles.taskBoxTitle}>Ongoing Tasks</Text>
                <Text style={styles.taskBoxContent}>{ongoingAudits.length} Tasks</Text>
>>>>>>> b9f48e99e16895170955d10a15b6812dc1f2c671
              </TouchableOpacity>
            </View>
          </View>
<<<<<<< HEAD
        </View>
      </Modal>

      {/* Cards Row */}

      <Text style={{ fontSize: 18, fontWeight: 'bold', colr: 'black' }}>Categories</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.card, styles.todayTasks]}
          onPress={() => navigation.navigate('TodaysTasks')}
        >
          <Ionicons name="calendar" size={30} color="#4A90E2" style={styles.icon} />
          <Text style={styles.cardTitle}>Today's Audits</Text>
          <Text style={styles.cardContent}>{todayAudits.length > 0 ? todayAudits.length : 'No Tasks'}</Text>
        </TouchableOpacity>

     
        <TouchableOpacity
      style={[styles.card, styles.ongoingTasks]}
      onPress={() => navigation.navigate('Ongoing')}
    >
      <Ionicons name="play-circle" size={30} color="#FF9F00" style={styles.icon} />
      <Text style={styles.cardTitle}>Ongoing Audits</Text>
      <Text style={styles.cardContent}>
        {ongoingCounter > 0 ? ongoingCounter : 'No Tasks'}
      </Text>
    </TouchableOpacity>


        <TouchableOpacity
          style={[styles.card, styles.completedTasks]}
          onPress={() => navigation.navigate("CompletedTasks")}
        >
          <Ionicons
            name="checkmark-circle"
            size={30} couhn
            color="#28A745"
            style={styles.icon}
          />
          <Text style={styles.cardTitle}>Completed Audits</Text>
          <Text style={styles.cardContent}>{completedAuditsCount} Tasks</Text>
        </TouchableOpacity>
      </View>


      {/* Upcoming Audits Section */}
      <View style={styles.upcomingAuditsContainer}>
        <Text style={styles.upcomingAuditsTitle}>Upcoming Audits</Text>
        {hasAcceptedAllAudits ? (
          <View style={styles.noAuditsContainer}>
            <Image source={require('./Images/nua.jpg')} style={styles.noAuditsImage} />
            <Text style={styles.noAuditsText}>You have accepted all upcoming audits</Text>
          </View>
        ) :
          (

            <FlatList
              data={audits}
              renderItem={({ item }) => (
                <View style={styles.auditCard}>
                  <View style={styles.auditDetails}>
                    <Text style={styles.auditTitle}>{item.name}</Text>
                    <Text style={styles.auditClient}>
                      Client: {clientsData[item.clientId] || 'Unknown Client'}
                    </Text>
                    <Text style={styles.auditLocation}>
                      Location: {branchesData.find((branch) => branch.id === item.branchId)?.city || 'Unknown Location'}
                    </Text>
                  </View>
=======

          <TouchableOpacity style={styles.taskBox2}>
            <TouchableOpacity onPress={() => navigation.navigate("Completed-Tasks")}>
              <Ionicons name="checkmark-circle" size={30} color="black" style={styles.icon} />
              <Text style={styles.taskBoxTitle}>Completed Tasks</Text>
              <Text style={styles.taskBoxContent}>{completedTasks.length} Tasks</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Upcoming Audits Section */}
          <View style={styles.upcomingAuditsContainer}>
            <Text style={styles.upcomingAuditsText}>Upcoming Audits</Text>

            <FlatList
              data={filteredAudits}
              renderItem={({ item }) => {
                const clientName = clientsData[item.clientId] || "Unknown Client";
                const branch = branchesData.find((branch) => branch.id === item.branchId);
                const branchCity = branch ? branch.city : "Unknown Location";

                return (
>>>>>>> b9f48e99e16895170955d10a15b6812dc1f2c671
                  <TouchableOpacity
                    style={styles.seeMoreButton}
                    onPress={() => navigation.navigate('AuditDetails', { audit: item })}
                  >
<<<<<<< HEAD
                    <Text style={styles.seeMoreButtonText}>See More Info</Text>
=======
                    <View style={styles.clientImageContainer}>
                      <Text style={styles.clientImage}>{getAvatar(item.auditorId)}</Text>
                    </View>
                    <View style={styles.auditContent}>
                      <Text style={styles.auditName}>{item.name}</Text>
                      <Text style={styles.auditLocation}>{clientName}</Text>
                      <Text style={styles.auditLocation}>{branchCity}</Text>
                    </View>
                    <View style={styles.actionsContainer}>
                    
                        <TouchableOpacity
                          style={styles.acceptButton}
                          onPress={() => navigation.navigate("AuditDetails", { audit: item })}
                        >
                          <Text style={styles.buttonText}>See More</Text>
                        </TouchableOpacity>
                      
                    </View>
>>>>>>> b9f48e99e16895170955d10a15b6812dc1f2c671
                  </TouchableOpacity>
                </View>
              )}
              keyExtractor={(item) => item.id}
            />

          )}
      </View>
    </ScrollView>
  );
};

<<<<<<< HEAD


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 30
  },
  card: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
    color: '#000',
  },
  cardContent: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
  },
  icon: {
    marginBottom: 8,
  },
  todayTasks: {
    backgroundColor: '#EAF4FF',
  },
  ongoingTasks: {
    backgroundColor: '#FFF4E5',
  },
  completedTasks: {
    backgroundColor: '#E8F8E9',
  },
  upcomingAuditsContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  upcomingAuditsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  auditCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
=======
const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  greetingContainer: {
    padding: 15,
    backgroundColor: "#6200ea",
  },
  greetingText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  container: {
    padding: 20,
  },
  taskBoxesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  taskBox: {
    width: (width - 60) / 2,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  taskBoxTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  taskBoxContent: {
    fontSize: 14,
    marginTop: 5,
  },
  taskBox2: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  upcomingAuditsContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 3,
  },
  topRightIconContainer: {
   marginBottom:20,
   marginRight:50
    
  },
  upcomingAuditsText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  auditItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  clientImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: "#6200ea",
    justifyContent: "center",
    alignItems: "center",
  },
  clientImage: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
>>>>>>> b9f48e99e16895170955d10a15b6812dc1f2c671
  },
  auditDetails: {
    flex: 1,
    paddingLeft: 10,
  },
<<<<<<< HEAD
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
  // Other styles remain unchanged

  auditTitle: {
=======
  auditName: {
>>>>>>> b9f48e99e16895170955d10a15b6812dc1f2c671
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#4A90E2',
  },
<<<<<<< HEAD
  auditClient: {
    fontSize: 14,
    color: '#666',
  },
  auditLocation: {
    fontSize: 14,
    color: '#666',
  },
  seeMoreButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  seeMoreButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  noAuditsText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
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
=======
  auditLocation: {
    fontSize: 14,
    color: "#888",
  },
  actionsContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: "#4caf50",
    padding: 10,
    borderRadius: 5,
  },
  completeButton: {
    backgroundColor: "#4caf50",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
>>>>>>> b9f48e99e16895170955d10a15b6812dc1f2c671
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { borderBottomWidth: 1, marginBottom: 10 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-around' },
  modalButton: { padding: 10 },
  modalButtonText: { color: '#4A90E2' },
  // Other styles remain unchanged

});

export default HomeScreen;



