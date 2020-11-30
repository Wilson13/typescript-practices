import { Handler, APIGatewayProxyResult, Context } from "aws-lambda";
import { RestController } from "./controller/rest_controller";
import { SftpFunctions } from "./utils/constants";

const restController = new RestController();

export const sftpProcessFiles: Handler = async (
  event: unknown,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  context?: Context
): Promise<APIGatewayProxyResult> => {
  // Call Rest Controller with the corresponding enum so the
  // invoke function will use the correct URL endpoints.
  return await restController.invoke(event, SftpFunctions.SFTP_PROCESS);
};

export const sftpGeneratePod: Handler = async (
  event: unknown,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  context?: Context
): Promise<APIGatewayProxyResult> => {
  // Call Rest Controller with the corresponding enum so the
  // invoke function will use the correct URL endpoints.
  return await restController.invoke(event, SftpFunctions.SFTP_GENERATE_POD);
};
