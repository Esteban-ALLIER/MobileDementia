import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '@/context/ctx';
import { getUserData } from '@/services/user.service';
import { useRouter } from 'expo-router';
import Ionicons from "@expo/vector-icons/build/Ionicons";

export default function Profile() {
    const router = useRouter();
    const { user, role } = useAuth();
    const [userData, setUserData] = useState({
        email: "",
        PseudoInGame: "",
        role: "",
        Core: false,
        Regear: false
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

    const getRoleColor = (userRole: string) => {
        switch (userRole) {
            case 'Admin': return '#ffebee';
            case 'Reviewer': return '#f3e5f5';
            case 'Membre': return '#e3f2fd';
            default: return '#f8f9fa';
        }
    };

    const getRoleTextColor = (userRole: string) => {
        switch (userRole) {
            case 'Admin': return '#d32f2f';
            case 'Reviewer': return '#7b1fa2';
            case 'Membre': return '#1976d2';
            default: return '#666';
        }
    };

    const renderStatusIcon = (value: boolean) => {
        return (
            <View style={[styles.statusChip, value ? styles.statusYes : styles.statusNo]}>
                <Ionicons 
                    name={value ? "checkmark" : "close"} 
                    size={16} 
                    color={value ? "#155724" : "#721c24"} 
                />
                <Text style={[styles.statusText, { color: value ? "#155724" : "#721c24" }]}>
                    {value ? "Oui" : "Non"}
                </Text>
            </View>
        );
    };

    const GoToStatInGame = () => {
        router.push("/profile/StatInGame");
    }

    return (
        <ScrollView style={styles.container}>
            {/* Header Card */}
            <View style={styles.headerCard}>
                <Text style={styles.title}>Mon Profil</Text>
                <Text style={styles.subtitle}>Informations de votre compte</Text>
            </View>

            {/* Personal Info Card */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Ionicons name="person-outline" size={20} color="#2196F3" />
                    <Text style={styles.cardTitle}>Informations personnelles</Text>
                </View>

                <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Email</Text>
                        <Text style={styles.value}>{userData.email}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Pseudo</Text>
                        <Text style={styles.value}>{userData.PseudoInGame}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Rôle</Text>
                        <View style={[styles.roleChip, { backgroundColor: getRoleColor(userData.role) }]}>
                            <Text style={[styles.roleText, { color: getRoleTextColor(userData.role) }]}>
                                {userData.role}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Status Card */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Ionicons name="shield-checkmark-outline" size={20} color="#2196F3" />
                    <Text style={styles.cardTitle}>Statut</Text>
                </View>

                <View style={styles.statusGrid}>
                    <View style={styles.statusItem}>
                        <Text style={styles.statusLabel}>Core</Text>
                        {renderStatusIcon(userData.Core)}
                    </View>

                    <View style={styles.statusDivider} />

                    <View style={styles.statusItem}>
                        <Text style={styles.statusLabel}>Regear</Text>
                        {renderStatusIcon(userData.Regear)}
                    </View>
                </View>
            </View>

            {/* Actions Card */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Ionicons name="settings-outline" size={20} color="#2196F3" />
                    <Text style={styles.cardTitle}>Actions</Text>
                </View>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={GoToStatInGame}
                >
                    <Ionicons name="stats-chart-outline" size={18} color="white" />
                    <Text style={styles.actionButtonText}>Statistiques In-Game</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 15,
    },
    headerCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        gap: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    infoContainer: {
        gap: 12,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    label: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    value: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
        flex: 1,
        textAlign: 'right',
    },
    roleChip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    roleText: {
        fontSize: 13,
        fontWeight: '600',
    },
    statusGrid: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
    },
    statusDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#e0e0e0',
        marginHorizontal: 15,
    },
    statusLabel: {
        fontSize: 13,
        color: '#666',
        fontWeight: '600',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statusChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    statusYes: {
        backgroundColor: '#d4edda',
    },
    statusNo: {
        backgroundColor: '#f8d7da',
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2196F3',
        padding: 12,
        borderRadius: 8,
        gap: 6,
    },
    actionButtonText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
    },
});