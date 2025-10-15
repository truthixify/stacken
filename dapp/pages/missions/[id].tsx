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
import LikeButton from '../../components/LikeButton';
import ShareButton from '../../components/ShareButton';
import UserAvatar from '../../components/UserAvatar';
import { createExcerpt } from '../../lib/textUtils';
import { formatDistanceToNow, isPast, isFuture } from 'date-fns';

import type { NextPage, GetServerSidePropsContext } from 'next';

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const { id } = ctx.params!;

  try {
    // Import database connection and model on server side
    const dbConnect = (await import('../../lib/mongodb')).default;
    const Mission = (await import('../../models/Mission')).default;

    await dbConnect();

    // Fetch mission directly from database for better performance
    const mission = await Mission.aggregate([
      { $match: { _id: new (await import('mongoose')).Types.ObjectId(id as string) } },
      {
        $lookup: {
          from: 'users',
          localField: 'creatorAddress',
          foreignField: 'stacksAddress',
          as: 'creator',
        },
      },
      {
        $addFields: {
          creator: { $arrayElemAt: ['$creator', 0] },
        },
      },
      {
        $project: {
          title: 1,
          summary: 1,
          description: 1,
          details: 1,
          category: 1,
          status: 1,
          totalParticipants: 1,
          totalPoints: 1,
          startTime: 1,
          endTime: 1,
          creatorAddress: 1,
          imageUrl: 1,
          tags: 1,
          taskLinks: 1,
          socialLinks: 1,
          tokenAddress: 1,
          tokenAmount: 1,
          createdAt: 1,
          updatedAt: 1,
          'creator.username': 1,
          'creator.displayName': 1,
          'creator.avatar': 1,
        },
      },
    ]);

    if (!mission || mission.length === 0) {
      return {
        notFound: true,
      };
    }

    // Convert MongoDB ObjectId and dates to strings for serialization
    const serializedMission = JSON.parse(JSON.stringify(mission[0]));

    return {
      props: {
        dehydratedState: await getDehydratedStateFromSession(ctx),
        mission: serializedMission,
      },
    };
  } catch (error) {
    console.error('Error fetching mission:', error);
    return {
      notFound: true,
    };
  }
}

interface Mission {
  _id: string;
  title: string;
  summary?: string;
  description: string;
  details?: string;
  category: string;
  status: string;
  missionType?: 'TOKEN' | 'POINTS';
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

interface MissionDetailProps {
  mission: Mission;
}

const MissionDetail: NextPage<MissionDetailProps> = ({ mission: initialMission }) => {
  const router = useRouter();
  const { id } = router.query;
  const { isSignedIn } = useAuth();
  const { stxAddress } = useAccount();
  const [mission, setMission] = useState<Mission | null>(initialMission);
  const [loading, setLoading] = useState(false);
  const [completingActivity, setCompletingActivity] = useState<string | null>(null);
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);

  useEffect(() => {
    // Only fetch if we don't have initial mission data (fallback for client-side navigation)
    if (id && !initialMission) {
      fetchMission();
    }
  }, [id, initialMission]);

