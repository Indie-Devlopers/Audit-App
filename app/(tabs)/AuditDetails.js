import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "./firebaseConfig"; // Import Firebase configuration
import DateTimePicker from "@react-native-community/datetimepicker";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import moment from 'moment';
import { BackHandler } from "react-native";
import 'moment-timezone';
import { LinearGradient } from 'expo-linear-gradient';
moment.tz.setDefault("Asia/Kolkata");

const AuditDetails = ({ route, navigation }) => {
  const { audit } = route.params;
  const [auditDetails, setAuditDetails] = useState(null);
  const [clientDetails, setClientDetails] = useState(null);
  const [auditType, setAuditType] = useState(null);
  const [isAcceptedByUser, setIsAcceptedByUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [submitting, setSubmitting] = useState(false);
  const [acceptedAuditorNames, setAcceptedAuditorNames] = useState([]);

  const handleDateConfirm = async (event, date) => {
    if (event.type === "set" && date) {
      setShowCalendar(false);
      
      // Convert the selected date to Indian timezone and format it
      const formattedDate = moment(date).tz("Asia/Kolkata").format('YYYY-MM-DD');
      setSelectedDate(new Date(formattedDate));

      try {
        setSubmitting(true);
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          console.error("User ID not found!");
          setSubmitting(false);
          return;
        }

        const userProfileRef = doc(db, "Profile", userId);
        const acceptedAuditsRef = doc(userProfileRef, "acceptedAudits", audit.id);

        // Save the audit acceptance information in the user profile
        await setDoc(acceptedAuditsRef, {
          auditId: audit.id,
          date: formattedDate, // Use the formatted date in IST
        });

        // Update the acceptedByUser field in the audit document
        const auditRef = doc(db, "audits", audit.id);
        await updateDoc(auditRef, {
          acceptedByUser: arrayUnion(userId),
        });

        // Fetch the current ongoingCounter value for the user
        const userDocSnap = await getDoc(userProfileRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const currentOngoingCounter = userData.ongoingCounter || 0;

          // Increment the ongoingCounter
          const newOngoingCounter = currentOngoingCounter + 1;

          // Update the ongoingCounter field in the user's profile
          await updateDoc(userProfileRef, {
            ongoingCounter: newOngoingCounter,
          });
        }

        setIsAcceptedByUser(true);

        // Check if selected date is today
        const today = moment().tz("Asia/Kolkata").startOf('day');
        const selectedMoment = moment(formattedDate).tz("Asia/Kolkata").startOf('day');

        // Navigate based on the date
        if (selectedMoment.isSame(today, 'day')) {
          navigation.navigate("TodaysTasks");
        } else {
          navigation.navigate("Ongoing");
        }
        setSubmitting(false);
      } catch (error) {
        console.error("Error accepting audit", error);
        setSubmitting(false);
      }
    } else {
      setShowCalendar(false);
    }
  };

  useEffect(() => {
    const backAction = () => {
      navigation.navigate("HomeScreen");
      return true; // prevent default behavior
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    const fetchAuditDetails = async () => {
      try {
        const auditRef = doc(db, "audits", audit.id);
        const auditSnap = await getDoc(auditRef);
        if (auditSnap.exists()) {
          const auditData = auditSnap.data();
          setAuditDetails(auditData);

          // Fetch audit type details
          if (auditData.auditTypeId) {
            const auditTypeRef = doc(db, "auditType", auditData.auditTypeId);
            const auditTypeSnap = await getDoc(auditTypeRef);
            if (auditTypeSnap.exists()) {
              setAuditType(auditTypeSnap.data());
            }
          }

          const userId = await AsyncStorage.getItem("userId");
          if (userId && auditData.acceptedBy && auditData.acceptedBy === userId) {
            setIsAcceptedByUser(true);
          }

          const clientRef = doc(db, "clients", auditData.clientId);
          const clientSnap = await getDoc(clientRef);

          if (clientSnap.exists()) {
            setClientDetails(clientSnap.data());
          }

          // Fetch accepted auditors' names
          const acceptedIds = auditData.acceptedByUser || [];
          if (acceptedIds.length > 0) {
            const namePromises = acceptedIds.map(async (uid) => {
              const userRef = doc(db, "Profile", uid);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                return userSnap.data().name || uid;
              } else {
                return uid;
              }
            });
            const names = await Promise.all(namePromises);
            setAcceptedAuditorNames(names);
          } else {
            setAcceptedAuditorNames([]);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching audit details:", error);
        setLoading(false);
      }
    };

    fetchAuditDetails();
  }, [audit.id]);

  const handleAccept = () => {
    if (auditDetails?.date) {
      // If date is already set, set selectedDate to that and show calendar in read-only mode
      setSelectedDate(new Date(auditDetails.date));
      setShowCalendar(true);
    } else {
      setShowCalendar(true);
    }
  };

  const renderFields = (details, includeKeys = []) => {
    return Object.keys(details)
      .filter((key) => includeKeys.includes(key))
      .map((key) => (
        <Text key={key} style={styles.detailText}>
          {key}: {details[key]}
        </Text>
      ));
  };


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#00796B', '#004D40']}
          style={styles.headerSection}
        >
          <View style={styles.headerContent}>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>New Audit</Text>
            </View>
          </View>
        </LinearGradient>

        {auditDetails && clientDetails ? (
          <View style={styles.contentContainer}>
            <View style={styles.card}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 0.95)']}
                style={styles.cardGradient}
              >
                {/* 1. Client Name */}
                <View style={styles.infoRow}>
                  <View style={styles.iconContainer}>
                    <MaterialIcons name="business" size={24} color="#1976D2" />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.label}>Client</Text>
                    <Text style={styles.infoText}>{clientDetails?.name}</Text>
                  </View>
                </View>
                {/* 2. Audit Type */}
                {auditType?.name ? (
                  <View style={styles.infoRow}>
                    <View style={styles.iconContainer}>
                      <MaterialIcons name="assignment" size={24} color="#9C27B0" />
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.label}>Audit Type</Text>
                      <Text style={styles.infoText}>{auditType.name}</Text>
                    </View>
                  </View>
                ) : null}
                 {/* 3. Branch Name */}
                {auditDetails?.branchName ? (
                  <View style={styles.infoRow}>
                    <View style={styles.iconContainer}>
                      <Ionicons name="business-outline" size={24} color="#9C27B0" />
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.label}>Branch</Text>
                      <Text style={styles.infoText}>{auditDetails.branchName}</Text>
                    </View>
                  </View>
                ) : null}
                {/* 4. State */}
                {auditDetails?.state ? (
                  <View style={styles.infoRow}>
                    <View style={styles.iconContainer}>
                      <MaterialIcons name="map" size={24} color="#FF5722" />
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.label}>State</Text>
                      <Text style={styles.infoText}>{auditDetails.state}</Text>
                    </View>
                  </View>
                ) : null}
                {/* 5. Distributor Name */}
                {auditDetails?.distributor ? (
                  <View style={styles.infoRow}>
                    <View style={styles.iconContainer}>
                      <MaterialIcons name="person" size={24} color="#388E3C" />
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.label}>Distributor</Text>
                      <Text style={styles.infoText}>{auditDetails.distributor}</Text>
                    </View>
                  </View>
                ) : null}
               
                
                {/* 6. City */}
                {auditDetails?.city ? (
                  <View style={styles.infoRow}>
                    <View style={styles.iconContainer}>
                      <MaterialIcons name="location-city" size={24} color="#FF5722" />
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.label}>City</Text>
                      <Text style={styles.infoText}>{auditDetails.city}</Text>
                    </View>
                  </View>
                ) : null}
                {/* 7. Claim No. */}
                {auditDetails?.claimNo ? (
                  <View style={styles.infoRow}>
                    <View style={styles.iconContainer}>
                      <MaterialIcons name="confirmation-number" size={24} color="#607D8B" />
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.label}>Claim No.</Text>
                      <Text style={styles.infoText}>{auditDetails.claimNo}</Text>
                    </View>
                  </View>
                ) : null}

                 {/* 8. Claimed Amount */}
                {auditDetails?.claimedAmount ? (
                  <View style={styles.infoRow}>
                    <View style={styles.iconContainer}>
                      <MaterialIcons name="currency-rupee" size={24} color="#388E3C" />
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.label}>Claimed Amount</Text>
                      <Text style={styles.infoText}>{auditDetails.claimedAmount}</Text>
                    </View>
                  </View>
                ) : null}
                {/* 9. Date */}
                {auditDetails?.date ? (
                  <View style={styles.infoRow}>
                    <View style={styles.iconContainer}>
                      <MaterialIcons name="event" size={24} color="#1976D2" />
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.label}>Date</Text>
                      <Text style={styles.infoText}>{auditDetails.date}</Text>
                    </View>
                  </View>
                ) : null}
               
                
                {/* 10. External Auditors */}
                {auditDetails?.externalAuditors && auditDetails.externalAuditors.length > 0 ? (
                  <View style={styles.infoRow}>
                    <View style={styles.iconContainer}>
                      <MaterialCommunityIcons name="account-group" size={24} color="#009688" />
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.label}>External Auditors</Text>
                      <Text style={styles.infoText}>
                        {auditDetails.externalAuditors.map(auditor => auditor.name).filter(Boolean).join(', ')}
                      </Text>
                    </View>
                  </View>
                ) : null}
                {/* 11. Add Note */}
                {auditDetails?.note ? (
                  <View style={styles.infoRow}>
                    <View style={styles.iconContainer}>
                      <MaterialIcons name="note" size={24} color="#607D8B" />
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.label}>Note</Text>
                      <Text style={styles.infoText}>{auditDetails.note}</Text>
                    </View>
                  </View>
                ) : null}
                {/* 12. Accepted Auditors */}
                <View style={styles.infoRow}>
                  <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="account-check" size={24} color="#1976D2" />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.label}>Accepted Auditors</Text>
                    {acceptedAuditorNames.length > 0 ? (
                      <Text style={styles.infoText}>{acceptedAuditorNames.join(', ')}</Text>
                    ) : (
                      <Text style={styles.infoText}>No one has accepted yet. You can be the first to accept this audit.</Text>
                    )}
                  </View>
                </View>
              </LinearGradient>
            </View>

            {!isAcceptedByUser && (
              <TouchableOpacity 
                style={styles.acceptButtonContainer}
                onPress={handleAccept}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#4CAF50', '#388E3C']}
                  style={styles.acceptButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                  <Text style={styles.buttonText}>Accept Audit</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={48} color="#D32F2F" />
            <Text style={styles.errorText}>No data found!</Text>
          </View>
        )}
      </ScrollView>

      {submitting && (
        <View style={styles.submittingOverlay}>
          <ActivityIndicator size="large" color="#6200ee" />
        </View>
      )}

      {showCalendar && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateConfirm}
          themeVariant="light"
          accentColor="#00796B"
          androidVariant="nativeAndroid"
          positiveButtonLabel="OK"
          negativeButtonLabel="Cancel"
          positiveButton={{ label: 'OK', textColor: '#00796B' }}
          negativeButton={{ label: 'Cancel', textColor: '#00796B' }}
          minimumDate={auditDetails?.date ? new Date(auditDetails.date) : undefined}
          maximumDate={auditDetails?.date ? new Date(auditDetails.date) : undefined}
          disabled={!!auditDetails?.date}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  scrollView: {
    flex: 1,
  },
  headerSection: {
    paddingTop: 15,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    marginBottom: 15,
  },
  headerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 45,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardGradient: {
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    fontWeight: '500',
  },
  infoText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  acceptButtonContainer: {
    marginTop: 20,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonText: {
    marginLeft: 10,
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 40,
  },
  errorText: {
    fontSize: 16,
    color: "#D32F2F",
    marginTop: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  submittingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  '@global': {
    '.react-native-modal-datetime-picker': {
      backgroundColor: '#00796B',
    },
    '.react-native-modal-datetime-picker .header': {
      backgroundColor: '#00796B',
    },
    '.react-native-modal-datetime-picker .confirm': {
      color: '#00796B',
    },
  },
});

export default AuditDetails;