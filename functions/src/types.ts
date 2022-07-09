export type AccessToken = {
  access_token: string
  expires_in: number
  id_token: string
  refresh_token: string
  scope: string
  token_type: string
  [key: string]: any
}

export type LineUserInfo = {
  iss: string
  sub: string
  aud: string
  exp: number
  iat: number
  auth_time: number
  nonce: string
  amr: string
  name: string
  picture: string
  [key: string]: any
}

export type FbToken = {
  access: AccessToken
  lineU: LineUserInfo
}
