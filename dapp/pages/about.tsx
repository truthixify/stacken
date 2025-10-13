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
    <Layout title="About - Stacken Rewards">
      {/* Hero Section */}
      <section className="gradient-bg text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About Stacken Rewards
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
            Empowering communities through decentralized reward campaigns on the Stacks blockchain
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 mb-8">
              We believe in the power of community-driven growth. Stacken Rewards provides a 
              decentralized platform where creators can build engaging reward campaigns, 
              distribute meaningful incentives, and foster stronger connections with their communities.
            </p>
            <p className="text-lg text-gray-600">
              Built on the Stacks blockchain, we combine the security and transparency of Bitcoin 
              with the flexibility of smart contracts to create a truly decentralized rewards ecosystem.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Stacks Blockchain?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We chose Stacks for its unique approach to bringing smart contracts to Bitcoin
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-orange-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Bitcoin Security</h3>
              <p className="text-gray-600">
                Inherit Bitcoin's proven security model while enabling smart contract functionality
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast & Efficient</h3>
              <p className="text-gray-600">
                Low transaction costs and fast confirmation times for seamless user experience
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Developer Friendly</h3>
              <p className="text-gray-600">
                Clarity smart contracts are predictable, decidable, and easy to analyze
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">True Ownership</h3>
              <p className="text-gray-600">
                Users maintain full control of their assets and rewards through decentralization
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple steps to create and participate in reward campaigns
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Campaign</h3>
              <p className="text-gray-600">
                Set up your reward campaign with custom activities, point values, and distribution rules
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Participates</h3>
              <p className="text-gray-600">
                Users complete activities like social media tasks, referrals, or custom challenges
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Rewards Distributed</h3>
              <p className="text-gray-600">
                Automatic or manual distribution of tokens, points, or custom rewards to participants
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built for the Community
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stacken Rewards is an open-source project built by developers who believe in 
              the power of decentralized communities and fair reward distribution.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Open Source & Community Driven</h3>
            <p className="text-gray-600 mb-6">
              Our code is open source and available on GitHub. We welcome contributions, 
              feedback, and collaboration from the Stacks community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://github.com/stacken-rewards" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center justify-center"
              >
                View on GitHub
                <ArrowRight className="ml-2" size={16} />
              </a>
              <a 
                href="https://discord.gg/stacken" 
                target="_blank" 
                rel="noopener noreferrer"
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center justify-center"
              >
                Join Discord
                <ArrowRight className="ml-2" size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join the growing community of creators and participants building the future of rewards
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/campaigns"
              className="bg-primary-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center justify-center"
            >
              Browse Campaigns
              <ArrowRight className="ml-2" size={20} />
            </a>
            <a 
              href="/campaigns/create"
              className="border border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-gray-900 transition-colors inline-flex items-center justify-center"
            >
              Create Campaign
              <ArrowRight className="ml-2" size={20} />
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;