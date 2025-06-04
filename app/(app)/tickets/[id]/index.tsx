import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, Alert, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { getDetailTicket, deleteTicket, updateTicket, closedTicket } from "@/services/ticket.service";
import AddTicketForm from "@/components/tickets/TicketForm";
import { TicketFirst } from "@/types/ticket";
import { DocumentData, DocumentReference, getDoc } from "firebase/firestore";
import AddCommentModal from "@/components/comments/commentsForm";
import { useAuth } from "@/context/ctx";
import { addComment, listenToComments } from "@/services/comment.service";
import { comments } from "@/types/comments";
import Ionicons from "@expo/vector-icons/build/Ionicons";

const TicketDetails = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const idTicket = id as string;

  const [ticket, setTicket] = useState<TicketFirst | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [createdByUser, setCreatedByUser] = useState<string | null>(null);
  const { user, role } = useAuth();
  const [comments, setComments] = useState<comments[]>([]);

  useEffect(() => {
    if (idTicket) {
      setLoading(true);
      getDetailTicket(idTicket).then((data) => {
        if (data) setTicket(data as TicketFirst);
        setLoading(false);
      });
      const unsubscribeComments = listenToComments(idTicket, setComments);
      return () => unsubscribeComments();
    }
  }, [idTicket]);

  useEffect(() => {
    const fetchCreator = async () => {
      if (ticket?.createdBy && typeof ticket.createdBy !== "string") {
        try {
          const creatorRef = ticket.createdBy as DocumentReference<DocumentData>;
          const docSnap = await getDoc(creatorRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setCreatedByUser(data?.PseudoInGame || "Nom non disponible");
          } else {
            setCreatedByUser("Utilisateur inconnu");
          }
        } catch (error) {
          console.error("Erreur lors de la récupération de l'utilisateur :", error);
          setCreatedByUser("Erreur de récupération");
        }
      }
    };

    fetchCreator();
  }, [ticket?.createdBy]);

  const goToCommentsScreen = () => router.push(`/tickets/${idTicket}/comments`);
  const goToTicketsIndex = () => router.replace("/tickets");

  const handleEdit = () => {
    if (ticket?.status !== "fermé") {
      setIsEditModalVisible(true);
    } else {
      Alert.alert("Ticket fermé", "Le ticket est fermé")
    }
  }

  const handleSaveEdit = async (updatedTicket: TicketFirst) => {
    if (!updatedTicket || !idTicket) return;

    Alert.alert(
      "Confirmer la modification",
      "Êtes-vous sûr de vouloir modifier ce ticket ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Enregistrer",
          style: "destructive",
          onPress: async () => {
            await updateTicket(idTicket, updatedTicket);
            const updated = await getDetailTicket(idTicket) as TicketFirst;
            if (updated) {
              setTicket(updated);
            }
            setIsEditModalVisible(false);
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      "Supprimer le ticket",
      "Voulez-vous vraiment supprimer ce ticket ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            const checker = await deleteTicket(idTicket);
            if (checker) {
              setTicket(null);
              setLoading(true);
              goToTicketsIndex();
            }
          },
        },
      ]
    );
  };

  const handleCloseTicket = () => {
    Alert.alert(
      "Fermer le ticket",
      "Voulez-vous vraiment fermer ce ticket ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Fermer",
          style: "destructive",
          onPress: async () => {
            if (ticket) {
              await closedTicket(idTicket);
              setTicket({ ...ticket, status: "fermé" });
              Alert.alert("Succès", "Le ticket a été fermé avec succès.");
            }
          },
        },
      ]
    );
  }

  const openCommentModal = () => {
    if (ticket?.status !== "fermé") {
      setCommentModalVisible(true);
    } else {
      Alert.alert("Ticket fermé", "Le ticket est fermé")
    }
  }

  const handleAddComment = async (text: string) => {
    if (!user?.uid) {
      return Alert.alert("Erreur", "Utilisateur non connecté.");
    }
    try {
      await addComment({
        ticketId: idTicket,
        userId: user.uid,
        content: text,
      });

      Alert.alert("Succès", "Commentaire ajouté");
    } catch (error) {
      console.error("Erreur lors de l'ajout du commentaire :", error);
      Alert.alert("Erreur", "Impossible d'ajouter le commentaire.");
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ouvert': return '#e3f2fd';
      case 'en cours': return '#fff3e0';
      case 'fermé': return '#f8d7da';
      default: return '#f8f9fa';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ouvert': return '#1976d2';
      case 'en cours': return '#f57c00';
      case 'fermé': return '#721c24';
      default: return '#666';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'haute': return '#ffebee';
      case 'moyenne': return '#fff3e0';
      case 'basse': return '#e8f5e8';
      default: return '#f8f9fa';
    }
  };

  const hasComments = comments.length > 0;

  if (!ticket) return (
    <View style={styles.centerContainer}>
      <Text style={styles.emptyText}>Veuillez sélectionner un ticket dans la liste</Text>
    </View>
  );

  if (loading) return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#2196F3" />
      <Text style={styles.loadingText}>Chargement...</Text>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.container}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle} numberOfLines={2}>{ticket.title}</Text>
            <View style={[styles.statusChip, { backgroundColor: getStatusColor(ticket.status) }]}>
              <Text style={[styles.statusText, { color: getStatusTextColor(ticket.status) }]}>
                {ticket.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{ticket.description}</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Priorité</Text>
              <View style={[styles.priorityChip, { backgroundColor: getPriorityColor(ticket.priority) }]}>
                <Text style={styles.infoValue}>{ticket.priority}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Catégorie</Text>
              <Text style={styles.infoValue}>{ticket.category}</Text>
            </View>
          </View>
        </View>

        {/* Meta Card */}
        <View style={styles.metaCard}>
          <Text style={styles.sectionTitle}>Informations</Text>
          
          <View style={styles.metaItem}>
            <Ionicons name="person-outline" size={16} color="#666" />
            <Text style={styles.metaLabel}>Créé par</Text>
            <Text style={styles.metaValue}>{createdByUser}</Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.metaLabel}>Créé le</Text>
            <Text style={styles.metaValue}>
              {ticket.createdAt?.toDate().toLocaleDateString('fr-FR')}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="refresh-outline" size={16} color="#666" />
            <Text style={styles.metaLabel}>Mis à jour</Text>
            <Text style={styles.metaValue}>
              {ticket.updatedAt?.toDate().toLocaleDateString('fr-FR')}
            </Text>
          </View>
        </View>

        {/* Actions Card */}
        <View style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={handleEdit}>
              <Ionicons name="create-outline" size={18} color="white" />
              <Text style={styles.actionButtonText}>Modifier</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={18} color="white" />
              <Text style={styles.actionButtonText}>Supprimer</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.actionButton, styles.commentButton]} onPress={openCommentModal}>
            <Ionicons name="chatbubble-outline" size={18} color="white" />
            <Text style={styles.actionButtonText}>Ajouter un commentaire</Text>
          </TouchableOpacity>

          {hasComments && (
            <TouchableOpacity style={[styles.actionButton, styles.viewButton]} onPress={goToCommentsScreen}>
              <Ionicons name="eye-outline" size={18} color="white" />
              <Text style={styles.actionButtonText}>Voir les commentaires ({comments.length})</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.actionButton, styles.closeButton]} onPress={handleCloseTicket}>
            <Ionicons name="close-circle-outline" size={18} color="white" />
            <Text style={styles.actionButtonText}>Fermer le ticket</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.backButton]} onPress={goToTicketsIndex}>
            <Ionicons name="arrow-back-outline" size={18} color="#666" />
            <Text style={styles.backButtonText}>Retour à la liste</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modals */}
      {commentModalVisible && (
        <AddCommentModal
          visible={commentModalVisible}
          onClose={() => setCommentModalVisible(false)}
          onSave={(text) => handleAddComment(text)}
        />
      )}
      {isEditModalVisible && (
        <AddTicketForm
          visible={isEditModalVisible}
          onClose={() => setIsEditModalVisible(false)}
          onSave={handleSaveEdit}
          initialTicket={ticket}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  headerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    lineHeight: 26,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    minWidth: 70,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  description: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 20,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  priorityChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  metaCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  metaLabel: {
    fontSize: 14,
    color: '#666',
    width: 80,
  },
  metaValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  actionsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    gap: 6,
  },
  editButton: {
    backgroundColor: '#2196F3',
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    flex: 1,
  },
  commentButton: {
    backgroundColor: '#4CAF50',
  },
  viewButton: {
    backgroundColor: '#FF9800',
  },
  closeButton: {
    backgroundColor: '#9E9E9E',
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  backButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TicketDetails;