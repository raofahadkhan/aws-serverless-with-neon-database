import { Client, Pool } from "pg";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const client = new Client(process.env.DATABASE_URL);
  client.connect();
  const { first_name, last_name, age, isStudent } = JSON.parse(event.body!);

  if (!first_name || !last_name || !age || !isStudent) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "required credentials are missing" }),
    };
  }

  try {
    await client.query(
      `INSERT INTO USERS (first_name, last_name, age, isStudent) VALUES ($1, $2, $3, $4);`,
      [first_name, last_name, age, isStudent]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "user data added successfully" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error }),
    };
  }
};

