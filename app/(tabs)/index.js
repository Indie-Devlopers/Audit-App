import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";


import LoginScreen from "./LoginScreen";
import HomeScreen from "./HomeScreen"; 
import Ongoing from "./Ongoing"
import UserInfo from "./UserInfo"
import ClientDetails from './ClientDetails';
import CompletedTasks from './CompletedTasks';
import UpcomingAudits from "./UpcomingAudits";
import AuditDetails from "./AuditDetails";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
    <Stack.Navigator initialRouteName="LoginScreen">
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name = "UserInfo" component = {UserInfo} />
      <Stack.Screen name="Ongoing" component={Ongoing}/>
      <Stack.Screen name="UpcomingAudits" component={UpcomingAudits} />
      <Stack.Screen name="AuditDetails" component={AuditDetails} />
      <Stack.Screen name="ClientDetails" component={ClientDetails} />
      <Stack.Screen name="CompletedTasks" component={CompletedTasks} />
    </Stack.Navigator>

  </NavigationContainer>
  );
}
