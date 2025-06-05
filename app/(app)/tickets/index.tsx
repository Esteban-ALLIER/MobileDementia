import AddTicketForm from "@/components/tickets/TicketForm";
import TicketList from "@/components/tickets/TicketCard";
import { createTicket, getAllTickets } from "@/services/ticket.service";
import { useEffect, useState } from "react";
import { Redirect, useRouter } from "expo-router";
import { 
  SafeAreaView, 
  StyleSheet, 
  TextInput, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  Animated,
  Dimensions
} from "react-native";
import React from "react";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { TicketFirst } from "@/types/ticket";
import { useAuth } from "@/context/ctx";

const { width } = Dimensions.get('window');

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
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Animation values
  const searchBarAnimation = new Animated.Value(0);
  const filterAnimation = new Animated.Value(0);

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

  // Animation effects
  useEffect(() => {
    Animated.timing(searchBarAnimation, {
      toValue: isSearchFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isSearchFocused]);

  useEffect(() => {
    Animated.timing(filterAnimation, {
      toValue: isPrioritySorted || isStatusSorted ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isPrioritySorted, isStatusSorted]);

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
    setIsModalVisible(false);
    getTickets();
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
      setYourTicketsData(initialTicketsData);
    }
    setIsPrioritySorted(!isPrioritySorted);
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
      setYourTicketsData(initialTicketsData);
    }
    setIsStatusSorted(!isStatusSorted);
    setIsPrioritySorted(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query === "") {
      setFilteredTickets(yourTicketsData);
    } else {
      const filtered = yourTicketsData.filter(ticket =>
        ticket.title.toLowerCase().includes(query.toLowerCase()) ||
        ticket.description.toLowerCase().includes(query.toLowerCase()) ||
        ticket.category.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredTickets(filtered);
    }
  };

  const clearFilters = () => {
    setYourTicketsData(initialTicketsData);
    setIsPrioritySorted(false);
    setIsStatusSorted(false);
    setSearchQuery("");
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (isPrioritySorted) count++;
    if (isStatusSorted) count++;
    if (searchQuery.length > 0) count++;
    return count;
  };

  const searchBarBorderColor = searchBarAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e2e8f0', '#2196F3']
  });

  const searchBarShadow = searchBarAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 8]
  });

  const filterBackgroundColor = filterAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', '#f0f9ff']
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Fixed Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Tickets</Text>
            <View style={styles.headerStats}>
              <View style={styles.statBadge}>
                <Text style={styles.statNumber}>{filteredTickets.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              {getActiveFiltersCount() > 0 && (
                <View style={styles.filterBadge}>
                  <Ionicons name="filter" size={12} color="#2196F3" />
                  <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Fixed Search Bar */}
        <View style={styles.searchContainer}>
          <Animated.View style={[
            styles.searchBarContainer,
            {
              borderColor: searchBarBorderColor,
              shadowRadius: searchBarShadow,
              shadowOpacity: isSearchFocused ? 0.1 : 0,
            }
          ]}>
            <Ionicons 
              name="search-outline" 
              size={20} 
              color={isSearchFocused ? "#2196F3" : "#64748b"} 
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Rechercher par titre, description ou catégorie..."
              value={searchQuery}
              onChangeText={handleSearch}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              style={styles.searchInput}
              placeholderTextColor="#94a3b8"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => handleSearch("")}
                style={styles.clearButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={20} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>

        {/* Fixed Filters */}
        <Animated.View style={[
          styles.filtersContainer,
          { backgroundColor: filterBackgroundColor }
        ]}>
          <View style={styles.filtersContent}>
            <Text style={styles.filtersTitle}>Filtres</Text>
            <View style={styles.filterButtons}>
              <TouchableOpacity
                onPress={sortByStatus}
                style={[
                  styles.filterButton,
                  isStatusSorted && styles.filterButtonActive
                ]}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={isStatusSorted ? "checkmark-circle" : "filter-outline"} 
                  size={16} 
                  color={isStatusSorted ? "#2196F3" : "#64748b"}
                />
                <Text style={[
                  styles.filterButtonText,
                  isStatusSorted && styles.filterButtonTextActive
                ]}>
                  Statut
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={sortByPriority}
                style={[
                  styles.filterButton,
                  isPrioritySorted && styles.filterButtonActive
                ]}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={isPrioritySorted ? "checkmark-circle" : "filter-outline"} 
                  size={16} 
                  color={isPrioritySorted ? "#2196F3" : "#64748b"}
                />
                <Text style={[
                  styles.filterButtonText,
                  isPrioritySorted && styles.filterButtonTextActive
                ]}>
                  Priorité
                </Text>
              </TouchableOpacity>

              {getActiveFiltersCount() > 0 && (
                <TouchableOpacity
                  onPress={clearFilters}
                  style={styles.clearFiltersButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="refresh-outline" size={16} color="#ef4444" />
                  <Text style={styles.clearFiltersText}>Effacer</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Fixed Results Info */}
        {searchQuery.length > 0 && (
          <View style={styles.resultsInfo}>
            <Text style={styles.resultsText}>
              {filteredTickets.length} résultat{filteredTickets.length !== 1 ? 's' : ''} 
              pour "{searchQuery}"
            </Text>
          </View>
        )}

        {/* Ticket List - Now takes remaining space */}
        <TicketList
          tickets={filteredTickets}
          onTicketRefresh={getTickets}
          onTicketPress={handleTicketPress}
          onAddTicket={handleAddTicketList}
        />
      </View>

      {/* Add Ticket Modal */}
      <AddTicketForm
        visible={isModalVisible}
        onClose={onModalClose}
        onSave={handleAddTicket}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 60,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    lineHeight: 18,
  },
  statLabel: {
    fontSize: 11,
    color: '#1976d2',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterBadge: {
    backgroundColor: '#dbeafe',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0,
    elevation: 0,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: 8,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  filtersContent: {
    gap: 12,
  },
  filtersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterButtonActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  filterButtonTextActive: {
    color: '#2196F3',
    fontWeight: '600',
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ef4444',
  },
  resultsInfo: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#f0f9ff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  resultsText: {
    fontSize: 14,
    color: '#0369a1',
    fontStyle: 'italic',
  },
});

export default Tickets;