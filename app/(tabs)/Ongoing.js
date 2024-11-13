import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Ongoing = ({ navigation }) => {
  const [clients, setClients] = useState({});

  // Load ongoing clients from AsyncStorage
  useEffect(() => {
    const loadClients = async () => {
      try {
        const storedClients = await AsyncStorage.getItem("ongoingClients");
        if (storedClients) {
          setClients(JSON.parse(storedClients));
        }
      } catch (error) {
        console.error("Failed to load ongoing clients", error);
      }
    };

    loadClients();
  }, []);

  // Handle completion of task
  const handleComplete = async (clientKey) => {
    const completedClient = clients[clientKey];

    // Save completed task to AsyncStorage
    try {
      const existingCompletedClients = await AsyncStorage.getItem("completedClients");
      const completedClients = existingCompletedClients ? JSON.parse(existingCompletedClients) : [];
      completedClients.push(completedClient);
      await AsyncStorage.setItem("completedClients", JSON.stringify(completedClients));

      // Remove the task from ongoing tasks
      const updatedClients = { ...clients };
      delete updatedClients[clientKey];
      setClients(updatedClients);

      // Save updated ongoing clients
      await AsyncStorage.setItem("ongoingClients", JSON.stringify(updatedClients));

      // Navigate to Completed Tasks screen
      navigation.navigate("CompletedTasks");
    } catch (error) {
      console.error("Error saving completed task", error);
    }
  };

  // Check if there are any ongoing tasks
  const noOngoingTasks = Object.keys(clients).length === 0;

  return (
    <ScrollView style={styles.container}>
      {noOngoingTasks ? (
        <View style={styles.noTasksContainer}>
          <Text style={styles.noTasksText}>No ongoing tasks</Text>
        </View>
      ) : (
        Object.keys(clients).map((clientKey) => (
          <View key={clientKey} style={styles.optionContainer}>
            <TouchableOpacity
              style={styles.option}
              onPress={() => navigation.navigate("ClientDetails", { client: clients[clientKey] })}
            >
              <Text style={styles.optionText}>{clients[clientKey].name}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => handleComplete(clientKey)}
            >
              <Ionicons name="checkmark-circle" size={24} color="green" />
              <Text>Complete</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  option: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  optionText: {
    fontSize: 16,
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  noTasksContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  noTasksText: {
    fontSize: 18,
    color: "gray",
  },
});

export default Ongoing;
