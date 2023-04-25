const sendResp = (
  message: string,
  data: object,
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
