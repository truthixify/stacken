import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@micro-stacks/react';
import Layout from '../components/Layout';
import { getDehydratedStateFromSession } from '../common/session-helpers';
import { ArrowRight, Trophy, Users, Zap, Star, Plus } from 'lucide-react';

// Utility function to strip HTML tags
const stripHtml = (html: string) => {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
};

import type { NextPage, GetServerSidePropsContext } from 'next';

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      dehydratedState: await getDehydratedStateFromSession(ctx),
    },
  };
}

interface Campaign {
  _id: string;
  title: string;
  summary?: string;
  description: string;
  category: string;
  status: string;
  totalParticipants: number;
  totalPoints: number;
  startTime: string;
  endTime: string;
  creatorAddress: string;
  imageUrl?: string;
}

const AppPage: NextPage = () => {
  const { isSignedIn, openAuthRequest } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalUsers: 0,
    totalRewards: 0,
  });

  useEffect(() => {
    fetchFeaturedCampaigns();
    fetchStats();
  }, []);

  const fetchFeaturedCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns?limit=6');
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
        totalRewards: 50000,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isSignedIn) {
    return (
      <Layout title="Stacken Rewards App">
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="text-primary-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">
              Connect your Stacks wallet to access campaigns, create rewards, and manage your
              community.
            </p>
            <button
              onClick={openAuthRequest}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              Connect Wallet
            </button>
            <Link href="/">
              <a className="block mt-4 text-primary-600 hover:text-primary-700">
                ← Back to Homepage
              </a>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Stacken Rewards App">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Stacken</h1>
            <p className="text-gray-600">
              Create campaigns, reward your community, and track your impact
            </p>
          </div>
          <Link href="/campaigns/create">
            <a className="mt-4 md:mt-0 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center">
              <Plus className="mr-2" size={16} />
              Create Campaign
            </a>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Trophy className="text-primary-600" size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalCampaigns}+</h3>
                <p className="text-gray-600">Active Campaigns</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                <Users className="text-secondary-600" size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalUsers}+</h3>
                <p className="text-gray-600">Community Members</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Zap className="text-yellow-600" size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.totalRewards.toLocaleString()}
                </h3>
                <p className="text-gray-600">Rewards Distributed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/campaigns/create">
            <a className="bg-primary-600 text-white p-4 rounded-lg hover:bg-primary-700 transition-colors text-center">
              <Plus className="mx-auto mb-2" size={24} />
              <span className="block font-semibold">Create Campaign</span>
            </a>
          </Link>
          <Link href="/campaigns">
            <a className="bg-white border border-gray-200 text-gray-900 p-4 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <Trophy className="mx-auto mb-2" size={24} />
              <span className="block font-semibold">Browse Campaigns</span>
            </a>
          </Link>
          <Link href="/dashboard">
            <a className="bg-white border border-gray-200 text-gray-900 p-4 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <Users className="mx-auto mb-2" size={24} />
              <span className="block font-semibold">My Dashboard</span>
            </a>
          </Link>
          <Link href="/leaderboard">
            <a className="bg-white border border-gray-200 text-gray-900 p-4 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <Star className="mx-auto mb-2" size={24} />
              <span className="block font-semibold">Leaderboard</span>
            </a>
          </Link>
        </div>

        {/* Active Campaigns */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Active Campaigns</h2>
            <Link href="/campaigns">
              <a className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center">
                View All
                <ArrowRight className="ml-1" size={16} />
              </a>
            </Link>
          </div>

          {campaigns.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active campaigns</h3>
              <p className="text-gray-600 mb-4">
                Be the first to create a campaign and start rewarding your community!
              </p>
              <Link href="/campaigns/create">
                <a className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center">
                  <Plus className="mr-2" size={16} />
                  Create Campaign
                </a>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map(campaign => (
                <div
                  key={campaign._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden card-hover"
                >
                  {campaign.imageUrl && (
                    <div className="h-48 bg-gray-200">
                      <img
                        src={campaign.imageUrl}
                        alt={campaign.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {campaign.category}
                      </span>
                      <span
                        className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(
                          campaign.status
                        )}`}
                      >
                        {campaign.status}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                      {campaign.title}
                    </h3>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {campaign.summary || stripHtml(campaign.description)}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Users size={16} className="mr-1" />
                        <span>{campaign.totalParticipants} participants</span>
                      </div>
                      <div className="flex items-center">
                        <Star size={16} className="mr-1" />
                        <span>{campaign.totalPoints} points</span>
                      </div>
                    </div>

                    <Link href={`/campaigns/${campaign._id}`}>
                      <a className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors text-center block">
                        View Campaign
                      </a>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AppPage;
