export interface Remark {
  _id?: string;
  text: string;
  author: { id: string; name: string };
  createdAt: Date | string;
}

export interface ActivityLog {
  _id?: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  author?: { id: string; name: string };
  createdAt: Date | string;
}

export interface Message {
  messageId: string;
  content: string;
  role: "lead" | "assistant";
  timestamp: Date;
  status?: "sent" | "delivered" | "read" | "failed";
  sessionId?: string;
}

export interface LeadSession {
  sessionId: string;
  startedAt: Date;
  messageCount: number;
  status: "active" | "complete" | "expired" | "no_reply";
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  token: string;
  companyId?: string | null;
  role?: "admin" | "member";
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
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
  neetScore?: number | null;
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
  assignedTo: { id: string; name: string } | null;
  createdAt?: Date;
  updatedAt?: Date;

  sessions?: LeadSession[];
  leadQualityScore?: number | null;
  leadQualityScoreReason?: string | null;
  leadQualityScoreUpdatedAt?: Date | null;
  qualifiedLead?: boolean;
  location?: string;
  countryInterest?: string;
  stage?: string;
  stageUpdatedBy?: "ai" | "user";
  neetStatus?: string;
  qualification?: string;
  neetYear?: number | null;
  targetYear?: number | null;
  budget?: string;
  remarks?: Remark[];
  activityLog?: ActivityLog[];
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
