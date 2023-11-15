import { Client } from "pg";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const client = new Client(process.env.DATABASE_URL);
  client.connect();

  try {
    const result = await client.query(`SELECT * FROM USERS`);

    return {
      statusCode: 200,
      body: JSON.stringify({ data: result.rows }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error }),
    };
  }
};
