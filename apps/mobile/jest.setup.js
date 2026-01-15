/* eslint-env jest */
/* global jest */
// Mock Expo Router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Link: "Link",
}));

// Mock React Native SafeArea Context
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }) => <>{children}</>,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock Appwrite
jest.mock("react-native-appwrite", () => ({
  Client: jest.fn().mockImplementation(() => ({
    setEndpoint: jest.fn().mockReturnThis(),
    setProject: jest.fn().mockReturnThis(),
    setPlatform: jest.fn().mockReturnThis(),
  })),
  Account: jest.fn().mockImplementation(() => ({
    create: jest.fn(),
    createEmailPasswordSession: jest.fn(),
    deleteSessions: jest.fn(),
    get: jest.fn(),
  })),
  Databases: jest.fn(),
  ID: {
    unique: jest.fn().mockReturnValue("unique-id"),
  },
}));

// Mock Expo Vector Icons
jest.mock("@expo/vector-icons", () => ({
  MaterialCommunityIcons: "Icon",
  Ionicons: "Icon",
}));
