import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { app } from './firebaseConfig';
import { Calendar } from 'react-native-calendars';

const db = getFirestore(app);

const CalendarScreen = () => {
  const [markedDates, setMarkedDates] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

        const auditPromises = acceptedAuditsSnap.docs.map(async (auditDoc) => {
          const acceptedAuditData = auditDoc.data();
          const acceptedDate = acceptedAuditData ? acceptedAuditData.date : null;

          if (acceptedDate) {
            dates[acceptedDate] = { selected: true, marked: true, selectedColor: 'green' };
          }
        });

        await Promise.all(auditPromises);

        setMarkedDates(dates);
      } catch (error) {
        console.error("Error loading accepted dates:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAcceptedDates();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : (
        <Calendar
          markedDates={markedDates}
          theme={{
            selectedDayBackgroundColor: 'green',
            todayTextColor: 'red',
            arrowColor: 'blue',
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CalendarScreen;