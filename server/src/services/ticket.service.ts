import prisma from "../config/prisma";
import { Prisma, TicketActivity, TicketPriority, TicketStatus } from "@prisma/client"

interface CreateTicketData {
    title: string;
    description: string;
    priority: TicketPriority;
    departmentId?: string;
}

interface UpdateTicketData {
    title: string;
    description: string;
    priority: TicketPriority;
    departmentId?: string;
    status: TicketStatus;
    assignedTo: string;
    resolvedAt: Date | null | undefined;
    closedAt: Date | null | undefined;
}

interface CreateActivityLogParams {
    ticketId: string;
    performedBy: string;
    actionType: TicketActivity;
    oldValue?: Prisma.JsonValue | Prisma.NullableJsonNullValueInput | null;
    newValue?: Prisma.JsonValue | Prisma.NullableJsonNullValueInput | null;
};

export async function createTicket(
    userId: string,
    data: CreateTicketData
) {
    return prisma.$transaction(async (tx) => {

        const ticket = await prisma.ticket.create({
            data: {
                title: data.title,

                description: data.description,

                priority: data.priority,

                departmentId: data.departmentId,

                createdBy: userId,
            },

            include: {
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: true
                    }
                },
                department: true,
            },
        });

        await createActivityLog(tx, {
            ticketId: ticket.id,

            performedBy: userId,

            actionType:
                TicketActivity.TICKET_CREATED,

            oldValue: null,

            newValue: {
                ...data
            }
        });

        return ticket;
    });
}

export async function updateTicket(
    ticketId: string,
    data: UpdateTicketData,
    userId: string
) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    const existingTicket =
        await prisma.ticket.findUnique({
            where: {
                id: ticketId
            }
        });

    if (!existingTicket) {
        throw new Error("Ticket not found");
    }

    if (user?.role === "EMPLOYEE" && existingTicket.createdBy !== user.id) {
        throw new Error("Forbidden. Access not allowed.");
    }

    const updateData: Prisma.TicketUpdateInput = {
        ...data
    };

    if (data.status === TicketStatus.RESOLVED) {
        updateData.resolvedAt = new Date();
    }

    if (data.status === TicketStatus.CLOSED) {
        updateData.closedAt = new Date();
    }

    if (data.status === TicketStatus.REOPENED) {
        data.resolvedAt = null;
        updateData.closedAt = null;
    }

    return prisma.$transaction(async (tx) => {
        const updatedTicket = await prisma.ticket.update({
            where: {
                id: ticketId
            },
            data: updateData,
        });

        await createActivityLog(tx, {
            ticketId,

            performedBy: userId,

            actionType:
                TicketActivity.TICKET_UPDATED,

            oldValue: {
                title: existingTicket.title,
                description: existingTicket.description,
                priority: existingTicket.priority,
                departmentId: existingTicket.departmentId,
                status: existingTicket.status,
                assignedTo: existingTicket.assignedTo,
                resolvedAt: existingTicket.resolvedAt?.toISOString() ?? null,
                closedAt: existingTicket.closedAt?.toISOString() ?? null
            },

            newValue: {
                title: data.title,
                description: data.description,
                priority: data.priority,
                departmentId: data.departmentId,
                status: data.status,
                assignedTo: data.assignedTo,
                resolvedAt: data.resolvedAt?.toISOString() ?? null,
                closedAt: data.closedAt?.toISOString() ?? null
            }
        });

        return updatedTicket;
    });
}

export async function getTickets(userId: string) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    const filter: Prisma.TicketWhereInput = {};

    if (user?.role === "EMPLOYEE") {
        filter.createdBy = userId;
    } else if (user?.role === "AGENT") {
        filter.assignedTo = userId;
    }

    return prisma.ticket.findMany({
        where: filter,
        include: {
            creator: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    department: {
                        select: {
                            name: true
                        }
                    }
                }
            },

            assignee: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    department: {
                        select: {
                            name: true
                        }
                    }
                }
            },

            department: true,
        },

        orderBy: {
            createdAt: "desc",
        },
    });
}

