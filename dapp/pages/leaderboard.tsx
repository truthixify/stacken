import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { getDehydratedStateFromSession } from '../common/session-helpers';
import { Trophy, Medal, Award, TrendingUp, Users, Star, Crown } from 'lucide-react';
import UserAvatar from '../components/UserAvatar';

import type { NextPage, GetServerSidePropsContext } from 'next';

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      dehydratedState: await getDehydratedStateFromSession(ctx),
    },
  };
}

interface LeaderboardUser {
  _id: string;
  stacksAddress: string;
  username?: string;
  displayName?: string;
  avatar?: string;
  totalPoints: number;
  campaignsParticipated: number;
  campaignsWon: number;
  lastActiveAt: string;
  rank: number;
}

const Leaderboard: NextPage = () => {
  const router = useRouter();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPoints: 0,
    activeCampaigns: 0,
  });

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/leaderboard?timeframe=${timeframe}&limit=100`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);

        // Use stats from API
        setStats({
          totalUsers: data.stats?.totalUsers || data.users.length,
          totalPoints:
            data.stats?.totalPointsDistributed ||
            data.users.reduce((sum: number, user: LeaderboardUser) => sum + user.totalPoints, 0),
          activeCampaigns: data.stats?.activeCampaigns || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="text-yellow-500" size={24} />;
      case 2:
        return <Medal className="text-gray-400" size={24} />;
      case 3:
        return <Award className="text-amber-600" size={24} />;
      default:
        return <span className="text-lg font-bold text-gray-200">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
    if (rank <= 10) return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
    return 'bg-gray-100 text-gray-200';
  };

  const timeframes = [
    { value: 'all', label: 'All Time' },
    { value: 'month', label: 'This Month' },
    { value: 'week', label: 'This Week' },
  ];

  return (
    <Layout title="Leaderboard - Stacken Rewards">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-200 mb-4">🏆 Leaderboard</h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            See who's leading the pack in earning rewards and participating in campaigns
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-700/20 rounded-lg shadow-sm border border-gray-600/20 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-200">Total Participants</p>
                <p className="text-2xl font-bold text-gray-200">
                  {stats.totalUsers.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-700/20 rounded-lg shadow-sm border border-gray-600/20 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="text-green-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-200">Total Points Earned</p>
                <p className="text-2xl font-bold text-gray-200">
                  {stats.totalPoints.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-700/20 rounded-lg shadow-sm border border-gray-600/20 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Star className="text-purple-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-200">Active Campaigns</p>
                <p className="text-2xl font-bold text-gray-200">{stats.activeCampaigns}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeframe Filter */}
        <div className="bg-gray-700/20 rounded-lg shadow-sm border border-gray-600/20 p-6 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-200">Rankings</h2>
            <div className="flex space-x-2">
              {timeframes.map(tf => (
                <button
                  key={tf.value}
                  onClick={() => setTimeframe(tf.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeframe === tf.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-700/20 text-gray-200'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-gray-700/20 rounded-lg shadow-sm border border-gray-600/20 overflow-hidden">
          {loading ? (
            <div className="p-8">
              <div className="animate-pulse space-y-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 bg-gray-700/20">
              <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-200 mb-2">No participants yet</h3>
              <p className="text-gray-200">
                Be the first to participate in campaigns and earn points!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-600/20">
              {/* Top 3 Special Display */}
              {users.slice(0, 3).map((user, index) => (
                <div
                  key={user._id}
                  className={`p-6 ${
                    index === 0
                      ? 'bg-gradient-to-r from-yellow-50 to-amber-50'
                      : index === 1
                      ? 'bg-gradient-to-r from-gray-50 to-slate-50'
                      : 'bg-gradient-to-r from-amber-50 to-orange-50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">{getRankIcon(user.rank)}</div>

                    <div className="flex-shrink-0">
                      <UserAvatar
                        userAddress={user.stacksAddress}
                        avatar={user.avatar}
                        displayName={user.displayName || user.username}
                        size={64}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-200 truncate">
                          {user.displayName || user.username || formatAddress(user.stacksAddress)}
                        </h3>
                        {user.username && user.displayName && (
                          <span className="text-sm text-gray-400">@{user.username}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-200 mb-2">
                        {formatAddress(user.stacksAddress)}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-200">
                        <span>{user.campaignsParticipated} campaigns</span>
                        <span>{user.campaignsWon} wins</span>
                        <span>Last active {new Date(user.lastActiveAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${getRankBadge(
                          user.rank
                        )}`}
                      >
                        {user.totalPoints.toLocaleString()} pts
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Rank #{user.rank}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Rest of the users */}
              {users.slice(3).map(user => (
                <div
                  key={user._id}
                  className="p-4 hover:bg-gray-600/20 transition-colors cursor-pointer"
                  onClick={() => router.push(`/profile/${user.stacksAddress}`)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-8 text-center">
                      <span className="text-lg font-bold text-gray-200">#{user.rank}</span>
                    </div>

                    <div className="flex-shrink-0">
                      <UserAvatar
                        userAddress={user.stacksAddress}
                        avatar={user.avatar}
                        displayName={user.displayName || user.username}
                        size={48}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-base font-semibold text-gray-200 truncate">
                          {user.displayName || user.username || formatAddress(user.stacksAddress)}
                        </h3>
                        {user.username && user.displayName && (
                          <span className="text-sm text-gray-400">@{user.username}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-200">
                        <span>{user.campaignsParticipated} campaigns</span>
                        <span>{user.campaignsWon} wins</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-200">
                        {user.totalPoints.toLocaleString()}
                      </div>
                      <p className="text-sm text-gray-400">points</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-gray-700/20 border border-gray-600/20 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-gray-200 mb-4">
              Ready to climb the leaderboard?
            </h3>
            <p className="text-gray-200 mb-6 max-w-2xl mx-auto">
              Participate in campaigns, complete tasks, and earn points to see your name at the top!
            </p>
            <button
              onClick={() => router.push('/campaigns')}
              className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              Browse Campaigns
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Leaderboard;
