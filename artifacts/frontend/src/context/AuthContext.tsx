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
  // A helper fetch wrapper that automatically injects auth cookies and the x-project-id header
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
    setProjects((prev) => [...prev, newProject]); // Add to dropdown
    setActiveProjectId(newProject.id); // Auto-switch to the new project
  };

  const checkAuth = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/me`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setProjects(data.projects);
        
        // Auto-select the first project if none is selected or if the selected one isn't valid
        if (data.projects.length > 0 && (!activeProjectId || !data.projects.find((p: Project) => p.id === activeProjectId))) {
          setActiveProjectId(data.projects[0].id);
        }
      } else {
        setUser(null);
        setProjects([]);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await fetch(`${BACKEND_URL}/api/auth/logout`, { method: "POST", credentials: "include" });
    setUser(null);
    setProjects([]);
    setActiveProjectIdState(null);
    localStorage.removeItem("activeProjectId");
    setLocation("/login");
  };

  // Custom fetch wrapper to keep your API calls clean in other components
  const authFetch = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    if (activeProjectId) headers.set("x-project-id", activeProjectId);
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");

    const res = await fetch(url, {
      ...options,
      headers,
      credentials: "include", // Required to send the secure HTTP-only cookie
    });

    if (res.status === 401) {
      toast({ title: "Session expired", description: "Please log in again.", variant: "destructive" });
      setUser(null);
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