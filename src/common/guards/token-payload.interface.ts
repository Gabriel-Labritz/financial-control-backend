export interface TokenPayloadInterface {
  id: number;
  nick_name: string;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
}
