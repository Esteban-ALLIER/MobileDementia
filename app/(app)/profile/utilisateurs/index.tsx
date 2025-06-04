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

    return (
        <>
            <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", marginVertical: 20 }}>Liste des Utilisateurs</Text>
            <Text style={{ fontSize: 16, textAlign: "center", marginBottom: 20 }}>cliquer sur un Membre pour le passer en Reviewer</Text>
            <UserList
                user={users}
                onUserRefresh={getUsers}
                onUserPress={handleUserPress}
            />

            <View style={{ flexDirection: "row", justifyContent: "space-evenly", marginVertical: 10 }}>
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
                        <Text style={styles.modalTitle}>Confirmation</Text>
                        <Text style={styles.modalText}>
                            Êtes-vous sûr de vouloir passer ce Membre en Reviewer ?
                        </Text>
                        <Text style={styles.userInfo}>
                            {selectedUser?.PseudoInGame} ({selectedUser?.email})
                        </Text>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonCancel]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.textStyle}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonConfirm]}
                                onPress={confirmRoleChange}
                            >
                                <Text style={styles.textStyle}>Confirmer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    filterBtn: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 10,
        marginHorizontal: 10
    },
    searchBar: {
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        marginHorizontal: 10,
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
        borderRadius: 10,
        padding: 25,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: "80%"
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    },
    userInfo: {
        fontWeight: "500",
        marginBottom: 20,
        textAlign: "center"
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginTop: 10
    },
    button: {
        borderRadius: 5,
        padding: 10,
        elevation: 2,
        minWidth: "45%"
    },
    buttonCancel: {
        backgroundColor: "#ccc",
    },
    buttonConfirm: {
        backgroundColor: "#2196F3",
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    }
});

export default UserProfile;