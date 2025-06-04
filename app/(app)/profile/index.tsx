import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/context/ctx';
import { getUserData } from '@/services/user.service';

export default function Profile() {
    const { user,role } = useAuth();
    const [userData, setUserData] = useState({
        email: "",
        PseudoInGame: "",
        role: "",
    });
    
    useEffect(() => {
        async function fetchUserData() {
            if (!user?.uid) return;
      
            try {
              const data = await getUserData(user.uid);
              setUserData(data);
            } catch (error) {
              console.error("Erreur lors du chargement des données utilisateur:", error);
            }
          }
      
          fetchUserData();
        }, [user]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mon Profil</Text>
           
            <View style={styles.infoBox}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{userData.email}</Text>
            </View>
            
            <View style={styles.infoBox}>
                <Text style={styles.label}>Nom:</Text>
                <Text style={styles.value}>{userData.PseudoInGame}</Text>
            </View>

            <View style={styles.infoBox}>
                <Text style={styles.label}>Rôle:</Text>
                <Text style={styles.value}>{userData.role}</Text>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff"
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center"
    },
    infoBox: {
        marginBottom: 15,
        padding: 10,
        backgroundColor: "#f0f0f0",
        borderRadius: 5
    },
    label: {
        fontSize: 16,
        color: "#555",
        marginBottom: 5
    },
    value: {
        fontSize: 18,
        fontWeight: "500"
    }
});