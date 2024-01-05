import type { AuthOptions, User } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { bcryptCompare } from './bcrypt-compare';
import { checkIfUserExists } from './check-if-user-exists';
import { createUser } from './create-user/sign-up';
import { getUserFromApi } from './get-user-from-api';
import { UserTemplate } from './types';

export const authConfig: AuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'email', type: 'email', required: true },
        password: {
          label: 'password',
          type: 'password',
          required: true,
        },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials) return null;

        const { email: emailInput, password: passwordInput } =
          credentials;

        const apiUser = await getUserFromApi(emailInput);

        if (!apiUser) {
          throw new Error('Email not registered!');
        }

        const {
          id: apiUserId,
          email: apiUserEmail,
          password_hash: apiUserPasswordHash,
        } = apiUser;

        const isPasswordCorrect = await bcryptCompare(
          passwordInput,
          apiUserPasswordHash
        );

        if (!isPasswordCorrect) {
          throw new Error('Password is not correct!');
        }

        const user: User = {
          id: apiUserId,
          email: apiUserEmail,
        };

        return user;
      },
    }),
  ],
  callbacks: {
    async signIn(props) {
      const { account, user } = props;

      if (!account || !user) return false;

      const { email } = user;

      if (!email) return false;

      const userExists = await checkIfUserExists(email);

      if (userExists) return true;

      const userTemplate: UserTemplate = {
        email,
        password: '',
      };

      const userIsWrittenToApi = await createUser(userTemplate);

      return userIsWrittenToApi;
    },
    async jwt(props) {
      const { token, user, account } = props;

      if (!account || !user) return token;

      return {
        ...token,
        accessToken: account.access_token,
      };
    },
    async session(props) {
      const { session: oldSession, token } = props;

      if (!oldSession) return oldSession;

      const newSession = {
        ...oldSession,
        access_token: token.jti,
      };

      return newSession;
    },
  },
  pages: {
    signIn: '/sign-in',
  },
};
