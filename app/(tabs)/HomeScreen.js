import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // For location icon
import AsyncStorage from "@react-native-async-storage/async-storage";

const HomeScreen = ({ navigation, route }) => {
  const userEmail = route?.params?.userEmail || ""; // Safely retrieve userEmail or set to an empty string
  const [greeting, setGreeting] = useState("");
  const [userName, setUserName] = useState("");
  const [audits, setAudits] = useState([]);
  const [ongoingAudits, setOngoingAudits] = useState([]);

  // Load audits data from AsyncStorage
  useEffect(() => {
    const loadAudits = async () => {
      try {
        const storedUpcomingAudits = await AsyncStorage.getItem("upcomingAudits");
        const storedOngoingAudits = await AsyncStorage.getItem("ongoingAudits");

        if (storedUpcomingAudits) {
          setAudits(JSON.parse(storedUpcomingAudits));
        } else {
          // Default set of audits
          const defaultAudits = [
            { 
              id: "1", 
              name: "Client A", 
              location: "New York", 
              date: "2024-11-20",
              image: "https://images.unsplash.com/photo-1602610126445-05311e91a91f" // Unsplash image
            },
            { 
              id: "2", 
              name: "Client B", 
              location: "Los Angeles", 
              date: "2024-12-05",
              image: "https://images.unsplash.com/photo-1585056795224-5c02d2f2568a" // Unsplash image
            },
            { 
              id: "3", 
              name: "Client C", 
              location: "Chicago", 
              date: "2024-11-15",
              image: "https://images.unsplash.com/photo-1604679800740-6e342fb2a9f3" // Unsplash image
            },
            { 
              id: "4", 
              name: "John", 
              location: "New York", 
              date: "2024-11-20",
              image: "https://images.unsplash.com/photo-1602610126445-05311e91a91f" // Unsplash image
            },
            { 
              id: "5", 
              name: "Shraddha", 
              location: "Los Angeles", 
              date: "2024-12-18",
              image: "" // Unsplash image
            },
            { 
              id: "6", 
              name: "Harry", 
              location: "Chicago", 
              date: "2024-11-31",
              image: "https://unsplash.com/photos/woman-near-green-leafed-plants-R8bNESnnKR8" // Unsplash image
            },
          ];
          setAudits(defaultAudits);
          await AsyncStorage.setItem("upcomingAudits", JSON.stringify(defaultAudits)); // Save default audits
        }

        if (storedOngoingAudits) {
          setOngoingAudits(JSON.parse(storedOngoingAudits));
        }
      } catch (error) {
        console.error("Failed to load audits", error);
      }
    };

    loadAudits();

    const currentTime = new Date().getHours();
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

  // Move audit to Ongoing and remove from Upcoming
  const acceptAudit = async (audit) => {
    // Remove from upcoming audits
    const updatedAudits = audits.filter((item) => item.id !== audit.id); 

    // Add to ongoing audits
    const updatedOngoingAudits = [...ongoingAudits, audit];

    // Update state to remove the audit from the list
    setAudits(updatedAudits); // Remove the accepted audit from the FlatList
    setOngoingAudits(updatedOngoingAudits); // Add to ongoing list

    // Save updated lists to AsyncStorage
    try {
      await AsyncStorage.setItem("upcomingAudits", JSON.stringify(updatedAudits));
      await AsyncStorage.setItem("ongoingAudits", JSON.stringify(updatedOngoingAudits));
    } catch (error) {
      console.error("Failed to update audits", error);
    }
  };

  // Remove audit from the list and update AsyncStorage
  const removeAudit = async (auditId) => {
    Alert.alert(
      "Remove Audit",
      "Are you sure you want to remove this audit?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            const updatedAudits = audits.filter(audit => audit.id !== auditId);
            setAudits(updatedAudits);
            try {
              await AsyncStorage.setItem("upcomingAudits", JSON.stringify(updatedAudits)); // Save updated list
            } catch (error) {
              console.error("Failed to update upcoming audits", error);
            }
          },
        },
      ]
    );
  };

  // Render each audit item in the FlatList
  const renderAuditItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.auditItem} 
      onPress={() => navigation.navigate("AuditDetails", { audit: item })} // Navigate to details page
    >
      <Image source={{ uri: item.image }} style={styles.clientImage} />
      <View style={styles.auditContent}>
        <Text style={styles.auditName}>{item.name}</Text>
        <Text style={styles.auditLocation}>{item.location}</Text>
        <Text style={styles.auditDate}>{item.date}</Text>
      </View>
      <TouchableOpacity onPress={() => acceptAudit(item)} style={styles.acceptButton}>
        <Ionicons name="checkmark-circle" size={24} color="green" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => removeAudit(item.id)} style={styles.removeButton}>
        <Ionicons name="trash-bin" size={24} color="red" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.greetingText}>{greeting}, {userName}</Text>

      <View style={styles.taskBoxesContainer}>
        <TouchableOpacity style={styles.taskBox}>       
          <TouchableOpacity onPress={() => navigation.navigate("UserInfo")}>
            <View>
              <Ionicons name="calendar" size={30} color="black" style={styles.icon} />
              <Text style={styles.taskBoxTitle}>Today's Tasks</Text>
              <Text style={styles.taskBoxContent}>5 tasks</Text>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>

        <TouchableOpacity style={styles.taskBox}>
          <TouchableOpacity onPress={() => navigation.navigate("Ongoing")}>
            <View>
              <Ionicons name="play-circle" size={30} color="black" style={styles.icon} />
              <Text style={styles.taskBoxTitle}>Ongoing Tasks</Text>
              <Text style={styles.taskBoxContent}>13 Tasks</Text>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      <View>
        <TouchableOpacity style={styles.taskBox}>
          <TouchableOpacity onPress={() => navigation.navigate("CompletedTasks")}>
            <View style={{ backgroundColor: 'white' }}>
              <Ionicons name="checkmark-circle" size={30} color="black" style={styles.icon} />
            </View>
            <Text style={styles.taskBoxTitle}>Completed Tasks</Text>
            <Text style={styles.taskBoxContent}>20 Tasks</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      {/* Upcoming Audits - FlatList Slider */}
      <View style={styles.upcomingAuditsContainer}>
        <Text style={styles.upcomingAuditsText}>Upcoming Audits</Text>
        <FlatList
          data={audits}
          renderItem={renderAuditItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.auditList}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#E6EDEF',
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
  },
  taskBox: {
    width: "47%",
    padding: 10,
    backgroundColor: "white",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  upcomingAuditsContainer: {
    padding: 20,
    marginTop: 40,
    borderRadius: 20,
    backgroundColor: 'gray',
  },
  upcomingAuditsText: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    color: "black",
  },
  auditList: {
    marginVertical: 10,
    marginHorizontal: 10,
  },
  auditItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: 280,
    height: 120,
    marginRight: 15,
  },
  clientImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  auditContent: {
    flexDirection: "column",
    justifyContent: "center",
  },
  auditName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  auditLocation: {
    fontSize: 14,
    color: "gray",
  },
  auditDate: {
    fontSize: 12,
    color: "gray",
  },
  acceptButton: {
    marginLeft: "auto",
    marginRight: 10,
  },
  removeButton: {
    marginLeft: "auto",
  },
});

export default HomeScreen;
