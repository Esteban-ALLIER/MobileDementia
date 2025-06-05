import React, { useState } from "react";
import { 
  View, 
  StyleSheet, 
  Alert, 
  TouchableOpacity, 
  Text, 
  ScrollView,
  KeyboardAvoidingView,
  Platform 
} from "react-native";
import { TextInput } from "react-native-paper";
import { sendEmailVerification, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/config/firebase";
import { Link, useRouter } from "expo-router";
import { doc, Timestamp, updateDoc } from "firebase/firestore";
import { Eye, EyeOff } from 'lucide-react-native';

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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userRef = doc(db, "Users", user.uid);
      await updateDoc(userRef, {
        lastLogin: Timestamp.now(),
      });
      router.replace("/(app)")
    } catch (error) {
      const errorMessage = (error instanceof Error) ? error.message : "Une erreur inconnue s'est produite.";
      Alert.alert("Erreur, mot de passe ou email incorrect", errorMessage);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>Connexion</Text>
          <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.fieldLabel}>Adresse e-mail</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              theme={{
                colors: {
                  primary: '#2196F3',
                  outline: '#ddd',
                }
              }}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.fieldLabel}>Mot de passe</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={secureText}
                autoCapitalize="none"
                style={styles.passwordInput}
                theme={{
                  colors: {
                    primary: '#2196F3',
                    outline: '#ddd',
                  }
                }}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setSecureText(!secureText)}
              >
                {secureText ? (
                  <EyeOff size={20} color="#666" />
                ) : (
                  <Eye size={20} color="#666" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Connexion..." : "Se connecter"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={goToRegister}
              disabled={loading}
            >
              <Text style={styles.secondaryButtonText}>Inscription</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
  },
  inputContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    backgroundColor: "#fff",
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 16,
    padding: 8,
    zIndex: 1,
  },
  buttonContainer: {
    marginTop: 10,
    gap: 15,
  },
  button: {
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#2196F3",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#2196F3",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  secondaryButtonText: {
    color: "#2196F3",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default LoginScreen;