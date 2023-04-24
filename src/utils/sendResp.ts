const sendResp = (
  message: string,
  data: object,
  accessToken?: string,
  statusCode = 200,
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
