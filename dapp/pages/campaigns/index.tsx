import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@micro-stacks/react';
import Layout from '../../components/Layout';
import { Search, Calendar, Users, Star, ArrowRight } from 'lucide-react';
import { getDehydratedStateFromSession } from '../../common/session-helpers';

const stripHtml = (html: string) =>
  html ? html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() : '';

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

const CampaignsPage: NextPage = () => {
  const { isSignedIn } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const categories = ['DeFi', 'NFT', 'Gaming', 'Social', 'Education', 'Community'];

  useEffect(() => {
    fetchCampaigns();
  }, [selectedCategory, selectedStatus]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedStatus) params.append('status', selectedStatus);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/campaigns?${params.toString()}`);
      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCampaigns();
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-900/40 text-green-400';
      case 'DRAFT':
        return 'bg-gray-800/50 text-gray-400';
      case 'COMPLETED':
        return 'bg-blue-900/40 text-blue-400';
      case 'CANCELLED':
        return 'bg-red-900/40 text-red-400';
      default:
        return 'bg-gray-800/50 text-gray-400';
    }
  };

  return (
    <Layout title="Browse Campaigns - Stacken Rewards">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-white">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold mb-2">Browse Campaigns</h1>
            <p className="text-white/60">
              Discover and join reward campaigns from the community
            </p>
          </div>
          {isSignedIn && (
            <Link href="/campaigns/create">
              <a className="mt-4 md:mt-0 bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-700 transition inline-flex items-center">
                <span>Create Campaign</span>
                <ArrowRight className="ml-2" size={16} />
              </a>
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-[#0B0B0F]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="md:col-span-2">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700/20 border border-white/10 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </form>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-gray-700/20 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-4 py-2 bg-gray-700/20 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Campaigns Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-700/20 rounded-2xl border border-white/10 p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-800 rounded mb-4"></div>
                <div className="h-6 bg-gray-800 rounded mb-2"></div>
                <div className="h-4 bg-gray-800 rounded mb-4"></div>
                <div className="h-4 bg-gray-800 rounded"></div>
              </div>
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12 text-white/80">
            <div className="w-24 h-24 bg-gray-700/20 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-white/40" size={32} />
            </div>
            <h3 className="text-lg font-medium mb-2">No campaigns found</h3>
            <p className="text-white/50 mb-6">
              Try adjusting your search criteria or create a new campaign.
            </p>
            {isSignedIn && (
              <Link href="/campaigns/create">
                <a className="bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-700 transition inline-flex items-center">
                  Create Campaign
                  <ArrowRight className="ml-2" size={16} />
                </a>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map(campaign => (
              <div
                key={campaign._id}
                className="bg-gray-700/20 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl transition hover:border-orange-500/40 hover:shadow-lg hover:shadow-orange-500/10"
              >
                {campaign.imageUrl && (
                  <div className="h-48 bg-gray-800">
                    <img
                      src={campaign.imageUrl}
                      alt={campaign.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-orange-900/40 text-orange-400 text-xs font-medium px-2.5 py-0.5 rounded-full">
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

                  <h3 className="text-xl font-semibold text-white mb-2 line-clamp-1">
                    {campaign.title}
                  </h3>

                  <p className="text-white/60 mb-4 line-clamp-2">
                    {campaign.summary || stripHtml(campaign.description)}
                  </p>

                  <div className="flex items-center justify-between text-sm text-white/50 mb-4">
                    <div className="flex items-center">
                      <Users size={16} className="mr-1 text-white/40" />
                      <span>{campaign.totalParticipants} participants</span>
                    </div>
                    <div className="flex items-center">
                      <Star size={16} className="mr-1 text-white/40" />
                      <span>{campaign.totalPoints} points</span>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-white/50 mb-4">
                    <Calendar size={16} className="mr-1 text-white/40" />
                    <span>Ends {formatDate(campaign.endTime)}</span>
                  </div>

                  <Link href={`/campaigns/${campaign._id}`}>
                    <a className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition text-center block">
                      View Campaign
                    </a>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CampaignsPage;