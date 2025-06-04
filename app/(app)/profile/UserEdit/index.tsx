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
    ScrollView,
    Switch
} from "react-native";
import { getUserData, updateUser } from "@/services/user.service";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { User } from "@/types/user";
import { useAuth } from "@/context/ctx";
import { getAllUsers } from "@/services/user.service";
import { DocumentReference, collection, getDocs } from "firebase/firestore";
import { db } from "@/config/firebase";

const UserProfileEdit = () => {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [isRoleSorted, setIsRoleSorted] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [editedUser, setEditedUser] = useState<User | null>(null);

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

    const handleUserPress = async (userToView: User) => {
        // Vérifier si l'utilisateur est un admin
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
                
                Alert.alert(
                    "Succès",
                    "Les modifications ont été sauvegardées.",
                    [{ text: "OK" }]
                );
                
                setEditMode(false);
                setModalVisible(false);
                getUsers(); // Refresh la liste
            } catch (error) {
                console.error("Erreur lors de la mise à jour:", error);
                Alert.alert(
                    "Erreur",
                    "La sauvegarde a échoué. Veuillez réessayer.",
                    [{ text: "OK" }]
                );
            }
        }
    };

    const handleRoleChange = (newRole: "Membre" | "Reviewer" | "Admin") => {
        if (editedUser) {
            setEditedUser({ ...editedUser, role: newRole });
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

    return (
        <>
            <Text style={styles.title}>Liste des Utilisateurs</Text>
            <Text style={styles.subtitle}>Cliquez sur un utilisateur pour afficher le détail et le modifier</Text>
            <UserList
                user={users}
                onUserRefresh={getUsers}
                onUserPress={handleUserPress}
            />

            {/* Modal de détails utilisateur */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                    setEditMode(false);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    {editMode ? "Modifier l'utilisateur" : "Détails de l'utilisateur"}
                                </Text>
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={() => {
                                        setModalVisible(false);
                                        setEditMode(false);
                                    }}
                                >
                                    <Ionicons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>

                            {selectedUser && (
                                <View style={styles.userDetailsContainer}>
                                    {/* Pseudo */}
                                    <View style={styles.fieldContainer}>
                                        <Text style={styles.fieldLabel}>Pseudo in Game:</Text>
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

                                    {/* Core */}
                                    <View style={styles.fieldContainer}>
                                        <Text style={styles.fieldLabel}>Fais parti du Core:</Text>
                                        {editMode ? (
                                            <View style={styles.switchContainer}>
                                                <Text style={styles.switchLabel}>
                                                    {editedUser?.Core ? 'Oui' : 'Non'}
                                                </Text>
                                                <Switch
                                                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                                                    thumbColor={editedUser?.Core ? "#f5dd4b" : "#f4f3f4"}
                                                    ios_backgroundColor="#3e3e3e"
                                                    onValueChange={handleCoreToggle}
                                                    value={!!editedUser?.Core || false}
                                                />
                                            </View>
                                        ) : (
                                            <View style={[styles.statusChip, selectedUser.Core ? styles.statusYes : styles.statusNo]}>
                                                <Text style={styles.statusText}>
                                                    {selectedUser.Core ? 'Oui' : 'Non'}
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Regear */}
                                    <View style={styles.fieldContainer}>
                                        <Text style={styles.fieldLabel}>Peux ètre Regear:</Text>
                                        {editMode ? (
                                            <View style={styles.switchContainer}>
                                                <Text style={styles.switchLabel}>
                                                    {editedUser?.Regear ? 'Oui' : 'Non'}
                                                </Text>
                                                <Switch
                                                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                                                    thumbColor={editedUser?.Regear ? "#f5dd4b" : "#f4f3f4"}
                                                    ios_backgroundColor="#3e3e3e"
                                                    onValueChange={handleRegearToggle}
                                                    value={!!editedUser?.Regear}
                                                />
                                            </View>
                                        ) : (
                                            <View style={[styles.statusChip, selectedUser.Regear ? styles.statusYes : styles.statusNo]}>
                                                <Text style={styles.statusText}>
                                                    {selectedUser.Regear ? 'Oui' : 'Non'}
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Email */}
                                    <View style={styles.fieldContainer}>
                                        <Text style={styles.fieldLabel}>Email:</Text>
                                        {editMode ? (
                                            <TextInput
                                                style={styles.textInput}
                                                value={editedUser?.email || ''}
                                                onChangeText={(text) => 
                                                    setEditedUser(prev => prev ? {...prev, email: text} : null)
                                                }
                                                placeholder="Email"
                                                keyboardType="email-address"
                                            />
                                        ) : (
                                            <Text style={styles.fieldValue}>{selectedUser.email}</Text>
                                        )}
                                    </View>
                                </View>
                            )}

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
                                            <Text style={styles.textStyle}>Annuler</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.button, styles.buttonConfirm]}
                                            onPress={handleSaveChanges}
                                        >
                                            <Text style={styles.textStyle}>Sauvegarder</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <TouchableOpacity
                                            style={[styles.button, styles.buttonCancel]}
                                            onPress={() => setModalVisible(false)}
                                        >
                                            <Text style={styles.textStyle}>Fermer</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.button, styles.buttonEdit]}
                                            onPress={handleEditToggle}
                                        >
                                            <Text style={styles.textStyle}>
                                                <Ionicons name="create-outline" size={16} /> Modifier
                                            </Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginVertical: 20
    },
    subtitle: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 20,
        color: "#666"
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
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: "90%",
        maxHeight: "80%"
    },
    scrollView: {
        padding: 20
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        flex: 1
    },
    closeButton: {
        padding: 5
    },
    userDetailsContainer: {
        marginBottom: 20
    },
    fieldContainer: {
        marginBottom: 15
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 5,
        color: "#333"
    },
    fieldValue: {
        fontSize: 16,
        padding: 10,
        backgroundColor: "#f8f9fa",
        borderRadius: 8,
        color: "#555"
    },
    userIdText: {
        fontSize: 12,
        fontFamily: "monospace"
    },
    textInput: {
        fontSize: 16,
        padding: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        backgroundColor: "#fff"
    },
    switchContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 10,
        backgroundColor: "#f8f9fa",
        borderRadius: 8
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: "500",
        color: "#333"
    },
    statusChip: {
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15
    },
    statusYes: {
        backgroundColor: "#d4edda"
    },
    statusNo: {
        backgroundColor: "#f8d7da"
    },
    statusText: {
        fontSize: 14,
        fontWeight: "600"
    },
    roleSelector: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8
    },
    roleButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#ddd",
        backgroundColor: "#f8f9fa"
    },
    roleButtonSelected: {
        backgroundColor: "#2196F3",
        borderColor: "#2196F3"
    },
    roleButtonText: {
        fontSize: 14,
        color: "#666"
    },
    roleButtonTextSelected: {
        color: "white",
        fontWeight: "600"
    },
    roleChip: {
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15
    },
    roleMembre: {
        backgroundColor: "#e3f2fd"
    },
    roleReviewer: {
        backgroundColor: "#f3e5f5"
    },
    roleAdmin: {
        backgroundColor: "#ffebee"
    },
    roleChipText: {
        fontSize: 14,
        fontWeight: "600"
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
        gap: 10
    },
    button: {
        borderRadius: 8,
        padding: 12,
        elevation: 2,
        flex: 1,
        alignItems: "center"
    },
    buttonCancel: {
        backgroundColor: "#6c757d"
    },
    buttonConfirm: {
        backgroundColor: "#28a745"
    },
    buttonEdit: {
        backgroundColor: "#2196F3"
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
        fontSize: 16
    }
});

export default UserProfileEdit;