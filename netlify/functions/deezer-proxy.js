exports.handler = async function (event, context) {
  const endpoint = event.queryStringParameters.endpoint;

  if (!endpoint) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing endpoint parameter" }),
    };
  }

  try {
    const response = await fetch(`https://api.deezer.com/${endpoint}`);
    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch from Deezer" }),
    };
  }
};
