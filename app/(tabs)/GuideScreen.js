import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const GuideScreen = () => {
  const guideSteps = [
    {
      title: 'Dashboard',
      description: "View all your today's audits and upcoming audits at a glance",
      icon: 'view-dashboard',
    },
    {
      title: 'Accept Audits',
      description: 'Accept new audit assignments from the dashboard',
      icon: 'checkbox-marked-circle',
    },
    {
      title: 'View Schedule',
      description: 'Check your audit schedule in the calendar view',
      icon: 'calendar-check',
    },
    {
      title: 'Complete Reports',
      description: 'Submit audit reports for your assigned audits',
      icon: 'file-document-edit',
    },
    {
      title: 'Track Progress',
      description: 'Monitor your completed audits in the submitted section',
      icon: 'chart-line',
    },
    {
      title: 'Manage Profile',
      description: 'Update your profile information and preferences',
      icon: 'account-cog',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#00796B', '#004D40']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>How to Use</Text>
            <View style={styles.headerLine} />
            <Text style={styles.headerSubtitle}>Learn how to use the app effectively</Text>
          </View>
        </LinearGradient>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {guideSteps.map((step, index) => (
          <View key={index} style={styles.stepCard}>
            <LinearGradient
              colors={['#ffffff', '#f8f9fa']}
              style={styles.cardGradient}
            >
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name={step.icon} size={32} color="#00796B" />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
 
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  headerLine: {
    width: 40,
    height: 3,
    backgroundColor: '#4DB6AC',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#B2DFDB',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  stepCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  cardGradient: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f5f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
});

export default GuideScreen; 