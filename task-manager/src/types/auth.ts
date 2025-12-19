export declare namespace Auth {
    type JwtPayload = {
      userId: number;
      name: string;
      email: string;
      iat: number;
      exp: number;
    };
  }