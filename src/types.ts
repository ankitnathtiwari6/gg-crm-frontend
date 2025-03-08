export interface Message {
  messageId: string;
  content: string;
  role: "lead" | "assistant";
  timestamp: Date;
  status?: "sent" | "delivered" | "read" | "failed";
}

export interface Lead {
  id: string;
  leadPhoneNumber: string;
  businessPhoneNumber: string;
  businessPhoneId: string;
  name?: string;
  email?: string;
  preferredCountry?: string;
  city?: string;
  state?: string;
  neetScore?: number;
  numberOfEnquiry: number;
  numberOfChatsMessages: number;
  firstInteraction: Date;
  lastInteraction: Date;
  messageCount: number;
  status: "active" | "inactive" | "archived";
  tags?: string[];
  source?: string;
  notes?: string;
  chatHistory?: Message[];
  createdAt?: Date;
  updatedAt?: Date;

  // For backward compatibility with existing components
  qualifiedLead?: boolean; // Derived from neetScore
  location?: string; // Derived from city and state
  countryInterest?: string; // Alias for preferredCountry
  stage?: string; // Derived from status
  neetStatus?: string; // Derived from neetScore
}

export interface LeadsTableProps {
  leads: Lead[];
  lastLeadElementRef?:
    | React.RefObject<HTMLTableRowElement>
    | ((node: HTMLTableRowElement | null) => void)
    | null;
  onUpdateLead?: (updatedLead: Lead) => void;
}
// types.ts
export type SortOption = "latest" | "longest" | "relevant" | "oldest";

export type WhatsAppNumber = {
  id: string;
  number: string;
  name: string;
  lastMessage: string;
  lastActive: Date;
  messageCount: number;
  relevanceScore: number;
  unreadCount: number;
  profilePic: string;
};

export type MessageRecord = Record<string, Message[]>;
