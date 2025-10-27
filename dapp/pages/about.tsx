import React from 'react';
import Layout from '../components/Layout';
import { Shield, Zap, Users, Trophy, ArrowRight } from 'lucide-react';

import type { NextPage } from 'next';

const About: NextPage = () => {
  return (
    <Layout title="Our Mission — Stacken">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Building the Future Together</h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Where builders meet bounties. Create missions, reward amazing work, and grow your
            community on the Stacks blockchain.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-gray-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-200 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-200 mb-4">
              We empower creators and builders by offering transparent rewards for real
              contributions. Every mission is backed by smart contracts on Stacks, ensuring fairness
              and trust.
            </p>
            <p className="text-lg text-gray-200">
              Participants earn points equivalent to the reward amount — points that can be used for
              future incentives, recognition, and access to exclusive community benefits.
            </p>
          </div>
        </div>
      </section>

      {/* Why Stacken Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-200 mb-6">Why Stacken?</h2>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto mb-8">
            Stacken isn’t just another bounty platform. We combine security, transparency, and
            community-driven incentives to reward amazing work in code, content, and creative
            projects.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <Shield className="mx-auto mb-2 text-orange-600" size={32} />
              <h3 className="text-xl font-semibold text-gray-200 mb-2">Transparent & Secure</h3>
              <p className="text-gray-200">
                All rewards are locked in smart contracts on Stacks — no middlemen, no disputes.
              </p>
            </div>
            <div className="text-center">
              <Zap className="mx-auto mb-2 text-blue-600" size={32} />
              <h3 className="text-xl font-semibold text-gray-200 mb-2">Instant Rewards</h3>
              <p className="text-gray-200">
                Winners are automatically paid crypto rewards — fast, fair, and reliable.
              </p>
            </div>
            <div className="text-center">
              <Users className="mx-auto mb-2 text-green-600" size={32} />
              <h3 className="text-xl font-semibold text-gray-200 mb-2">Community Driven</h3>
              <p className="text-gray-200">
                Builders earn points and recognition, fueling future opportunities and growth.
              </p>
            </div>
            <div className="text-center">
              <Trophy className="mx-auto mb-2 text-purple-600" size={32} />
              <h3 className="text-xl font-semibold text-gray-200 mb-2">Own Your Success</h3>
              <p className="text-gray-200">
                Your wallet holds your rewards, achievements, and reputation — always under your
                control.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How Points Work */}
      <section className="py-16 bg-gray-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-200 mb-6">Points & Rewards</h2>
          <p className="text-lg text-gray-200 mb-4 max-w-3xl mx-auto">
            Every participant earns points equal to the reward amount. Points accumulate over time
            and unlock future incentives, exclusive missions, and community recognition.
          </p>
          <p className="text-lg text-gray-200 max-w-3xl mx-auto">
            It's our way of rewarding consistent contributions and building a thriving ecosystem
            where everyone benefits.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Building?</h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of builders earning crypto rewards and points for amazing work
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