export async function getTicketById(
    ticketId: string,
    userId: string
) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    const filter: Prisma.TicketWhereInput = {};

    filter.id = ticketId;
    if (user?.role === "EMPLOYEE") {
        filter.createdBy = userId;
    } else if (user?.role === "AGENT") {
        filter.assignedTo = userId;
    }

    return prisma.ticket.findFirst({
        where: filter,

        include: {
            creator: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    department: {
                        select: {
                            name: true
                        }
                    }
                }
            },

            assignee: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    department: {
                        select: {
                            name: true
                        }
                    }
                }
            },
        },
    });
}

export async function addComment(
    ticketId: string,
    userId: string,
    comment: string
) {
    const existingTicket =
        await prisma.ticket.findUnique({
            where: {
                id: ticketId
            }
        });

    if (!existingTicket) {
        throw new Error("Ticket not found");
    }
    return prisma.$transaction(async (tx) => {

        const ticketComment = prisma.ticketComment.create({
            data: {
                ticketId,
                userId,
                comment,
            },
        });

        await createActivityLog(tx, {
            ticketId,

            performedBy: userId,

            actionType:
                TicketActivity.COMMENT_ADDED,

            oldValue: null,

            newValue: {
                comment: comment
            }
        });

        return ticketComment;
    });
}

export async function changeStatus(
    ticketId: string,
    status: TicketStatus,
    userId: string
) {
    const existingTicket =
        await prisma.ticket.findUnique({
            where: {
                id: ticketId
            }
        });

    if (!existingTicket) {
        throw new Error("Ticket not found");
    }

    const updateData: Prisma.TicketUpdateInput = {
        status
    };

    if (status === TicketStatus.RESOLVED) {
        updateData.resolvedAt = new Date();
    }

    if (status === TicketStatus.CLOSED) {
        updateData.closedAt = new Date();
    }

    if (status === TicketStatus.REOPENED) {
        updateData.resolvedAt = null;
        updateData.closedAt = null;
    }

    return prisma.$transaction(async (tx) => {

        const updatedTicket = prisma.ticket.update({
            where: {
                id: ticketId
            },

            data: updateData
        });

        await createActivityLog(tx, {
            ticketId,

            performedBy: userId,

            actionType:
                TicketActivity.STATUS_CHANGED,

            oldValue: {
                status: existingTicket.status
            },

            newValue: {
                status: status
            }
        });

        return updatedTicket;
    });

}

export async function changePriority(
    ticketId: string,
    priority: TicketPriority,
    userId: string
) {
    const existingTicket =
        await prisma.ticket.findUnique({
            where: {
                id: ticketId
            }
        });

    if (!existingTicket) {
        throw new Error("Ticket not found");
    }

    return prisma.$transaction(async (tx) => {

        const updatedTicket = prisma.ticket.update({
            where: {
                id: ticketId
            },
            data: {
                priority
            },
        });

        await createActivityLog(tx, {
            ticketId,

            performedBy: userId,

            actionType:
                TicketActivity.PRIORITY_CHANGED,

            oldValue: {
                status: existingTicket.priority
            },

            newValue: {
                status: priority
            }
        });

        return updatedTicket;
    });
}

export async function assignAgent(
    ticketId: string,
    assignedTo: string,
    userId: string
) {
    const existingTicket =
        await prisma.ticket.findUnique({
            where: {
                id: ticketId
            },
            include: {
                assignee: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        department: true
                    }
                }
            }
        });

    if (!existingTicket) {
        throw new Error("Ticket not found");
    }

    const assignedUser =
        await prisma.user.findUnique({
            where: {
                id: assignedTo
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                department: true
            }
        });


    if (!assignedUser) {
        throw new Error("User not found");
    }

    return prisma.$transaction(async (tx) => {

        const updatedTicket = prisma.ticket.update({
            where: {
                id: ticketId
            },
            data: {
                assignedTo: assignedTo
            }
        });

        await createActivityLog(tx, {
            ticketId,

            performedBy: userId,

            actionType:
                TicketActivity.ASSIGNED_CHANGED,

            oldValue: {
                status: existingTicket.assignedTo
            },

            newValue: {
                status: assignedTo
            }
        });

        return updatedTicket;
    });
}

export async function createActivityLog(
    tx: Prisma.TransactionClient,
    params: CreateActivityLogParams
) {

    return tx.ticketActivityLog.create({
        data: {
            ticketId: params.ticketId,

            performedBy: params.performedBy,

            actionType: params.actionType,

            oldValue: params.oldValue ?? Prisma.JsonNull,

            newValue: params.newValue ?? Prisma.JsonNull,
        }
    });
}