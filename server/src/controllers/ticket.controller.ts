import { Response } from "express";

import { AuthRequest } from "../middleware/auth.middleware";

import { addCommentSchema, assignAgentSchema, changePrioritySchema, changeStatusSchema, createTicketSchema, getTicketByIdSchema, updateTicketSchema } from "../validators/ticket.validator";

import { addComment, assignAgent, changePriority, changeStatus, createTicket, getTicketById, getTickets, updateTicket } from "../services/ticket.service";
import z, { success } from "zod";

export async function createTicketHandler(
    req: AuthRequest,
    res: Response
) {
    try {
        const validatedData =
            createTicketSchema.parse(req.body);

        const ticket = await createTicket(
            req.user.userId,
            validatedData
        );

        return res.status(201).json({
            success: true,
            message: "Ticket created successfully",
            data: ticket,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

export async function updateTicketHandler(
    req: AuthRequest,
    res: Response
) {
    try {
        const userId =
            z.uuid().parse(req.user.userId);

        const validatedData =
            updateTicketSchema.parse(req.body);

        const ticket = await updateTicket(
            req.user.userId,
            validatedData,
            userId
        );

        return res.status(201).json({
            success: true,
            message: "Ticket updated successfully",
            data: ticket,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

export async function getTicketsHandler(
    req: AuthRequest,
    res: Response
) {
    try {
        const tickets = await getTickets(req.user.id);

        return res.status(200).json({
            success: true,
            data: tickets,
        });
    } catch (error: any) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch tickets",
        });
    }
}

export async function getTicketbyIdHandler(
    req: AuthRequest,
    res: Response
) {
    try {
        const validatedData =
            getTicketByIdSchema.parse({
                ticketId: req.params.id
            });
        const ticket = await getTicketById(validatedData.ticketId, req.user.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: ticket,
        });
    } catch (error: any) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch ticket by ID",
        });
    }
}

export async function addCommentHandler(
    req: AuthRequest,
    res: Response
) {
    try {
        const ticketId =
            z.uuid().parse(req.params.id);

        const userId =
            z.uuid().parse(req.user.userId);

        const validatedData =
            addCommentSchema.parse(req.body);

        const comment = await addComment(
            ticketId,
            userId,
            validatedData.comment
        );

        return res.status(201).json({
            success: true,
            message: "Comment added successfully",
            data: comment,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

export async function changeStatusHandler(
    req: AuthRequest,
    res: Response
) {
    try {
        const ticketId =
            z.uuid().parse(req.params.id);

        const userId =
            z.uuid().parse(req.user.userId);

        const validatedData =
            changeStatusSchema.parse(req.body);

        const ticket = await changeStatus(
            ticketId,
            validatedData.status,
            userId
        );

        return res.status(200).json({
            success: true,
            message: "Status changed successfully",
            data: ticket
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

export async function changePriorityHandler(
    req: AuthRequest,
    res: Response
) {
    try {
        const ticketId =
            z.uuid().parse(req.params.id);

        const userId =
            z.uuid().parse(req.user.userId);

        const validatedData =
            changePrioritySchema.parse(req.body);

        const ticket = await changePriority(
            ticketId,
            validatedData.priority,
            userId
        );

        return res.status(200).json({
            success: true,
            message: "Priority changed successfully",
            data: ticket
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

export async function assignAgentHandler(
    req: AuthRequest,
    res: Response
) {
    try {
        const ticketId =
            z.uuid().parse(req.params.id);

        const userId =
            z.uuid().parse(req.user.userId);

        const validatedData =
            assignAgentSchema.parse(req.body);

        const ticket = await assignAgent(
            ticketId,
            validatedData.assignedTo,
            userId
        );

        return res.status(200).json({
            success: true,
            message: "Agent assigned successfully",
            data: ticket
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}