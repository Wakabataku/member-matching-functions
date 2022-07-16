import * as functions from "firebase-functions"
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cors = require("cors")({ origin: true })

import { db } from "./index"
import { postUrl, eventsCol, groupCol, userCol } from "./LoginItems"
import { Event, Sub, FbEventItem } from "./types"

export const addEvent = functions
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
    // アクセストークン
    const body: Event = req.body

    if (body === undefined) {
      res.status(400).send("bodyの中身が不正です")
    }
    const onlySub: Sub = {
      sub: "",
    }
    // アクセストークンからユーザID取得
    // try {
    //   const profileConfig: AxiosRequestConfig = {
    //     headers: {
    //       Authorization: "Bearer " + body.access_token,
    //     },
    //   }
    //   const userProfile: AxiosResponse<UserProfile> = await getUserProfile({
    //     profileUrl,
    //     profileConfig,
    //   })
    //   console.log("userProfile: " + userProfile.data.name)
    //   onlySub.sub = userProfile.data.sub
    // } catch (e: any) {
    //   console.error(e.message)
    //   res.status(400).send(e.message)
    // }

    // アクセストークンからFirestoreよりsubを取得
    try {
      const userDoc = await db
        .collection(userCol)
        .where("access_token", "==", body.access_token)
        .get()
      userDoc.forEach((doc) => {
        onlySub.sub = doc.id
      })
      console.log("sub is " + onlySub.sub)
    } catch (e: any) {
      console.error(e.message)
      res.status(400).send(e)
    }
    // ユーザIDを使って，Firestoreにeventを登録
    const addItems: FbEventItem = {
      sub: onlySub.sub,
      starttime: body.starttime,
      endtime: body.endtime,
      blockUser: body.blockUser,
    }
    // Firestoreにイベント登録
    try {
      const userQuerySnapshot = await db
        .collection(groupCol)
        .doc(body.gid)
        .collection(userCol)
        .doc(onlySub.sub)
        .get()
      const userInfo = userQuerySnapshot.data()
      if (!userInfo) {
        throw new Error("User information cannot be got")
      }
      if (!userInfo.isJoin) {
        res.status(400).send("グループでイベントを作成する権利がありません")
      }
      await db
        .collection(groupCol)
        .doc(body.gid)
        .collection(eventsCol)
        .doc(body.starttime.toString())
        .set(addItems, { merge: true })
    } catch (e: any) {
      console.error(e.message)
      res.status(400).send(e.message)
    }
    res.status(200).send(true)
  })
