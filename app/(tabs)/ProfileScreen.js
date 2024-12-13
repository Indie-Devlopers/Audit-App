



import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { doc, getDoc, getDocs, collection, updateDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "./firebaseConfig";

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [availableCities, setAvailableCities] = useState([]);
  const [availableStates, setAvailableStates] = useState([]);
  const [upcomingAudits, setUpcomingAudits] = useState([]);

  // Fetch user data and location details
  useEffect(() => {
    const getUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          console.error("User ID not found in AsyncStorage");
          return;
        }

        const docRef = doc(db, "Profile", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
          setSelectedCity(docSnap.data().preferredCity || "");
          setSelectedState(docSnap.data().preferredState || "");
        } else {
          console.error("No such document in Firestore");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchLocations = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "branches"));
        const cities = new Set();
        const states = new Set();

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.city) cities.add(data.city);
          if (data.state) states.add(data.state);
        });

        setAvailableCities(Array.from(cities));
        setAvailableStates(Array.from(states));
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    getUserData();
    fetchLocations();
    fetchUpcomingAudits(); // Fetch upcoming audits after data is loaded
  }, []);

  // Fetch and filter upcoming audits based on the selected city
  const fetchUpcomingAudits = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "audits"));
      let audits = [];
      
      querySnapshot.forEach((doc) => {
        const auditData = doc.data();
        const city = auditData.location?.city || ""; // Assuming the city is stored as location.city
        audits.push({ ...auditData, id: doc.id, city });
      });

      // Sort audits based on whether the city matches the user's preferred city
      audits.sort((a, b) => {
        if (a.city === selectedCity && b.city !== selectedCity) {
          return -1; // Bring the preferred city audits to the top
        } else if (a.city !== selectedCity && b.city === selectedCity) {
          return 1; // Keep audits without preferred city at the bottom
        }
        return 0; // Keep order for other audits
      });

      setUpcomingAudits(audits);
    } catch (error) {
      console.error("Error fetching audits:", error);
    }
  };

  // Save selected location to Firestore
  const handleSaveLocation = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        Alert.alert("Error", "User ID not found.");
        return;
      }

      const docRef = doc(db, "Profile", userId);
      await updateDoc(docRef, {
        preferredCity: selectedCity,
        preferredState: selectedState,
      });

      Alert.alert("Location Saved", "Your preferred location has been saved.");
      fetchUpcomingAudits(); // Re-fetch the audits after saving location
    } catch (error) {
      console.error("Error saving location:", error);
      Alert.alert("Error", "Failed to save location.");
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await AsyncStorage.removeItem("userId");
    navigation.navigate("LoginScreen");
  };

  return (
    <View style={styles.container}>
      {userData ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.name}>{userData.name}</Text>
            <Text style={styles.email}>{userData.email}</Text>
          </View>

          <View style={styles.locationContainer}>
            <Text style={styles.infoTitle}>Preferred City</Text>
            <Picker
              selectedValue={selectedCity}
              style={styles.picker}
              onValueChange={(itemValue) => {
                setSelectedCity(itemValue);
                fetchUpcomingAudits(); // Re-fetch audits when city is changed
              }}
            >
              <Picker.Item label="Select City" value="" />
              {availableCities.map((city, index) => (
                <Picker.Item key={index} label={city} value={city} />
              ))}
            </Picker>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveLocation}>
            <Text style={styles.saveButtonText}>Save Location</Text>
          </TouchableOpacity>

         

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    marginTop: 7,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  email: {
    fontSize: 18,
    color: "#777",
    marginBottom: 15,
  },
  locationContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
    fontWeight: "bold",
  },
  picker: {
    height: 50,
    width: "100%",
    marginBottom: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
  saveButton: {
    backgroundColor: "#009966",
    paddingVertical: 15,
    borderRadius: 8,
    marginHorizontal: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  upcomingAuditsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: 20,
    marginBottom: 10,
    color: "#333",
  },
  auditContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  auditName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  auditCity: {
    fontSize: 14,
    color: "#777",
  },
  auditDate: {
    fontSize: 14,
    color: "#777",
  },
  logoutButton: {
    backgroundColor: "#009966",
    paddingVertical: 15,
    borderRadius: 8,
    marginHorizontal: 20,
    alignItems: "center",
    marginBottom: 30,
  },
  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ProfileScreen;
