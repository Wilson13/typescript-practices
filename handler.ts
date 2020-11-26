import { Handler, Context, Callback } from "aws-lambda";
// import dotenv from "dotenv";
// import path from "path";
import axios, { AxiosResponse } from "axios";
import { logger } from "./logger";

export const sftpSliftProcess: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) => {
  const test = "string";
  // Call ATS service's webhook that handles fulfilment data (lsp-adapter for now) and send JSON.
  const axiosReq = axios.create({
    baseURL: process.env.SLIFT_PROCESS_FILE_URL,
    timeout: 3000,
    // headers: {
    //   Authorization: "Bearer " + PAYLOAD_API_BEARER_TOKEN,
    // },
  });
  try {
    const podRes: AxiosResponse = await axiosReq.post(
      process.env.SLIFT_PROCESS_FILE_PATH
    );
    console.log(process.env.SLIFT_PROCESS_FILE_URL);
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: "Processing complete",
        data: podRes,
      }),
    };
    return callback(null, response);
  } catch (err) {
    let data;
    if (err.response?.data) {
      data = err.response?.data;
      logger.error(err.response?.data);
    } else {
      logger.error(err);
    }
    const response = {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error occurred while calling API to process decrypted files.",
        data: data,
      }),
    };
    return callback(null, response);
  }
};
