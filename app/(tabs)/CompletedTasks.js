import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CompletedTasks = () => {
  const [completedClients, setCompletedClients] = useState([]);

  useEffect(() => {
    const loadCompletedClients = async () => {
      try {
        const savedCompletedClients = await AsyncStorage.getItem("completedClients");
        if (savedCompletedClients) {
          setCompletedClients(JSON.parse(savedCompletedClients));
        }
      } catch (error) {
        console.error("Failed to load completed clients", error);
      }
    };

    loadCompletedClients();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {completedClients.length > 0 ? (
        completedClients.map((client, index) => (
          <View key={index} style={styles.clientContainer}>
            <Text style={styles.clientText}>Name: {client.name}</Text>
            <Text style={styles.clientText}>Audit Number: {client.auditNumber}</Text>
            <Text style={styles.clientText}>City: {client.city}</Text>
            <Text style={styles.clientText}>Date of Audit: {client.dateOfAudit}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noTasksText}>No completed tasks yet!</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  clientContainer: {
    backgroundColor: "#e0e0e0",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  clientText: {
    fontSize: 16,
  },
  noTasksText: {
    fontSize: 18,
    color: "gray",
    textAlign: "center",
  },
});

export default CompletedTasks;
