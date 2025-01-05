


// import React from "react";
// import { Alert, TouchableOpacity, Text } from "react-native";
// import { NavigationContainer } from "@react-navigation/native";
// import { createStackNavigator } from "@react-navigation/stack";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import { Ionicons } from "@expo/vector-icons";



// // Import your screens
// import LoginScreen from "./LoginScreen";
// import HomeScreen from "./HomeScreen";
// import Ongoing from "./Ongoing";
// import ProfileScreen from "./ProfileScreen";
// import ClientDetails from "./ClientDetails";
// import CompletedTasks from "./CompletedTasks";
// import AuditDetails from "./AuditDetails";
// import RejectedAudits from "./RejectedAudits";
// import UpcomingAudits from "./UpcomingAudits";
// import TodaysTasks from "./TodaysTasks";
// import ReportScreen from "./ReportScreen"; // Import the ReportScreen

// // Firebase sign-out and auth imports
// import { signOut } from "firebase/auth";
// import { auth } from "./firebaseConfig"; // Assuming your Firebase auth is configured

// // Stack and Tab Navigators
// const Stack = createStackNavigator();
// const Tab = createBottomTabNavigator();

// // Handle logout action
// const handleLogout = (navigation) => {
//   signOut(auth)
//     .then(() => {
//       console.log("User logged out.");
//       navigation.navigate("LoginScreen"); // Navigate to LoginScreen after successful logout
//     })
//     .catch((error) => {
//       console.error("Error logging out: ", error); // Handle any errors that occur during logout
//     });
// };

// // Logout confirmation function
// const confirmLogout = (navigation) => {
//   Alert.alert("Logout", "Are you sure you want to logout?", [
//     { text: "Cancel", style: "cancel" },
//     { text: "Logout", onPress: () => handleLogout(navigation) },
//   ]);
// };

// // Updated Bottom Tabs Navigator
// function BottomTabs({ navigation }) {
//   return (
//     <Tab.Navigator
//       screenOptions={{
//         tabBarStyle: { height: 60 },
       
//       }}
//     >
//   <Tab.Screen
//   name="DashBoard"
//   component={HomeScreen}
//   options={{
//     headerShown: false, // If you also want to hide the header
//     tabBarLabel: () => null, 
//     tabBarIcon: ({ color, size }) => (
//       <Ionicons name="home" color={color} size={size} />
//     ),
//   }}
// />
//       <Tab.Screen
//         name="CompletedTasks"
//         component={CompletedTasks}
//         options={{
         
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="checkmark-done" color={color} size={size} />
//           ),
//         }}
//       />
//       <Tab.Screen
//         name="Profile"
//         component={ProfileScreen}
//         options={{
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="person" color={color} size={size} />
//           ),
//         }}
//       />
//     </Tab.Navigator>
//   );
// }

// // Main App Navigator
// export default function App() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator initialRouteName="LoginScreen">
//         {/* Login Screen */}
//         <Stack.Screen
//           name="LoginScreen"
//           component={LoginScreen}
//           options={{ headerShown: false }}
//         />
       
//         <Stack.Screen
//           name="HomeScreen"
//           component={BottomTabs}
//           options={{ headerShown: false }}
//         />
      
//         <Stack.Screen name="Ongoing" component={Ongoing}  options={{ headerShown: false }}  />
     
//         <Stack.Screen name="ReportScreen" component={ReportScreen}  options={{ headerShown: false }}  />
//         <Stack.Screen name="CompletedTasks" component={CompletedTasks}  options={{ headerShown: false }}   />
//         <Stack.Screen name="TodaysTasks" component={TodaysTasks}  options={{ headerShown: false }} />
//         <Stack.Screen name="AuditDetails" component={AuditDetails}   />
//         <Stack.Screen name="ClientDetails" component={ClientDetails}  options={{ headerShown: false }}  />
//         <Stack.Screen name="RejectedAudits" component={RejectedAudits}  options={{ headerShown: false }}  />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }
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
        tabBarStyle: { height: 60, paddingBottom: 10 },
        tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' }, // Style for tab labels
        tabBarActiveTintColor: "#4CAF50", // Active tab color
        tabBarInactiveTintColor: "#8e8e8e", // Inactive tab color
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
          tabBarLabel: "Completed Tasks",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-done" color={color} size={size} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
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
        <Stack.Screen
          name="Ongoing"
          component={Ongoing}
          options={{
            headerShown: true,
            title: "Ongoing Audits", // Title for this screen
            headerTitleAlign: "center", // Center the title
            headerStyle: {
              backgroundColor: "#fff",
              shadowOpacity: 0, // Remove shadow
              height: 80, // Increase header height for more space
            },
            headerTitleStyle: {
              fontSize: 22,
              fontWeight: "bold",
              color: "#333",
            },
          }}
        />

        <Stack.Screen
          name="ReportScreen"
          component={ReportScreen}
          options={{
            headerShown: true,
            title: "Report",
            headerTitleAlign: "center",
            headerStyle: {
              backgroundColor: "#fff",
              shadowOpacity: 0,
              height: 80,
            },
            headerTitleStyle: {
              fontSize: 22,
              fontWeight: "bold",
              color: "#333",
            },
          }}
        />

        <Stack.Screen
          name="CompletedTasks"
          component={CompletedTasks}
          options={{
            headerShown: true,
            title: "Completed Tasks",
            headerTitleAlign: "center",
            headerStyle: {
              backgroundColor: "#fff",
              shadowOpacity: 0,
              height: 80,
            },
            headerTitleStyle: {
              fontSize: 22,
              fontWeight: "bold",
              color: "#333",
            },
          }}
        />

        <Stack.Screen
          name="TodaysTasks"
          component={TodaysTasks}
          options={{
            headerShown: true,
            title: "Today's Tasks",
            headerTitleAlign: "center",
            headerStyle: {
              backgroundColor: "#fff",
              shadowOpacity: 0,
              height: 80,
            },
            headerTitleStyle: {
              fontSize: 22,
              fontWeight: "bold",
              color: "#333",
            },
          }}
        />

        <Stack.Screen
          name="AuditDetails"
          component={AuditDetails}
          options={{
            headerShown: true,
            title: "Audit Details",
            headerTitleAlign: "center",
            headerStyle: {
              backgroundColor: "#fff",
              shadowOpacity: 0,
              height: 80,
            },
            headerTitleStyle: {
              fontSize: 22,
              fontWeight: "bold",
              color: "#333",
            },
          }}
        />

        <Stack.Screen
          name="ClientDetails"
          component={ClientDetails}
          options={{
            headerShown: true,
            title: "Client Details",
            headerTitleAlign: "center",
            headerStyle: {
              backgroundColor: "#fff",
              shadowOpacity: 0,
              height: 80,
            },
            headerTitleStyle: {
              fontSize: 22,
              fontWeight: "bold",
              color: "#333",
            },
          }}
        />

        <Stack.Screen
          name="RejectedAudits"
          component={RejectedAudits}
          options={{
            headerShown: true,
            title: "Rejected Audits",
            headerTitleAlign: "center",
            headerStyle: {
              backgroundColor: "#fff",
              shadowOpacity: 0,
              height: 80,
            },
            headerTitleStyle: {
              fontSize: 22,
              fontWeight: "bold",
              color: "#333",
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
