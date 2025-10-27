import * as Iron from 'iron-session';
import { sessionOptions } from './session';

import type { NextPageContext } from 'next';
import type { GetServerSidePropsContext } from 'next/types';
import type { NextApiRequest } from 'next';
import type { IncomingMessage, ServerResponse } from 'http';

export const getIronSession = (req: NextPageContext['req'], res: NextPageContext['res']) => {
  return Iron.getIronSession(req as IncomingMessage, res as ServerResponse, sessionOptions);
};

// No longer needed with Stacks.js - authentication is handled client-side
export const getDehydratedStateFromSession = async (ctx: GetServerSidePropsContext) => {
  return null;
};

export const getSession = async (req: NextApiRequest) => {
  try {
    const session = await Iron.getIronSession(req, {} as ServerResponse, sessionOptions);
    const dehydratedState = session.dehydratedState;

    if (!dehydratedState) {
      return null;
    }

    const parsed = JSON.parse(dehydratedState);

    // Extract stxAddress from various possible locations in the session
    const stxAddress =
      parsed.stxAddress ||
      parsed.accounts?.[0]?.address ||
      parsed.userData?.profile?.stxAddress ||
      parsed.userData?.identityAddress ||
      null;

    if (!stxAddress) {
      return null;
    }

    return {
      stxAddress,
      ...parsed,
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};
