export const handler = async (event: any): Promise<any> => {
  console.log("lambda authorizer event", event);
  const token = event.headers.Authorization || event.headers.authorization;

  let response: any = {
    isAuthorized: false,
  };

  if (token === "secret_token") {
    response = {
      isAuthorized: true,
      context: {
        user: "raofahad046@gmail.com",
      },
    };
    console.log("user is authorized");
  }

  return response;
};
