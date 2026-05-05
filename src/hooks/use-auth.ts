import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/database.types";
import type { Session } from "@supabase/supabase-js";

export interface AuthState {
  session:        Session | null;
  profile:        Profile | null;
  loading:        boolean;
  signOut:        () => Promise<void>;
  refetchProfile: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [session, setSession]   = useState<Session | null>(null);
  const [profile, setProfile]   = useState<Profile | null>(null);
  const [loading, setLoading]   = useState(true);
  const [userId, setUserId]     = useState<string | null>(null);

  async function fetchProfile(uid: string) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .single();
    setProfile(data ?? null);
  }

  async function refetchProfile() {
    if (userId) await fetchProfile(userId);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUserId(session.user.id);
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUserId(session.user.id);
        fetchProfile(session.user.id);
      } else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => { await supabase.auth.signOut(); };

  return { session, profile, loading, signOut, refetchProfile };
}
