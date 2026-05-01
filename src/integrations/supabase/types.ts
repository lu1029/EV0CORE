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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          description: string | null
          icon: string | null
          id: string
          name: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      club_members: {
        Row: {
          club_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          club_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          club_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_members_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      club_posts: {
        Row: {
          activity_data: Json | null
          club_id: string
          content: string
          created_at: string
          id: string
          photo_url: string | null
          user_id: string
        }
        Insert: {
          activity_data?: Json | null
          club_id: string
          content?: string
          created_at?: string
          id?: string
          photo_url?: string | null
          user_id: string
        }
        Update: {
          activity_data?: Json | null
          club_id?: string
          content?: string
          created_at?: string
          id?: string
          photo_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_posts_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          category: string
          cover_url: string | null
          created_at: string
          description: string | null
          font: string | null
          id: string
          is_private: boolean
          members_count: number
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          category?: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          font?: string | null
          id?: string
          is_private?: boolean
          members_count?: number
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          category?: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          font?: string | null
          id?: string
          is_private?: boolean
          members_count?: number
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_checkins: {
        Row: {
          checkin_date: string
          created_at: string
          hit_calorie_goal: boolean
          id: string
          logged_meal: boolean
          manual_checkin: boolean
          ran: boolean
          updated_at: string
          user_id: string
          worked_out: boolean
        }
        Insert: {
          checkin_date?: string
          created_at?: string
          hit_calorie_goal?: boolean
          id?: string
          logged_meal?: boolean
          manual_checkin?: boolean
          ran?: boolean
          updated_at?: string
          user_id: string
          worked_out?: boolean
        }
        Update: {
          checkin_date?: string
          created_at?: string
          hit_calorie_goal?: boolean
          id?: string
          logged_meal?: boolean
          manual_checkin?: boolean
          ran?: boolean
          updated_at?: string
          user_id?: string
          worked_out?: boolean
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          is_read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      exercise_image_cache: {
        Row: {
          created_at: string
          id: string
          image_url: string
          name_key: string
          source: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          name_key: string
          source?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          name_key?: string
          source?: string
        }
        Relationships: []
      }
      exercise_library: {
        Row: {
          ai_image_url: string | null
          body_part: string | null
          created_at: string
          equipment: string | null
          external_id: string
          gif_url: string | null
          id: string
          instructions: Json | null
          name: string
          secondary_muscles: Json | null
          target: string | null
          updated_at: string
        }
        Insert: {
          ai_image_url?: string | null
          body_part?: string | null
          created_at?: string
          equipment?: string | null
          external_id: string
          gif_url?: string | null
          id?: string
          instructions?: Json | null
          name: string
          secondary_muscles?: Json | null
          target?: string | null
          updated_at?: string
        }
        Update: {
          ai_image_url?: string | null
          body_part?: string | null
          created_at?: string
          equipment?: string | null
          external_id?: string
          gif_url?: string | null
          id?: string
          instructions?: Json | null
          name?: string
          secondary_muscles?: Json | null
          target?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          body_part: string | null
          created_at: string
          equipment: string | null
          gif_url: string | null
          id: string
          instructions: Json | null
          name: string
          secondary_muscles: Json | null
          target: string | null
        }
        Insert: {
          body_part?: string | null
          created_at?: string
          equipment?: string | null
          gif_url?: string | null
          id: string
          instructions?: Json | null
          name: string
          secondary_muscles?: Json | null
          target?: string | null
        }
        Update: {
          body_part?: string | null
          created_at?: string
          equipment?: string | null
          gif_url?: string | null
          id?: string
          instructions?: Json | null
          name?: string
          secondary_muscles?: Json | null
          target?: string | null
        }
        Relationships: []
      }
      feed_posts: {
        Row: {
          activity_data: Json | null
          caption: string | null
          comments_count: number
          created_at: string
          id: string
          likes_count: number
          photo_url: string | null
          post_type: string
          submission_token: string | null
          updated_at: string
          user_id: string
          visibility: Database["public"]["Enums"]["post_visibility"]
        }
        Insert: {
          activity_data?: Json | null
          caption?: string | null
          comments_count?: number
          created_at?: string
          id?: string
          likes_count?: number
          photo_url?: string | null
          post_type: string
          submission_token?: string | null
          updated_at?: string
          user_id: string
          visibility?: Database["public"]["Enums"]["post_visibility"]
        }
        Update: {
          activity_data?: Json | null
          caption?: string | null
          comments_count?: number
          created_at?: string
          id?: string
          likes_count?: number
          photo_url?: string | null
          post_type?: string
          submission_token?: string | null
          updated_at?: string
          user_id?: string
          visibility?: Database["public"]["Enums"]["post_visibility"]
        }
        Relationships: []
      }
      food_analyses: {
        Row: {
          confidence: string | null
          created_at: string
          detected_items: Json
          id: string
          input_text: string | null
          photo_url: string | null
          source: string
          total_calories: number
          total_carbs_g: number
          total_fat_g: number
          total_protein_g: number
          user_id: string
        }
        Insert: {
          confidence?: string | null
          created_at?: string
          detected_items?: Json
          id?: string
          input_text?: string | null
          photo_url?: string | null
          source: string
          total_calories?: number
          total_carbs_g?: number
          total_fat_g?: number
          total_protein_g?: number
          user_id: string
        }
        Update: {
          confidence?: string | null
          created_at?: string
          detected_items?: Json
          id?: string
          input_text?: string | null
          photo_url?: string | null
          source?: string
          total_calories?: number
          total_carbs_g?: number
          total_fat_g?: number
          total_protein_g?: number
          user_id?: string
        }
        Relationships: []
      }
      generated_plans: {
        Row: {
          created_at: string
          description: string
          id: string
          plan_data: Json
          plan_name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          plan_data?: Json
          plan_name?: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          plan_data?: Json
          plan_name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      meals: {
        Row: {
          calories: number
          carbs_g: number
          created_at: string
          fat_g: number
          id: string
          logged_at: string
          meal_type: string
          name: string
          protein_g: number
          user_id: string
        }
        Insert: {
          calories?: number
          carbs_g?: number
          created_at?: string
          fat_g?: number
          id?: string
          logged_at?: string
          meal_type?: string
          name: string
          protein_g?: number
          user_id: string
        }
        Update: {
          calories?: number
          carbs_g?: number
          created_at?: string
          fat_g?: number
          id?: string
          logged_at?: string
          meal_type?: string
          name?: string
          protein_g?: number
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          completed: boolean | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      pix_charges: {
        Row: {
          abacate_id: string | null
          amount: number
          created_at: string
          expires_at: string | null
          external_id: string
          id: string
          paid_at: string | null
          price_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          abacate_id?: string | null
          amount: number
          created_at?: string
          expires_at?: string | null
          external_id: string
          id?: string
          paid_at?: string | null
          price_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          abacate_id?: string | null
          amount?: number
          created_at?: string
          expires_at?: string | null
          external_id?: string
          id?: string
          paid_at?: string | null
          price_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_saves: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_saves_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number
          ai_messages_reset_date: string
          ai_messages_today: number
          avatar_url: string | null
          created_at: string
          days_per_week: number
          email: string
          gender: string
          goal: string
          height: number
          id: string
          is_premium: boolean
          level: string
          name: string
          preference: string
          updated_at: string
          user_id: string
          weight: number
        }
        Insert: {
          age?: number
          ai_messages_reset_date?: string
          ai_messages_today?: number
          avatar_url?: string | null
          created_at?: string
          days_per_week?: number
          email?: string
          gender?: string
          goal?: string
          height?: number
          id?: string
          is_premium?: boolean
          level?: string
          name?: string
          preference?: string
          updated_at?: string
          user_id: string
          weight?: number
        }
        Update: {
          age?: number
          ai_messages_reset_date?: string
          ai_messages_today?: number
          avatar_url?: string | null
          created_at?: string
          days_per_week?: number
          email?: string
          gender?: string
          goal?: string
          height?: number
          id?: string
          is_premium?: boolean
          level?: string
          name?: string
          preference?: string
          updated_at?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      progress_logs: {
        Row: {
          body_measurements: Json | null
          created_at: string
          id: string
          logged_at: string
          notes: string | null
          photo_url: string | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          body_measurements?: Json | null
          created_at?: string
          id?: string
          logged_at?: string
          notes?: string | null
          photo_url?: string | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          body_measurements?: Json | null
          created_at?: string
          id?: string
          logged_at?: string
          notes?: string | null
          photo_url?: string | null
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          count: number
          key: string
          window_start: string
        }
        Insert: {
          count?: number
          key: string
          window_start: string
        }
        Update: {
          count?: number
          key?: string
          window_start?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string | null
          enabled: boolean | null
          id: string
          time: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          time: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          time?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      runs: {
        Row: {
          activity_type: string
          avg_speed_kmh: number | null
          calories_burned: number | null
          created_at: string
          distance_km: number
          duration_seconds: number
          id: string
          notes: string | null
          pace_min_km: number | null
          photo_url: string | null
          route_data: Json | null
          started_at: string
          user_id: string
        }
        Insert: {
          activity_type?: string
          avg_speed_kmh?: number | null
          calories_burned?: number | null
          created_at?: string
          distance_km?: number
          duration_seconds?: number
          id?: string
          notes?: string | null
          pace_min_km?: number | null
          photo_url?: string | null
          route_data?: Json | null
          started_at?: string
          user_id: string
        }
        Update: {
          activity_type?: string
          avg_speed_kmh?: number | null
          calories_burned?: number | null
          created_at?: string
          distance_km?: number
          duration_seconds?: number
          id?: string
          notes?: string | null
          pace_min_km?: number | null
          photo_url?: string | null
          route_data?: Json | null
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      security_audit_logs: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      user_set_logs: {
        Row: {
          completed: boolean
          created_at: string
          exercise_id: string
          id: string
          reps: number
          set_number: number
          weight: number
          workout_log_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          exercise_id: string
          id?: string
          reps?: number
          set_number: number
          weight?: number
          workout_log_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          exercise_id?: string
          id?: string
          reps?: number
          set_number?: number
          weight?: number
          workout_log_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_set_logs_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercise_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_set_logs_workout_log_id_fkey"
            columns: ["workout_log_id"]
            isOneToOne: false
            referencedRelation: "user_workout_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_workout_logs: {
        Row: {
          created_at: string
          duration_seconds: number
          finished_at: string | null
          id: string
          started_at: string
          total_volume: number
          user_id: string
          workout_template_id: string | null
        }
        Insert: {
          created_at?: string
          duration_seconds?: number
          finished_at?: string | null
          id?: string
          started_at?: string
          total_volume?: number
          user_id: string
          workout_template_id?: string | null
        }
        Update: {
          created_at?: string
          duration_seconds?: number
          finished_at?: string | null
          id?: string
          started_at?: string
          total_volume?: number
          user_id?: string
          workout_template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_workout_logs_workout_template_id_fkey"
            columns: ["workout_template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      water_logs: {
        Row: {
          amount_ml: number
          id: string
          logged_at: string
          user_id: string
        }
        Insert: {
          amount_ml?: number
          id?: string
          logged_at?: string
          user_id: string
        }
        Update: {
          amount_ml?: number
          id?: string
          logged_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_exercises: {
        Row: {
          created_at: string
          id: string
          name: string
          notes: string | null
          reps: number
          rest_seconds: number | null
          sets: number
          sort_order: number
          user_id: string
          weight_kg: number | null
          workout_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          reps?: number
          rest_seconds?: number | null
          sets?: number
          sort_order?: number
          user_id: string
          weight_kg?: number | null
          workout_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          reps?: number
          rest_seconds?: number | null
          sets?: number
          sort_order?: number
          user_id?: string
          weight_kg?: number | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_template_items: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          notes: string | null
          order_index: number
          reps: string
          rest_seconds: number
          sets: number
          workout_template_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          notes?: string | null
          order_index?: number
          reps?: string
          rest_seconds?: number
          sets?: number
          workout_template_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          notes?: string | null
          order_index?: number
          reps?: string
          rest_seconds?: number
          sets?: number
          workout_template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_template_items_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercise_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_template_items_workout_template_id_fkey"
            columns: ["workout_template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_templates: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string
          estimated_minutes: number
          goal: string
          id: string
          is_premium: boolean
          level: string
          location_type: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string
          estimated_minutes?: number
          goal: string
          id?: string
          is_premium?: boolean
          level: string
          location_type: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string
          estimated_minutes?: number
          goal?: string
          id?: string
          is_premium?: boolean
          level?: string
          location_type?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      workouts: {
        Row: {
          calories_burned: number | null
          completed: boolean
          completed_at: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          muscle_group: string | null
          notes: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          calories_burned?: number | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          muscle_group?: string | null
          notes?: string | null
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          calories_burned?: number | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          muscle_group?: string | null
          notes?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_public_profile: {
        Args: { _user_id: string }
        Returns: {
          avatar_url: string
          name: string
          user_id: string
        }[]
      }
      get_public_profiles: {
        Args: { _user_ids: string[] }
        Returns: {
          avatar_url: string
          name: string
          user_id: string
        }[]
      }
    }
    Enums: {
      post_visibility: "public" | "followers" | "private"
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
      post_visibility: ["public", "followers", "private"],
    },
  },
} as const
