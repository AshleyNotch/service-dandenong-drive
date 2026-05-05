export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: "super_admin" | "admin" | "user";
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: "super_admin" | "admin" | "user";
          created_at?: string;
        };
        Update: {
          full_name?: string | null;
          role?: "super_admin" | "admin" | "user";
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          date: string;
          time: string;
          services: string[];
          make: string;
          model: string;
          year: string;
          odometer: string | null;
          name: string;
          phone: string;
          email: string;
          status: "pending" | "confirmed" | "cancelled";
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          time: string;
          services: string[];
          make: string;
          model: string;
          year: string;
          odometer?: string | null;
          name: string;
          phone: string;
          email: string;
          status?: "pending" | "confirmed" | "cancelled";
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          status?: "pending" | "confirmed" | "cancelled";
          notes?: string | null;
        };
        Relationships: [];
      };
      quote_requests: {
        Row: {
          id: string;
          services: string[];
          make: string;
          model: string;
          year: string;
          odometer: string | null;
          name: string;
          phone: string;
          email: string;
          notes: string | null;
          status: "pending" | "sent" | "completed";
          created_at: string;
        };
        Insert: {
          id?: string;
          services: string[];
          make: string;
          model: string;
          year: string;
          odometer?: string | null;
          name: string;
          phone: string;
          email: string;
          notes?: string | null;
          status?: "pending" | "sent" | "completed";
          created_at?: string;
        };
        Update: {
          status?: "pending" | "sent" | "completed";
        };
        Relationships: [];
      };
      blocked_slots: {
        Row: {
          id: string;
          date: string;
          time: string | null;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          time?: string | null;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          reason?: string | null;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      user_role: "super_admin" | "admin" | "user";
      booking_status: "pending" | "confirmed" | "cancelled";
      quote_status: "pending" | "sent" | "completed";
    };
    CompositeTypes: { [_ in never]: never };
  };
};

// Convenience row types
export type Role         = Database["public"]["Enums"]["user_role"];
export type BookingStatus = Database["public"]["Enums"]["booking_status"];
export type QuoteStatus  = Database["public"]["Enums"]["quote_status"];
export type Profile      = Database["public"]["Tables"]["profiles"]["Row"];
export type Booking      = Database["public"]["Tables"]["bookings"]["Row"];
export type QuoteRequest = Database["public"]["Tables"]["quote_requests"]["Row"];
export type BlockedSlot  = Database["public"]["Tables"]["blocked_slots"]["Row"];
