import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
// import LoginScreen from "./LoginScreen";
import HomeScreen from "./HomeScreen"; 

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* <Stack.Screen name="Login" component={LoginScreen} /> */}
        <Stack.Screen name = " "component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}