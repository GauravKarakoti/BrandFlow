import { Router, type IRouter } from "express";
import healthRouter from "./health";
import postsRouter from "./posts";
import schedulesRouter from "./schedules";
import analyticsRouter from "./analytics";
import aiRouter from "./ai";
import commentsRouter from "./comments";
import brandRouter from "./brand";
import knowledgeRouter from "./knowledge";
import teamRouter from "./team";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(postsRouter);
router.use(schedulesRouter);
router.use(analyticsRouter);
router.use(aiRouter);
router.use(commentsRouter);
router.use(brandRouter);
router.use(knowledgeRouter);
router.use(teamRouter);
router.use(dashboardRouter);

export default router;
