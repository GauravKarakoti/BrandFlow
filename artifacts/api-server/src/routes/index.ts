import { Router } from "express";
import healthRouter from "./health";
import knowledgeRouter from "./knowledge";
import uploadRouter from "./upload";

const router = Router();

router.use("/health", healthRouter);
router.use("/knowledge-base", knowledgeRouter);
router.use("/upload", uploadRouter);

export default router;