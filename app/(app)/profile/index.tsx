import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/context/ctx';
import { TextInput, IconButton, Button as Bt } from "react-native-paper";
import { getUserData } from '@/services/user.service';
import { useRouter } from 'expo-router';

export default function Profile() {
      const router = useRouter();
    const { user, role } = useAuth();
    const [userData, setUserData] = useState({
        email: "",
        PseudoInGame: "",
        role: "",
        Core: "",
        Regear: ""
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

    const renderStatusIcon = (value: string) => {
        if (value === 'Non' || value === 'Non') {
            return (
                <View style={styles.iconContainer}>
                    <Text style={styles.crossIcon}>✗</Text>
                </View>
            );
        } else if (value === 'Oui' || value === 'oui') {
            return (
                <View style={styles.iconContainer}>
                    <Text style={styles.checkIcon}>✓</Text>
                </View>
            );
        } else {
            return <Text style={styles.statusText}>{value}</Text>;
        }
    };
    const GoToStatInGame = () => {
        router.push("/profile/StatInGame");
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Mon Profil</Text>
                <View style={styles.titleUnderline} />
            </View>

            <View style={styles.cardContainer}>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Informations personnelles</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Email</Text>
                        <Text style={styles.value}>{userData.email}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Pseudo</Text>
                        <Text style={styles.value}>{userData.PseudoInGame}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Rôle</Text>
                        <Text style={styles.value}>{userData.role}</Text>
                    </View>
                </View>

                <View style={styles.statusCard}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Statut</Text>
                    </View>

                    <View style={styles.statusGrid}>
                        <View style={styles.statusItem}>
                            <Text style={styles.statusLabel}>Core</Text>
                            {renderStatusIcon(userData.Core)}
                        </View>

                        <View style={styles.statusSeparator} />

                        <View style={styles.statusItem}>
                            <Text style={styles.statusLabel}>Regear</Text>
                            {renderStatusIcon(userData.Regear)}
                        </View>
                    </View>
                </View>
            </View>
            <View style={styles.cardContainer}>
                <Bt
                    mode="contained"
                    onPress={GoToStatInGame}
                    style={styles.actionButton}
                    icon="ticket"
                >
                    Gérer les utilisateurs
                </Bt>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
        paddingHorizontal: 20,
        paddingTop: 40
    },
    header: {
        alignItems: 'center',
        marginBottom: 30
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#1e293b",
        letterSpacing: -0.5
    },
    titleUnderline: {
        width: 60,
        height: 3,
        backgroundColor: "#3b82f6",
        borderRadius: 2,
        marginTop: 8
    },
    cardContainer: {
        gap: 20
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: "#f1f5f9"
    },
    statusCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: "#f1f5f9"
    },
    actionButton: {
    marginBottom: 12,
    width: '80%',
  },
    cardHeader: {
        marginBottom: 20
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#374151",
        letterSpacing: -0.2
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12
    },
    label: {
        fontSize: 15,
        color: "#6b7280",
        fontWeight: "500",
        letterSpacing: 0.1
    },
    value: {
        fontSize: 15,
        color: "#1f2937",
        fontWeight: "600",
        textAlign: 'right',
        flex: 1,
        marginLeft: 20
    },
    divider: {
        height: 1,
        backgroundColor: "#e5e7eb",
        marginVertical: 4
    },
    statusGrid: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    statusItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 16
    },
    statusSeparator: {
        width: 1,
        height: 40,
        backgroundColor: "#e5e7eb",
        marginHorizontal: 20
    },
    statusLabel: {
        fontSize: 14,
        color: "#6b7280",
        fontWeight: "600",
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3
    },
    checkIcon: {
        fontSize: 20,
        color: "#ffffff",
        fontWeight: "bold"
    },
    crossIcon: {
        fontSize: 18,
        color: "#ffffff",
        fontWeight: "bold"
    },
    statusText: {
        fontSize: 16,
        color: "#374151",
        fontWeight: "600"
    }
});