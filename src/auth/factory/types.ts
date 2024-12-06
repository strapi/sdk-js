import type { AuthProvider } from '../providers';

export type AuthProviderCreator<T = any> = (options: T) => AuthProvider;

export type AuthProviderMap = { [key: string]: AuthProviderCreator };

export type CreateAuthProviderParams<
  T_Providers extends AuthProviderMap,
  T_Strategy extends StringKeysOf<T_Providers>,
> = T_Providers[T_Strategy] extends AuthProviderCreator<infer T_Options> ? T_Options : unknown;
