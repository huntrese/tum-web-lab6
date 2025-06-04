export interface User {
  user: {
    name: string;
    email: string;
  };
  authorization?: {
    token: string;
    type: string;
  };
}
