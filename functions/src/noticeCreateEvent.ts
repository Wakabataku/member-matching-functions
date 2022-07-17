import * as functions from "firebase-functions"

import { db } from "./index"
import { groupCol, eventsCol } from "./LoginItems"
import { MatchEvent } from "./types"

export const noticeCreateEvent = functions.firestore
  .document("groups/{gid}/events/{eid}")
  .onCreate(async (snapshot, context) => {
    // 新規追加された値
    const newEvent = snapshot.data()

    const starttime = newEvent.starttime
    const endtime = newEvent.endtime
    const blockUser: string[] = newEvent.blockUser
    const gid = context.params.gid
    const sub = newEvent.sub
    // 同グループの自分が作成したイベント以外のイベントを取得
    const events = await db
      .collection(groupCol)
      .doc(gid)
      .collection(eventsCol)
      .where("sub", "!=", sub)
      .get()

    const matchEvent: MatchEvent = {
      user: [],
      starttime: [],
      endtime: [],
    }
    // マッチング
    events.forEach((doc) => {
      const eData = doc.data()
      const otherUSub = eData.sub
      const otherUBlockUser: string[] = eData.blockUser
      const otherUStarttime: number = eData.starttime
      const otherUEndtime: number = eData.endtime
      // 他のユーザが自分をブロックしていたらマッチングしない
      if (otherUBlockUser.some((elm) => elm === sub)) {
        return
      }
      // 自分のブロックユーザとはマッチングしない
      if (blockUser.some((elm) => elm === otherUSub)) {
        return
      }
      // マッチ可否判定
      if (otherUStarttime < starttime && starttime < otherUEndtime) {
        matchEvent.user.push(otherUSub)
        matchEvent.starttime.push(starttime)
        matchEvent.endtime.push(otherUEndtime)
      }
      // マッチ可否判定
      if (otherUStarttime < endtime && endtime < otherUEndtime) {
        matchEvent.user.push(otherUSub)
        matchEvent.starttime.push(otherUStarttime)
        matchEvent.endtime.push(endtime)
      }
      // マッチなし
      return
    })
    if (!matchEvent.user.length) {
      console.log("No Matching!!")
    } else {
      console.log("Matching!!")
      console.log(matchEvent)
    }
  })
