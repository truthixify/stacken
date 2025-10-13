import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@micro-stacks/react';
import Layout from '../components/Layout';
import { getDehydratedStateFromSession } from '../common/session-helpers';
import { ArrowRight, Trophy, Users, Zap, Star } from 'lucide-react';

// Utility function to strip HTML tags
const stripHtml = (html: string) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
};

import type { NextPage, GetServerSidePropsContext } from 'next';

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      dehydratedState: await getDehydratedStateFromSession(ctx),
    },
  };
}

const Home: NextPage = () => {
  const { isSignedIn, openAuthRequest } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalUsers: 0,
    totalRewards: 0
  });

  useEffect(() => {
    // Fetch featured campaigns and stats
    fetchFeaturedCampaigns();
    fetchStats();
  }, []);

  const fetchFeaturedCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns?limit=3');
      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // This would be a dedicated stats endpoint
      setStats({
        totalCampaigns: 150,
        totalUsers: 2500,
        totalRewards: 50000
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <Layout title="Stacken Rewards - Decentralized Reward Campaigns">
      {/* Hero Section */}
      <section className="gradient-bg text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Reward Your Community
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                On Stacks Blockchain
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto">
              Create engaging reward campaigns, distribute tokens and points, 
              and build stronger connections with your community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/app">
                <a className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center">
                  Launch App
                  <ArrowRight className="ml-2" size={20} />
                </a>
              </Link>
              <Link href="/campaigns">
                <a className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors">
                  Browse Campaigns
                </a>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="text-primary-600" size={32} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.totalCampaigns}+</h3>
              <p className="text-gray-600">Active Campaigns</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-secondary-600" size={32} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.totalUsers}+</h3>
              <p className="text-gray-600">Community Members</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="text-yellow-600" size={32} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.totalRewards.toLocaleString()}</h3>
              <p className="text-gray-600">Rewards Distributed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Stacken?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built on Stacks blockchain for security, transparency, and true decentralization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm card-hover">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="text-primary-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Campaign Creation</h3>
              <p className="text-gray-600">
                Create reward campaigns in minutes with our intuitive interface. 
                No coding required.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm card-hover">
              <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-4">
                <Trophy className="text-secondary-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Flexible Rewards</h3>
              <p className="text-gray-600">
                Distribute tokens, points, or custom rewards. Set up automated 
                distribution rules.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm card-hover">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-green-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Engagement</h3>
              <p className="text-gray-600">
                Boost engagement with social tasks, achievements, and 
                leaderboards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      {campaigns.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Featured Campaigns</h2>
              <Link href="/campaigns">
                <a className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center">
                  View All
                  <ArrowRight className="ml-1" size={16} />
                </a>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.slice(0, 3).map((campaign: any) => (
                <div key={campaign._id} className="bg-white border border-gray-200 rounded-xl p-6 card-hover">
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {campaign.category}
                    </span>
                    <div className="flex items-center text-yellow-500">
                      <Star size={16} fill="currentColor" />
                      <span className="ml-1 text-sm text-gray-600">Featured</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{campaign.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{campaign.summary || stripHtml(campaign.description)}</p>
                  
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                    <span>{campaign.totalParticipants} participants</span>
                    <span>{campaign.totalPoints} points</span>
                  </div>
                  
                  <Link href={`/campaigns/${campaign._id}`}>
                    <a className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors text-center block">
                      Join Campaign
                    </a>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Reward Your Community?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of creators building engaged communities with Stacken Rewards.
          </p>
          {isSignedIn ? (
            <Link href="/campaigns/create">
              <a className="bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors inline-flex items-center">
                Create Your First Campaign
                <ArrowRight className="ml-2" size={20} />
              </a>
            </Link>
          ) : (
            <button
              onClick={openAuthRequest}
              className="bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors inline-flex items-center"
            >
              Connect Wallet to Start
              <ArrowRight className="ml-2" size={20} />
            </button>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Home;
