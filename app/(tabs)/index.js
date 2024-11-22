// import React from "react";
// import { NavigationContainer } from "@react-navigation/native";
// import { createStackNavigator } from "@react-navigation/stack";


// import LoginScreen from "./LoginScreen";
// import HomeScreen from "./HomeScreen"; 
// import Ongoing from "./Ongoing"
// // import UserInfo from "./UserInfo"
// // import ClientDetails from './ClientDetails';
// // import CompletedTasks from './CompletedTasks';
// // import UpcomingAudits from "./UpcomingAudits";
// // import AuditDetails from "./AuditDetails";

// // const Stack = createStackNavigator();

// // export default function App() {
// //   return (
// //     <NavigationContainer>
// //     <Stack.Navigator initialRouteName="LoginScreen">
// //       <Stack.Screen name="LoginScreen" component={LoginScreen} />
// //       <Stack.Screen name="HomeScreen" component={HomeScreen} />
// //       <Stack.Screen name = "UserInfo" component = {UserInfo} />
// //       <Stack.Screen name="Ongoing" component={Ongoing}/>
// //       <Stack.Screen name="UpcomingAudits" component={UpcomingAudits} />
// //       <Stack.Screen name="AuditDetails" component={AuditDetails} />
// //       <Stack.Screen name="ClientDetails" component={ClientDetails} />
// //       <Stack.Screen name="CompletedTasks" component={CompletedTasks} />
// //     </Stack.Navigator>

// //   </NavigationContainer>
// //   );
// // }



















import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import LoginScreen from "./LoginScreen";
import HomeScreen from "./HomeScreen"; 
import Ongoing from "./Ongoing";
import UserInfo from "./UserInfo";
import ClientDetails from './ClientDetails';
import CompletedTasks from './CompletedTasks'
import UpcomingAudits from "./UpcomingAudits";
import AuditDetails from "./AuditDetails";
import RejectedAudits from "./RejectedAudits"
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
         initialRouteName="LoginScreen">
        <Stack.Screen 
          name="LoginScreen" 
          component={LoginScreen} 
          options={{ headerShown: false }} // This removes the header from the LoginScreen
        /> 
        <Stack.Screen name="HomeScreen" component={HomeScreen}  options={{ headerShown: false }}  />
        <Stack.Screen name="UserInfo" component={UserInfo} />
        <Stack.Screen name="Ongoing" component={Ongoing} />
        <Stack.Screen name="UpcomingAudits" component={UpcomingAudits} />
        <Stack.Screen name="AuditDetails" component={AuditDetails} />
        <Stack.Screen name="ClientDetails" component={ClientDetails} />
        <Stack.Screen name="Completed-Tasks" component={CompletedTasks} />
        <Stack.Screen name="RejectedAudits" component={RejectedAudits} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}





// import React from "react";
// import { Alert, TouchableOpacity } from "react-native";
// import { NavigationContainer } from "@react-navigation/native";
// import { createStackNavigator } from "@react-navigation/stack";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import { Ionicons } from "@expo/vector-icons";

// // Import your screens
// import LoginScreen from "./LoginScreen";
// import HomeScreen from "./HomeScreen";
// import Ongoing from "./Ongoing";
// import UserInfo from "./UserInfo";
// import ClientDetails from "./ClientDetails";
// import CompletedTasks from "./CompletedTasks";
// import AuditDetails from "./AuditDetails";

// // Import Firebase signOut and auth object
// import { signOut } from "firebase/auth";
// import { auth } from "./firebaseConfig"; // Assuming your Firebase auth is configured

// const Stack = createStackNavigator();
// const Tab = createBottomTabNavigator();

// // Handle logout action
// const handleLogout = (navigation) => {
//   // Sign out the user using Firebase
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
//     { text: "Logout", onPress: () => handleLogout(navigation) }, // Call handleLogout on confirmation
//   ]);
// };

// // Create the Bottom Tab Navigator
// function BottomTabs({ navigation }) {
//   return (
//     <Tab.Navigator
//       screenOptions={{
//         tabBarStyle: { height: 60 },
//         headerRight: () => (
//           <TouchableOpacity
//             style={{ marginRight: 20 }}
//             onPress={() => confirmLogout(navigation)} // Trigger the logout confirmation
//           >
//             <Ionicons name="log-out" size={24} color="black" />
//           </TouchableOpacity>
//         ),
//       }}
//     >
//       <Tab.Screen
//         name="Home"
//         component={HomeScreen}
//         options={{
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="home" color={color} size={size} />
//           ),
//         }}
//       />
//       <Tab.Screen
//         name="Ongoing"
//         component={Ongoing}
//         options={{
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="time" color={color} size={size} />
//           ),
//         }}
//       />
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
//         name="UserInfo"
//         component={UserInfo}
//         options={{
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="person" color={color} size={size} />
//           ),
//         }}
//       />
//     </Tab.Navigator>
//   );
// }

// // Main App Navigator with Stack for login and BottomTabs for main navigation
// export default function App() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator initialRouteName="LoginScreen">
//         <Stack.Screen
//           name="LoginScreen"
//           component={LoginScreen}
//           options={{ headerShown: false }} // Hides header for the LoginScreen
//         />
//         <Stack.Screen
//           name="HomeScreen"
//           component={BottomTabs} // Bottom tabs navigation is displayed after login
//           options={{ headerShown: false }} // Hide the header for the BottomTabs
//         />
//         <Stack.Screen name="AuditDetails" component={AuditDetails} />
//         <Stack.Screen name="ClientDetails" component={ClientDetails} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }