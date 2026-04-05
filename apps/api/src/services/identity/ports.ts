/** Registo interno de utilizador (inclui segredo de verificação de palavra-passe). */
export type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
};

/** Dados públicos do utilizador autenticado (sem segredos). */
export type PublicUser = {
  id: string;
  email: string;
};

export interface IUserReader {
  findByEmail(email: string): Promise<UserRecord | undefined>;
  findById(id: string): Promise<UserRecord | undefined>;
}

export interface IPasswordVerifier {
  verify(plainText: string, passwordHash: string): Promise<boolean>;
}
