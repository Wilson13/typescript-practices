import { APIGatewayProxyResult, Context } from "aws-lambda";
import axios, { AxiosResponse } from "axios";
import { SftpFunctions } from "../utils/constants";
import { logger } from "../utils/logger";

export class RestController {
  invokeFunction: SftpFunctions;
  constructor() {
    this.invokeFunction;
  }
  /**
   * Invoke function
   * @param {*} event
   */
  async invoke(
    event: unknown,
    invokeFunc: SftpFunctions,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context?: Context
  ): Promise<APIGatewayProxyResult> {
    this.invokeFunction = invokeFunc;
    logger.debug(`invokeFunction: ${this.invokeFunction}`);

    let apiURL: string, apiPath: string;

    switch (this.invokeFunction) {
      case SftpFunctions.SFTP_PULL:
        apiURL = process.env.SLIFT_PULL_FILE_URL;
        apiPath = process.env.SLIFT_PULL_FILE_PATH;
        break;
      case SftpFunctions.SFTP_PROCESS:
        apiURL = process.env.SLIFT_PROCESS_FILE_URL;
        apiPath = process.env.SLIFT_PROCESS_FILE_PATH;
        break;
      case SftpFunctions.SFTP_GENERATE_POD:
        apiURL = process.env.SLIFT_GENERATE_POD_URL;
        apiPath = process.env.SLIFT_GENERATE_POD_PATH;
        break;
      case SftpFunctions.SFTP_PUSH:
        apiURL = process.env.SLIFT_PUSH_FILE_URL;
        apiPath = process.env.SLIFT_PUSH_FILE_PATH;
        break;
    }

    // Call ATS service's webhook that handles fulfilment data (lsp-adapter for now) and send JSON.
    const axiosReq = axios.create({
      baseURL: apiURL,
      timeout: 600000,
      // headers: {
      //   Authorization: "Bearer " + PAYLOAD_API_BEARER_TOKEN,
      // },
    });
    try {
      const podRes: AxiosResponse = await axiosReq.post(apiPath);

      const response = {
        statusCode: 200,
        body: JSON.stringify({
          message: this.invokeFunction,
          apiResponse: podRes.data,
        }),
      };
      return response;
    } catch (err) {
      logger.error(err);
      let apiResponse;
      if (err.response?.data) {
        apiResponse = err.response?.data;
        logger.error(err.response?.data);
      } else {
        logger.error(err);
      }
      const response = {
        statusCode: 500,
        body: JSON.stringify({
          message: `Error occurred while calling API to perform following action: ${this.invokeFunction}`,
          apiResponse: apiResponse,
        }),
      };
      return response;
    }
  }
}
