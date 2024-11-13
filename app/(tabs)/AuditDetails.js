import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const AuditDetails = ({ route, navigation }) => {
  const { audit } = route.params;
  const [notes, setNotes] = useState("");

  const handleAccept = async () => {
    try {
      const ongoingClients = await AsyncStorage.getItem("ongoingClients");
      const parsedOngoingClients = ongoingClients ? JSON.parse(ongoingClients) : {};
      parsedOngoingClients[audit.id] = { ...audit, notes };
      
      await AsyncStorage.setItem("ongoingClients", JSON.stringify(parsedOngoingClients));

      // Navigate back to ongoing page
      navigation.navigate("Ongoing");
    } catch (error) {
      console.error("Error saving accepted audit", error);
    }
  };

  const handleRemove = () => {
    // Navigate back without saving the audit
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{audit.name}</Text>
      <Text style={styles.subTitle}>Location: {audit.location}</Text>
      <Text style={styles.subTitle}>Date of Audit: {audit.date}</Text>

      <TextInput
        style={styles.notesInput}
        placeholder="Add your notes here"
        value={notes}
        onChangeText={setNotes}
      />

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
          <Ionicons name="checkmark-circle" size={24} color="white" />
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
          <Ionicons name="remove-circle" size={24} color="white" />
          <Text style={styles.buttonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  notesInput: {
    height: 100,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
    borderRadius: 5,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  removeButton: {
    backgroundColor: "#F44336",
    padding: 15,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    marginLeft: 10,
    fontSize: 16,
  },
});

export default AuditDetails;