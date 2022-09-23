import * as trpc from '@trpc/server'
import z from 'zod'
import { createuserSchema } from '../../schema/userSchema'
import { createRouter } from './context'
import { defaultError } from '../shared/errors'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

export const userRouter = createRouter()
  .query('getSession', {
    resolve({ ctx }) {
      return ctx.session
    },
  })
  .query('me', {
    async resolve({ ctx }) {
      const session = ctx.session
      if (!session) return null
      try {
        const user = await ctx.prisma.user.findFirst({
          where: {
            id: session.id as string,
          },
          include: {
            groups: { include: { members: true } },
            events: {
              include: {
                participates: {
                  include: {
                    user: true,
                  },
                },
                user: true,
              },
            },
          },
        })
        return user
      } catch (error) {
        console.error(error)
        throw new trpc.TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }
    },
  })
  .query('user-list', {
    async resolve({ ctx }) {
      try {
        const userList = await ctx.prisma.user.findMany({
          include: {
            participates: {
              include: {
                user: true,
              },
            },
          },
        })
        return userList
      } catch (error) {
        console.error(error)
        throw new trpc.TRPCError(defaultError)
      }
    },
  })
  .mutation('create-user', {
    input: createuserSchema,
    async resolve({ ctx, input }) {
      try {
        const user = await ctx.prisma.user.create({
          data: input,
        })
        return user
      } catch (e) {
        if (e instanceof PrismaClientKnownRequestError) {
          if (e.code === 'P2002') {
            throw new trpc.TRPCError({
              code: 'CONFLICT',
              message: 'user already exists',
            })
          }
        }
        console.error(e)
        throw new trpc.TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong',
        })
      }
    },
  })
