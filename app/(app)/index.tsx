import { Text, View, StyleSheet, Pressable, ActivityIndicator, ScrollView, RefreshControl, TouchableOpacity, SafeAreaView } from 'react-native';
import { Link, Redirect, useRootNavigationState, useRouter } from 'expo-router';
import { useAuth } from '@/context/ctx';
import { getAuth } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { getAllTickets } from '@/services/ticket.service';
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import Ionicons from "@expo/vector-icons/build/Ionicons";

export default function Index() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [ticketCount, setTicketCount] = useState(0);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [pseudoInGame, setPseudoInGame] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleOpenList = () => {
    router.push(`/profile/utilisateurs`);
  }

  const GoToUserInfoEdit = () => {
    router.push(`/profile/UserEdit`);
  }

  const fetchTickets = async () => {
    if (user) {
      try {
        setLoadingTickets(true);
        const tickets = await getAllTickets();
        // Filtrer les tickets en fonction de l'utilisateur connecté
        let userTickets = [];
        if (role === "Membre") {
          // Tickets créés par le Membre
          userTickets = tickets.filter(ticket =>
            ticket.createdBy?.id === user?.uid
          );
        } else if (role === "Admin" || role === "Reviewer") {
          userTickets = tickets;
        }
        setTicketCount(userTickets.length);
      } catch (error) {
        console.error("Erreur lors de la récupération des tickets:", error);
      } finally {
        setLoadingTickets(false);
      }
    }
  };

  const fetchPseudo = async () => {
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, "Users", user.uid));
        if (userDoc.exists()) {
          setPseudoInGame(userDoc.data().PseudoInGame || null);
        }
      } catch (error) {
        setPseudoInGame(null);
      }
    }
  };

  // Fonction pour le pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchTickets(), fetchPseudo()]);
    } catch (error) {
      console.error('Erreur lors du refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  useEffect(() => {
    fetchPseudo();
  }, [user]);

  // ✅ CORRIGÉ : Navigation correcte
  if (!user)
    return <Redirect href="/(auth)/login" />

  const signOut = () => {
    const auth = getAuth();
    auth.signOut();
  }

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2196F3']}
            tintColor="#2196F3"
          />
        }
      >
        {/* Welcome Card avec icône */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeIconContainer}>
            <Ionicons name="person-circle-outline" size={48} color="#2196F3" />
          </View>
          <Text style={styles.welcomeTitle}>Bienvenue</Text>

          <View style={[styles.roleChip, { backgroundColor: getRoleColor(role || '') }]}>
            <Text style={[styles.roleText, { color: getRoleTextColor(role || '') }]}>
              {role}
            </Text>
          </View>

          {pseudoInGame && (
            <View style={styles.pseudoContainer}>
              <Ionicons name="game-controller-outline" size={16} color="#64748b" />
              <Text style={styles.pseudoLabel}>Pseudo In Game :</Text>
              <Text style={styles.pseudoValue}>{pseudoInGame}</Text>
            </View>
          )}
        </View>

        {/* Stats Card avec icône */}
        <View style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <Ionicons name="ticket-outline" size={24} color="#2196F3" />
            <Text style={styles.statsTitle}>Tickets</Text>
          </View>

          {loadingTickets ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#2196F3" />
              <Text style={styles.loadingText}>Chargement...</Text>
            </View>
          ) : (
            <View style={styles.statsContent}>
              <Text style={styles.ticketCount}>{ticketCount}</Text>
              <Text style={styles.ticketLabel}>
                {role === "Membre"
                  ? ticketCount > 1 ? "tickets créés" : "ticket créé"
                  : ticketCount > 1 ? "tickets en cours" : "ticket en cours"
                }
              </Text>
            </View>
          )}
        </View>

        {/* Actions Card avec icônes */}
        <View style={styles.actionsCard}>
          <View style={styles.actionsHeader}>
            <Ionicons name="settings-outline" size={20} color="#2196F3" />
            <Text style={styles.actionsTitle}>Actions disponibles</Text>
          </View>

          <View style={styles.actionsContainer}>
            {(role === "Reviewer" || role === "Admin") && (
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryAction]}
                onPress={GoToUserInfoEdit}
                activeOpacity={0.8}
              >
                <Ionicons name="people-outline" size={18} color="white" />
                <Text style={styles.actionButtonText}>Gérer les utilisateurs</Text>
              </TouchableOpacity>
            )}

            {role === "Admin" && (
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryAction]}
                onPress={handleOpenList}
                activeOpacity={0.8}
              >
                <Ionicons name="shield-outline" size={18} color="white" />
                <Text style={styles.actionButtonText}>Gérer les rôles</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionButton, styles.logoutButton]}
              onPress={signOut}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={18} color="#666" />
              <Text style={styles.logoutButtonText}>Se déconnecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 30,
  },
  welcomeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  welcomeIconContainer: {
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1e293b',
    textAlign: 'center',
  },
  roleChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  roleText: {
    fontSize: 15,
    fontWeight: '600',
  },
  pseudoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: '80%',
    justifyContent: 'center',
    gap: 8,
  },
  pseudoLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  pseudoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: '#1e293b',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#64748b',
  },
  statsContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  ticketCount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 6,
  },
  ticketLabel: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
  },
  actionsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#1e293b',
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    minHeight: 48,
  },
  primaryAction: {
    backgroundColor: '#2196F3',
    shadowColor: "#2196F3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    marginTop: 8,
  },
  logoutButtonText: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
});