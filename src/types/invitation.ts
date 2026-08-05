export type EventType = "boda" | "cumpleanos" | "baby-shower" | "graduacion" | "otro";
export type ThemeStyle = "elegant" | "romantic" | "modern" | "floral";
export type TimelineItem = {
  time: string;
  title: string;
  description?: string;
};
export type BulletStyle = "dot" | "circle" | "square" | "dash";
export type SectionKey =
  | "hero"
  | "details"
  | "countdown"
  | "timeline"
  | "parents"
  | "godparents"
  | "witnesses"
  | "parish"
  | "reception"
  | "gallery"
  | "message"
  | "giftTable"
  | "dressCode"
  | "rsvp"
  | "music"
  | "tables";

export type Invitation = {
  id: string;
  ownerId: string;
  slug: string;
  eventType: EventType;
  eventTypeLabel?: string;
  // Hero
  title: string;
  subtitle?: string;
  heroImage?: string;
  // Details
  hostNames?: string;
  dateTime?: string;
  place?: string;
  address?: string;
  // Timeline
  timeline?: TimelineItem[];
  // Parents / godparents / witnesses
  parents?: string;
  brideParents?: string;
  groomParents?: string;
  parentsBulletStyle?: BulletStyle;
  godparents?: string;
  godparentsBulletStyle?: BulletStyle;
  witnesses?: string;
  witnessesBulletStyle?: BulletStyle;
  // Parish
  parishName?: string;
  parishTime?: string;
  parishMapUrl?: string;
  // Reception
  receptionName?: string;
  receptionTime?: string;
  receptionMapUrl?: string;
  // Message
  message?: string;
  // Gift table
  giftTable?: string;
  // Gallery
  gallery: string[];
  // Dress code
  dressCode?: string;
  dressCodeMen?: string;
  dressCodeWomen?: string;
  // Music
  musicUrl?: string;
  // Tables
  tableAssignments?: Array<{ dni: string; name: string; tableNumber: string }>;
  tablePdfUrl?: string;
  // Custom sections
  customSections?: Array<{ id: string; title: string; content: string }>;
  // Comments settings
  commentsEnabled?: boolean;
  commentsAllowPhotos?: boolean;
  // Full combined section order (builtin keys + custom IDs)
  fullOrder?: string[];
  // Theme
  theme: ThemeStyle;
  primaryColor?: string;
  textColor?: string;
  fontFamily?: string;
  fontSize?: string;
  // Sections enabled
  sections: SectionKey[];
  // Full section order, including disabled sections
  sectionOrder?: SectionKey[];
  createdAt: string;
  updatedAt: string;
};

export type AppUser = {
  id: string;
  name: string;
  email: string;
  googleId: string;
  createdAt: string;
};

export type RSVP = {
  id: string;
  invitationId: string;
  name: string;
  attendees: number;
  message: string;
  createdAt: string;
};

export type InvitationComment = {
  id: string;
  invitationId: string;
  userId?: string;
  userName: string;
  avatarUrl?: string;
  text: string;
  imageUrl?: string;
  createdAt: string;
};
