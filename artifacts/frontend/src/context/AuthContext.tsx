import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { BACKEND_URL } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
}

interface Project {
  id: string;
  name: string;
  userId: string;
}

interface AuthContextType {
  user: User | null;
  projects: Project[];
  activeProjectId: string | null;
  isLoading: boolean;
  setActiveProjectId: (id: string) => void;
  addProject: (name: string) => Promise<void>;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(
    localStorage.getItem("activeProjectId")
  );
  const [isLoading, setIsLoading] = useState(true);
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const setActiveProjectId = (id: string) => {
    setActiveProjectIdState(id);
    localStorage.setItem("activeProjectId", id);
  };

  const addProject = async (name: string) => {
    const res = await authFetch(`${BACKEND_URL}/api/projects`, {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    
    if (!res.ok) throw new Error("Failed to create workspace.");
    
    const newProject = await res.json();
    setProjects((prev) => [...prev, newProject]);
    setActiveProjectId(newProject.id); 
  };

  const checkAuth = async () => {
    try {
      // 🚀 FIX: Catch the token from the URL and save it
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get("token");
      if (urlToken) {
        localStorage.setItem("access_token", urlToken);
        // Clean the URL so the token doesn't sit in the address bar
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const token = localStorage.getItem("access_token");

      const res = await fetch(`${BACKEND_URL}/api/auth/me`, { 
        credentials: "include",
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Authorization": token ? `Bearer ${token}` : "" // Inject token
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setProjects(data.projects);
        
        if (data.projects.length > 0 && (!activeProjectId || !data.projects.find((p: Project) => p.id === activeProjectId))) {
          setActiveProjectId(data.projects[0].id);
        }
      } else {
        setUser(null);
        setProjects([]);
      }
    } catch (error) {
      console.error("Auth verification failed:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await fetch(`${BACKEND_URL}/api/auth/logout`, { 
      method: "POST", 
      credentials: "include",
      headers: { "ngrok-skip-browser-warning": "true" }
    });
    setUser(null);
    setProjects([]);
    setActiveProjectIdState(null);
    localStorage.removeItem("activeProjectId");
    localStorage.removeItem("access_token"); // Clear token on logout
    setLocation("/login");
  };

  const authFetch = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    if (activeProjectId) headers.set("x-project-id", activeProjectId);
    
    // 🚀 FIX: Do NOT force application/json if the body is FormData (file uploads)
    const isFormData = options.body instanceof FormData;
    if (!headers.has("Content-Type") && !isFormData) {
      headers.set("Content-Type", "application/json");
    }
    
    headers.set("ngrok-skip-browser-warning", "true");

    const token = localStorage.getItem("access_token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const res = await fetch(url, {
      ...options,
      headers,
      credentials: "include", 
    });

    if (res.status === 401) {
      toast({ title: "Session expired", description: "Please log in again.", variant: "destructive" });
      setUser(null);
      localStorage.removeItem("access_token");
      setLocation("/login");
    }

    return res;
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, projects, activeProjectId, isLoading, setActiveProjectId, addProject, checkAuth, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};