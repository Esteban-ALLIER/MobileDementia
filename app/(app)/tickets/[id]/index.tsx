import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, Alert, ActivityIndicator, StyleSheet, Button as RNButton, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { getDetailTicket, deleteTicket, updateTicket, closedTicket } from "@/services/ticket.service";
import AddTicketForm from "@/components/tickets/TicketForm";
import { TicketFirst } from "@/types/ticket";
import { DocumentData, DocumentReference, getDoc } from "firebase/firestore";
import AddCommentModal from "@/components/comments/commentsForm";
import { useAuth } from "@/context/ctx";
import { addComment, listenToComments } from "@/services/comment.service";
import { comments } from "@/types/comments";

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
    {
      if (ticket?.status !== "fermé") {
        setCommentModalVisible(true);
      } else {
        Alert.alert("Ticket fermé", "Le ticket est fermé")
      }
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


  const hasComments = comments.length > 0;

  if (!ticket) return (
    <View style={styles.centerContainer}>
      <Text>Veuillez sélectionner un ticket dans la liste</Text>
    </View>
  );

  if (loading) return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#0066CC" />
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.container}>
        {/* En-tête */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>{ticket.title}</Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>{ticket.status}</Text>
          </View>
        </View>

        {/* Section infos */}
        <View style={styles.section}>
          <Text numberOfLines={3} style={styles.description}>{ticket.description}</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Priorité</Text>
              <Text style={styles.detailValue}>{ticket.priority}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Catégorie</Text>
              <Text style={styles.detailValue}>{ticket.category}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.metaContainer}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Créé par</Text>
              <Text style={styles.metaValue}>{createdByUser}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Créé le</Text>
              <Text style={styles.metaValue}>{ticket.createdAt?.toDate().toLocaleDateString('fr-FR')}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Mise à jour</Text>
              <Text style={styles.metaValue}>{ticket.updatedAt?.toDate().toLocaleDateString('fr-FR')}</Text>
            </View>

          </View>
        </View>

        {/* Actions principales */}
        <View style={styles.actionRow}>
          <Button theme="edit" label="Modifier" onPress={handleEdit} />
          <Button theme="delete" label="Supprimer" onPress={handleDelete} />
        </View>

        <View style={styles.actionRow}>
          <Button
            theme="basique"
            label="Ajouter un commentaire"
            onPress={openCommentModal}
          />
        </View>

        <View style={styles.actionRow}>
          {hasComments && (
            <Button
              theme="see"
              label="Voir les commentaires"
              onPress={goToCommentsScreen}
            />
          )}
        </View>
        <View style={styles.actionRow}>
          <Button
            theme="close"
            label="Fermé le ticket"
            onPress={handleCloseTicket}
          />
        </View>
        <View style={styles.actionRow}>
          <Button
            theme="return"
            label="Retour à la liste"
            onPress={goToTicketsIndex}
          />
        </View>
      </ScrollView >

      {/* Modals */}
      {
        commentModalVisible && (
          <AddCommentModal
            visible={commentModalVisible}
            onClose={() => setCommentModalVisible(false)}
            onSave={(text) => handleAddComment(text)}
          />
        )
      }
      {
        isEditModalVisible && (
          <AddTicketForm
            visible={isEditModalVisible}
            onClose={() => setIsEditModalVisible(false)}
            onSave={handleSaveEdit}
            initialTicket={ticket}
          />
        )
      }
    </>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 50,
    marginLeft: 10,
    backgroundColor: '#0066CC',
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  description: {
    fontSize: 15,
    color: '#555',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: '#777',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  metaContainer: {
    marginTop: 8,
  },
  metaRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  metaLabel: {
    width: 80,
    fontSize: 13,
    color: '#777',
  },
  metaValue: {
    flex: 1,
    fontSize: 14,
    color: '#444',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  editButton: {
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    flex: 1,
    marginLeft: 8,
  },
  secondaryActions: {
    marginBottom: 24,
    gap: 10,
  },
  backButton: {
    backgroundColor: '#999',
    marginBottom: 20,
  },
});

export default TicketDetails;