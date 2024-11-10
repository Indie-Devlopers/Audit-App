// import React from "react";
// import { View, Text, StyleSheet } from "react-native";

// export default function HomeScreen() {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.text}>Welcome to the Home Screen!</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",

//   },
//   text: {
//     fontSize: 20,
//   },
// })










import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // For location icon

const HomeScreen = ({ route }) => {
 const userEmail = route?.params?.userEmail || ""; // Safely retrieve userEmail or set to an empty string
  const [greeting, setGreeting] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const currentTime = new Date().getHours();
    // Set greeting based on time of day
    if (currentTime < 12) {
      setGreeting("Good Morning");
    } else if (currentTime < 19) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }

    const name = userEmail ? userEmail.split("@")[0] : "User"; 
    setUserName(name);
  }, [userEmail]);

  return (
    <ScrollView style={styles.container}>
      {/* Greeting Message */}
      <Text style={styles.greetingText}>{greeting}, {userName}</Text>

      {/* Task Boxes */}
      <View style={styles.taskBoxesContainer}>
        <View style={styles.taskBox}>
        <Ionicons name="calendar" size={30} color="black" style={styles.icon} />
          <Text style={styles.taskBoxTitle}>Today's Tasks</Text>
          <Text style={styles.taskBoxContent}>Task 1, Task 2, Task 3</Text>
        </View>


        <View style={styles.taskBox}>
        <Ionicons name="play-circle" size={30} color="black" style={styles.icon} />
          <Text style={styles.taskBoxTitle}>Ongoing Tasks</Text>
          <Text style={styles.taskBoxContent}>Task 4, Task 5</Text>
        </View>
       
      </View>
      <View>
      <View style={styles.taskBox}>
      <Ionicons name="checkmark-circle" size={30} color="black" style={styles.icon} />
          <Text style={styles.taskBoxTitle}>Completed Tasks</Text>
          <Text style={styles.taskBoxContent}>Task 6, Task 7</Text>
        </View>
      </View>

      {/* Upcoming Audits */}
      <View style={styles.upcomingAuditsContainer}>
      <Text style={styles.upcomingAuditsText}>Upcoming Audits</Text>
      <View style={styles.auditList}>
        <View style={styles.auditItem}>
          <Ionicons name="location-outline" size={20} color="gray" />
          <Text style={styles.auditText}>Client A</Text>
        </View>
        <View style={styles.auditItem}>
          <Ionicons name="location-outline" size={20} color="gray" />
          <Text style={styles.auditText}>Client B</Text>
        </View>
        <View style={styles.auditItem}>
          <Ionicons name="location-outline" size={20} color="gray" />
          <Text style={styles.auditText}>Client C</Text>
        </View>
      </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
     backgroundColor:'#E6EDEF-'
  },
  upcomingAuditsContainer:{
    padding:20 ,
    marginTop:40,
    
    backgroundColor: 'white',
    
  },
  
  greetingText: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "black",
   
  },
  taskBoxesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    borderRadius:5,
    borderColor:'black'
  },
  taskBox: {
    width: "47%",
    
    padding: 10,
    backgroundColor: "white",
    
    borderRadius:10 ,

    // borderWidth:1,
    
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  taskBoxTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
  },
  taskBoxContent: {
    fontSize: 14,
    color: "gray",
  },
  upcomingAuditsText: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    color: "black",
    borderRadius:5,
  },
  auditList: {
    marginVertical: 10,
    marginHorizontal:10

  },
  auditItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  auditText: {
    marginLeft: 10,
    fontSize: 16,
    color: "black",
  },
});

export default HomeScreen;
