import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@micro-stacks/react';
import Layout from '../../components/Layout';
import { Search, Calendar, Users, Star, ArrowRight } from 'lucide-react';
import UserAvatar from '../../components/UserAvatar';
import LikeButton from '../../components/LikeButton';
import { getDehydratedStateFromSession } from '../../common/session-helpers';
import { stripHtml } from '../../lib/textUtils';

import type { NextPage, GetServerSidePropsContext } from 'next';

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      dehydratedState: await getDehydratedStateFromSession(ctx),
    },
  };
}

interface Mission {
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
  creator?: {
    username?: string;
    displayName?: string;
    avatar?: string;
  };
  imageUrl?: string;
}

const MissionsPage: NextPage = () => {
  const { isSignedIn } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const categories = ['DeFi', 'NFT', 'Gaming', 'Social', 'Education', 'Community'];

  useEffect(() => {
    fetchMissions();
  }, [selectedCategory, selectedStatus]);

  const fetchMissions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedStatus) params.append('status', selectedStatus);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/missions?${params.toString()}`);
      const data = await response.json();
      setMissions(data.missions || []);
    } catch (error) {
      console.error('Error fetching missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMissions();
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
    <Layout title="Discover Missions — Stacken">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-white">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold mb-2">Discover Active Missions</h1>
            <p className="text-white/60">
              Find bounty challenges that match your skills and start earning crypto
            </p>
          </div>
          {isSignedIn && (
            <Link href="/missions/create">
              <a className="mt-4 md:mt-0 bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-700 transition inline-flex items-center">
                <span>Launch a Bounty</span>
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
                  placeholder="Search missions, creators, or bounty tags..."
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
              <option value="">All Mission Types</option>
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
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Missions Grid */}
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
        ) : missions.length === 0 ? (
          <div className="text-center py-12 text-white/80">
            <div className="w-24 h-24 bg-gray-700/20 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-white/40" size={32} />
            </div>
            <h3 className="text-lg font-medium mb-2">No missions found</h3>
            <p className="text-white/50 mb-6">
              Try different search terms or be the first to launch a bounty challenge.
            </p>
            {isSignedIn && (
              <Link href="/missions/create">
                <a className="bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-700 transition inline-flex items-center">
                  Launch Your Bounty
                  <ArrowRight className="ml-2" size={16} />
                </a>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {missions.map(mission => (
              <div
                key={mission._id}
                className="bg-gray-700/20 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl transition hover:border-orange-500/40 hover:shadow-lg hover:shadow-orange-500/10"
              >
                {mission.imageUrl && (
                  <div className="h-48 bg-gray-800">
                    <img
                      src={mission.imageUrl}
                      alt={mission.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-orange-900/40 text-orange-400 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {mission.category}
                    </span>
                    <span
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(
                        mission.status
                      )}`}
                    >
                      {mission.status}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-2 line-clamp-1">
                    {mission.title}
                  </h3>

                  <p className="text-white/60 mb-4 line-clamp-2">
                    {mission.summary || stripHtml(mission.description)}
                  </p>

                  <div className="flex items-center justify-between text-sm text-white/50 mb-4">
                    <div className="flex items-center">
                      <Users size={16} className="mr-1 text-white/40" />
                      <span>{mission.totalParticipants} builders joined</span>
                    </div>
                    <div className="flex items-center">
                      <Star size={16} className="mr-1 text-white/40" />
                      <span>{mission.totalPoints} reward pool</span>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-white/50 mb-4">
                    <Calendar size={16} className="mr-1 text-white/40" />
                    <span>Ends {formatDate(mission.endTime)}</span>
                  </div>

                  {/* Creator and Like */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <UserAvatar
                        userAddress={mission.creatorAddress}
                        avatar={mission.creator?.avatar}
                        displayName={mission.creator?.displayName || mission.creator?.username}
                        size={24}
                      />
                      <span className="text-sm text-white/60">
                        {mission.creator?.displayName ||
                          mission.creator?.username ||
                          `${mission.creatorAddress.slice(0, 6)}...${mission.creatorAddress.slice(
                            -4
                          )}`}
                      </span>
                    </div>
                    <LikeButton
                      targetType="MISSION"
                      targetId={mission._id}
                      showCount={false}
                      className="text-sm"
                    />
                  </div>

                  <Link href={`/missions/${mission._id}`}>
                    <a className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition text-center block">
                      Join Mission
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

export default MissionsPage;
