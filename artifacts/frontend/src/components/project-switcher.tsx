import * as React from "react";
import { Check, ChevronsUpDown, PlusCircle, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function ProjectSwitcher() {
  const { projects, activeProjectId, setActiveProjectId, addProject } = useAuth();
  const [showDialog, setShowDialog] = React.useState(false);
  const [newProjectName, setNewProjectName] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);
  const { toast } = useToast();

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    
    setIsCreating(true);
    try {
      await addProject(newProjectName);
      setShowDialog(false);
      setNewProjectName("");
      toast({ title: "Workspace created!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  if (!activeProject) return null;

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" role="combobox" className="justify-between bg-muted/30 border-border/60 hover:bg-muted/50">
            <div className="flex items-center gap-2 truncate">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-indigo-500/10">
                <Building2 className="h-3 w-3 text-indigo-500" />
              </div>
              <span className="truncate font-semibold text-sm">{activeProject.name}</span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="start">
          <DropdownMenuLabel className="text-xs font-semibold uppercase text-muted-foreground">
            Your Workspaces
          </DropdownMenuLabel>
          {projects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              onClick={() => setActiveProjectId(project.id)}
              className="gap-2 cursor-pointer py-2"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-md border border-border bg-muted/50">
                <Building2 className="h-3 w-3 text-foreground/70" />
              </div>
              <span className="truncate flex-1 font-medium">{project.name}</span>
              {activeProjectId === project.id && (
                <Check className="h-4 w-4 text-indigo-500" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onSelect={() => setShowDialog(true)}
            className="gap-2 cursor-pointer text-indigo-500 focus:text-indigo-500 focus:bg-indigo-50 dark:focus:bg-indigo-500/10 py-2"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="font-medium">Create new workspace</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
          <DialogDescription>
            Add a new isolated workspace for a different brand or client.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Workspace Name</Label>
            <Input 
              id="name" 
              placeholder="e.g., Acme Corp Socials" 
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button type="submit" disabled={!newProjectName.trim() || isCreating}>
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Workspace"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}