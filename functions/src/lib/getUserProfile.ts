import axios, { AxiosRequestConfig, AxiosResponse } from "axios"

import { UserProfile } from "../types"

export const getUserProfile = async (props: {
  profileUrl: string
  config: AxiosRequestConfig
}): Promise<AxiosResponse<UserProfile>> => {
  try {
    return await axios.get(props.profileUrl, props.config)
  } catch (e: any) {
    throw new Error(e)
  }
}