  const fetchMission = async () => {
    try {
      const response = await fetch(`/api/missions/${id}`);
      if (response.ok) {
        const data = await response.json();
        setMission(data.mission);
      } else {
        console.error('Mission not found');
      }
    } catch (error) {
      console.error('Error fetching mission:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeUntilStart = (startTime: string) => {
    const start = new Date(startTime);
    const distance = formatDistanceToNow(start, { addSuffix: false });
    return `Starts in ${distance}`;
  };

  const getTimeUntilEnd = (endTime: string) => {
    const end = new Date(endTime);
    const distance = formatDistanceToNow(end, { addSuffix: false });
    return `Ends in ${distance}`;
  };

  const getTimeSinceEnd = (endTime: string) => {
    const end = new Date(endTime);
    const distance = formatDistanceToNow(end, { addSuffix: true });
    return `Ended ${distance}`;
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
          missionId: id,
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
        toast.error(error.message || "Oops, something went wrong. Let's try that again.", {
          id: loadingToast,
        });
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

  const getMissionProgress = () => {
    if (!mission) return 0;
    const now = new Date();
    const start = new Date(mission.startTime);
    const end = new Date(mission.endTime);

    if (now < start) return 0;
    if (now > end) return 100;

    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.round((elapsed / total) * 100);
  };

  if (loading) {
    return (
      <Layout title="Loading Mission...">
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

  if (!mission) {
    return (
      <Layout title="Mission Not Found">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-200 mb-4">Mission Not Found</h1>
            <p className="text-gray-200 mb-8">
              The mission you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => router.push('/missions')}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Discover Missions
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const progress = getMissionProgress();

  // Prepare Open Graph data
  const ogTitle = `${mission.title} - Stacken`;
  const ogDescription =
    mission.summary || createExcerpt(mission.description || mission.details || '', 160);
  // Ensure we have absolute URLs for Open Graph images
  const baseUrl = process.env.NEXTAUTH_URL || 'https://stacken.vercel.app';
  const ogImage = mission.imageUrl
    ? mission.imageUrl.startsWith('http')
      ? mission.imageUrl
      : `${baseUrl}${mission.imageUrl}`
    : `${baseUrl}/stacken.png`;
  const ogUrl = `${process.env.NEXTAUTH_URL || 'https://stacken.vercel.app'}/missions/${
    mission._id
  }`;

  return (
    <Layout
      title={ogTitle}
      description={ogDescription}
      ogImage={ogImage}
      ogUrl={ogUrl}
      ogType="article"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Mission Header */}
            <div className="bg-gray-700/20 rounded-lg shadow-sm border border-gray-600/20 overflow-hidden mb-6">
              {mission.imageUrl && (
                <div className="h-64 bg-gray-700/20">
                  <img
                    src={mission.imageUrl}
                    alt={mission.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full">
                      {mission.category}
                    </span>
                    <span
                      className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(
                        mission.status
                      )}`}
                    >
                      {mission.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 gap-2">
                    {/* Show edit button only for mission creator */}
                    {isSignedIn && stxAddress === mission.creatorAddress && (
                      <button
                        onClick={() => router.push(`/missions/${id}/edit`)}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        Edit Mission
                      </button>
                    )}
                    <LikeButton targetType="MISSION" targetId={mission._id} />
                    <ShareButton
                      title={mission.title}
                      text={
                        mission.summary ||
                        createExcerpt(mission.description || mission.details || '', 100)
                      }
                      url={
                        typeof window !== 'undefined'
                          ? `${window.location.origin}/missions/${mission._id}`
                          : ''
                      }
                      showDropdown={true}
                    />
                  </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-200 mb-4">{mission.title}</h1>

                <div className="flex flex-col md:flex-row items-start md:items-center flex-wrap gap-y-2 md:gap-y-0 md:gap-x-6 text-sm text-gray-200 mb-6">
                  <div className="flex items-center">
                    <Users className="mr-1" size={16} />
                    <span>
                      {mission.stats?.uniqueParticipants || mission.totalParticipants} participants
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Trophy className="mr-1" size={16} />
                    <span>{mission.totalPoints} total points</span>
                  </div>

                  {/* Smart date display based on mission status */}
                  {mission.status === 'DRAFT' && (
                    <div className="flex items-center">
                      <Calendar className="mr-1" size={16} />
                      <span className="text-blue-400">{getTimeUntilStart(mission.startTime)}</span>
                    </div>
                  )}

                  {mission.status === 'ACTIVE' && (
                    <div className="flex items-center">
                      <Calendar className="mr-1" size={16} />
                      <span className="text-green-400">{getTimeUntilEnd(mission.endTime)}</span>
                    </div>
                  )}

                  {mission.status === 'COMPLETED' && (
                    <div className="flex items-center">
                      <Calendar className="mr-1" size={16} />
                      <span className="text-gray-400">{getTimeSinceEnd(mission.endTime)}</span>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-200">Mission Progress</span>
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
                  {mission.details ? (
                    <div
                      className="text-gray-200 leading-relaxed mission-content"
                      dangerouslySetInnerHTML={{ __html: mission.details }}
                    />
                  ) : (
                    <p className="text-gray-200 leading-relaxed">{mission.description}</p>
                  )}
                </div>

                {/* Tags */}
                {mission.tags && mission.tags.length > 0 && (
                  <div className="mt-6">
                    <div className="flex flex-wrap gap-2">
                      {mission.tags.map((tag, index) => (
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
            {mission.taskLinks && mission.taskLinks.length > 0 && (
              <div className="bg-gray-700/20 rounded-lg shadow-sm border border-gray-600/20 p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-200 mb-6">Task Links</h2>
                <div className="space-y-4">
                  {mission.taskLinks.map((link, index) => (
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
              <h2 className="text-xl font-semibold text-gray-200 mb-6">Mission Activities</h2>

              {mission.activities && mission.activities.length > 0 ? (
                <div className="space-y-4">
                  {mission.activities.map((activity, index) => (
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
            {/* Creator Info */}
            <div className="bg-gray-700/20 rounded-lg shadow-sm border border-gray-600/20 p-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Mission Creator</h3>

              <div className="flex items-center space-x-3">
                <UserAvatar
                  userAddress={mission.creatorAddress}
                  avatar={mission.creator?.avatar}
                  displayName={mission.creator?.displayName || mission.creator?.username}
                  size={48}
                />
                <div>
                  <p className="font-medium text-gray-200">
                    {mission.creator?.displayName ||
                      mission.creator?.username ||
                      `${mission.creatorAddress.slice(0, 6)}...${mission.creatorAddress.slice(-4)}`}
                  </p>
                  <p className="text-sm text-gray-400">
                    {mission.creatorAddress.slice(0, 8)}...{mission.creatorAddress.slice(-6)}
                  </p>
                </div>
              </div>
            </div>

            {/* Mission Stats */}
            <div className="bg-gray-700/20 rounded-lg shadow-sm border border-gray-600/20 p-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Mission Stats</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-200">Participants</span>
                  <span className="font-semibold">
                    {mission.stats?.uniqueParticipants || mission.totalParticipants}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-200">Total Activities</span>
                  <span className="font-semibold">{mission.stats?.totalActivities || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-200">Points Distributed</span>
                  <span className="font-semibold">
                    {mission.stats?.totalPointsDistributed || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-200">Mission Type</span>
                  <span className="font-semibold">{mission.missionType}</span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            {mission.socialLinks && Object.keys(mission.socialLinks).length > 0 && (
              <div className="bg-gray-700/20 rounded-lg shadow-sm border border-gray-600/20 p-6">
                <h3 className="text-lg font-semibold text-gray-200 mb-4">Social Links</h3>

                <div className="space-y-3">
                  {mission.socialLinks.website && (
                    <a
                      href={mission.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-200 hover:text-primary-600 transition-colors"
                    >
                      <ExternalLink className="mr-3" size={16} />
                      <span>Website</span>
                    </a>
                  )}
                  {mission.socialLinks.twitter && (
                    <a
                      href={mission.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-200 hover:text-primary-600 transition-colors"
                    >
                      <ExternalLink className="mr-3" size={16} />
                      <span>Twitter</span>
                    </a>
                  )}
                  {mission.socialLinks.discord && (
                    <a
                      href={mission.socialLinks.discord}
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

            {/* Participate CTA */}
            {isSignedIn && stxAddress !== mission.creatorAddress && (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-primary-900 mb-2">Ready to Build?</h3>
                <p className="text-primary-700 mb-4">
                  Submit your work and claim up to {mission.totalPoints} reward points!
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push(`/missions/${id}/submit`)}
                    className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    Submit Your Work
                  </button>
                  <button
                    onClick={() => router.push(`/missions/${id}/submissions`)}
                    className="w-full border border-primary-600 text-primary-600 py-2 px-4 rounded-lg hover:bg-primary-50 transition-colors font-medium"
                  >
                    See All Submissions
                  </button>
                </div>
              </div>
            )}

            {/* Join Mission CTA for non-signed users */}
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

export default MissionDetail;
