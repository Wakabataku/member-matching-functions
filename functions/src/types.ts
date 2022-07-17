import { DocumentData } from "@google-cloud/firestore"

export type AccessToken = {
  access_token: string
  expires_in: number
  id_token: string
  refresh_token: string
  scope: string
  token_type: string
  [key: string]: any
}

// name :string
// picture: stringを含む
export type UserProfile = DocumentData & {
  sub: string
}

export type DBUserProfile = UserProfile & {
  isJoin: boolean
}

export type AuthResponse = UserProfile & {
  access_token: string
  otherUser: UserProfile[]
}

export type Sub = {
  sub: string
}

export type EventItem = {
  starttime: number
  endtime: number
  blockUser: string[]
}

export type FbEventItem = Sub & EventItem

export type Event = EventItem & {
  gid: string
  access_token: string
}

export type MatchEvent = {
  user: string[]
  starttime: number[]
  endtime: number[]
}
