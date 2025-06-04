import { Text, View, StyleSheet, Pressable, ActivityIndicator, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
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

  if (!user)
    return <Redirect href="/login" />

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
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          colors={['#2196F3']}
          tintColor="#2196F3"
        />
      }
    >
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>Bienvenue</Text>
        
        <View style={[styles.roleChip, { backgroundColor: getRoleColor(role || '') }]}>
          <Text style={[styles.roleText, { color: getRoleTextColor(role || '') }]}>
            {role}
          </Text>
        </View>

        {pseudoInGame && (
          <View style={styles.pseudoContainer}>
            <Text style={styles.pseudoLabel}>Pseudo In Game :</Text>
            <Text style={styles.pseudoValue}>{pseudoInGame}</Text>
          </View>
        )}
      </View>

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

      <View style={styles.actionsContainer}>
        <Text style={styles.actionsTitle}>Actions disponibles</Text>
        
        {(role === "Reviewer" || role === "Admin") && (
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryAction]}
            onPress={GoToUserInfoEdit}
          >
            <Ionicons name="people-outline" size={20} color="white" />
            <Text style={styles.actionButtonText}>Gérer les utilisateurs</Text>
          </TouchableOpacity>
        )}

        {role === "Admin" && (
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryAction]}
            onPress={handleOpenList}
          >
            <Ionicons name="shield-outline" size={20} color="white" />
            <Text style={styles.actionButtonText}>Gérer les rôles</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.logoutButton]}
          onPress={signOut}
        >
          <Ionicons name="log-out-outline" size={20} color="#666" />
          <Text style={styles.logoutButtonText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  roleChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 15,
  },
  roleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pseudoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pseudoLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  pseudoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: '#333',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  statsContent: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  ticketCount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5,
  },
  ticketLabel: {
    fontSize: 16,
    color: '#666',
  },
  actionsContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  primaryAction: {
    backgroundColor: '#2196F3',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginTop: 10,
  },
  logoutButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});