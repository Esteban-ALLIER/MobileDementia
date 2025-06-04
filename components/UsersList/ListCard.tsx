import { useAuth } from "@/context/ctx";
import { User } from "@/types/user";
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

interface UserListProps {
  user: User[];
  onUserPress?: (user: User) => void;
  onUserRefresh?: () => void;
}
// Helper function to get color based on role
const getRoleColor = (Role: string): string => {
  switch (Role.toLowerCase()) {
    case "Reviewer":
      return "#ff7800";
    case "Membre":
      return "#4CAF50";
    case "Admin":
      return "#FF5252";
    default:
      return "#9E9E9E";
  }
};
export const UserList: React.FC<UserListProps> = ({
  user,
  onUserPress,
  onUserRefresh,
}) => {
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [paginatedUsers, setPaginatedUsers] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const itemsPerPage = 3;
  const { user: userAuth, role } = useAuth()
  useEffect(() => {
    paginateData();
  }, [user, currentPage]);

  const paginateData = () => {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    setPaginatedUsers(user.slice(start, end));
    setTotalPages(Math.ceil(user.length / itemsPerPage));
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
    } const buttons = [];

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
    onUserRefresh?.();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const renderUserItem = ({ item }: { item: User }) => {
    return (
      <TouchableOpacity style={styles.userItem}
        onPress={() => onUserPress && onUserPress(item)}
      >
        <View style={styles.userContent}>
          <Text style={styles.userName}>{item.PseudoInGame}</Text>

          <View style={styles.userDetails}>
            <View style={styles.infoContainer}>
              <View
                style={[
                  styles.roleIndicator,
                  { backgroundColor: getRoleColor(item.role) },
                ]}
              />
              <Text style={styles.roleText}>{item.role}</Text>
            </View>

            {/* <View style={styles.infoContainer}>
              <View
                style={[
                  styles.priorityDot,
                  { backgroundColor: getPriorityColor(item.priority) },
                ]}
              />
              <Text style={styles.priorityText}>{item.priority}</Text>
            </View> */}
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
          data={paginatedUsers}
          renderItem={renderUserItem}
          keyExtractor={(item, index) => `user-${index}`}
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
  userItem: {
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
  userContent: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 12,
  },
  userDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  roleIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  roleText: {
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