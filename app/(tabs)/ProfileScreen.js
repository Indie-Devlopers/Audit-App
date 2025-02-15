import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { doc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "./firebaseConfig";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [scaleValue] = useState(new Animated.Value(1));

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return;
        const docRef = doc(db, "Profile", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
    getUserData();
  }, []);

  const handleLogout = async () => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(async () => {
      await AsyncStorage.removeItem("userId");
      navigation.navigate("LoginScreen");
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#00796B', '#004D40']}
        style={styles.headerGradient}
      >
        <View style={styles.headerOverlay}>
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                style={styles.profileIconContainer}
              >
                <Ionicons name="person" size={50} color="#fff" />
              </LinearGradient>
              <View style={styles.onlineIndicator} />
            </View>
            <Text style={styles.name}>{userData?.name || 'Loading...'}</Text>
            <Text style={styles.email}>{userData?.email || ''}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.contentContainer}>
        <View style={styles.infoCard}>
          <LinearGradient
            colors={['#E8F5E9', '#C8E6C9']}
            style={styles.iconBackground}
          >
            <MaterialCommunityIcons name="phone-outline" size={24} color="#00796B" />
          </LinearGradient>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Contact Number</Text>
            <Text style={styles.infoValue}>{userData?.phone || 'Not specified'}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#00796B', '#004D40']}
            style={styles.logoutGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons name="logout" size={24} color="#fff" style={styles.logoutIcon} />
            <Text style={styles.logoutText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerGradient: {
    height: 280,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: 60,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  profileIconContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  onlineIndicator: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    borderWidth: 3,
    borderColor: '#fff',
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  email: {
    fontSize: 16,
    color: '#B2DFDB',
    marginBottom: 10,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    paddingBottom: 90,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  iconBackground: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  logoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    width: '100%',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default ProfileScreen;
