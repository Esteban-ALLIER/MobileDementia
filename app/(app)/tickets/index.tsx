import AddTicketForm from "@/components/tickets/TicketForm";
import TicketList from "@/components/tickets/TicketCard";
import { createTicket, getAllTickets } from "@/services/ticket.service";
import { useEffect, useState } from "react";
import { Redirect, useRouter } from "expo-router";
import { Button, Platform, SafeAreaView, StyleSheet, TextInput, View, Text, TouchableOpacity } from "react-native";
import React from "react";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { TicketFirst } from "@/types/ticket";
import { useAuth } from "@/context/ctx";
import { DocumentReference } from "firebase/firestore";

const Tickets = () => {
  const router = useRouter();
  const ticketsData: TicketFirst[] = [];
  const [yourTicketsData, setYourTicketsData] = useState<TicketFirst[]>(ticketsData);
  const [initialTicketsData, setInitialTicketsData] = useState<TicketFirst[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTickets, setFilteredTickets] = useState<TicketFirst[]>(yourTicketsData);
  const [isPrioritySorted, setIsPrioritySorted] = useState(false);
  const [isStatusSorted, setIsStatusSorted] = useState(false);

  const { user, loading, role } = useAuth();

  if (!user) return <Redirect href="/login" />;
  const priorityMap = new Map<string, number>([
    ["critique", 1],
    ["élevé", 2],
    ["moyen", 3],
    ["bas", 4],
  ]);
  const statusMap = new Map<string, number>([
    ["nouveau", 1],
    ["en cours", 3],
    ["fermé", 4],
  ]);
  const getTickets = async () => {
    const tickets = await getAllTickets();
    let filtered = tickets;

    if (role === "Membre") {
      filtered = tickets.filter(ticket => {
        const createdById = ticket.createdBy?.id;
        return createdById === user?.uid;
      });
    }
    setYourTicketsData(filtered);
    setInitialTicketsData(filtered);
  };

  useEffect(() => {
    getTickets();
  }, []);

  useEffect(() => {
    handleSearch(searchQuery);
  }, [yourTicketsData]);

  const handleTicketPress = async (ticket: TicketFirst) => {
    router.push(`/tickets/${ticket.id?.toString()}`);
  };

  const handleAddTicketList = () => {
    setIsModalVisible(true);
  };

  const handleAddTicket = async (ticket: TicketFirst) => {
    await createTicket({
      title: ticket.title,
      description: ticket.description,
      status: "nouveau",
      priority: ticket.priority,
      category: ticket.category,
      createdBy: user?.uid,
      location: ticket.location
    });
    setIsModalVisible(false)
  };

  const onModalClose = () => {
    setIsModalVisible(false);
  };
  const sortByPriority = () => {
    if (!isPrioritySorted) {
      const sorted = [...yourTicketsData].sort((a, b) => {
        const aValue = priorityMap.get(a.priority.toLowerCase()) ?? 999;
        const bValue = priorityMap.get(b.priority.toLowerCase()) ?? 999;
        return aValue - bValue;
      });
      setYourTicketsData(sorted);
    } else {
      setYourTicketsData(initialTicketsData)
    }
    setIsPrioritySorted(!isPrioritySorted)
    setIsStatusSorted(false);
  };

  const sortByStatus = () => {
    if (!isStatusSorted) {
      const sorted = [...yourTicketsData].sort((a, b) => {
        const aValue = statusMap.get(a.status.toLowerCase()) ?? 999;
        const bValue = statusMap.get(b.status.toLowerCase()) ?? 999;
        return aValue - bValue;
      });
      setYourTicketsData(sorted);
    } else {
      setYourTicketsData(initialTicketsData)
    }
    setIsStatusSorted(!isStatusSorted)
    setIsPrioritySorted(false)

  }

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query === "") {
      setFilteredTickets(yourTicketsData);
    } else {
      const filtered = yourTicketsData.filter(ticket =>
        ticket.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredTickets(filtered);
    }
  };

  return (

    <>
      <TextInput
        placeholder="Rechercher un ticket"
        value={searchQuery}
        onChangeText={handleSearch}
        style={styles.SearchBar}
      />
      <View style={styles.filterBtn}>


        <TouchableOpacity
          onPress={sortByStatus}
          style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
        >
          <Ionicons name="filter-outline" size={16} />
          <Text>Statut</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={sortByPriority}
          style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
        >
          <Ionicons name="filter-outline" size={16} />
          <Text>Priorité</Text>
        </TouchableOpacity>
      </View>
      <TicketList
        tickets={filteredTickets}
        onTicketRefresh={getTickets}
        onTicketPress={handleTicketPress}
        onAddTicket={handleAddTicketList} />


      <View style={{ flexDirection: "row", justifyContent: "space-evenly", marginVertical: 10 }}>

      </View>
      <AddTicketForm
        visible={isModalVisible}
        onClose={onModalClose}
        onSave={handleAddTicket} /></>

  );
};

const styles = StyleSheet.create({
  filterBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
    marginHorizontal: 10
  },
  SearchBar: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
    marginHorizontal: 10,
  }
})


export default Tickets;