import React from 'react';
import Layout from '../components/Layout';
import { getDehydratedStateFromSession } from '../common/session-helpers';
import { Shield, Zap, Users, Trophy, ArrowRight } from 'lucide-react';

import type { NextPage, GetServerSidePropsContext } from 'next';

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      dehydratedState: await getDehydratedStateFromSession(ctx),
    },
  };
}

const About: NextPage = () => {
  return (
    <Layout title="Our Mission — Stacken">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Building the Future Together</h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Where builders meet bounties. Create missions, reward amazing work, and grow your
            community on Stacks blockchain.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-200 mb-6">Why We're Here</h2>
            <p className="text-lg text-gray-200 mb-8">
              Great work deserves great rewards. We're building a platform where creators launch
              bounty missions, builders showcase their skills, and everyone gets rewarded fairly
              through transparent smart contracts.
            </p>
            <p className="text-lg text-gray-200">
              Powered by Stacks blockchain, we bring Bitcoin's security together with smart contract
              flexibility to create the most trusted bounty platform in Web3.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-200 mb-4">
              Built on Bitcoin's Foundation
            </h2>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Stacks brings smart contracts to Bitcoin — giving you the security you trust with the
              flexibility you need
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-orange-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-200 mb-2">Unbreakable Security</h3>
              <p className="text-gray-200">
                Your bounties are protected by Bitcoin's battle-tested security — the most secure
                blockchain ever built
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-200 mb-2">Lightning Fast</h3>
              <p className="text-gray-200">
                Quick transactions, low fees — focus on building instead of waiting for
                confirmations
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-200 mb-2">Builder-First</h3>
              <p className="text-gray-200">
                Clarity smart contracts are readable, predictable, and designed for developers who
                ship
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-200 mb-2">You Own It All</h3>
              <p className="text-gray-200">
                Your wallet, your rewards, your choice — no middlemen, no gatekeepers, just pure
                ownership
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-200 mb-4">
              Ready to Start Building?
            </h2>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Three simple steps to launch bounties and start earning rewards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600/80 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-200 mb-2">Launch Your Mission</h3>
              <p className="text-gray-200">
                Create bounty challenges with custom tasks, reward pools, and smart contract rules
                that work for you
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600/80 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-200 mb-2">Builders Join In</h3>
              <p className="text-gray-200">
                Talented creators tackle your challenges — from code contributions to content
                creation and beyond
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600/80 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-200 mb-2">Everyone Gets Paid</h3>
              <p className="text-gray-200">
                Smart contracts automatically distribute crypto rewards to winners — transparent,
                fair, and instant
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-200 mb-4">
              Built by Builders, for Builders
            </h2>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              We're developers who got tired of unfair reward systems. So we built something better
              — open source, community-driven, and completely transparent.
            </p>
          </div>

          <div className="bg-gray-700/20 rounded-lg shadow-sm border border-gray-600/20 p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-200 mb-4">Open Source & Proud of It</h3>
            <p className="text-gray-200 mb-6">
              Every line of code is public on GitHub. Want to contribute? Found a bug? Have an idea?
              Jump in — this platform belongs to the community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://github.com/stacken-rewards"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800/80 text-white px-6 py-3 rounded-lg hover:bg-gray-700/80 transition-colors inline-flex items-center justify-center"
              >
                Check Out the Code
                <ArrowRight className="ml-2" size={16} />
              </a>
              <a
                href="https://discord.gg/stacken"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-gray-600/20 text-gray-200 px-6 py-3 rounded-lg hover:bg-gray-600/20 transition-colors inline-flex items-center justify-center"
              >
                Join Our Community
                <ArrowRight className="ml-2" size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Building?</h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of builders earning crypto rewards for amazing work
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/missions"
              className="bg-primary-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center justify-center"
            >
              Find Your Next Mission
              <ArrowRight className="ml-2" size={20} />
            </a>
            <a
              href="/missions/create"
              className="border border-gray-300/20 text-white px-8 py-4 rounded-lg hover:bg-gray-300/20 hover:text-white transition-colors inline-flex items-center justify-center"
            >
              Launch a Bounty
              <ArrowRight className="ml-2" size={20} />
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
