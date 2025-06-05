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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
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
              autoComplete="email"
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
              autoComplete="username"
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
                autoComplete="password"
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
                activeOpacity={0.7}
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
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
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
              activeOpacity={0.8}
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
    paddingBottom: 40, // Extra space en bas
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    marginVertical: 20, // Marge verticale pour breathing room
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#1e293b",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 32,
    color: "#64748b",
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#374151",
  },
  input: {
    backgroundColor: "#fff",
    fontSize: 15,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: "#fff",
    paddingRight: 50,
    fontSize: 15,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 16,
    padding: 8,
    zIndex: 1,
  },
  buttonContainer: {
    marginTop: 24,
    gap: 16,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48, // Minimum touch target
  },
  primaryButton: {
    backgroundColor: "#2196F3",
    shadowColor: "#2196F3",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#2196F3",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryButtonText: {
    color: "#2196F3",
    fontWeight: "600",
    fontSize: 15,
  },
});