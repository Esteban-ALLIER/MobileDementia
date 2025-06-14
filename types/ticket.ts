import { DocumentReference, Timestamp } from "firebase/firestore";

export interface TicketTrue {
    id?: string;
    title: string;
    description: string;
    status: 'nouveau' | 'en cours' | 'fermé';
    priority: 'bas' | 'moyen' | 'élevé' | 'critique';
    category: 'DPS' | 'Heal' | 'Tank' | 'Support' | 'BM';
    createdBy: DocumentReference;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    dueDate?: Timestamp;
    location?: string;
    deviceInfo?: {
        model?: string;
        os?: string;
        version?: string;
    };
}

export interface TicketFirst {
    id?: string,
    title: string;
    description: string;
    status: 'nouveau' | 'en cours' | 'fermé';
    priority: 'bas' | 'moyen' | 'élevé' | 'critique';
    category: 'DPS' | 'Heal' | 'Tank' | 'Support' | 'BM';
    createdBy?: string | DocumentReference;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
    dueDate?: Timestamp;
    location?: string;
    deviceInfo?: {
        model?: string;
        os?: string;
        version?: string;
    };
}
