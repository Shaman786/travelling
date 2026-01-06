import { Account, Client, ID } from "react-native-appwrite";
import "react-native-url-polyfill/auto";

// Appwrite Configuration from environment variables
const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!;
const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!;
const platform = process.env.EXPO_PUBLIC_APPWRITE_PLATFORM!;

// Initialize Client
const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setPlatform(platform);

// Initialize Account service
export const account = new Account(client);

// Export utilities
export { client, ID };
