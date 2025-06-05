import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useAuth } from '@/context/ctx';
import { getUserData } from '@/services/user.service';
import { useRouter, Redirect } from 'expo-router';
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

    // Redirection si pas connecté
    if (!user) return <Redirect href="/(auth)/login" />;

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
        <SafeAreaView style={styles.safeArea}>
            <ScrollView 
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Card */}
                <View style={styles.headerCard}>
                    <View style={styles.headerIconContainer}>
                        <Ionicons name="person-circle-outline" size={48} color="#2196F3" />
                    </View>
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
                            <View style={styles.labelContainer}>
                                <Ionicons name="mail-outline" size={16} color="#64748b" />
                                <Text style={styles.label}>Email</Text>
                            </View>
                            <Text style={styles.value} numberOfLines={1}>{userData.email}</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <View style={styles.labelContainer}>
                                <Ionicons name="game-controller-outline" size={16} color="#64748b" />
                                <Text style={styles.label}>Pseudo</Text>
                            </View>
                            <Text style={styles.value} numberOfLines={1}>{userData.PseudoInGame}</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <View style={styles.labelContainer}>
                                <Ionicons name="shield-outline" size={16} color="#64748b" />
                                <Text style={styles.label}>Rôle</Text>
                            </View>
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

                    <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={GoToStatInGame}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="stats-chart-outline" size={18} color="white" />
                            <Text style={styles.actionButtonText}>Statistiques In-Game</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 16,
        paddingBottom: 30,
    },
    headerCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        marginBottom: 16,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    headerIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#e3f2fd',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 6,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    infoContainer: {
        gap: 4,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        minHeight: 44,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    label: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    value: {
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '600',
        textAlign: 'right',
        flex: 1,
        marginLeft: 12,
    },
    divider: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: 4,
    },
    roleChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: 'flex-end',
    },
    roleText: {
        fontSize: 13,
        fontWeight: '600',
    },
    statusGrid: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    statusItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 16,
    },
    statusDivider: {
        width: 1,
        height: 50,
        backgroundColor: '#e2e8f0',
        marginHorizontal: 16,
    },
    statusLabel: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '600',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statusChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 6,
        minWidth: 60,
        justifyContent: 'center',
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
    actionButtonsContainer: {
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2196F3',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        gap: 8,
        minHeight: 48,
        shadowColor: "#2196F3",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: '#2196F3',
        shadowOpacity: 0,
        elevation: 0,
    },
    actionButtonText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
    },
    secondaryButtonText: {
        color: '#2196F3',
        fontSize: 15,
        fontWeight: '600',
    },
});