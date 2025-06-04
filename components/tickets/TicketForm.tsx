import { TicketFirst, TicketTrue } from "@/types/ticket";
import { Timestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useAuth } from "@/context/ctx"; // Ajout du contexte d'authentification

// Props pour le formulaire
interface AddTicketFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (ticket: TicketFirst) => void;
  initialTicket?: TicketFirst;
}

const AddTicketForm: React.FC<AddTicketFormProps> = ({
  visible,
  onClose,
  onSave,
  initialTicket,
}) => {
  // Récupération du rôle de l'utilisateur
  const { role } = useAuth();
  const isEmployee = role === "Membre"

  const [ticket, setTicket] = useState<TicketFirst>
    ({
      title: "",
      description: "",
      status: "nouveau",
      priority: "moyen",
      category: "DPS",
    });
  const [typeForm, setTypeForm] = useState<string>("")

  useEffect(() => {
    if (initialTicket) {
      setTicket(initialTicket);
      setTypeForm("edit")
    } else {
      setTypeForm("add")
    }
  }, [initialTicket]);
  const statusOptions = ["nouveau", "en cours", "fermé"];
  const priorityOptions = ["bas", "moyen", "élevé", "critique"];
  const categoryOPtions = ["DPS", "Heal", "Tank", "Support", "BM"]

  const [nameError, setNameError] = useState("");

  // Validation du formulaire
  const validateForm = (): boolean => {
    if (!ticket.title.trim()) {
      setNameError("Le titre du ticket est requis");
      return false;
    }
    if (!ticket.description.trim()) {
      setNameError("La description du ticket est requis");
      return false;
    }
    setNameError("");
    return true;
  };

  // Soumission du formulaire
  const handleSubmit = () => {

    if (validateForm()) {
      onSave(ticket);
      // Réinitialiser le formulaire
      setTicket({
        title: "",
        description: "",
        status: "nouveau",
        priority: "moyen",
        category: "DPS",
      });
      onClose();
    }
  };

  // Selection d'option
  const renderOptions = (
    options: string[],
    selectedValue: string,
    field: "status" | "priority" | "category"
  ) => {
    return (
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              ticket[field] === option && styles.selectedOption,
            ]}
            onPress={() => {
              setTicket({ ...ticket, [field]: option });
            }}
            disabled={ticket.status === "fermé"}
          >
            <Text
              style={[
                styles.optionText,
                ticket[field] === option && styles.selectedOptionText,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingContainer}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Nouveau Ticket</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nom du ticket</Text>
                  <TextInput
                    style={[styles.input,
                    nameError ? styles.inputError : null,
                    ]}
                    value={ticket.title}
                    onChangeText={(text) => {
                      if (isEmployee && ticket.status !== "fermé") {
                        setTicket({ ...ticket, title: text });
                        if (text.trim()) setNameError("");
                      }
                    }}
                    placeholder="Titre du ticket..."
                    placeholderTextColor="#A0A0A0"

                  />
                  {nameError ? (
                    <Text style={styles.errorText}>{nameError}</Text>
                  ) : null}

                  <Text style={styles.label}>Description du ticket</Text>
                  <TextInput
                    style={[styles.input,
                    nameError ? styles.inputError : null,
                    ]}
                    value={ticket.description}
                    onChangeText={(text) => {
                      if (isEmployee && ticket.status !== "fermé") {
                        setTicket({ ...ticket, description: text });
                        if (text.trim()) setNameError("");
                      }
                    }}
                    placeholder="Décrivez le ticket..."
                    placeholderTextColor="#A0A0A0"
                  />
                  {nameError ? (
                    <Text style={styles.errorText}>{nameError}</Text>
                  ) : null}
                </View>

                {/* Afficher le statut uniquement pour le support en mode édition */}
                {!isEmployee && typeForm === "edit" && ticket.status !== "fermé" && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Statut</Text>
                    {renderOptions(statusOptions, ticket.status, "status")}
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Priorité</Text>
                  {renderOptions(priorityOptions, ticket.priority, "priority")}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Catégorie</Text>
                  {renderOptions(categoryOPtions, ticket.category, "category")}
                </View>
              </ScrollView>

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.saveButtonText}>Enregistrer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  keyboardAvoidingContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: "60%",
    maxHeight: "90%",
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212121",
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 24,
    color: "#757575",
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#424242",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    fontSize: 16,
    color: "#212121",
  },
  inputError: {
    borderColor: "#F44336",
  },
  errorText: {
    color: "#F44336",
    marginTop: 4,
    fontSize: 12,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: "#F5F5F5",
  },
  selectedOption: {
    backgroundColor: "#E3F2FD",
    borderColor: "#2196F3",
  },
  optionText: {
    color: "#757575",
    fontSize: 14,
  },
  selectedOptionText: {
    color: "#2196F3",
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#757575",
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 10,
    borderRadius: 8,
    backgroundColor: "#2196F3",
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  detectButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  detectButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  locationText: {
    marginTop: 8,
    color: "#424242",
    fontSize: 14,
  },
});

export default AddTicketForm;