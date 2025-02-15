import React, { useEffect } from 'react';
import { Alert, TouchableOpacity, Text, View, StyleSheet, Animated, BackHandler } from "react-native";
import { NavigationContainer, CommonActions } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import NotificationService, { 
  setupDailyNotifications, 
  handleNotificationResponse 
} from '../services/NotificationService';
import * as Notifications from 'expo-notifications';

// Import your screens
import LoginScreen from "./LoginScreen";
import HomeScreen from "./HomeScreen";
import Ongoing from "./Ongoing";
import CalendarScreen from "./Calendar";
import ProfileScreen from "./ProfileScreen";
import ClientDetails from "./ClientDetails";
import CompletedTasks from "./CompletedTasks";
import AuditDetails from "./AuditDetails";
import RejectedAudits from "./RejectedAudits";
import UpcomingAudits from "./UpcomingAudits";
import TodaysTasks from "./TodaysTasks";
import ReportScreen from "./ReportScreen";
import NotSubmitted from "./NotSubmitted";
import IncompleteTasks from './IncompleteTasks';
import Report from './Report';
import GuideScreen from './GuideScreen.js';

// Firebase sign-out and auth imports
import { signOut } from "firebase/auth";
import { auth } from "./firebaseConfig"; // Assuming your Firebase auth is configured

// Stack and Tab Navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Handle logout action
const handleLogout = (navigation) => {
  signOut(auth)
    .then(() => {
      console.log("User logged out.");
      navigation.navigate("LoginScreen"); // Navigate to LoginScreen after successful logout
    })
    .catch((error) => {
      console.error("Error logging out: ", error); // Handle any errors that occur during logout
    });
};

// Logout confirmation function
const confirmLogout = (navigation) => {
  Alert.alert("Logout", "Are you sure you want to logout?", [
    { text: "Cancel", style: "cancel" },
    { text: "Logout", onPress: () => handleLogout(navigation) },
  ]);
};

function TabIcon({ name, color, size, focused }) {
  const scaleValue = new Animated.Value(1);

  useEffect(() => {
    if (focused) {
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.2,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [focused]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <Ionicons name={name} color={color} size={size} />
    </Animated.View>
  );
}

function HomeButton({ focused }) {
  const scaleValue = new Animated.Value(1);

  useEffect(() => {
    if (focused) {
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.15,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [focused]);

  return (
    <Animated.View 
      style={[
        styles.homeTabContainer,
        { transform: [{ scale: scaleValue }] }
      ]}
    >
      <LinearGradient
        colors={focused ? ['#00796B', '#004D40'] : ['#26A69A', '#00796B']}
        style={styles.homeGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons 
          name="home"
          color="#ffffff"
          size={28}
        />
      </LinearGradient>
    </Animated.View>
  );
}

// Updated Bottom Tabs Navigator
function BottomTabs({ navigation }) {
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Let the OS handle the back button for tab screens
      return false;
    });

    return () => backHandler.remove();
  }, []);

  return (
    <Tab.Navigator
      initialRouteName="DashBoard"
      screenOptions={{
        tabBarStyle: {
          height: 60,
          backgroundColor: '#ffffff',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          borderTopWidth: 0,
          paddingHorizontal: 10,
        },
        tabBarActiveTintColor: '#00796B',
        tabBarInactiveTintColor: '#95a5a6',
      }}
    >
      <Tab.Screen
        name="Submitted Audits"
        component={CompletedTasks}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "checkmark-done-circle" : "checkmark-done-circle-outline"} 
              color={color}
              size={24} 
            />
          ),
        }}
      />

      <Tab.Screen
        name="Accpected Audits Calendar"
        component={CalendarScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="DashBoard"
        component={HomeScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          tabBarLabel: 'Home'
        }}
      />

      <Tab.Screen
        name="UpcomingAudits"
        component={UpcomingAudits}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "clipboard" : "clipboard-outline"} 
              size={24} 
              color={color} 
            />
          ),
          tabBarLabel: 'Available'
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  homeTabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    top: -20,
    height: 45,
    width: 45,
    borderRadius: 23,
    backgroundColor: '#fff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  homeGradient: {
    height: 45,
    width: 45,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Main App Navigator
export default function App() {
  useEffect(() => {
    // Set up notifications
    setupDailyNotifications();

    // Listen for notification taps
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      handleNotificationResponse(response, navigation);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <Stack.Navigator 
      initialRouteName="LoginScreen"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="HomeScreen" component={BottomTabs} />
      
      {/* Stack screens */}
      <Stack.Screen 
        name="CompletedTasks" 
        component={CompletedTasks}
        options={{
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
      <Stack.Screen name="AuditDetails" component={AuditDetails} />
      <Stack.Screen name="ClientDetails" component={ClientDetails} />
      <Stack.Screen name="RejectedAudits" component={RejectedAudits} />
      <Stack.Screen name="NotSubmitted" component={NotSubmitted} />
      <Stack.Screen name="IncompleteTasks" component={IncompleteTasks} />
      <Stack.Screen name="TodaysTasks" component={TodaysTasks} />
      <Stack.Screen name="Ongoing" component={Ongoing} />
      <Stack.Screen name="Report" component={Report} />
      <Stack.Screen name="ReportScreen" component={ReportScreen} />
      <Stack.Screen name="GuideScreen" component={GuideScreen} />
    </Stack.Navigator>
  );
}
