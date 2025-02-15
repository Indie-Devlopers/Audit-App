import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment-timezone';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const Report = ({ route, navigation }) => {
  const { audit } = route.params;
  const [selectedReport, setSelectedReport] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [localReportDate, setLocalReportDate] = useState(audit.reportDate || [
    { type: 'scanDate', date: null, isSubmitted: false, submittedBy: '' },
    { type: 'hardCopyDate', date: null, isSubmitted: false, submittedBy: '' },
    { type: 'softCopyDate', date: null, isSubmitted: false, submittedBy: '' },
    { type: 'photoDate', date: null, isSubmitted: false, submittedBy: '' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);
  const [editDate, setEditDate] = useState(new Date());

  const reportTypes = [
    { type: 'scanDate', label: 'Scan Report', icon: 'scanner' },
    { type: 'hardCopyDate', label: 'Hard Copy', icon: 'file-document' },
    { type: 'softCopyDate', label: 'Soft Copy', icon: 'file-pdf-box' },
    { type: 'photoDate', label: 'Photo Report', icon: 'image' }
  ];

  const handleDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
      if (Platform.OS === 'android') {
        handleSubmit(date);
      }
    }
  };

  const handleReportSelect = (type) => {
    setSelectedReport(type);
    if (Platform.OS === 'android') {
      setShowDatePicker(true);
    }
  };

  const checkAllReportsSubmitted = (reportDate) => {
    return reportDate.every(report => report.isSubmitted === true);
  };

  const handleSubmit = async (submissionDate = selectedDate) => {
    if (!selectedReport) {
      Alert.alert('Error', 'Please select a report type');
      return;
    }

    setIsSubmitting(true);

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'User not found');
        return;
      }

      const auditRef = doc(db, 'audits', audit.id);
      const auditDoc = await getDoc(auditRef);

      if (!auditDoc.exists()) {
        Alert.alert('Error', 'Audit not found');
        return;
      }

      // Update local state first
      const updatedReportDate = localReportDate.map(report => {
        if (report.type === selectedReport) {
          return {
            ...report,
            date: moment(submissionDate).tz('Asia/Kolkata').format(),
            isSubmitted: true,
            submittedBy: userId
          };
        }
        return report;
      });

      // Check if all reports are submitted
      const allSubmitted = checkAllReportsSubmitted(updatedReportDate);

      // Update Firestore with reportDate, isCompleted, and completedDate if all submitted
      const updateData = {
        reportDate: updatedReportDate,
        isCompleted: allSubmitted,
      };

      // Add completedDate only when all reports are submitted
      if (allSubmitted) {
        updateData.completedDate = moment().tz('Asia/Kolkata').format();
      }

      await updateDoc(auditRef, updateData);

      // Update local state
      setLocalReportDate(updatedReportDate);
      setSelectedReport(null);

      // Show success message without navigation
      Alert.alert(
        'Success',
        'Report submitted successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              if (Platform.OS === 'ios') {
                setShowDatePicker(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDone = () => {
    const allSubmitted = checkAllReportsSubmitted(localReportDate);
    
    if (allSubmitted) {
      Alert.alert(
        'Complete',
        'All reports have been submitted successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.popToTop();
              navigation.navigate('IncompleteTasks');
            }
          }
        ]
      );
    } else {
      navigation.popToTop();
      navigation.navigate('IncompleteTasks');
    }
  };

  const isReportSubmitted = (type) => {
    return localReportDate.find(report => report.type === type)?.isSubmitted || false;
  };

  const handleEditDate = (type, currentDate) => {
    setEditingReport(type);
    setEditDate(currentDate ? moment(currentDate).toDate() : new Date());
    if (Platform.OS === 'ios') {
      setShowEditDatePicker(true);
    } else {
      setShowDatePicker(true);
    }
  };

  const handleEditDateChange = async (event, date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (!date) return;

    setIsLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'User not found');
        return;
      }

      const updatedReportDate = localReportDate.map(report => {
        if (report.type === editingReport) {
          return {
            ...report,
            date: moment(date).tz('Asia/Kolkata').format(),
            isSubmitted: true,
            submittedBy: userId
          };
        }
        return report;
      });

      // Check if all reports are submitted
      const allSubmitted = checkAllReportsSubmitted(updatedReportDate);

      // Update Firestore with reportDate, isCompleted, and completedDate if all submitted
      const updateData = {
        reportDate: updatedReportDate,
        isCompleted: allSubmitted,
      };

      // Add completedDate only when all reports are submitted
      if (allSubmitted) {
        updateData.completedDate = moment().tz('Asia/Kolkata').format();
      }

      const auditRef = doc(db, 'audits', audit.id);
      await updateDoc(auditRef, updateData);

      setLocalReportDate(updatedReportDate);
      Alert.alert('Success', 'Date updated successfully');
    } catch (error) {
      console.error('Error updating date:', error);
      Alert.alert('Error', 'Failed to update date');
    } finally {
      setIsLoading(false);
      setShowEditDatePicker(false);
      setEditingReport(null);
    }
  };

  const renderReportCard = ({ type, label, icon }) => {
    const submitted = isReportSubmitted(type);
    const reportDate = localReportDate.find(r => r.type === type)?.date;
    
    return (
      <TouchableOpacity
        key={type}
        style={[
          styles.reportCard,
          selectedReport === type && styles.selectedCard,
          submitted && styles.submittedCard
        ]}
        onPress={() => !submitted ? handleReportSelect(type) : handleEditDate(type, reportDate)}
        disabled={isLoading}
      >
        <MaterialCommunityIcons
          name={icon}
          size={24}
          color={submitted ? '#4CAF50' : selectedReport === type ? '#fff' : '#00796B'}
        />
        <View style={styles.reportInfo}>
          <Text style={[
            styles.reportLabel,
            selectedReport === type && styles.selectedLabel,
            submitted && styles.submittedLabel
          ]}>
            {label}
          </Text>
          {submitted && reportDate && (
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>
                {moment(reportDate).format('DD MMM, YYYY')}
              </Text>
              <TouchableOpacity 
                onPress={() => handleEditDate(type, reportDate)}
                style={styles.editButton}
              >
                <MaterialCommunityIcons name="pencil" size={16} color="#00796B" />
              </TouchableOpacity>
            </View>
          )}
        </View>
        {submitted && (
          <MaterialCommunityIcons
            name="check-circle"
            size={20}
            color="#4CAF50"
            style={styles.checkIcon}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#00796B', '#004D40']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Submit Report</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.auditInfo}>
          <Text style={styles.infoLabel}>Client:</Text>
          <Text style={styles.infoValue}>{audit.clientName}</Text>
          <Text style={styles.infoLabel}>Branch:</Text>
          <Text style={styles.infoValue}>{audit.branchName}</Text>
          <Text style={styles.infoLabel}>Audit Type:</Text>
          <Text style={styles.infoValue}>{audit.auditType}</Text>
          <Text style={styles.infoLabel}>Date:</Text>
          <Text style={styles.infoValue}>
            {moment(audit.date).format('DD MMM, YYYY')}
          </Text>
        </View>

        <View style={styles.reportContainer}>
          {reportTypes.map(renderReportCard)}
        </View>

        <TouchableOpacity
          style={styles.doneButton}
          onPress={handleDone}
        >
          <LinearGradient
            colors={['#00796B', '#004D40']}
            style={styles.submitGradient}
          >
            <Text style={styles.submitText}>Done</Text>
          </LinearGradient>
        </TouchableOpacity>

        {showEditDatePicker && Platform.OS === 'ios' && (
          <Modal
            transparent={true}
            visible={showEditDatePicker}
            animationType="slide"
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <DateTimePicker
                  value={editDate}
                  mode="date"
                  display="spinner"
                  onChange={(event, date) => {
                    if (date) setEditDate(date);
                  }}
                  maximumDate={new Date()}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => setShowEditDatePicker(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonConfirm]}
                    onPress={() => handleEditDateChange(null, editDate)}
                  >
                    <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>
                      Confirm
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

        {Platform.OS === 'android' && showDatePicker && (
          <DateTimePicker
            value={editingReport ? editDate : selectedDate}
            mode="date"
            display="default"
            onChange={editingReport ? handleEditDateChange : handleDateChange}
            maximumDate={new Date()}
          />
        )}

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#00796B" />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    padding: 15,
  },
  auditInfo: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 10,
  },
  reportContainer: {
    marginBottom: 20,
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  selectedCard: {
    backgroundColor: '#00796B',
  },
  submittedCard: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  reportLabel: {
    marginLeft: 10,
    fontSize: 16,
    color: '#00796B',
    flex: 1,
  },
  selectedLabel: {
    color: '#fff',
  },
  submittedLabel: {
    color: '#4CAF50',
  },
  checkIcon: {
    marginLeft: 10,
  },
  submitButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  submitGradient: {
    padding: 15,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
  reportInfo: {
    flex: 1,
    marginLeft: 10,
  },
  dateText: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
  },
  doneButton: {
    marginTop: 20,
    marginHorizontal: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  editButton: {
    marginLeft: 8,
    padding: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonConfirm: {
    backgroundColor: '#00796B',
    borderRadius: 10,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#00796B',
  },
  modalButtonTextConfirm: {
    color: '#fff',
  },
});

export default Report; 