import { Text, View, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { auth } from "@/config/firebase";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { TextInput } from "react-native-paper";
import { db } from '@/config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Eye, EyeOff } from 'lucide-react-native';

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
    if (!email || !password || !PseudoInGame) {
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
        Core: false,
        Regear: false,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      Alert.alert("Succès", "Inscription réussie !");
      router.replace("/(app)");
    } catch (error: any) {
      Alert.alert("Erreur", error.message);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>Inscription</Text>
          <Text style={styles.subtitle}>Créez votre compte</Text>

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
            <Text style={styles.fieldLabel}>Pseudo In Game</Text>
            <TextInput
              value={PseudoInGame}
              onChangeText={setName}
              mode="outlined"
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
                  <EyeOff size={24} color="#666" />
                ) : (
                  <Eye size={24} color="#666" />
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.buttonText}>S'enregistrer</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={GoToLogin}
              disabled={loading}
            >
              <Text style={styles.secondaryButtonText}>
                Déjà un compte ? Connectez-vous
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
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
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: "#fff",
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
    padding: 5,
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
    minHeight: 50,
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
    fontSize: 14,
  },
});