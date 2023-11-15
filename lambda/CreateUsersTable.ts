import { Client } from "pg";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const client = new Client(process.env.DATABASE_URL);
  client.connect();

  try {
    await client.query(`
          CREATE TABLE USERS (
            id SERIAL PRIMARY KEY,
            first_name VARCHAR(255) NOT NULL,
            last_name VARCHAR(255) NOT NULL,
            age INT,
            isStudent BOOLEAN
        );
    `);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Table Created Successfully" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error }),
    };
  }
};
