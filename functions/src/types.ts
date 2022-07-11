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

export type UserProfile = DocumentData & {
  sub: string
}

export type AuthResponse = UserProfile & {
  access_token: string
  otherUser: UserProfile[]
}
