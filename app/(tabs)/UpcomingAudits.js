import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const UpcomingAudits = () => {
  const navigation = useNavigation();
  const [audits, setAudits] = useState([
    { id: "1", name: "Client A", location: "New York", date: "2024-11-20" },
    { id: "2", name: "Client B", location: "Los Angeles", date: "2024-12-05" },
    { id: "3", name: "Client C", location: "Chicago", date: "2024-11-15" },
  ]);

  // Render each audit item in the FlatList
  const renderAuditItem = ({ item }) => (
    <TouchableOpacity
      style={styles.auditItem}
      onPress={() => navigation.navigate("AuditDetails", { audit: item })}
    >
      <View style={styles.auditContent}>
        <Ionicons name="location-outline" size={20} color="black" />
        <Text style={styles.auditText}>{item.name} - {item.location}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.upcomingAuditsContainer}>
      <Text style={styles.upcomingAuditsText}>Upcoming Audits</Text>
      <FlatList
        data={audits}
        renderItem={renderAuditItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  upcomingAuditsContainer: {
    padding: 20,
    marginTop: 40,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
  },
  upcomingAuditsText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  auditItem: {
    backgroundColor: "#fff",
    padding: 15,
    marginRight: 15,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  auditContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  auditText: {
    marginLeft: 10,
    fontSize: 16,
  },
});

export default UpcomingAudits;
