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
    Switch,
    KeyboardAvoidingView,
    ScrollView
} from "react-native";
import { getUserData, updateUser } from "@/services/user.service";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { User } from "@/types/user";
import { useAuth } from "@/context/ctx";
import { getAllUsers } from "@/services/user.service";

const UserProfileEdit = () => {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [editedUser, setEditedUser] = useState<User | null>(null);

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

    const handleUserPress = async (userToView: User) => {
        if (userToView.role === "Admin") {
            Alert.alert(
                "Action non autorisée",
                "Vous ne pouvez pas modifier les informations d'un administrateur.",
                [{ text: "OK" }]
            );
            return;
        }
        
        setSelectedUser(userToView);
        setEditedUser({ ...userToView });
        setEditMode(false);
        setModalVisible(true);
    };

    const handleEditToggle = () => {
        setEditMode(!editMode);
        if (!editMode) {
            setEditedUser({ ...selectedUser! });
        }
    };

    const handleSaveChanges = async () => {
        if (editedUser && selectedUser) {
            try {
                await updateUser(editedUser.userId, {
                    PseudoInGame: editedUser.PseudoInGame,
                    email: editedUser.email,
                    role: editedUser.role,
                    Core: editedUser.Core,
                    Regear: editedUser.Regear
                });
                
                Alert.alert("Succès", "Les modifications ont été sauvegardées.", [{ text: "OK" }]);
                setEditMode(false);
                setModalVisible(false);
                getUsers();
            } catch (error) {
                console.error("Erreur lors de la mise à jour:", error);
                Alert.alert("Erreur", "La sauvegarde a échoué. Veuillez réessayer.", [{ text: "OK" }]);
            }
        }
    };

    const handleCoreToggle = (value: boolean) => {
        if (editedUser) {
            setEditedUser({ ...editedUser, Core: value.toString() });
        }
    };

    const handleRegearToggle = (value: boolean) => {
        if (editedUser) {
            setEditedUser({ ...editedUser, Regear: value.toString() });
        }
    };

    const renderStatusChip = (value: boolean) => {
        return (
            <View style={[styles.statusChip, value ? styles.statusYes : styles.statusNo]}>
                <Ionicons 
                    name={value ? "checkmark" : "close"} 
                    size={14} 
                    color={value ? "#155724" : "#721c24"} 
                />
                <Text style={[styles.statusText, { color: value ? "#155724" : "#721c24" }]}>
                    {value ? "Oui" : "Non"}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header avec icône */}
            <View style={styles.header}>
                <View style={styles.headerIconContainer}>
                    <Ionicons name="people-outline" size={32} color="#2196F3" />
                </View>
                <Text style={styles.title}>Gestion des Utilisateurs</Text>
                <Text style={styles.subtitle}>Cliquez sur un utilisateur pour le modifier</Text>
            </View>

            {/* ✅ CORRIGÉ : UserList directement sans ScrollView */}
            <View style={styles.listContainer}>
                <View style={styles.listHeader}>
                    <Ionicons name="list-outline" size={20} color="#2196F3" />
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

            {/* Modal avec icônes */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                    setEditMode(false);
                }}
            >
                <KeyboardAvoidingView 
                    style={styles.centeredView}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={styles.modalView}>
                        <ScrollView 
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            <View style={styles.modalContent}>
                                {/* Header Modal avec icône */}
                                <View style={styles.modalHeader}>
                                    <View style={styles.modalHeaderContent}>
                                        <View style={styles.modalIconContainer}>
                                            <Ionicons 
                                                name={editMode ? "create-outline" : "person-circle-outline"} 
                                                size={24} 
                                                color="#2196F3" 
                                            />
                                        </View>
                                        <Text style={styles.modalTitle}>
                                            {editMode ? "Modifier l'utilisateur" : "Détails de l'utilisateur"}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.closeButton}
                                        onPress={() => {
                                            setModalVisible(false);
                                            setEditMode(false);
                                        }}
                                    >
                                        <Ionicons name="close" size={20} color="#64748b" />
                                    </TouchableOpacity>
                                </View>

                                {selectedUser && (
                                    <View style={styles.fieldsContainer}>
                                        {/* Pseudo avec icône */}
                                        <View style={styles.fieldContainer}>
                                            <View style={styles.fieldLabelContainer}>
                                                <Ionicons name="game-controller-outline" size={16} color="#64748b" />
                                                <Text style={styles.fieldLabel}>Pseudo in Game</Text>
                                            </View>
                                            {editMode ? (
                                                <TextInput
                                                    style={styles.textInput}
                                                    value={editedUser?.PseudoInGame || ''}
                                                    onChangeText={(text) => 
                                                        setEditedUser(prev => prev ? {...prev, PseudoInGame: text} : null)
                                                    }
                                                    placeholder="Pseudo in Game"
                                                />
                                            ) : (
                                                <Text style={styles.fieldValue}>{selectedUser.PseudoInGame}</Text>
                                            )}
                                        </View>

                                        {/* Email avec icône */}
                                        <View style={styles.fieldContainer}>
                                            <View style={styles.fieldLabelContainer}>
                                                <Ionicons name="mail-outline" size={16} color="#64748b" />
                                                <Text style={styles.fieldLabel}>Email</Text>
                                            </View>
                                            {editMode ? (
                                                <TextInput
                                                    style={styles.textInput}
                                                    value={editedUser?.email || ''}
                                                    onChangeText={(text) => 
                                                        setEditedUser(prev => prev ? {...prev, email: text} : null)
                                                    }
                                                    placeholder="Email"
                                                    keyboardType="email-address"
                                                    autoCapitalize="none"
                                                />
                                            ) : (
                                                <Text style={styles.fieldValue}>{selectedUser.email}</Text>
                                            )}
                                        </View>

                                        {/* Core avec icône */}
                                        <View style={styles.fieldContainer}>
                                            <View style={styles.fieldLabelContainer}>
                                                <Ionicons name="shield-outline" size={16} color="#64748b" />
                                                <Text style={styles.fieldLabel}>Fait partie du Core</Text>
                                            </View>
                                            {editMode ? (
                                                <View style={styles.switchContainer}>
                                                    <Text style={styles.switchLabel}>
                                                        {editedUser?.Core ? 'Oui' : 'Non'}
                                                    </Text>
                                                    <Switch
                                                        trackColor={{ false: "#e2e8f0", true: "#93c5fd" }}
                                                        thumbColor={editedUser?.Core ? "#2196F3" : "#f1f5f9"}
                                                        ios_backgroundColor="#e2e8f0"
                                                        onValueChange={handleCoreToggle}
                                                        value={!!editedUser?.Core}
                                                    />
                                                </View>
                                            ) : (
                                                renderStatusChip(!!selectedUser.Core)
                                            )}
                                        </View>

                                        {/* Regear avec icône */}
                                        <View style={styles.fieldContainer}>
                                            <View style={styles.fieldLabelContainer}>
                                                <Ionicons name="refresh-outline" size={16} color="#64748b" />
                                                <Text style={styles.fieldLabel}>Peut être Regear</Text>
                                            </View>
                                            {editMode ? (
                                                <View style={styles.switchContainer}>
                                                    <Text style={styles.switchLabel}>
                                                        {editedUser?.Regear ? 'Oui' : 'Non'}
                                                    </Text>
                                                    <Switch
                                                        trackColor={{ false: "#e2e8f0", true: "#93c5fd" }}
                                                        thumbColor={editedUser?.Regear ? "#2196F3" : "#f1f5f9"}
                                                        ios_backgroundColor="#e2e8f0"
                                                        onValueChange={handleRegearToggle}
                                                        value={!!editedUser?.Regear}
                                                    />
                                                </View>
                                            ) : (
                                                renderStatusChip(!!selectedUser.Regear)
                                            )}
                                        </View>
                                    </View>
                                )}

                                {/* Boutons avec icônes */}
                                <View style={styles.buttonContainer}>
                                    {editMode ? (
                                        <>
                                            <TouchableOpacity
                                                style={[styles.button, styles.buttonCancel]}
                                                onPress={() => {
                                                    setEditMode(false);
                                                    setEditedUser({ ...selectedUser! });
                                                }}
                                            >
                                                <Ionicons name="close-outline" size={16} color="#64748b" />
                                                <Text style={styles.buttonCancelText}>Annuler</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.button, styles.buttonConfirm]}
                                                onPress={handleSaveChanges}
                                            >
                                                <Ionicons name="checkmark-outline" size={16} color="white" />
                                                <Text style={styles.buttonConfirmText}>Sauvegarder</Text>
                                            </TouchableOpacity>
                                        </>
                                    ) : (
                                        <>
                                            <TouchableOpacity
                                                style={[styles.button, styles.buttonCancel]}
                                                onPress={() => setModalVisible(false)}
                                            >
                                                <Ionicons name="close-outline" size={16} color="#64748b" />
                                                <Text style={styles.buttonCancelText}>Fermer</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.button, styles.buttonEdit]}
                                                onPress={handleEditToggle}
                                            >
                                                <Ionicons name="create-outline" size={16} color="white" />
                                                <Text style={styles.buttonEditText}>Modifier</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: 'white',
        padding: 24,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
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
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 8,
        color: '#1e293b'
    },
    subtitle: {
        fontSize: 14,
        textAlign: "center",
        color: "#64748b",
        lineHeight: 20,
    },
    listContainer: {
        flex: 1,
        backgroundColor: 'white',
        margin: 16,
        borderRadius: 16,
        padding: 20,
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
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
        width: "90%",
        maxHeight: "85%",
        maxWidth: 400,
    },
    modalContent: {
        padding: 24,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24
    },
    modalHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    modalIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#e3f2fd',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: '#1e293b',
        flex: 1,
    },
    closeButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#f8fafc',
    },
    fieldsContainer: {
        marginBottom: 24,
        gap: 20,
    },
    fieldContainer: {
        gap: 8,
    },
    fieldLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1e293b"
    },
    fieldValue: {
        fontSize: 15,
        padding: 12,
        backgroundColor: "#f8fafc",
        borderRadius: 12,
        color: "#475569",
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    textInput: {
        fontSize: 15,
        padding: 12,
        borderWidth: 1.5,
        borderColor: "#e2e8f0",
        borderRadius: 12,
        backgroundColor: "#fff",
        color: '#1e293b',
    },
    switchContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 12,
        backgroundColor: "#f8fafc",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    switchLabel: {
        fontSize: 15,
        fontWeight: "500",
        color: "#1e293b"
    },
    statusChip: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 6,
    },
    statusYes: {
        backgroundColor: "#d4edda"
    },
    statusNo: {
        backgroundColor: "#f8d7da"
    },
    statusText: {
        fontSize: 13,
        fontWeight: "600"
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
    button: {
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        flex: 1,
        alignItems: "center",
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
        minHeight: 48,
    },
    buttonCancel: {
        backgroundColor: "transparent",
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
    },
    buttonConfirm: {
        backgroundColor: "#22c55e",
        shadowColor: "#22c55e",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonEdit: {
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
    buttonEditText: {
        color: "white",
        fontWeight: "600",
        fontSize: 15,
    },
});

export default UserProfileEdit;