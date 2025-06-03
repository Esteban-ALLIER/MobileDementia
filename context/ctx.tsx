import { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/config/firebase";
import { doc, getDoc } from 'firebase/firestore';
interface AuthContextType {
user: User | null;
loading: boolean;
role: string | null;
}
const AuthContext = createContext<AuthContextType>({
user: null,
loading: true,
role:null
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState(true);
const [role, setRole] = useState<string | null>(null);

useEffect(() => {

const unsubscribe = onAuthStateChanged(auth, async (user) => {
setUser(user);
setLoading(false);
if (user) {
    try {
      const docRef = doc(db, "Users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRole(data.role || null);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des infos utilisateur :", error);
    }
  } else {
    setRole(null);
  }
});
return () => unsubscribe();
}, []);
return (
<AuthContext.Provider value={{ user, loading,role }}>
{children}
</AuthContext.Provider>
);
}

export function useAuth() {
return useContext(AuthContext);
}