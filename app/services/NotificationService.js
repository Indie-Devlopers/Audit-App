import * as Notifications from 'expo-notifications';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../(tabs)/firebaseConfig";
import moment from 'moment-timezone';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const setupDailyNotifications = async () => {
  try {
    // Request notification permissions
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    // Cancel any existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule the daily check
    const trigger = {
      hour: 9, // 9 AM
      minute: 0,
      repeats: true,
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Daily Audit Check",
        body: "Checking your audits for today...",
      },
      trigger,
    });

    // Do an immediate check
    await checkAndNotifyAudits();
  } catch (error) {
    console.error('Error setting up notifications:', error);
  }
};

export const checkAndNotifyAudits = async () => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) return;

    const today = moment().tz("Asia/Kolkata").startOf('day');
    
    // Get user's accepted audits
    const acceptedAuditsRef = collection(db, "Profile", userId, "acceptedAudits");
    const acceptedSnapshot = await getDocs(acceptedAuditsRef);
    
    let todayAudits = [];
    let notSubmittedAudits = [];
    let incompleteAudits = [];

    // Process each accepted audit
    for (const acceptedDoc of acceptedSnapshot.docs) {
      const acceptedData = acceptedDoc.data();
      const auditRef = doc(db, "audits", acceptedData.auditId);
      const auditSnap = await getDoc(auditRef);
      
      if (!auditSnap.exists()) continue;
      
      const auditData = auditSnap.data();
      const auditDate = moment(auditData.date).tz("Asia/Kolkata").startOf('day');

      // Check if audit is for today
      if (auditDate.isSame(today, 'day')) {
        todayAudits.push(auditData);
      }

      // Check if audit is not submitted
      if (!auditData.isSubmitted && auditDate.isSameOrBefore(today, 'day')) {
        notSubmittedAudits.push(auditData);
      }

      // Check if audit is incomplete
      if (auditData.isSubmitted && !auditData.isCompleted) {
        incompleteAudits.push(auditData);
      }
    }

    // Send notifications based on findings
    if (todayAudits.length > 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Today's Audits",
          body: `You have ${todayAudits.length} audit${todayAudits.length > 1 ? 's' : ''} scheduled for today.`,
          data: { type: 'today' },
        },
        trigger: null, // Send immediately
      });
    }

    if (notSubmittedAudits.length > 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Not Submitted Audits",
          body: `You have ${notSubmittedAudits.length} audit${notSubmittedAudits.length > 1 ? 's' : ''} pending submission.`,
          data: { type: 'notSubmitted' },
        },
        trigger: { seconds: 5 }, // Send after 5 seconds
      });
    }

    if (incompleteAudits.length > 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Incomplete Audits",
          body: `You have ${incompleteAudits.length} incomplete audit${incompleteAudits.length > 1 ? 's' : ''}.`,
          data: { type: 'incomplete' },
        },
        trigger: { seconds: 10 }, // Send after 10 seconds
      });
    }

  } catch (error) {
    console.error('Error checking audits:', error);
  }
};

// Handle notification taps
export const handleNotificationResponse = (response, navigation) => {
  const data = response.notification.request.content.data;
  
  switch (data.type) {
    case 'today':
      navigation.navigate('TodaysTasks');
      break;
    case 'notSubmitted':
      navigation.navigate('NotSubmitted');
      break;
    case 'incomplete':
      navigation.navigate('IncompleteTasks');
      break;
  }
};

// Add default export
const NotificationService = {
  setupDailyNotifications,
  checkAndNotifyAudits,
  handleNotificationResponse,
};

export default NotificationService; 