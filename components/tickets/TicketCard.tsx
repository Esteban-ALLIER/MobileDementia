import { useAuth } from "@/context/ctx";
import { TicketFirst } from "@/types/ticket";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from "react-native";



interface TicketListProps {
  tickets: TicketFirst[];
  onTicketPress?: (ticket: TicketFirst) => void;
  onAddTicket?: () => void;
  onTicketRefresh?: () => void;
}

// Helper function to get color based on priority
const getPriorityColor = (priority: string): string => {
  switch (priority.toLowerCase()) {
    case "critique":
      return "#880808";
    case "élevé":
      return "#FF5252";
    case "moyen":
      return "#FFD740";
    case "bas":
      return "#4CAF50";
      
    default:
      return "#9E9E9E";
  }
};

// Helper function to get color based on status
const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    
    case "nouveau":
      return "#2196F3";
    case "assigné":
      return "#FFEB3B";
    case "en cours":
      return "#FF9800";
    case "fermé":
      return "#dfe8e9";
    default:
      return "#9E9E9E";
  }
};

const TicketList: React.FC<TicketListProps> = ({
  tickets,
  onTicketPress,
  onAddTicket,
  onTicketRefresh,
}) => {
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [paginatedTickets, setPaginatedTickets] = useState<TicketFirst[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const itemsPerPage = 4;
  const {user, role}= useAuth()
  useEffect(() => {
    paginateData();
  }, [tickets, currentPage]);

  const paginateData = () => {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    setPaginatedTickets(tickets.slice(start, end));
    setTotalPages(Math.ceil(tickets.length / itemsPerPage));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const renderPaginationButtons = () => {
    const maxButtonsToShow = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxButtonsToShow / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxButtonsToShow - 1);
  
    if (endPage - startPage + 1 < maxButtonsToShow) {
      startPage = Math.max(0, endPage - maxButtonsToShow + 1);
    }
  
    const buttons = [];
  
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <TouchableOpacity
          key={i}
          onPress={() => handlePageClick(i)}
          style={[
            styles.paginationButton,
            i === currentPage && styles.activeButton,
          ]}
        >
          <Text style={styles.buttonText}>{i + 1}</Text>
        </TouchableOpacity>
      );
    }
    return <View style={styles.paginationContainer}>{buttons}</View>;

  }

  const handleRefresh = () => {
    setRefreshing(true);
    onTicketRefresh?.();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };
  
  const renderTicketItem = ({ item }: { item: TicketFirst }) => {
    return (
      <TouchableOpacity
        style={styles.ticketItem}
        onPress={() => onTicketPress && onTicketPress(item)}
      >
        <View style={styles.ticketContent}>
          <Text style={styles.ticketName}>{item.title}</Text>

          <View style={styles.ticketDetails}>
            <View style={styles.infoContainer}>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: getStatusColor(item.status) },
                ]}
              />
              <Text style={styles.statusText}>{item.status}</Text>
            </View>

            <View style={styles.infoContainer}>
              <View
                style={[
                  styles.priorityDot,
                  { backgroundColor: getPriorityColor(item.priority) },
                ]}
              />
              <Text style={styles.priorityText}>{item.priority}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
     
    <View style={styles.flatListView}>
      <FlatList
        data={paginatedTickets}
        renderItem={renderTicketItem}
        keyExtractor={(item, index) => `ticket-${index}`}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
      {renderPaginationButtons()}
  </View>
      {role === "Membre" && 
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={onAddTicket}
        activeOpacity={0.8}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>
}
    </View>
  );
  }
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    position: "relative",
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212121",
  },
  listContent: {
    padding: 16,
  },
  ticketItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ticketContent: {
    flex: 1,
  },
  ticketName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 12,
  },
  ticketDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: "#616161",
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 14,
    color: "#616161",
  },
  floatingButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    zIndex: 999,
  },
  floatingButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
   flatListView: {
    flex: 1, 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  paginationButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: 'gray',
  },
  activeButton: {
    backgroundColor: '#330e8a',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
  },
});

export default TicketList;