import { Group, Profile } from '@prisma/client'

export interface IGroup extends Group {
  groups: Profile[]
}