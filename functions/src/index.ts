import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
admin.initializeApp(functions.config().firebase)

import { loginFunc } from "./loginFunc"

export const db = admin.firestore()

export const login = loginFunc
