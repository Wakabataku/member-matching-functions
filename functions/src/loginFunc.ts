import * as functions from "firebase-functions"
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cors = require("cors")({ origin: true })
import { AxiosResponse, AxiosRequestConfig } from "axios"

import { getUserProfile } from "./lib/getUserProfile"
import { getAccessToken } from "./lib/getAccessToken"
import {
  postUrl,
  clientSecret,
  clientId,
  redirectURL,
  accessUrl,
  profileUrl,
} from "./LoginItems"
import { AuthResponse, AccessToken, UserProfile } from "./types"

export const loginFunc = functions
  .region("asia-northeast1")
  .https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Headers", "Content-Type")
    res.set("Access-Control-Allow-Origin", postUrl)
    res.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS, POST")

    // preflightが必要な時はokを返す
    // POSTはpreflightが必要
    if (req.method == "OPTIONS") {
      cors(req, res, () => {
        res.status(200).send()
      })
      return
    }

    const body = req.body
    if (body === undefined) {
      res.status(400).send("bodyの中身が不正です")
    }
    const params = new URLSearchParams()
    params.append("grant_type", "authorization_code")
    params.append("code", body.code)
    params.append("redirect_uri", redirectURL)
    params.append("client_id", clientId)
    params.append("client_secret", clientSecret)
    const config: AxiosRequestConfig = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }

    const responseData: AuthResponse = {
      access_token: "",
      name: "Unknown",
      picture: "pictureURL",
      sub: "noneSub",
      otherUser: [],
    }

    // アクセストークンのPOST
    try {
      const accessToken: AxiosResponse<AccessToken> = await getAccessToken({
        accessUrl,
        params,
        config,
      })
      console.log(accessToken.data)
      responseData.access_token = accessToken.data.access_token
      // res.status(200).send({ name: "CHIBITA" })
    } catch (e) {
      res.send(e)
    }
    // ユーザプロフィールの取得
    try {
      const profileConfig: AxiosRequestConfig = {
        headers: {
          Authorization: "Bearer " + responseData.access_token,
        },
      }
      const userProfile: AxiosResponse<UserProfile> = await getUserProfile({
        profileUrl,
        profileConfig,
      })
      console.log("userProfile: " + userProfile.data.name)
      responseData.name = userProfile.data.name
      responseData.picture = userProfile.data.picture
      responseData.sub = userProfile.data.sub
    } catch (e) {
      res.send(e)
    }
    // firebaseからグループ内の他ユーザを取得
  })
