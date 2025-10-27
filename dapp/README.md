# Stacken + Next.js

This is a Next.js application that implements `@stacks/connect` for Stacks-based web3 authentication.
The application provides a seamless wallet connection experience with support for multiple Stacks wallets.

## Overview

In this example:

- Stacks.js related dependencies are installed
- Stacks wallet authentication is implemented
- Custom `useStacks` hook for wallet management
- `_app.tsx` handles auto-registration of users
- Client-side authentication with wallet selection popup

## Getting Started

First, create a new `.env.local` file:

```
# ⚠️ The SECRET_COOKIE_PASSWORD should never be inside your repository directly, it's here only to ease
# the example deployment
# For local development, you should store it inside a `.env.local` gitignored file
# See https://nextjs.org/docs/basic-features/environment-variables#loading-environment-variables

SECRET_COOKIE_PASSWORD=2gyZ3GDw3LHZQKDhPmPDL3sjREVRXPr8
```

Then install your dependencies:

```bash
pnpm i
# or
yarn
```

Then run the dev task:

```bash
pnpm dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed
on [http://localhost:3000/api/session/save](http://localhost:3000/api/session/save)
or [http://localhost:3000/api/session/destroy](http://localhost:3000/api/session/destroy). These endpoint can be found
in `pages/api/session/save.ts` and `pages/api/session/destroy.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated
as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Stacks.js:

- [Stacks.js Documentation](https://docs.stacks.co/stacks.js)
- [Connect Package](https://github.com/hirosystems/stacks.js/tree/main/packages/connect)
- [Authentication Guide](https://docs.stacks.co/build-apps/authentication)
- [Transaction Signing](https://docs.stacks.co/build-apps/transaction-signing)
- [Working with post conditions](https://docs.stacks.co/build-apps/transaction-signing#post-conditions)

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions
are welcome!

## Community

Stacken is built on Stacks, a Bitcoin layer that enables smart contracts and decentralized applications.

Learn more about Stacks at [stacks.co](https://www.stacks.co)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use
the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_mission=create-next-app-readme)
from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
