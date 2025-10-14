// this file is a wrapper with defaults to be used in both API routes and `getServerSideProps` functions
import type { IronSessionOptions } from 'iron-session';

// Use environment variable or fallback for development
const password =
  process.env.SECRET_COOKIE_PASSWORD ||
  'complex_password_at_least_32_characters_long_for_iron_session_security';

if (password.length < 32) {
  console.warn('SECRET_COOKIE_PASSWORD should be at least 32 characters long for security');
}

export const sessionOptions: IronSessionOptions = {
  password,
  cookieName: 'stacken-rewards-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

// This is where we specify the typings of req.session.*
declare module 'iron-session' {
  interface IronSessionData {
    dehydratedState?: string;
  }
}
