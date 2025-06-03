import { Text, View, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { auth } from "@/config/firebase";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { IconButton, TextInput, Button as Bt } from "react-native-paper";
import { db } from '@/config/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function Register() {
  const [email, setEmail] = useState("");
  const [PseudoInGame, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);
  const GoToLogin = () => {
    router.push("/(auth)/login");
  }
  const handleRegister = async () => {
    if (!email || !password || !PseudoInGame ) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user
      const userId = user.uid;

      await setDoc(doc(db, "Users", user.uid), {
        email: email,
        PseudoInGame: PseudoInGame,
        role: "Membre",
        userId: user.uid
      });
      Alert.alert("Succès", "Inscription réussie !");
      router.replace("/(app)");
    } catch (error: any) {
      Alert.alert("Erreur", error.message);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Inscription</Text>

      <TextInput
        label="Adresse e-mail"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        label="Pseudo In Game"
        value={PseudoInGame}
        onChangeText={setName}
        mode="outlined"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        label="Mot de passe"
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        autoCapitalize="none"
      />
      <Bt
        mode="contained"
        loading={loading}
        disabled={loading}
        onPress={handleRegister}
        style={styles.button}
      >S'enregistrer</Bt>
      <Bt mode="text" onPress={GoToLogin}>déjà un compte ? connectez-vous</Bt>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  input: {
    marginBottom: 10,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    marginTop: 20,
  },
  text: {
    color: "#000",
    fontSize: 24,
    textAlign: "center",
  }
});