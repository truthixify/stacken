import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth, useAccount } from '@micro-stacks/react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { getDehydratedStateFromSession } from '../common/session-helpers';
import { Plus, Trophy, Users, Star, Calendar, ArrowRight } from 'lucide-react';

import type { NextPage, GetServerSidePropsContext } from 'next';

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      dehydratedState: await getDehydratedStateFromSession(ctx),
    },
  };
}

const Dashboard: NextPage = () => {
  const { isSignedIn } = useAuth();
  const { stxAddress } = useAccount();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/');
      return;
    }

    if (stxAddress) {
      fetchUserData();
    }
  }, [isSignedIn, stxAddress, router]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/users/${stxAddress || 'placeholder'}`);
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isSignedIn) {
    return null; // Will redirect
  }

  if (loading) {
    return (
      <Layout title="Dashboard - Stacken Rewards">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const stats = userData?.user?.stats || {
    totalCampaignsCreated: 0,
    totalCampaignsParticipated: 0,
    totalPoints: 0,
    totalActivitiesCompleted: 0,
  };

  return (
    <Layout title="Dashboard - Stacken Rewards">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your activity overview.</p>
          </div>
          <Link href="/missions/create">
            <a className="mt-4 md:mt-0 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center">
              <Plus className="mr-2" size={16} />
              Create Mission
            </a>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Trophy className="text-primary-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Points</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalPoints.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Star className="text-green-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Activities Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalActivitiesCompleted}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Missions Joined</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalCampaignsParticipated}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-purple-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Missions Created</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCampaignsCreated}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
            </div>
            <div className="p-6">
              {userData?.recentActivities?.length > 0 ? (
                <div className="space-y-4">
                  {userData.recentActivities.slice(0, 5).map((activity: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{activity.activityName}</p>
                        <p className="text-sm text-gray-600">
                          {activity.campaignId?.title || 'Mission'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-primary-600">
                          +{activity.pointsEarned} points
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(activity.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">No activities yet</p>
                  <Link href="/missions">
                    <a className="text-primary-600 hover:text-primary-700 font-medium">
                      Browse missions to get started
                    </a>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* My Missions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">My Missions</h2>
              <Link href="/missions/create">
                <a className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                  Create New
                </a>
              </Link>
            </div>
            <div className="p-6">
              {userData?.user?.createdCampaigns?.length > 0 ? (
                <div className="space-y-4">
                  {userData.user.createdCampaigns.slice(0, 5).map((mission: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{mission.title}</p>
                        <p className="text-sm text-gray-600">
                          {mission.status} • {mission.totalParticipants || 0} participants
                        </p>
                      </div>
                      <Link href={`/missions/${mission._id}`}>
                        <a className="text-primary-600 hover:text-primary-700">
                          <ArrowRight size={16} />
                        </a>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Plus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">No missions created yet</p>
                  <Link href="/missions/create">
                    <a className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center">
                      <Plus className="mr-2" size={16} />
                      Create Your First Mission
                    </a>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
