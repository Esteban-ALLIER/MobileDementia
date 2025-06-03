import { Timestamp } from "firebase/firestore";

 export interface User {
    userId:string,
    email: string;
    PseudoInGame: string;
    role: 'Membre' | 'Reviewer' | 'Admin'
  }