import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const ClientDetails = ({ route, navigation }) => {
  const { client } = route.params;
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = () => {
    setIsCompleted(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
          <Text style={styles.buttonText}>Complete</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.redeemButton}>
          <Text style={styles.buttonText}>Redeem/Uncomplete</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.detailTitle}>Client Details</Text>
        <Text style={styles.detailText}>Name: {client.name}</Text>
        <Text style={styles.detailText}>Audit Number: {client.auditNumber}</Text>
        <Text style={styles.detailText}>City: {client.city}</Text>
        <Text style={styles.detailText}>Date of Audit: {client.dateOfAudit}</Text>
      </View>

      {/* Completion Message and Tick Icon */}
      {isCompleted && (
        <View style={styles.completionContainer}>
          <Image
            source={{ uri: 'https://img.icons8.com/ios-filled/100/28a745/checkmark.png' }} 
            style={styles.completionTick}
          />
          <Text style={styles.completionMessage}>Your task is completed!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  completeButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  redeemButton: {
    backgroundColor: '#ff6347',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  detailsContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
  },
  detailText: {
    fontSize: 18,
    color: '#444',
    marginBottom: 10,
  },
  completionContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  completionTick: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  completionMessage: {
    fontSize: 18,
    color: '#28a745',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ClientDetails;
