import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profileRouter from "./profile";
import opportunitiesRouter from "./opportunities";
import skillgapRouter from "./skillgap";
import applicationsRouter from "./applications";
import recoveryRouter from "./recovery";
import interviewsRouter from "./interviews";
import dashboardRouter from "./dashboard";
import resumeRouter from "./resume";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profileRouter);
router.use(opportunitiesRouter);
router.use(skillgapRouter);
router.use(applicationsRouter);
router.use(recoveryRouter);
router.use(interviewsRouter);
router.use(dashboardRouter);
router.use(resumeRouter);

export default router;
