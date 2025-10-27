import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useStacks } from '../../../hooks/useStacks';
import Layout from '../../../components/Layout';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Link as LinkIcon,
  FileText,
  Upload,
  Share2,
  Send,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useForm } from 'react-hook-form';

import type { NextPage } from 'next';

interface Mission {
  _id: string;
  title: string;
  description: string;
  details?: string;
  category: string;
  status: string;
  totalPoints: number;
  startTime: string;
  endTime: string;
  creatorAddress: string;
  imageUrl?: string;
  taskLinks?: Array<{
    title: string;
    url: string;
    type: string;
    required: boolean;
    description?: string;
  }>;
}

interface SubmissionFormData {
  submissionType: 'LINK' | 'TEXT' | 'FILE' | 'SOCIAL_PROOF';
  url?: string;
  text?: string;
  fileUrl?: string;
  socialHandle?: string;
  description?: string;
}

const SubmitToMission: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { isSignedIn, stxAddress } = useStacks();
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SubmissionFormData>({
    defaultValues: {
      submissionType: 'LINK',
    },
  });

  const submissionType = watch('submissionType');

  useEffect(() => {
    if (id) {
      fetchMission();
      checkExistingSubmission();
    }
  }, [id, stxAddress]);

  const fetchMission = async () => {
    try {
      const response = await fetch(`/api/missions/${id}`);
      if (response.ok) {
        const data = await response.json();
        setMission(data.mission);
      } else {
        toast.error("This mission doesn't exist or has ended");
        router.push('/missions');
      }
    } catch (error) {
      console.error('Error fetching mission:', error);
      toast.error("Couldn't load this mission — let's try again");
    } finally {
      setLoading(false);
    }
  };

  const checkExistingSubmission = async () => {
    if (!stxAddress) return;

    try {
      const response = await fetch(`/api/missions/${id}/submissions?userAddress=${stxAddress}`);
      if (response.ok) {
        const data = await response.json();
        const userSubmission = data.submissions.find((s: any) => s.userAddress === stxAddress);
        if (userSubmission) {
          setHasSubmitted(true);
        }
      }
    } catch (error) {
      console.error('Error checking existing submission:', error);
    }
  };

  const onSubmit = async (data: SubmissionFormData) => {
    if (!isSignedIn || !stxAddress) {
      toast.error('Link your Stacks wallet to claim rewards');
      return;
    }

    setSubmitting(true);
    const loadingToast = toast.loading('Submitting your work...');

    try {
      const submissionData = {
        userAddress: stxAddress,
        submissionType: data.submissionType,
        content: {
          url: data.url,
          text: data.text,
          fileUrl: data.fileUrl,
          socialHandle: data.socialHandle,
          description: data.description,
        },
      };

      const response = await fetch(`/api/missions/${id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message, { id: loadingToast });
        setHasSubmitted(true);
      } else {
        const error = await response.json();
        toast.error(error.message || "Submission failed — let's try that again", {
          id: loadingToast,
        });
      }
    } catch (error) {
      console.error('Error submitting:', error);
      toast.error('Oops, something broke. Give it another shot!', { id: loadingToast });
    } finally {
      setSubmitting(false);
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

  const getSubmissionTypeIcon = (type: string) => {
    switch (type) {
      case 'LINK':
        return <LinkIcon size={20} />;
      case 'TEXT':
        return <FileText size={20} />;
      case 'FILE':
        return <Upload size={20} />;
      case 'SOCIAL_PROOF':
        return <Share2 size={20} />;
      default:
        return <FileText size={20} />;
    }
  };

  if (!isSignedIn) {
    return (
      <Layout title="Ready to Claim Your Reward?">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-200 mb-4">
              Link Your Stacks Wallet to Begin
            </h1>
            <p className="text-gray-200 mb-8">
              Connect your wallet to submit your work and claim your crypto rewards.
            </p>
            <button
              onClick={() => router.push(`/missions/${id}`)}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Back to Mission
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout title="Loading Your Mission...">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-700/20 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!mission) {
    return (
      <Layout title="Mission Not Found">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-200 mb-4">
              Oops, This Mission Doesn't Exist
            </h1>
            <p className="text-gray-200 mb-8">
              This bounty might have ended or been removed. Let's find you another mission to
              tackle.
            </p>
            <button
              onClick={() => router.push('/missions')}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Discover Active Missions
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (hasSubmitted) {
    return (
      <Layout title={`Submit to ${mission.title}`}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-200 mb-4">Nice Work — You're All Set!</h1>
            <p className="text-gray-200 mb-8">
              Your submission is live and under review. The mission creator will evaluate your work
              and distribute rewards soon.
            </p>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => router.push(`/missions/${id}`)}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Back to Mission
              </button>
              <button
                onClick={() => router.push(`/missions/${id}/submissions`)}
                className="border border-gray-600/20 text-gray-200 px-6 py-3 rounded-lg hover:bg-gray-600/20 transition-colors"
              >
                See All Submissions
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const now = new Date();
  const startTime = new Date(mission.startTime);
  const endTime = new Date(mission.endTime);

  if (now < startTime) {
    return (
      <Layout title={`Submit to ${mission.title}`}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-200 mb-4">Mission Not Started</h1>
            <p className="text-gray-200 mb-8">
              This mission starts on {formatDate(mission.startTime)}. Come back then to submit!
            </p>
            <button
              onClick={() => router.push(`/missions/${id}`)}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Back to Mission
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (now > endTime) {
    return (
      <Layout title={`Submit to ${mission.title}`}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-200 mb-4">Mission Ended</h1>
            <p className="text-gray-200 mb-8">
              This mission ended on {formatDate(mission.endTime)}. Submissions are no longer
              accepted.
            </p>
            <button
              onClick={() => router.push(`/missions/${id}`)}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Back to Mission
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Submit to ${mission.title}`}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/missions/${id}`)}
            className="flex items-center text-gray-200 hover:text-gray-300 mb-4"
          >
            <ArrowLeft className="mr-2" size={20} />
            Back to Mission
          </button>
          <h1 className="text-3xl font-bold text-gray-200 mb-2">Submit to Mission</h1>
          <h2 className="text-xl text-gray-200">{mission.title}</h2>
        </div>

        {/* Mission Info */}
        <div className="bg-gray-700/20 border border-gray-600/20 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <AlertCircle className="text-blue-500 mr-3 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-gray-200 mb-1">Submission Guidelines</h3>
              <p className="text-gray-200 text-sm mb-2">
                Make sure your submission follows the mission requirements. Your submission will be
                reviewed by the mission creator.
              </p>
              <p className="text-gray-200 text-sm">
                <strong>Reward:</strong> Up to {mission.totalPoints} points available
              </p>
            </div>
          </div>
        </div>

        {/* Task Links */}
        {mission.taskLinks && mission.taskLinks.length > 0 && (
          <div className="bg-gray-700/20 rounded-lg shadow-sm border border-gray-600/20 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Required Resources</h3>
            <div className="space-y-3">
              {mission.taskLinks.map((link, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-200">{link.title}</h4>
                      {link.required && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                          Required
                        </span>
                      )}
                    </div>
                    {link.description && (
                      <p className="text-sm text-gray-200">{link.description}</p>
                    )}
                  </div>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 text-primary-600 hover:text-primary-700"
                  >
                    <LinkIcon size={20} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submission Form */}
        <div className="bg-gray-700/20 rounded-lg shadow-sm border border-gray-600/20 p-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-6">Your Submission</h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Submission Type */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-3">
                Submission Type *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'LINK', label: 'Link/URL', description: 'Share a link to your work' },
                  { value: 'TEXT', label: 'Text', description: 'Write your submission' },
                  { value: 'FILE', label: 'File', description: 'Upload a file' },
                  {
                    value: 'SOCIAL_PROOF',
                    label: 'Social Proof',
                    description: 'Social media handle/proof',
                  },
                ].map(type => (
                  <label
                    key={type.value}
                    className={`flex items-start p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      submissionType === type.value
                        ? 'border-primary-500'
                        : 'border-gray-600/20 hover:border-gray-500/20'
                    }`}
                  >
                    <input
                      type="radio"
                      {...register('submissionType', { required: true })}
                      value={type.value}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <div className="mr-3">{getSubmissionTypeIcon(type.value)}</div>
                      <div>
                        <div className="font-medium text-gray-200">{type.label}</div>
                        <div className="text-sm text-gray-200">{type.description}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Dynamic Fields Based on Type */}
            {submissionType === 'LINK' && (
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">URL *</label>
                <input
                  type="url"
                  {...register('url', {
                    required: submissionType === 'LINK' ? 'URL is required' : false,
                  })}
                  className="w-full px-3 py-2 border border-gray-600/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://example.com/your-work"
                />
                {errors.url && <p className="text-red-500 text-sm mt-1">{errors.url.message}</p>}
              </div>
            )}

            {submissionType === 'TEXT' && (
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Your Submission *
                </label>
                <textarea
                  {...register('text', {
                    required: submissionType === 'TEXT' ? 'Text is required' : false,
                    maxLength: { value: 2000, message: 'Maximum 2000 characters' },
                  })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-600/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Describe your work, provide details about your contribution..."
                />
                {errors.text && <p className="text-red-500 text-sm mt-1">{errors.text.message}</p>}
              </div>
            )}

            {submissionType === 'FILE' && (
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">File URL *</label>
                <input
                  type="url"
                  {...register('fileUrl', {
                    required: submissionType === 'FILE' ? 'File URL is required' : false,
                  })}
                  className="w-full px-3 py-2 border border-gray-600/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://drive.google.com/... or https://github.com/..."
                />
                {errors.fileUrl && (
                  <p className="text-red-500 text-sm mt-1">{errors.fileUrl.message}</p>
                )}
                <p className="text-sm text-gray-400 mt-1">
                  Upload your file to Google Drive, GitHub, or another file sharing service and
                  paste the link here.
                </p>
              </div>
            )}

            {submissionType === 'SOCIAL_PROOF' && (
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Social Handle/Proof *
                </label>
                <input
                  type="text"
                  {...register('socialHandle', {
                    required:
                      submissionType === 'SOCIAL_PROOF' ? 'Social handle is required' : false,
                  })}
                  className="w-full px-3 py-2 border border-gray-600/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="@yourusername or link to your social media post"
                />
                {errors.socialHandle && (
                  <p className="text-red-500 text-sm mt-1">{errors.socialHandle.message}</p>
                )}
              </div>
            )}

            {/* Description (optional for all types) */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Additional Description (Optional)
              </label>
              <textarea
                {...register('description', {
                  maxLength: { value: 1000, message: 'Maximum 1000 characters' },
                })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-600/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Any additional context or information about your submission..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push(`/missions/${id}`)}
                className="border border-gray-600/20 text-gray-200 px-6 py-2 rounded-lg hover:bg-gray-600/20 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Send className="mr-2" size={16} />
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default SubmitToMission;
