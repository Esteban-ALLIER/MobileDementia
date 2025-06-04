import { UserList } from "@/components/UsersList/ListCard";
import React from 'react';
import { useEffect, useState } from "react";
import { Redirect, useRouter } from "expo-router";
import {
    Button,
    Platform,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    TextInput,
    View,
    Text,
    TouchableOpacity,
    Modal,
    Alert,
    ScrollView
} from "react-native";
import { getUserData, updateUser } from "@/services/user.service";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { User } from "@/types/user";
import { useAuth } from "@/context/ctx";
import { getAllUsers } from "@/services/user.service";
import { DocumentReference, collection, getDocs } from "firebase/firestore";
import { db } from "@/config/firebase";

const UserProfile = () => {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [isRoleSorted, setIsRoleSorted] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const { user, loading, role } = useAuth();

    if (!user) return <Redirect href="/login" />;

    const getUsers = async () => {
        try {
            const allUsersData = await getAllUsers();
            setUsers(allUsersData);
        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateurs:", error);
        }
    };

    useEffect(() => {
        getUsers();
    }, []);

    const handleUserPress = async (userToUpdate: User) => {
        // Vérifier si l'utilisateur est un admin avant de montrer le modal
        if (userToUpdate.role === "Admin") {
            Alert.alert(
                "Action non autorisée",
                "Vous ne pouvez pas changer le rôle d'un administrateur.",
                [{ text: "OK" }]
            );
            return;
        }

        setSelectedUser(userToUpdate);
        setModalVisible(true);
    };

    const confirmRoleChange = async () => {
        if (selectedUser) {
            if (selectedUser.role === "Admin") {
                Alert.alert(
                    "Action non autorisée",
                    "Vous ne pouvez pas changer le rôle d'un administrateur.",
                    [{ text: "OK" }]
                );
                setModalVisible(false);
                return;
            }

            try {
                await updateUser(selectedUser.userId, {
                    PseudoInGame: selectedUser.PseudoInGame,
                    email: selectedUser.email,
                    role: "Reviewer",
                    Core: selectedUser.Core,
                    Regear: selectedUser.Regear
                });
                setModalVisible(false);
                getUsers();
                Alert.alert(
                    "Succès",
                    `${selectedUser.PseudoInGame} est maintenant Reviewer.`,
                    [{ text: "OK" }]
                );
            } catch (error) {
                console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
                Alert.alert(
                    "Erreur",
                    "La mise à jour du rôle a échoué. Veuillez réessayer.",
                    [{ text: "OK" }]
                );
            }
        }
    };

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

    const membersCount = users.filter(u => u.role === 'Membre').length;
    const reviewersCount = users.filter(u => u.role === 'Reviewer').length;
    const adminsCount = users.filter(u => u.role === 'Admin').length;

    return (
        <ScrollView style={styles.container}>
            {/* Header Card */}
            <View style={styles.headerCard}>
                <Text style={styles.title}>Gestion des Rôles</Text>
                <Text style={styles.subtitle}>Cliquez sur un Membre pour le promouvoir Reviewer</Text>
                
                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{membersCount}</Text>
                        <Text style={styles.statLabel}>Membres</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{reviewersCount}</Text>
                        <Text style={styles.statLabel}>Reviewers</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{adminsCount}</Text>
                        <Text style={styles.statLabel}>Admins</Text>
                    </View>
                </View>
            </View>

            {/* Users List */}
            <View style={styles.listCard}>
                <View style={styles.listHeader}>
                    <Ionicons name="people-outline" size={20} color="#2196F3" />
                    <Text style={styles.listTitle}>Liste des Utilisateurs</Text>
                    <Text style={styles.listCount}>({users.length})</Text>
                </View>
                
                <UserList
                    user={users}
                    onUserRefresh={getUsers}
                    onUserPress={handleUserPress}
                />
            </View>

            {/* Modal de confirmation */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={styles.modalHeader}>
                            <Ionicons name="arrow-up-circle-outline" size={32} color="#2196F3" />
                            <Text style={styles.modalTitle}>Promotion</Text>
                        </View>

                        <Text style={styles.modalText}>
                            Êtes-vous sûr de vouloir promouvoir ce membre au rôle de Reviewer ?
                        </Text>

                        {selectedUser && (
                            <View style={styles.userCard}>
                                <View style={styles.userInfo}>
                                    <Text style={styles.userName}>{selectedUser.PseudoInGame}</Text>
                                    <Text style={styles.userEmail}>{selectedUser.email}</Text>
                                </View>
                                <View style={styles.roleChangeIndicator}>
                                    <View style={[styles.roleChip, { backgroundColor: getRoleColor(selectedUser.role) }]}>
                                        <Text style={[styles.roleText, { color: getRoleTextColor(selectedUser.role) }]}>
                                            {selectedUser.role}
                                        </Text>
                                    </View>
                                    <Ionicons name="arrow-forward" size={16} color="#666" />
                                    <View style={[styles.roleChip, { backgroundColor: getRoleColor('Reviewer') }]}>
                                        <Text style={[styles.roleText, { color: getRoleTextColor('Reviewer') }]}>
                                            Reviewer
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonCancel]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.buttonCancelText}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonConfirm]}
                                onPress={confirmRoleChange}
                            >
                                <Ionicons name="checkmark" size={18} color="white" />
                                <Text style={styles.buttonConfirmText}>Promouvoir</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

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
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
        color: '#333',
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        color: '#666',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2196F3',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        color: '#666',
    },
    listCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    listHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        gap: 8,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    listCount: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)"
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 15,
        padding: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: "90%",
        maxWidth: 400,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 8,
        color: '#333',
    },
    modalText: {
        fontSize: 15,
        marginBottom: 20,
        textAlign: "center",
        color: '#555',
        lineHeight: 22,
    },
    userCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    userInfo: {
        marginBottom: 12,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
    },
    roleChangeIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    roleChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    roleText: {
        fontSize: 13,
        fontWeight: '600',
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
    button: {
        flex: 1,
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 6,
    },
    buttonCancel: {
        backgroundColor: "transparent",
        borderWidth: 1.5,
        borderColor: '#e0e0e0',
    },
    buttonConfirm: {
        backgroundColor: "#2196F3",
    },
    buttonCancelText: {
        color: '#666',
        fontWeight: "600",
        fontSize: 15,
    },
    buttonConfirmText: {
        color: "white",
        fontWeight: "600",
        fontSize: 15,
    },
});

export default UserProfile;