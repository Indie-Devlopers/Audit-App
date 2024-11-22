import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
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
    if (selectedReason) {
      Alert.alert('Audit Removal', `You selected: ${selectedReason}`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Error', 'Please select a reason before removing the audit.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Why are you removing the audit?</Text>
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
      <Button title="Remove Audit" onPress={handleRemove} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
  },
});

export default RejectedAudits;
