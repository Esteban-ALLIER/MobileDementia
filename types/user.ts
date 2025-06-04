import { Timestamp } from "firebase/firestore";

 export interface User {
    userId:string,
    email: string;
    PseudoInGame: string;
    Core: string;
    Regear: string;
    role: 'Membre' | 'Reviewer' | 'Admin'
  }