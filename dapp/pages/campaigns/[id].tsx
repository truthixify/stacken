import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth, useAccount } from '@micro-stacks/react';
import Layout from '../../components/Layout';
import { getDehydratedStateFromSession } from '../../common/session-helpers';
import toast from 'react-hot-toast';
import {
  Calendar,
  Users,
  Star,
  Trophy,
  ExternalLink,
  CheckCircle,
  Clock,
  Share2,
  Heart,
  MessageCircle,
} from 'lucide-react';

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
  description: string;
  details?: string;
  category: string;
  status: string;
  campaignType?: 'TOKEN' | 'POINTS';
  totalParticipants: number;
  totalPoints: number;
  startTime: string;
  endTime: string;
  creatorAddress: string;
  imageUrl?: string;
  tags: string[];
  taskLinks?: Array<{
    title: string;
    url: string;
    type: 'GITHUB' | 'TWITTER' | 'DISCORD' | 'WEBSITE' | 'DOCUMENT' | 'OTHER';
    required: boolean;
    description?: string;
  }>;
  activities?: Array<{
    id: string;
    name: string;
    description: string;
    pointsReward: number;
    maxCompletions?: number;
    requirements?: {
      type: string;
      data: any;
    };
  }>;
  socialLinks: {
    twitter?: string;
    discord?: string;
    website?: string;
    telegram?: string;
  };
  stats?: {
    totalActivities: number;
    uniqueParticipants: number;
    totalPointsDistributed: number;
  };
}

const CampaignDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { isSignedIn } = useAuth();
  const { stxAddress } = useAccount();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [completingActivity, setCompletingActivity] = useState<string | null>(null);
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      fetchCampaign();
    }
  }, [id]);

  const fetchCampaign = async () => {
    try {
      const response = await fetch(`/api/campaigns/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCampaign(data.campaign);
      } else {
        console.error('Campaign not found');
      }
    } catch (error) {
      console.error('Error fetching campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeActivity = async (activityId: string) => {
    if (!isSignedIn || !stxAddress) {
      toast.error('Link your Stacks wallet to join this mission');
      return;
    }

    setCompletingActivity(activityId);
    const loadingToast = toast.loading('Completing activity...');

    try {
      const response = await fetch('/api/activities/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId: id,
          userAddress: stxAddress,
          activityId,
          verificationData: {
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
          },
        }),
      });

      if (response.ok) {
        setCompletedActivities([...completedActivities, activityId]);
        toast.success('Nice! Your work is submitted and rewards are coming your way.', {
          id: loadingToast,
        });
      } else {
        const error = await response.json();
        toast.error(error.message || 'Oops, something went wrong. Let\'s try that again.', { id: loadingToast });
      }
    } catch (error) {
      console.error('Error completing activity:', error);
      toast.error('Something broke on our end. Give it another shot!', { id: loadingToast });
    } finally {
      setCompletingActivity(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  const isActivityCompleted = (activityId: string) => {
    return completedActivities.includes(activityId);
  };

  const getCampaignProgress = () => {
    if (!campaign) return 0;
    const now = new Date();
    const start = new Date(campaign.startTime);
    const end = new Date(campaign.endTime);

    if (now < start) return 0;
    if (now > end) return 100;

    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.round((elapsed / total) * 100);
  };

  if (loading) {
    return (
      <Layout title="Loading Campaign...">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700/20 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-700/20 rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-700/20 rounded-lg mb-6"></div>
                <div className="h-32 bg-gray-700/20 rounded-lg"></div>
              </div>
              <div className="h-96 bg-gray-700/20 rounded-lg"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!campaign) {
    return (
      <Layout title="Campaign Not Found">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-200 mb-4">Campaign Not Found</h1>
            <p className="text-gray-200 mb-8">
              The campaign you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => router.push('/campaigns')}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Browse Campaigns
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const progress = getCampaignProgress();

  return (
    <Layout title={`${campaign.title} - Stacken Rewards`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Campaign Header */}
            <div className="bg-gray-700/20 rounded-lg shadow-sm border border-gray-600/20 overflow-hidden mb-6">
              {campaign.imageUrl && (
                <div className="h-64 bg-gray-700/20">
                  <img
                    src={campaign.imageUrl}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full">
                      {campaign.category}
                    </span>
                    <span
                      className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(
                        campaign.status
                      )}`}
                    >
                      {campaign.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Show edit button only for campaign creator */}
                    {isSignedIn && stxAddress === campaign.creatorAddress && (
                      <button
                        onClick={() => router.push(`/campaigns/${id}/edit`)}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        Edit Campaign
                      </button>
                    )}
                    <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <Heart size={20} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-200 mb-4">{campaign.title}</h1>

                <div className="flex items-center space-x-6 text-sm text-gray-200 mb-6">
                  <div className="flex items-center">
                    <Users className="mr-1" size={16} />
                    <span>
                      {campaign.stats?.uniqueParticipants || campaign.totalParticipants}{' '}
                      participants
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Trophy className="mr-1" size={16} />
                    <span>{campaign.totalPoints} total points</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-1" size={16} />
                    <span>Ends {formatDate(campaign.endTime)}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-200">Campaign Progress</span>
                    <span className="text-sm text-gray-200">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700/20 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="prose max-w-none">
                  {campaign.details ? (
                    <div
                      className="text-gray-200 leading-relaxed campaign-content"
                      dangerouslySetInnerHTML={{ __html: campaign.details }}
                    />
                  ) : (
                    <p className="text-gray-200 leading-relaxed">{campaign.description}</p>
                  )}
                </div>

                {/* Tags */}
                {campaign.tags && campaign.tags.length > 0 && (
                  <div className="mt-6">
                    <div className="flex flex-wrap gap-2">
                      {campaign.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Task Links */}
            {campaign.taskLinks && campaign.taskLinks.length > 0 && (
              <div className="bg-gray-700/20 rounded-lg shadow-sm border border-gray-600/20 p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-200 mb-6">Task Links</h2>
                <div className="space-y-4">
                  {campaign.taskLinks.map((link, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-4 border border-gray-600/20 rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        <ExternalLink className="h-5 w-5 text-gray-400 mt-0.5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-gray-200">{link.title}</h3>
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                            {link.type}
                          </span>
                          {link.required && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 text-sm break-all"
                        >
                          {link.url}
                        </a>
                        {link.description && (
                          <p className="text-sm text-gray-200 mt-1">{link.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activities */}
            <div className="bg-gray-700/20 rounded-lg shadow-sm border border-gray-600/20 p-6">
              <h2 className="text-xl font-semibold text-gray-200 mb-6">Campaign Activities</h2>

              {campaign.activities && campaign.activities.length > 0 ? (
                <div className="space-y-4">
                  {campaign.activities.map((activity, index) => (
                    <div key={activity.id} className="border border-gray-600/20 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-200">{activity.name}</h3>
                            <span className="bg-primary-100 text-primary-800 text-sm font-medium px-2 py-1 rounded">
                              +{activity.pointsReward} points
                            </span>
                            {isActivityCompleted(activity.id) && (
                              <CheckCircle className="text-green-500" size={20} />
                            )}
                          </div>
                          <p className="text-gray-200 mb-3">{activity.description}</p>
                          {activity.maxCompletions && (
                            <p className="text-sm text-gray-200">
                              Limited to {activity.maxCompletions} completions
                            </p>
                          )}
                        </div>

                        <div className="ml-4">
                          {isActivityCompleted(activity.id) ? (
                            <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                              <CheckCircle className="mr-2" size={16} />
                              <span className="text-sm font-medium">Completed</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => completeActivity(activity.id)}
                              disabled={completingActivity === activity.id || !isSignedIn}
                              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {completingActivity === activity.id ? (
                                <div className="flex items-center">
                                  <Clock className="mr-2 animate-spin" size={16} />
                                  <span>Completing...</span>
                                </div>
                              ) : (
                                'Complete'
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-200">No activities available yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Campaign Stats */}
            <div className="bg-gray-700/20 rounded-lg shadow-sm border border-gray-600/20 p-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Campaign Stats</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-200">Participants</span>
                  <span className="font-semibold">
                    {campaign.stats?.uniqueParticipants || campaign.totalParticipants}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-200">Total Activities</span>
                  <span className="font-semibold">{campaign.stats?.totalActivities || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-200">Points Distributed</span>
                  <span className="font-semibold">
                    {campaign.stats?.totalPointsDistributed || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-200">Campaign Type</span>
                  <span className="font-semibold">{campaign.campaignType}</span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            {campaign.socialLinks && Object.keys(campaign.socialLinks).length > 0 && (
              <div className="bg-gray-700/20 rounded-lg shadow-sm border border-gray-600/20 p-6">
                <h3 className="text-lg font-semibold text-gray-200 mb-4">Social Links</h3>

                <div className="space-y-3">
                  {campaign.socialLinks.website && (
                    <a
                      href={campaign.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-200 hover:text-primary-600 transition-colors"
                    >
                      <ExternalLink className="mr-3" size={16} />
                      <span>Website</span>
                    </a>
                  )}
                  {campaign.socialLinks.twitter && (
                    <a
                      href={campaign.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-200 hover:text-primary-600 transition-colors"
                    >
                      <ExternalLink className="mr-3" size={16} />
                      <span>Twitter</span>
                    </a>
                  )}
                  {campaign.socialLinks.discord && (
                    <a
                      href={campaign.socialLinks.discord}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-200 hover:text-primary-600 transition-colors"
                    >
                      <ExternalLink className="mr-3" size={16} />
                      <span>Discord</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Creator Info */}
            <div className="bg-gray-700/20 rounded-lg shadow-sm border border-gray-600/20 p-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Campaign Creator</h3>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold">
                    {campaign.creatorAddress.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-200">
                    {campaign.creatorAddress.slice(0, 8)}...{campaign.creatorAddress.slice(-6)}
                  </p>
                  <p className="text-sm text-gray-200">Campaign Creator</p>
                </div>
              </div>
            </div>

            {/* Participate CTA */}
            {isSignedIn && stxAddress !== campaign.creatorAddress && (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-primary-900 mb-2">
                  Ready to Build?
                </h3>
                <p className="text-primary-700 mb-4">
                  Submit your work and claim up to {campaign.totalPoints} reward points!
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push(`/campaigns/${id}/submit`)}
                    className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    Submit Your Work
                  </button>
                  <button
                    onClick={() => router.push(`/campaigns/${id}/submissions`)}
                    className="w-full border border-primary-600 text-primary-600 py-2 px-4 rounded-lg hover:bg-primary-50 transition-colors font-medium"
                  >
                    See All Submissions
                  </button>
                </div>
              </div>
            )}

            {/* Join Campaign CTA for non-signed users */}
            {!isSignedIn && (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-primary-900 mb-2">Join the Mission</h3>
                <p className="text-primary-700 mb-4">
                  Link your Stacks wallet to start building and earning crypto rewards!
                </p>
                <button
                  onClick={() => {
                    /* This would trigger wallet connection */
                  }}
                  className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Link Your Stacks Wallet
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CampaignDetail;