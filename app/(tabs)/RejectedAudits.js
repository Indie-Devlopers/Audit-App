import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const RejectedAudits = ({ navigation }) => {
  const [selectedReason, setSelectedReason] = useState('');

  const reasons = [
    'Not enough time',
    'Already handling too many audits',
    'No expertise in the audit subject',
    'Personal reasons',
    'Other',
  ];

  const handleRemove = () => {
    if (!selectedReason) {
      Alert.alert('Error', 'Please select a reason before removing the audit.');
      return;
    }

    // Confirmation Alert
    Alert.alert(
      'Confirm Removal',
      `Are you sure you want to remove the audit? Reason: "${selectedReason}"`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes, Remove',
          onPress: () =>
            Alert.alert(
              'Audit Removed',
              `You selected: ${selectedReason}`,
              [{ text: 'OK', onPress: () => navigation.goBack() }]
            ),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Why are you removing the audit?</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedReason}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedReason(itemValue)}
        >
          <Picker.Item label="Select a reason" value="" />
          {reasons.map((reason, index) => (
            <Picker.Item key={index} label={reason} value={reason} />
          ))}
        </Picker>
      </View>

      <TouchableOpacity
        style={[styles.removeButton, !selectedReason && styles.disabledButton]}
        onPress={handleRemove}
        disabled={!selectedReason}
      >
        <Text style={styles.removeButtonText}>Remove Audit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  pickerContainer: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    marginBottom: 20,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
    fontSize: 16,
    color: '#555',
  },
  removeButton: {
    backgroundColor: '#FF6F61',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
  removeButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RejectedAudits;
