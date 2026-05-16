import { z } from "zod";

import { TicketPriority, TicketStatus } from "@prisma/client";

export const createTicketSchema = z.object({
    title: z
        .string()
        .trim()
        .min(5)
        .max(255),

    description: z
        .string()
        .trim()
        .min(10),

    priority: z
        .enum(TicketPriority),

    departmentId: z
        .uuid()
        .optional(),

    assignedToId: z
        .uuid()
        .optional()
});

export const updateTicketSchema = z.object({
    title: z
        .string()
        .trim()
        .min(5)
        .max(255),

    description: z
        .string()
        .trim()
        .min(10),

    priority: z
        .enum(TicketPriority),

    departmentId: z
        .uuid()
        .optional(),

    status: z
        .enum(TicketStatus),

    assignedTo: z
        .uuid(),

    resolvedAt: z
        .date(),

    closedAt: z
        .date(),
});

export const getTicketByIdSchema = z.object({
    ticketId: z
        .uuid()
});

export const addCommentSchema = z.object({
    comment: z
        .string()
        .min(1),
});

export const changeStatusSchema = z.object({
    status: z
        .enum(TicketStatus)
});

export const changePrioritySchema = z.object({
    priority: z
        .enum(TicketPriority)
});

export const assignAgentSchema = z.object({
    assignedTo: z
        .uuid()
});