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
import { db } from "./index"

export const loginFunc = functions
  .region("asia-northeast1")
  .https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Headers", "Content-Type")
    res.set("Access-Control-Allow-Origin", postUrl)
    res.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS, POST")

    // preflightが必要な時はokを返す
    // POSTはpreflightが必要
    if (req.method === "OPTIONS") {
      cors(req, res, () => {
        res.status(200).send()
      })
      return
    }

    const responseData: AuthResponse = {
      access_token: "",
      name: "Unknown",
      picture: "pictureURL",
      sub: "noneSub",
      otherUser: [],
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
    } catch (e: any) {
      console.error(e.message)
      res.status(400).send(e)
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
      responseData.name = userProfile.data.name
      responseData.picture = userProfile.data.picture
      responseData.sub = userProfile.data.sub
    } catch (e: any) {
      console.error(e.message)
      res.status(400).send(e)
    }
    // firestoreにアクセストークンを保存
    try {
      await db
        .collection("users")
        .doc(responseData.sub)
        .set({ access_token: responseData.access_token }, { merge: true })
    } catch (e: any) {
      console.error(e.message)
      res.status(400).send(e)
    }
    // firebaseからグループ内の他ユーザを取得
    try {
      const gid = body.gid
      const querySnapshot = await db
        .collection("groups")
        .doc(gid)
        .collection("users")
        .doc(responseData.sub)
        .get()
      const userInfo = querySnapshot.data()
      if (!userInfo || !userInfo.isJoin) {
        res.status(400).send("You have no right to access the group")
      }
      const otherUserQuerySnapshot = await db
        .collection("groups")
        .doc(gid)
        .collection("users")
        .get()
      const otherUser: UserProfile[] = []
      otherUserQuerySnapshot.forEach((doc) => {
        const docData = doc.data()
        const docId: UserProfile = {
          sub: doc.id,
        }
        const user: UserProfile = { ...docData, ...docId }
        otherUser.push(user)
      })
      responseData.otherUser = otherUser
      res.status(200).send(responseData)
    } catch (e: any) {
      console.error(e.message)
      res.status(400).send(e)
    }
  })
