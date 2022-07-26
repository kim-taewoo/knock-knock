import * as trpc from '@trpc/server'

import { createRouter } from './context'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { defaultError } from '../shared/errors'
import z from 'zod'
import { createEventSchema, editEventSchema } from 'src/schema/eventSchema'

export const eventRouter = createRouter()
  .query('events', {
    async resolve({ ctx }) {
      try {
        const events = await ctx.prisma.event.findMany({
          include: {
            participates: {
              include: {
                profile: true,
              },
            },
          },
        })
        return events
      } catch (error) {
        console.error(error)
        throw new trpc.TRPCError(defaultError)
      }
    },
  })
  .query('single-event', {
    input: z.object({ eventId: z.string() }),
    async resolve({ ctx, input }) {
      try {
        const event = await ctx.prisma.event.findUnique({
          where: {
            id: input.eventId,
          },
          include: {
            participates: {
              include: {
                profile: true,
              },
            },
            profile: true,
          },
        })
        return event
      } catch (error) {
        console.error(error)
        throw new trpc.TRPCError(defaultError)
      }
    },
  })
  .mutation('my-cells', {
    input: z.object({ eventId: z.string(), profileId: z.string(), cells: z.string() }),
    async resolve({ ctx, input }) {
      const alreadyExists = await ctx.prisma.participation.findFirst({
        where: {
          eventId: input.eventId,
          profileId: input.profileId,
        },
      })
      if (alreadyExists) {
        if (input.cells.length === 0) {
          await ctx.prisma.participation.delete({
            where: {
              id: alreadyExists.id,
            },
          })
        } else {
          await ctx.prisma.participation.update({
            where: {
              id: alreadyExists.id,
            },
            data: {
              selectedCells: input.cells,
            },
          })
        }
      } else {
        await ctx.prisma.participation.create({
          data: {
            profile: {
              connect: {
                id: input.profileId,
              },
            },
            event: {
              connect: {
                id: input.eventId,
              },
            },
            selectedCells: input.cells,
          },
        })
      }
    },
  })
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session?.user?.email) {
      throw new trpc.TRPCError({ code: 'UNAUTHORIZED', message: 'Need to login' })
    }
    return next()
  })
  .mutation('create-event', {
    input: createEventSchema,
    async resolve({ ctx, input }) {
      const { title, description, tags, startingTimes, timeSize, isUnlimitedHeadCounts, groupId, headCounts } = input

      try {
        const event = await ctx.prisma.event.create({
          data: {
            profile: {
              connect: {
                email: ctx.session?.user?.email!,
              },
            },
            ...(groupId
              ? {
                  group: {
                    connect: {
                      id: input.groupId,
                    },
                  },
                }
              : {}),
            title,
            description,
            tags,
            startingTimes,
            timeSize,
            isUnlimitedHeadCounts,
            headCounts,
          },
        })
        return event
      } catch (e) {
        if (e instanceof PrismaClientKnownRequestError) {
          if (e.code === 'P2002') {
            throw new trpc.TRPCError({
              code: 'CONFLICT',
              message: 'Profile already exists',
            })
          }
        }
        console.error(e)
        throw new trpc.TRPCError(defaultError)
      }
    },
  })
  .mutation('edit-event', {
    input: editEventSchema,
    async resolve({ ctx, input }) {
      try {
        const event = await ctx.prisma.event.update({
          where: {
            id: input.id,
          },
          data: {
            ...input,
          },
        })
        return event
      } catch (e) {
        if (e instanceof PrismaClientKnownRequestError) {
          if (e.code === 'P2002') {
            throw new trpc.TRPCError({
              code: 'CONFLICT',
              message: 'Profile already exists',
            })
          }
        }
        console.error(e)
        throw new trpc.TRPCError(defaultError)
      }
    },
  })
  .mutation('delete-event', {
    input: z.object({ eventId: z.string() }),
    async resolve({ ctx, input }) {
      try {
        const event = await ctx.prisma.event.delete({
          where: {
            id: input.eventId,
          },
        })
        return event
      } catch (e) {
        if (e instanceof PrismaClientKnownRequestError) {
          if (e.code === 'P2002') {
            throw new trpc.TRPCError({
              code: 'CONFLICT',
              message: 'Profile already exists',
            })
          }
        }
        console.error(e)
        throw new trpc.TRPCError(defaultError)
      }
    },
  })
