import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
admin.initializeApp(functions.config().firebase)

import { loginFunc } from "./loginFunc"
import { addEvent } from "./addEvent"

export const db = admin.firestore()

export const login = loginFunc
export const eventCreation = addEvent
