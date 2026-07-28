export type EventType = "boda" | "cumpleanos" | "baby-shower" | "graduacion" | "otro";
export type ThemeStyle = "elegant" | "romantic" | "modern" | "floral";
export type SectionKey =
  | "hero"
  | "details"
  | "countdown"
  | "gallery"
  | "message"
  | "dressCode"
  | "map"
  | "rsvp"
  | "music";

export type Invitation = {
  id: string;
  ownerId: string;
  slug: string;
  eventType: EventType;
  // Hero
  title: string;
  subtitle?: string;
  heroImage?: string;
  // Details
  hostNames?: string;
  dateTime?: string;
  place?: string;
  address?: string;
  // Map
  mapUrl?: string;
  // Message
  message?: string;
  // Gallery
  gallery: string[];
  // Dress code
  dressCode?: string;
  // Music
  musicUrl?: string;
  // Theme
  theme: ThemeStyle;
  primaryColor?: string;
  textColor?: string;
  // Sections enabled (ordered)
  sections: SectionKey[];
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
