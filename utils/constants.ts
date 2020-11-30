/**
 * Decrypt and Encrypt Java Lambdas can be invoked directly so there's
 * no need to use rest invoker to invoke them through Rest requests.
 */
export enum SftpFunctions {
  SFTP_PULL = "Pulling files from SFTP",
  //   SFTP_DECRYPT,
  SFTP_PROCESS = "Processing decrypted files",
  SFTP_GENERATE_POD = "Generating ePOD files",
  //   SFTP_ENCRYPT,
  SFTP_PUSH = "Pushing generated files to SFTP",
}
