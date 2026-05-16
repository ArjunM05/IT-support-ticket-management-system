import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";

import {
    addCommentHandler,
    assignAgentHandler,
    changePriorityHandler,
    changeStatusHandler,
    createTicketHandler,
    getTicketbyIdHandler,
    getTicketsHandler,
    updateTicketHandler,
} from "../controllers/ticket.controller";
import { authorize } from "../middleware/authorize.middleware";

const router = Router();

router.post(
    "/",
    authenticate,
    authorize(),
    createTicketHandler
);

router.patch(
    "/:id",
    authenticate,
    updateTicketHandler
);

router.get(
    "/",
    authenticate,
    getTicketsHandler
);

router.get(
    "/:id",
    authenticate,
    getTicketbyIdHandler
);

router.post(
    "/:id/comments",
    authenticate,
    addCommentHandler
);

router.patch(
    "/:id/status",
    authenticate,
    changeStatusHandler
);

router.patch(
    "/:id/priority",
    authenticate,
    changePriorityHandler
);

router.patch(
    "/:id/assign",
    authenticate,
    assignAgentHandler
);

export default router;