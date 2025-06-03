import { db } from "@/config/firebase";
import { TicketFirst, TicketTrue } from "@/types/Ticket";
import { dateOnly } from "@/utils/dateFormatter";
import { collection, getDocs, addDoc, updateDoc, doc, getDoc, deleteDoc, Timestamp, onSnapshot, DocumentReference } from "firebase/firestore";


const getAllTickets = async (): Promise<TicketTrue[]> => {
  //je ne le mets pas en abonnement en temps réel pour laisser l'utilité du pullToRefresh
  const ticketsCollection = collection(db, "Tickets");
  const snapshot = await getDocs(ticketsCollection);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as TicketTrue),
  }));
};



const getDetailTicket = async (idTicket: string) => {
  try {
    if (!idTicket || typeof idTicket !== "string") {
      throw new Error("ID du ticket invalide.");
    }
    const ticketRef = doc(db, "Tickets", idTicket);
    const docSnap = await getDoc(ticketRef);
    if (!docSnap.exists()) {
      console.log(`Aucun ticket trouvé pour l'ID : ${idTicket}`);
      return null;
    }
    return docSnap.data();
  } catch (error) {
    console.log("Erreur lors de la récupération du ticket :", error);
    return null;
  }
};

//Création de tickets
const createTicket = async (ticket: TicketFirst): Promise<TicketTrue | null> => {
  try {
    const ticketsCollection = collection(db, "Tickets");
    if (!ticket.createdBy || typeof ticket.createdBy !== 'string') {
      throw new Error("une erreur sur l'utilisateur");
    }
    const userRef = doc(db, "Users", ticket.createdBy);
    const ticketData: TicketFirst = {
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      createdBy: userRef,
      createdAt: Timestamp.fromDate(dateOnly),
      updatedAt: Timestamp.fromDate(dateOnly),
    };
    if (ticket.location) {
      ticketData.location = ticket.location;
    }
    if (ticket.dueDate) {
      ticketData.dueDate = ticket.dueDate;
    }
    await addDoc(ticketsCollection, ticketData);
    return {
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      createdBy: userRef,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
    };
  }
  catch (error) {
    console.error("Error creating ticket:", error);
    return null;
  }
};

const deleteTicket = async (idTicket: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, "Tickets", idTicket));
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    return false;
  }
};

const updateTicket = async (
  idTicket: string,
  updatedData: TicketFirst
): Promise<void> => {
  if (!idTicket) throw new Error("ID du ticket manquant");

  const ticketRef = doc(db, "Tickets", idTicket);
  const now = new Date();
  const dateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const updatePayload: any = {
    title: updatedData.title,
    description: updatedData.description,
    status: updatedData.status,
    priority: updatedData.priority,
    category: updatedData.category,
    updatedAt: Timestamp.fromDate(dateOnly),
  };

  if (updatedData.assignedTo) {
    updatePayload.assignedTo =
      typeof updatedData.assignedTo === "string"
        ? doc(db, "Users", updatedData.assignedTo)
        : updatedData.assignedTo;
  }

  if (updatedData.dueDate) {
    updatePayload.dueDate = updatedData.dueDate;
  }

  await updateDoc(ticketRef, updatePayload);
};

const assignSupportToTicket = async (ticketId: string, supportUserId: string) => {
  try {
    const ticketRef = doc(db, "Tickets", ticketId);
    const supportRef = doc(db, "Users", supportUserId);

    await updateDoc(ticketRef, {
      assignedTo: supportRef,
      status: "assigné",
    });

    const ticketSnap = await getDoc(ticketRef);
    if (ticketSnap.exists()) {
      const ticketData = ticketSnap.data();
      const title = ticketData.title || ticketId;
    }
  } catch (error) {
    console.error("Erreur lors de l’assignation du ticket :", error);
  }
};


const closedTicket = async (
  idTicket: string,
): Promise<void> => {
  if (!idTicket) throw new Error("ID du ticket manquant");

  const ticketRef = doc(db, "Tickets", idTicket);
  const now = new Date();
  const dateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const updatePayload: any = {
    status: "fermé",
    updatedAt: Timestamp.fromDate(dateOnly),
  };

  await updateDoc(ticketRef, updatePayload);
  const ticketSnap = await getDoc(ticketRef);
  if (ticketSnap.exists()) {
    const ticketData = ticketSnap.data();
    const title = ticketData.title;}
};




export { getAllTickets, createTicket, getDetailTicket, deleteTicket, updateTicket, assignSupportToTicket, closedTicket };