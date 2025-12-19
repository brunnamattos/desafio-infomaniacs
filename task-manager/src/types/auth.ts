export declare namespace Auth {
  type JwtPayload = {
    userId: number;
    name: string;
    email: string;
    iat: number;
    exp: number;
  };

  export type User = {
    id: number;
    name: string;
    email: string;
  };

  export type RegisterResponse = {
    message: string;
    user: User;
  };

  export type LoginResponse = {
    token: string;
    user: User;
  };
}
