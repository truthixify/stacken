import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth, useAccount } from '@micro-stacks/react';
import Layout from '../../components/Layout';
import { getDehydratedStateFromSession } from '../../common/session-helpers';
import {
  User,
  Trophy,
  Star,
  Calendar,
  Edit3,
  ExternalLink,
  Activity,
  TrendingUp,
} from 'lucide-react';
import UserAvatar from '../../components/UserAvatar';

import type { NextPage, GetServerSidePropsContext } from 'next';

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      dehydratedState: await getDehydratedStateFromSession(ctx),
    },
  };
}

interface UserProfile {
  stacksAddress: string;
  username?: string;
  displayName?: string;
  email?: string;
  bio?: string;
  avatar?: string;
  totalPoints: number;
  achievements: string[];
  participatedMissions: any[];
  createdMissions: any[];
  socialLinks?: {
    twitter?: string;
    discord?: string;
    github?: string;
    website?: string;
    telegram?: string;
  };
  settings: {
    publicProfile: boolean;
    showAchievements: boolean;
  };
  stats: {
    totalMissionsCreated: number;
    totalMissionsParticipated: number;
    totalPoints: number;
    totalSubmissions: number;
  };
  createdAt: string;
}

const ProfilePage: NextPage = () => {
  const router = useRouter();
  const { address } = router.query;
  const { isSignedIn } = useAuth();
  const { stxAddress } = useAccount();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = isSignedIn && stxAddress === address;

  useEffect(() => {
    if (address) {
      fetchProfile();
    }
  }, [address]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/users/${address}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
      } else if (response.status === 404) {
        // Try to create the user if they don't exist
        const registerResponse = await fetch('/api/users/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            stacksAddress: address,
          }),
        });

        if (registerResponse.ok) {
          // Retry fetching the profile
          const retryResponse = await fetch(`/api/users/${address}`);
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            setProfile(retryData.user);
          }
        }
      } else {
        console.error('Profile not found');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  if (loading) {
    return (
      <Layout title="Loading Profile...">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="bg-gray-700/20 rounded-lg shadow-sm border border-gray-600/20 p-6 mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-700/20 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-700/20 rounded w-1/3 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-700/20 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout title="Profile Not Found">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-200 mb-4">Profile Not Found</h1>
            <p className="text-gray-200 mb-8">The user profile you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/')}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={`${
        profile.displayName || profile.username || truncateAddress(profile.stacksAddress)
      } - Profile`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-gray-700/20 rounded-lg shadow-sm border border-gray-600/20 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <UserAvatar
                  userAddress={profile.stacksAddress}
                  avatar={profile.avatar}
                  displayName={profile.displayName || profile.username}
                  size={80}
                />
              </div>

              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-200">
                  {profile.displayName ||
                    profile.username ||
                    truncateAddress(profile.stacksAddress)}
                </h1>
                {profile.username && profile.displayName && (
                  <p className="text-gray-400">@{profile.username}</p>
                )}
                <p className="text-gray-400 text-sm mb-2">
                  {truncateAddress(profile.stacksAddress)}
                </p>
                {profile.bio && (
                  <p className="text-gray-200 whitespace-pre-wrap mb-3">{profile.bio}</p>
                )}

                {/* Social Links */}
                {profile.socialLinks && Object.values(profile.socialLinks).some(link => link) && (
                  <div className="flex items-center space-x-3 mb-2">
                    {profile.socialLinks.twitter && (
                      <a
                        href={profile.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 transition-colors"
                        title="Twitter"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                      </a>
                    )}
                    {profile.socialLinks.github && (
                      <a
                        href={profile.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-200 hover:text-gray-300 transition-colors"
                        title="GitHub"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                      </a>
                    )}
                    {profile.socialLinks.website && (
                      <a
                        href={profile.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-200 hover:text-gray-300 transition-colors"
                        title="Website"
                      >
                        <ExternalLink size={20} />
                      </a>
                    )}
                  </div>
                )}

                <div className="flex items-center text-sm text-gray-400">
                  <Calendar className="mr-1" size={16} />
                  <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {isOwnProfile && (
              <button
                onClick={() => router.push('/profile/edit')}
                className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Edit3 size={16} />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-700/20 rounded-lg shadow-sm border border-gray-600/20 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Trophy className="text-blue-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-200">Total Points</p>
                <p className="text-2xl font-bold text-gray-200">
                  {profile.stats?.totalPoints || profile.totalPoints || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-700/20 rounded-lg shadow-sm border border-gray-600/20 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Activity className="text-green-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-200">Missions Joined</p>
                <p className="text-2xl font-bold text-gray-200">
                  {profile.stats?.totalMissionsParticipated || 0}
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
                <p className="text-sm font-medium text-gray-200">Missions Created</p>
                <p className="text-2xl font-bold text-gray-200">
                  {profile.stats?.totalMissionsCreated || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-700/20 rounded-lg shadow-sm border border-gray-600/20 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="text-orange-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-200">Submissions</p>
                <p className="text-2xl font-bold text-gray-200">
                  {profile.stats?.totalSubmissions || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-700/20 rounded-lg shadow-sm border border-gray-600/20 p-6">
          <h2 className="text-xl font-semibold text-gray-200 mb-6">Recent Activity</h2>
          <div className="text-center py-8">
            <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-200">No recent activity to display</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
