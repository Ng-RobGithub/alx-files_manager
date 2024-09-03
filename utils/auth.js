import pkg from 'mongodb'; // Import the entire mongodb package
const { ObjectId } = pkg; // Destructure ObjectId from the default import

// Function to get user from X-Token header
export const getUserFromXToken = async (req) => {
  const userToken = req.header('X-Token');
  if (!userToken) return null;

  const userId = await redisClient.get(`auth_${userToken}`);
  if (!userId) return null;

  const user = await dbClient.usersCollection().findOne({ _id: new ObjectId(userId) });
  return user;
};

// Function to get user from Authorization header (Basic Authentication)
export const getUserFromAuthorization = async (req) => {
  const authHeader = req.header('Authorization') || '';
  const [authType, authToken] = authHeader.split(' ');

  if (authType !== 'Basic' || !authToken) return null;

  const decodedToken = Buffer.from(authToken, 'base64').toString();
  const [email, password] = decodedToken.split(':');

  if (!email || !password) return null;

  const user = await dbClient.usersCollection().findOne({ email });
  if (!user || user.password !== password) return null;

  return user;
};
