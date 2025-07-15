export class TokenPayloadDto {
  id: number;
  nick_name: string;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
}
