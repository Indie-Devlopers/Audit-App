


import React from "react";
import { Alert, TouchableOpacity, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";



// Import your screens
import LoginScreen from "./LoginScreen";
import HomeScreen from "./HomeScreen";
import Ongoing from "./Ongoing";
import ProfileScreen from "./ProfileScreen";
import ClientDetails from "./ClientDetails";
import CompletedTasks from "./CompletedTasks";
import AuditDetails from "./AuditDetails";
import RejectedAudits from "./RejectedAudits";
import UpcomingAudits from "./UpcomingAudits";
import TodaysTasks from "./TodaysTasks";
import ReportScreen from "./ReportScreen"; // Import the ReportScreen

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

// Updated Bottom Tabs Navigator
function BottomTabs({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { height: 60 },
      }}
    >
  <Tab.Screen
  name="DashBoard"
  component={HomeScreen}
  options={{
    headerShown: false, // If you also want to hide the header
    tabBarLabel: () => null, // Completely removes the label
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="home" color={color} size={size} />
    ),
  }}
/>



      
      
      
      <Tab.Screen
        name="CompletedTasks"
        component={CompletedTasks}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-done" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Main App Navigator
export default function App() {
  return (
    <NavigationContainer>
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
        <Stack.Screen name="CompletedTasks" component={CompletedTasks}    />
        <Stack.Screen name="TodaysTasks" component={TodaysTasks}  options={{ headerShown: false }} />
        <Stack.Screen name="AuditDetails" component={AuditDetails}   />
        <Stack.Screen name="ClientDetails" component={ClientDetails}  options={{ headerShown: false }}  />
        <Stack.Screen name="RejectedAudits" component={RejectedAudits}  options={{ headerShown: false }}  />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
