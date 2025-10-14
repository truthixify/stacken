import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth, useAccount } from '@micro-stacks/react';
import Layout from '../../../components/Layout';
import { getDehydratedStateFromSession } from '../../../common/session-helpers';
import {
  ArrowLeft,
  Link as LinkIcon,
  FileText,
  Upload,
  Share2,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  ExternalLink,
  User,
} from 'lucide-react';

import type { NextPage, GetServerSidePropsContext } from 'next';

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      dehydratedState: await getDehydratedStateFromSession(ctx),
    },
  };
}

interface Submission {
  _id: string;
  userAddress: string;
  submissionType: 'LINK' | 'TEXT' | 'FILE' | 'SOCIAL_PROOF';
  content: {
    url?: string;
    text?: string;
    fileUrl?: string;
    socialHandle?: string;
    description?: string;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  pointsAwarded: number;
  reviewNotes?: string;
  submittedAt: string;
  user?: {
    username?: string;
    displayName?: string;
    avatar?: string;
  };
}

interface Campaign {
  _id: string;
  title: string;
  creatorAddress: string;
}

const CampaignSubmissions: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { isSignedIn } = useAuth();
  const { stxAddress } = useAccount();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (id) {
      fetchCampaign();
      fetchSubmissions();
    }
  }, [id, stxAddress, filter]);

  const fetchCampaign = async () => {
    try {
      const response = await fetch(`/api/campaigns/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCampaign(data.campaign);
      }
    } catch (error) {
      console.error('Error fetching campaign:', error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const params = new URLSearchParams();
      if (stxAddress) params.append('userAddress', stxAddress);
      if (filter !== 'ALL' && campaign && stxAddress === campaign.creatorAddress) {
        params.append('status', filter);
      }

      const response = await fetch(`/api/campaigns/${id}/submissions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions);
      } else if (response.status === 403) {
        // Access denied - user is not creator
        setSubmissions([]);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'REJECTED':
        return <XCircle className="text-red-500" size={20} />;
      case 'UNDER_REVIEW':
        return <Eye className="text-blue-500" size={20} />;
      default:
        return <Clock className="text-yellow-500" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getSubmissionTypeIcon = (type: string) => {
    switch (type) {
      case 'LINK':
        return <LinkIcon size={16} />;
      case 'TEXT':
        return <FileText size={16} />;
      case 'FILE':
        return <Upload size={16} />;
      case 'SOCIAL_PROOF':
        return <Share2 size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  const renderSubmissionContent = (submission: Submission) => {
    const { content, submissionType } = submission;

    switch (submissionType) {
      case 'LINK':
        return (
          <div>
            <a
              href={content.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 flex items-center"
            >
              <ExternalLink className="mr-1" size={14} />
              {content.url}
            </a>
          </div>
        );
      case 'TEXT':
        return (
          <div className="bg-gray-700/30 p-3 rounded-lg">
            <p className="text-gray-200 whitespace-pre-wrap">{content.text}</p>
          </div>
        );
      case 'FILE':
        return (
          <div>
            <a
              href={content.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 flex items-center"
            >
              <ExternalLink className="mr-1" size={14} />
              View File
            </a>
          </div>
        );
      case 'SOCIAL_PROOF':
        return (
          <div>
            <span className="text-gray-200">{content.socialHandle}</span>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Layout title="Loading Submissions...">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-700/20 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Submissions - ${campaign?.title || 'Campaign'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/campaigns/${id}`)}
            className="flex items-center text-gray-200 hover:text-gray-300 mb-4"
          >
            <ArrowLeft className="mr-2" size={20} />
            Back to Campaign
          </button>
          <h1 className="text-3xl font-bold text-gray-200 mb-2">Campaign Submissions</h1>
          {campaign && <h2 className="text-xl text-gray-200">{campaign.title}</h2>}
        </div>

        {/* Filters - Only show for creators */}
        {isSignedIn && stxAddress === campaign?.creatorAddress && (
          <div className="bg-gray-700/20 rounded-lg shadow-sm border border-gray-600/20 p-4 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-200">Filter Submissions</h3>
              <div className="flex space-x-2">
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      filter === status
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-700/30 text-gray-200 hover:bg-gray-600/20'
                    }`}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Info for non-creators */}
        {isSignedIn && stxAddress !== campaign?.creatorAddress && (
          <div className="bg-gray-700/20 border border-gray-600/20 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="text-blue-600 mr-3 mt-0.5">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-200 mb-1">Your Submissions</h3>
                <p className="text-gray-200 text-sm">
                  You can only view your own submissions. The campaign creator will review all
                  submissions privately.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submissions List */}
        <div className="space-y-6">
          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-200 mb-2">No submissions found</h3>
              <p className="text-gray-200 mb-6">
                {filter === 'ALL'
                  ? 'No one has submitted to this campaign yet.'
                  : `No submissions with status "${filter.toLowerCase().replace('_', ' ')}" found.`}
              </p>
              {isSignedIn && stxAddress !== campaign?.creatorAddress && (
                <button
                  onClick={() => router.push(`/campaigns/${id}/submit`)}
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Be the First to Submit
                </button>
              )}
            </div>
          ) : (
            submissions.map(submission => (
              <div
                key={submission._id}
                className="bg-gray-700/20 rounded-lg shadow-sm border border-gray-600/20 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {submission.user?.avatar ? (
                      <img
                        src={submission.user.avatar}
                        alt={submission.user.displayName || submission.user.username || 'User'}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <User className="text-primary-600" size={20} />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-200">
                        {submission.user?.displayName ||
                          submission.user?.username ||
                          formatAddress(submission.userAddress)}
                      </h3>
                      <p className="text-sm text-gray-200">{formatDate(submission.submittedAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      {getSubmissionTypeIcon(submission.submissionType)}
                      <span className="text-sm text-gray-200 capitalize">
                        {submission.submissionType.toLowerCase().replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(submission.status)}
                      <span
                        className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusColor(
                          submission.status
                        )}`}
                      >
                        {submission.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submission Content */}
                <div className="mb-4">
                  {renderSubmissionContent(submission)}
                  {submission.content.description && (
                    <div className="mt-3 p-3 bg-gray-700/30 rounded-lg">
                      <p className="text-sm text-gray-200">{submission.content.description}</p>
                    </div>
                  )}
                </div>

                {/* Points and Review */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-600/20">
                  <div className="flex items-center space-x-4">
                    {submission.pointsAwarded > 0 && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="mr-1" size={16} />
                        <span className="font-medium">
                          {submission.pointsAwarded} points awarded
                        </span>
                      </div>
                    )}
                    {submission.reviewNotes && (
                      <div className="text-sm text-gray-200">
                        <strong>Review:</strong> {submission.reviewNotes}
                      </div>
                    )}
                  </div>

                  {/* Creator Actions */}
                  {isSignedIn &&
                    stxAddress === campaign?.creatorAddress &&
                    submission.status === 'PENDING' && (
                      <div className="flex space-x-2">
                        <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                          Approve
                        </button>
                        <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                          Reject
                        </button>
                      </div>
                    )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          {isSignedIn && stxAddress !== campaign?.creatorAddress && (
            <button
              onClick={() => router.push(`/campaigns/${id}/submit`)}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Submit Your Work
            </button>
          )}
          <button
            onClick={() => router.push(`/campaigns/${id}`)}
            className="border border-gray-600/20 text-gray-200 px-6 py-3 rounded-lg hover:bg-gray-600/20 transition-colors"
          >
            Back to Campaign
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default CampaignSubmissions;