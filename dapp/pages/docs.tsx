import React from 'react';
import Layout from '../components/Layout';
import { getDehydratedStateFromSession } from '../common/session-helpers';
import { Book, Code, ExternalLink, ArrowRight } from 'lucide-react';

import type { NextPage, GetServerSidePropsContext } from 'next';

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      dehydratedState: await getDehydratedStateFromSession(ctx),
    },
  };
}

const Docs: NextPage = () => {
  const sections = [
    {
      title: 'Getting Started',
      description: 'Learn the basics of creating and participating in campaigns',
      items: [
        { title: 'What is Stacken Rewards?', href: '#what-is-stacken' },
        { title: 'Connecting Your Wallet', href: '#connect-wallet' },
        { title: 'Your First Campaign', href: '#first-campaign' },
        { title: 'Earning Points', href: '#earning-points' },
      ],
    },
    {
      title: 'Campaign Creation',
      description: 'Comprehensive guide to creating effective reward campaigns',
      items: [
        { title: 'Campaign Types', href: '#campaign-types' },
        { title: 'Setting Up Activities', href: '#activities' },
        { title: 'Reward Distribution', href: '#rewards' },
        { title: 'Best Practices', href: '#best-practices' },
      ],
    },
    {
      title: 'Smart Contracts',
      description: 'Technical documentation for developers',
      items: [
        { title: 'Factory Contract', href: '#factory-contract' },
        { title: 'Campaign Contract', href: '#campaign-contract' },
        { title: 'Points System', href: '#points-system' },
        { title: 'Integration Guide', href: '#integration' },
      ],
    },
    {
      title: 'API Reference',
      description: 'REST API endpoints and usage examples',
      items: [
        { title: 'Authentication', href: '#api-auth' },
        { title: 'Campaigns API', href: '#api-campaigns' },
        { title: 'Users API', href: '#api-users' },
        { title: 'Activities API', href: '#api-activities' },
      ],
    },
  ];

  return (
    <Layout title="Documentation - Stacken Rewards">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Documentation</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about using and building with Stacken Rewards
          </p>
        </div>

        {/* Quick Links */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-primary-900 mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="#getting-started"
              className="flex items-center text-primary-700 hover:text-primary-900 transition-colors"
            >
              <Book className="mr-2" size={16} />
              <span>Getting Started Guide</span>
            </a>
            <a
              href="#api-reference"
              className="flex items-center text-primary-700 hover:text-primary-900 transition-colors"
            >
              <Code className="mr-2" size={16} />
              <span>API Reference</span>
            </a>
            <a
              href="https://github.com/stacken-rewards"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-primary-700 hover:text-primary-900 transition-colors"
            >
              <ExternalLink className="mr-2" size={16} />
              <span>GitHub Repository</span>
            </a>
          </div>
        </div>

        {/* Documentation Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sections.map((section, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                  <Book className="text-primary-600" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                  <p className="text-sm text-gray-600">{section.description}</p>
                </div>
              </div>

              <ul className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <a
                      href={item.href}
                      className="flex items-center justify-between text-gray-700 hover:text-primary-600 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span>{item.title}</span>
                      <ArrowRight size={16} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Content Sections */}
        <div className="mt-12 space-y-12">
          {/* What is Stacken */}
          <section
            id="what-is-stacken"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What is Stacken Rewards?</h2>
            <div className="prose max-w-none text-gray-700">
              <p>
                Stacken Rewards is a decentralized platform built on the Stacks blockchain that
                enables creators and communities to design, deploy, and manage reward campaigns. Our
                platform combines the security of Bitcoin with the flexibility of smart contracts to
                create transparent and trustless reward distribution systems.
              </p>
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Key Features:</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Create token-based or points-based reward campaigns</li>
                <li>Automated reward distribution through smart contracts</li>
                <li>Social media integration for community engagement</li>
                <li>Transparent and verifiable reward tracking</li>
                <li>Flexible activity types and requirements</li>
              </ul>
            </div>
          </section>

          {/* Connect Wallet */}
          <section
            id="connect-wallet"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connecting Your Wallet</h2>
            <div className="prose max-w-none text-gray-700">
              <p>
                To participate in campaigns or create your own, you'll need to connect a
                Stacks-compatible wallet:
              </p>
              <ol className="list-decimal list-inside space-y-2 mt-4">
                <li>Install a Stacks wallet (Hiro Wallet, Xverse, or Leather)</li>
                <li>Click "Connect Wallet" in the top navigation</li>
                <li>Select your preferred wallet and authorize the connection</li>
                <li>Your wallet address will appear in the navigation bar</li>
              </ol>
            </div>
          </section>

          {/* Campaign Types */}
          <section
            id="campaign-types"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Campaign Types</h2>
            <div className="prose max-w-none text-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Points Campaigns</h3>
              <p>
                Points campaigns reward participants with platform points that can be used for
                leaderboards, achievements, and future token distributions. These campaigns are
                ideal for community building and engagement.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Token Campaigns</h3>
              <p>
                Token campaigns distribute actual cryptocurrency tokens to participants. Campaign
                creators must deposit tokens upfront, which are then distributed automatically based
                on activity completion.
              </p>
            </div>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-gray-900 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Need More Help?</h2>
          <p className="text-gray-300 mb-6">
            Join our community for support, updates, and discussions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://discord.gg/stacken"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center justify-center"
            >
              Join Discord
              <ExternalLink className="ml-2" size={16} />
            </a>
            <a
              href="https://github.com/stacken-rewards"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-gray-600 text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center justify-center"
            >
              View on GitHub
              <ExternalLink className="ml-2" size={16} />
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Docs;
