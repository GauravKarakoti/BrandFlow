import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { and, eq } from "drizzle-orm";
import { db, projects } from "@workspace/db";

// 1. Explicitly cast as string to satisfy jwt.verify overloads
const JWT_SECRET = process.env.JWT_SECRET as string;

// 2. Define a custom interface extending the base JwtPayload
interface CustomJwtPayload extends JwtPayload {
  userId: string;
}

// Extend Express Request to hold our custom auth data
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      projectId?: string;
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 3. Try to get token from Authorization header first (Bearer token handoff), fallback to cookie
    const authHeader = req.headers.authorization;
    let token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      token = req.cookies?.access_token;
    }

    if (!token) return res.status(401).json({ error: "Unauthorized. Please log in." });

    // 4. Cast the verified token to our custom interface
    const decoded = jwt.verify(token, JWT_SECRET) as CustomJwtPayload;
    req.userId = decoded.userId;

    // Multi-tenant check: If the route requires a project context, verify ownership
    const requestedProjectId = req.headers['x-project-id'] as string;
    
    if (requestedProjectId) {
      const projectAccess = await db.select().from(projects).where(
        and(
          eq(projects.id, requestedProjectId),
          eq(projects.userId, req.userId)
        )
      ).limit(1);

      if (projectAccess.length === 0) {
        return res.status(403).json({ error: "Forbidden. You do not have access to this project." });
      }
      req.projectId = requestedProjectId;
    }

    return next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired session." });
  }
};