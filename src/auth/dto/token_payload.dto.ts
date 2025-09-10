export class TokenPayloadDto {
  id: string;
  name: string;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
}
