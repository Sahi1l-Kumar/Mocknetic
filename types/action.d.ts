interface SignInWithOAuthParams {
  provider: "google";
  providerAccountId: string;
  user: {
    email: string;
    name: string;
    image: string;
    username: string;
  };
}

interface AuthCredentials {
  name: string;
  username: string;
  email: string;
  password: string;
}

interface CreateChatParams {
  title?: string;
  message: {
    sender: "user" | "ai";
    content: string;
    imageUrl?: string;
    detectedDisease?: string;
    timestamp?: Date;
  };
}

interface GetChatParams {
  chatId: string;
}

type AddMessageParams = {
  chatId: string;
  message: {
    sender: "user" | "ai";
    content: string;
    imageUrl?: string;
    detectedDisease?: string;
  };
};
