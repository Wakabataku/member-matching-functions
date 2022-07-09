import axios, { AxiosRequestConfig, AxiosResponse } from "axios"

import { AccessToken } from "../types"

export const getAccessToken = async (props: {
  accessUrl: string
  params: URLSearchParams
  config: AxiosRequestConfig
}): Promise<AxiosResponse<AccessToken>> => {
  try {
    return await axios.post(props.accessUrl, props.params, props.config)
  } catch (e: any) {
    throw new Error(e)
  }
}
