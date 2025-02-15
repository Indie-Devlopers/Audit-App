import React, { useEffect } from 'react';
import { Alert, TouchableOpacity, Text, View, StyleSheet, Animated } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

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
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
        },
        tabBarActiveTintColor: '#00796B',
        tabBarInactiveTintColor: '#95a5a6',
        tabBarShowLabel: false,
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
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "calendar" : "calendar-outline"} 
              color={color}
              size={24} 
            />
          ),
        }}
      />

      <Tab.Screen
        name="DashBoard"
        component={HomeScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View style={styles.homeTabContainer}>
              <LinearGradient
                colors={focused ? ['#00796B', '#004D40'] : ['#26A69A', '#00796B']}
                style={styles.homeGradient}
              >
                <Ionicons 
                  name="home"
                  color="#ffffff"
                  size={24}
                />
              </LinearGradient>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Guide"
        component={GuideScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "help-circle" : "help-circle-outline"} 
              color={color}
              size={24} 
            />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "person" : "person-outline"} 
              color={color}
              size={24} 
            />
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
  return (
    // <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginScreen">
        {/* Login Screen */}
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
       
        <Stack.Screen
          name="HomeScreen"
          component={BottomTabs}
          options={{ headerShown: false }}
        />
        {/* Additional Screens not part of Bottom Tabs */}
        <Stack.Screen name="Ongoing" component={Ongoing}  options={{ headerShown: false }}  />
        <Stack.Screen name="ReportScreen" component={ReportScreen}  options={{ headerShown: false }}  />
        <Stack.Screen name="CompletedTasks" component={CompletedTasks}  options={{ headerShown: false }}   />
        <Stack.Screen name="Calendar" component={CalendarScreen}   options={{ headerShown: false }}  />
        <Stack.Screen name="TodaysTasks" component={TodaysTasks}  options={{ headerShown: false }} />
        <Stack.Screen name="AuditDetails" component={AuditDetails}  options={{ headerShown: false }}  />
        <Stack.Screen name="ClientDetails" component={ClientDetails}  options={{ headerShown: false }}  />
        <Stack.Screen name="RejectedAudits" component={RejectedAudits}  options={{ headerShown: false }}  />
        <Stack.Screen name="NotSubmitted" component={NotSubmitted} options={{ headerShown: false }} />
        <Stack.Screen
          name="IncompleteTasks"
          component={IncompleteTasks}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Report" 
          component={Report}
          options={{ 
            headerShown: false
          }}
        />
      </Stack.Navigator>
    // </NavigationContainer>
  );
}
