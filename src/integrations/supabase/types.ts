export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          booking_date: string
          created_at: string
          guest_count: number | null
          id: string
          notes: string | null
          status: string
          updated_at: string
          user_id: string
          vendor_id: string
          vendor_response: string | null
        }
        Insert: {
          booking_date: string
          created_at?: string
          guest_count?: number | null
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          user_id: string
          vendor_id: string
          vendor_response?: string | null
        }
        Update: {
          booking_date?: string
          created_at?: string
          guest_count?: number | null
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          vendor_id?: string
          vendor_response?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      brochure_requests: {
        Row: {
          budget_range: string | null
          contact_method: string | null
          created_at: string
          guest_count: number | null
          id: string
          message: string | null
          status: string | null
          user_id: string
          vendor_id: string
          wedding_date: string | null
        }
        Insert: {
          budget_range?: string | null
          contact_method?: string | null
          created_at?: string
          guest_count?: number | null
          id?: string
          message?: string | null
          status?: string | null
          user_id: string
          vendor_id: string
          wedding_date?: string | null
        }
        Update: {
          budget_range?: string | null
          contact_method?: string | null
          created_at?: string
          guest_count?: number | null
          id?: string
          message?: string | null
          status?: string | null
          user_id?: string
          vendor_id?: string
          wedding_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brochure_requests_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_categories: {
        Row: {
          actual_lbp: number | null
          actual_usd: number | null
          created_at: string
          estimated_lbp: number | null
          estimated_usd: number | null
          id: string
          name: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_lbp?: number | null
          actual_usd?: number | null
          created_at?: string
          estimated_lbp?: number | null
          estimated_usd?: number | null
          id?: string
          name: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_lbp?: number | null
          actual_usd?: number | null
          created_at?: string
          estimated_lbp?: number | null
          estimated_usd?: number | null
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      checklist_items: {
        Row: {
          category: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_months_before: number | null
          id: string
          is_completed: boolean
          is_custom: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_months_before?: number | null
          id?: string
          is_completed?: boolean
          is_custom?: boolean
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_months_before?: number | null
          id?: string
          is_completed?: boolean
          is_custom?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      guests: {
        Row: {
          created_at: string
          dietary_restrictions: string | null
          email: string | null
          guest_group: Database["public"]["Enums"]["guest_group"]
          id: string
          name: string
          notes: string | null
          phone: string | null
          plus_one: boolean
          plus_one_name: string | null
          rsvp_status: Database["public"]["Enums"]["rsvp_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dietary_restrictions?: string | null
          email?: string | null
          guest_group?: Database["public"]["Enums"]["guest_group"]
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          plus_one?: boolean
          plus_one_name?: string | null
          rsvp_status?: Database["public"]["Enums"]["rsvp_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dietary_restrictions?: string | null
          email?: string | null
          guest_group?: Database["public"]["Enums"]["guest_group"]
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          plus_one?: boolean
          plus_one_name?: string | null
          rsvp_status?: Database["public"]["Enums"]["rsvp_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          estimated_budget_usd: number | null
          estimated_guests: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          partner_name: string | null
          phone: string | null
          preferred_wedding_day: string | null
          preferred_wedding_month: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
          venue_booked: boolean | null
          wedding_date: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          estimated_budget_usd?: number | null
          estimated_guests?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          partner_name?: string | null
          phone?: string | null
          preferred_wedding_day?: string | null
          preferred_wedding_month?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
          venue_booked?: boolean | null
          wedding_date?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          estimated_budget_usd?: number | null
          estimated_guests?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          partner_name?: string | null
          phone?: string | null
          preferred_wedding_day?: string | null
          preferred_wedding_month?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
          venue_booked?: boolean | null
          wedding_date?: string | null
        }
        Relationships: []
      }
      shortlist: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          user_id: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          user_id: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          user_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shortlist_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendor_views: {
        Row: {
          created_at: string
          id: string
          session_id: string | null
          user_id: string | null
          vendor_id: string
          viewed_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          session_id?: string | null
          user_id?: string | null
          vendor_id: string
          viewed_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          session_id?: string | null
          user_id?: string | null
          vendor_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_views_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          brochure_url: string | null
          business_name: string
          category: Database["public"]["Enums"]["vendor_category"]
          cover_image_url: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          instagram: string | null
          is_featured: boolean | null
          is_sample: boolean
          max_images: number | null
          phone: string | null
          portfolio_images: string[] | null
          region: Database["public"]["Enums"]["lebanese_region"]
          shortlist_count: number
          starting_price_lbp: number | null
          starting_price_usd: number | null
          status: Database["public"]["Enums"]["vendor_status"]
          subscription_plan: string | null
          subscription_valid_until: string | null
          updated_at: string
          user_id: string
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          brochure_url?: string | null
          business_name: string
          category: Database["public"]["Enums"]["vendor_category"]
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          is_featured?: boolean | null
          is_sample?: boolean
          max_images?: number | null
          phone?: string | null
          portfolio_images?: string[] | null
          region: Database["public"]["Enums"]["lebanese_region"]
          shortlist_count?: number
          starting_price_lbp?: number | null
          starting_price_usd?: number | null
          status?: Database["public"]["Enums"]["vendor_status"]
          subscription_plan?: string | null
          subscription_valid_until?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          brochure_url?: string | null
          business_name?: string
          category?: Database["public"]["Enums"]["vendor_category"]
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          is_featured?: boolean | null
          is_sample?: boolean
          max_images?: number | null
          phone?: string | null
          portfolio_images?: string[] | null
          region?: Database["public"]["Enums"]["lebanese_region"]
          shortlist_count?: number
          starting_price_lbp?: number | null
          starting_price_usd?: number | null
          status?: Database["public"]["Enums"]["vendor_status"]
          subscription_plan?: string | null
          subscription_valid_until?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      guest_group: "family" | "friends" | "coworkers" | "other"
      lebanese_region:
        | "beirut"
        | "mount_lebanon"
        | "north"
        | "south"
        | "bekaa"
        | "nabatieh"
      rsvp_status: "pending" | "confirmed" | "declined" | "maybe"
      user_role: "couple" | "vendor" | "admin"
      vendor_category:
        | "venue"
        | "photographer"
        | "dj"
        | "zaffe"
        | "bridal_dress"
        | "makeup_artist"
        | "flowers"
        | "car_rental"
        | "catering"
        | "wedding_planner"
        | "videographer"
        | "jewelry"
        | "invitations"
        | "cake"
        | "entertainment"
        | "other"
        | "sound_lighting"
      vendor_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      guest_group: ["family", "friends", "coworkers", "other"],
      lebanese_region: [
        "beirut",
        "mount_lebanon",
        "north",
        "south",
        "bekaa",
        "nabatieh",
      ],
      rsvp_status: ["pending", "confirmed", "declined", "maybe"],
      user_role: ["couple", "vendor", "admin"],
      vendor_category: [
        "venue",
        "photographer",
        "dj",
        "zaffe",
        "bridal_dress",
        "makeup_artist",
        "flowers",
        "car_rental",
        "catering",
        "wedding_planner",
        "videographer",
        "jewelry",
        "invitations",
        "cake",
        "entertainment",
        "other",
        "sound_lighting",
      ],
      vendor_status: ["pending", "approved", "rejected"],
    },
  },
} as const
