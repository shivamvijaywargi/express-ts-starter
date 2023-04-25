const sendResp = (
  message: string,
  data: unknown,
  statusCode = 200,
  accessToken?: string,
) => {
  return {
    statusCode,
    success: true,
    message,
    data,
    accessToken: accessToken ? accessToken : undefined,
  };
};

export default sendResp;
