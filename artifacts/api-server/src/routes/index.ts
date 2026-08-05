import { Router } from "express";
import healthRouter from "./health";
import knowledgeRouter from "./knowledge";
import uploadRouter from "./upload";
import generateRouter from "./generate";
import postsRouter from "./posts";
import authRouter from "./auth";
import projectsRouter from "./projects";

const router = Router();

router.use("/health", healthRouter);
router.use("/knowledge-base", knowledgeRouter);
router.use("/upload", uploadRouter);
router.use("/generate", generateRouter);
router.use("/posts", postsRouter);
router.use("/auth", authRouter);
router.use("/projects", projectsRouter);

export default router;