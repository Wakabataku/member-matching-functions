import axios, { AxiosRequestConfig, AxiosResponse } from "axios"

import { UserProfile } from "../types"

export const getUserProfile = async (props: {
  profileUrl: string
  profileConfig: AxiosRequestConfig
}): Promise<AxiosResponse<UserProfile>> => {
  try {
    return await axios.get(props.profileUrl, props.profileConfig)
  } catch (e: any) {
    throw new Error(e)
  }
}
