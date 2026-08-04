import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { db, projects, users } from "@workspace/db";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET!;

router.post("/register", async (req, res) => {
  try {
    const { email, password, projectName } = req.body;
    
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) return res.status(400).json({ error: "Email already in use." });

    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create User
    const newUser = await db.insert(users).values({ email, passwordHash }).returning();
    
    // Create their first isolated Project/Account
    const newProject = await db.insert(projects).values({ 
      userId: newUser[0].id, 
      name: projectName || "My Workspace" 
    }).returning();

    // Issue Cookie
    const token = jwt.sign({ userId: newUser[0].id }, JWT_SECRET, { expiresIn: "7d" });
    res.cookie("access_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });

    return res.json({ user: { id: newUser[0].id, email: newUser[0].email }, defaultProject: newProject[0] });
  } catch (error) {
    return res.status(500).json({ error: "Registration failed." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const userRecords = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (userRecords.length === 0) return res.status(401).json({ error: "Invalid credentials." });
    
    const user = userRecords[0];
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(401).json({ error: "Invalid credentials." });

    // Fetch user's projects
    const userProjects = await db.select().from(projects).where(eq(projects.userId, user.id));

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.cookie("access_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });

    return res.json({ user: { id: user.id, email: user.email }, projects: userProjects });
  } catch (error) {
    return res.status(500).json({ error: "Login failed." });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  // Returns current user session and their projects
  const userRecords = await db.select({ id: users.id, email: users.email }).from(users).where(eq(users.id, req.userId!)).limit(1);
  const userProjects = await db.select().from(projects).where(eq(projects.userId, req.userId!));
  
  return res.json({ user: userRecords[0], projects: userProjects });
});

router.post("/logout", (req, res) => {
  res.clearCookie("access_token");
  return res.json({ success: true });
});

export default router;