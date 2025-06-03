import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { TextInput, IconButton, Button as Bt } from "react-native-paper";
import { sendEmailVerification, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/config/firebase";
import { Link, useRouter } from "expo-router";
import Button from "@/components/ui/Button";
import { doc, Timestamp, updateDoc } from "firebase/firestore";
// import { registerForPushNotificationsAsync } from "@/hooks/usePushNotification";

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);


  const goToRegister = () => {
    router.push("/(auth)/register");
  }

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    try {
      const userCredential= await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userRef = doc(db, "Users", user.uid);
      await updateDoc(userRef, {
        lastLogin: Timestamp.now(),
      });
      Alert.alert("Succès", "Connexion réussie !");
      router.replace("/(app)")
      // Redirection ou mise à jour de l'état après connexion
    } catch (error) {
      Alert.alert("Erreur", (error as Error).message);
    }
    setLoading(false);
  };
  return (
    <View style={styles.container}>

      <TextInput
        label="Adresse e-mail"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry={secureText}
          autoCapitalize="none"
          style={styles.passwordInput}
        />
        <IconButton
          icon={secureText ? "eye-off" : "eye"}
          onPress={() => setSecureText(!secureText)}
        />
      </View>

      <Bt
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Se connecter
      </Bt>
      <Bt
        mode="contained"
        onPress={goToRegister}
        style={styles.button}>
        Inscription
      </Bt>
    </View>
  );
};

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
  passwordInput: {
    flex: 1,
  },
  button: {
    marginTop: 20,
  },
});

export default LoginScreen;