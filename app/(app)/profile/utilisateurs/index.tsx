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
    Alert
} from "react-native";
import { getUserData, updateUser } from "@/services/user.service";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { User } from "@/types/user";
import { useAuth } from "@/context/ctx";
import { getAllUsers } from "@/services/user.service";

const UserProfile = () => {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const { user, loading, role } = useAuth();

    // ✅ CORRIGÉ : Navigation correcte
    if (!user) return <Redirect href="/(auth)/login" />;

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
        <SafeAreaView style={styles.container}>
            {/* Header Card avec icône */}
            <View style={styles.headerCard}>
                <View style={styles.headerIconContainer}>
                    <Ionicons name="shield-outline" size={32} color="#2196F3" />
                </View>
                <Text style={styles.title}>Gestion des Rôles</Text>
                <Text style={styles.subtitle}>Cliquez sur un Membre pour le promouvoir Reviewer</Text>
                
                {/* Stats Row avec icônes */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Ionicons name="person-outline" size={20} color="#1976d2" />
                        <Text style={styles.statNumber}>{membersCount}</Text>
                        <Text style={styles.statLabel}>Membres</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Ionicons name="checkmark-circle-outline" size={20} color="#7b1fa2" />
                        <Text style={styles.statNumber}>{reviewersCount}</Text>
                        <Text style={styles.statLabel}>Reviewers</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Ionicons name="star-outline" size={20} color="#d32f2f" />
                        <Text style={styles.statNumber}>{adminsCount}</Text>
                        <Text style={styles.statLabel}>Admins</Text>
                    </View>
                </View>
            </View>

            {/* Users List - SANS ScrollView pour éviter le conflit */}
            <View style={styles.listCard}>
                <View style={styles.listHeader}>
                    <Ionicons name="people-outline" size={20} color="#2196F3" />
                    <Text style={styles.listTitle}>Liste des Utilisateurs</Text>
                    <View style={styles.countBadge}>
                        <Text style={styles.listCount}>{users.length}</Text>
                    </View>
                </View>
                
                <UserList
                    user={users}
                    onUserRefresh={getUsers}
                    onUserPress={handleUserPress}
                />
            </View>

            {/* Modal de confirmation avec icônes */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalIconContainer}>
                                <Ionicons name="arrow-up-circle-outline" size={32} color="#2196F3" />
                            </View>
                            <Text style={styles.modalTitle}>Promotion</Text>
                        </View>

                        <Text style={styles.modalText}>
                            Êtes-vous sûr de vouloir promouvoir ce membre au rôle de Reviewer ?
                        </Text>

                        {selectedUser && (
                            <View style={styles.userCard}>
                                <View style={styles.userInfo}>
                                    <View style={styles.userNameContainer}>
                                        <Ionicons name="person-circle-outline" size={20} color="#666" />
                                        <Text style={styles.userName}>{selectedUser.PseudoInGame}</Text>
                                    </View>
                                    <View style={styles.userEmailContainer}>
                                        <Ionicons name="mail-outline" size={16} color="#666" />
                                        <Text style={styles.userEmail}>{selectedUser.email}</Text>
                                    </View>
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
                                <Ionicons name="close-outline" size={16} color="#666" />
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
        </SafeAreaView>
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
        borderRadius: 16,
        padding: 24,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        alignItems: 'center',
    },
    headerIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#e3f2fd',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
        color: '#1e293b',
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        color: '#64748b',
        lineHeight: 20,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        width: '100%',
    },
    statItem: {
        alignItems: 'center',
        gap: 6,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    statLabel: {
        fontSize: 13,
        color: '#64748b',
    },
    listCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        flex: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    listHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        flex: 1,
    },
    countBadge: {
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    listCount: {
        fontSize: 13,
        color: '#1976d2',
        fontWeight: '600',
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
        borderRadius: 20,
        padding: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
        width: "90%",
        maxWidth: 400,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    modalIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#e3f2fd',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: '#1e293b',
    },
    modalText: {
        fontSize: 15,
        marginBottom: 20,
        textAlign: "center",
        color: '#64748b',
        lineHeight: 22,
    },
    userCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    userInfo: {
        marginBottom: 12,
        gap: 8,
    },
    userNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    userEmailContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    userEmail: {
        fontSize: 14,
        color: '#64748b',
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
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 6,
    },
    buttonCancel: {
        backgroundColor: "transparent",
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
    },
    buttonConfirm: {
        backgroundColor: "#2196F3",
        shadowColor: "#2196F3",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonCancelText: {
        color: '#64748b',
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