import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const UserInfo = () => {
  // State to keep track of the selected client
  const [selectedClient, setSelectedClient] = useState(null);

  // Client details
  const clients = {
    clientA: { name: 'John Doe', auditNumber: 'A12345', city: 'New York', dateOfAudit: '2024-11-11' },
    clientB: { name: 'Jane Smith', auditNumber: 'B67890', city: 'Los Angeles', dateOfAudit: '2024-12-01' },
    clientC: { name: 'Sam Johnson', auditNumber: 'C24680', city: 'Chicago', dateOfAudit: '2024-10-15' },
    clientD: { name: 'Emma Davis', auditNumber: 'D13579', city: 'Houston', dateOfAudit: '2024-09-20' },
    clientE: { name: 'Michael Brown', auditNumber: 'E98765', city: 'Phoenix', dateOfAudit: '2024-08-30' },
  };

  // Function to handle touchable press
  const handlePress = (clientKey) => {
    setSelectedClient(selectedClient === clientKey ? null : clientKey);
  };

  return (
    <View style={styles.container}>
      {/* Touchable options */}
      {Object.keys(clients).map((clientKey) => (
        <View key={clientKey} style={styles.optionContainer}>
          <TouchableOpacity style={styles.option} onPress={() => handlePress(clientKey)}>
            <Text style={styles.optionText}>{clientKey.replace('client', 'Client ')}</Text>
          </TouchableOpacity>
          
          {/* Display selected client details */}
          {selectedClient === clientKey && (
            <View style={styles.clientDetails}>
              <Text style={styles.detailText}>Name: {clients[clientKey].name}</Text>
              <Text style={styles.detailText}>Audit Number: {clients[clientKey].auditNumber}</Text>
              <Text style={styles.detailText}>City: {clients[clientKey].city}</Text>
              <Text style={styles.detailText}>Date of Audit: {clients[clientKey].dateOfAudit}</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f2f2f2',
    padding: 20,
  },
  optionContainer: {
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  option: {
    backgroundColor: 'lightgray',
    padding: 25,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
  },
  optionText: {
    color: 'black',
    fontSize: 20,
    fontWeight:'400'
  },
  clientDetails: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    width: '80%',
  },
  detailText: {
    fontSize: 16,
    color: '#333',
  },
});

export default UserInfo;
