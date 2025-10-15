import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth, useAccount } from '@micro-stacks/react';
import Layout from '../../components/Layout';
import { getDehydratedStateFromSession } from '../../common/session-helpers';
import { Save, User, Upload, ArrowLeft } from 'lucide-react';
import UserAvatar from '../../components/UserAvatar';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import type { NextPage, GetServerSidePropsContext } from 'next';
import Image from 'next/image';

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      dehydratedState: await getDehydratedStateFromSession(ctx),
    },
  };
}

interface ProfileFormData {
  username: string;
  displayName: string;
  email: string;
  bio: string;
  socialLinks: {
    twitter: string;
    discord: string;
    github: string;
    website: string;
    telegram: string;
  };
}

const EditProfile: NextPage = () => {
  const { isSignedIn } = useAuth();
  const { stxAddress } = useAccount();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    defaultValues: {
      username: '',
      displayName: '',
      email: '',
      bio: '',
      socialLinks: {
        twitter: '',
        discord: '',
        github: '',
        website: '',
        telegram: '',
      },
    },
  });

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/');
      return;
    }

    fetchUserProfile();
  }, [isSignedIn, stxAddress, router]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/users/${stxAddress}`);
      if (response.ok) {
        const data = await response.json();
        const user = data.user;

        reset({
          username: user.username || '',
          displayName: user.displayName || '',
          email: user.email || '',
          bio: user.bio || '',
          socialLinks: {
            twitter: user.socialLinks?.twitter || '',
            discord: user.socialLinks?.discord || '',
            github: user.socialLinks?.github || '',
            website: user.socialLinks?.website || '',
            telegram: user.socialLinks?.telegram || '',
          },
        });

        setAvatarPreview(user.avatar || '');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = e => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Avatar upload failed:', error);
      throw new Error('Failed to upload avatar');
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!isSignedIn || !stxAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Updating profile...');

    try {
      let avatarUrl = avatarPreview;

      // Upload avatar if file is selected
      if (avatarFile) {
        toast.loading('Uploading avatar...', { id: loadingToast });
        try {
          avatarUrl = await uploadAvatar(avatarFile);
        } catch (error) {
          toast.error('Failed to upload avatar. Continuing with existing avatar.', {
            id: loadingToast,
          });
        }
      }

      toast.loading('Updating profile...', { id: loadingToast });
      const profileData = {
        ...data,
        avatar: avatarUrl,
        stacksAddress: stxAddress,
      };

      const response = await fetch(`/api/users/${stxAddress}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        toast.success('Profile updated successfully!', { id: loadingToast });
        router.push(`/profile/${stxAddress}`);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update profile', { id: loadingToast });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Layout title="Loading...">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-6">
              <div className="h-32 bg-gray-700/20 rounded"></div>
              <div className="h-32 bg-gray-700/20 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Edit Profile - Stacken">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.push(`/profile/${stxAddress}`)}
              className="mr-4 p-2 text-gray-200 hover:text-gray-300 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-200">Edit Profile</h1>
              <p className="text-gray-200">Update your profile information and social links</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Profile Picture */}
          <div className="bg-gray-700/20 rounded-lg shadow-sm border border-gray-600/20 p-6">
            <h2 className="text-xl font-semibold text-gray-200 mb-6">Profile Picture</h2>

            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-600/20"
                  />
                ) : (
                  <UserAvatar
                    userAddress={stxAddress || ''}
                    avatar={undefined}
                    displayName=""
                    size={96}
                    className=""
                  />
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  id="avatar-upload"
                />
                <label
                  htmlFor="avatar-upload"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors cursor-pointer inline-flex items-center"
                >
                  <Upload className="mr-2" size={16} />
                  {avatarFile ? 'Change Avatar' : 'Upload Avatar'}
                </label>
                <p className="text-sm text-gray-400 mt-2">JPG, PNG or GIF. Max size 5MB.</p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-gray-700/20 rounded-lg shadow-sm border border-gray-600/20 p-6">
            <h2 className="text-xl font-semibold text-gray-200 mb-6">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Username</label>
                <input
                  type="text"
                  {...register('username', {
                    pattern: {
                      value: /^[a-zA-Z0-9_-]+$/,
                      message:
                        'Username can only contain letters, numbers, hyphens, and underscores',
                    },
                  })}
                  className="w-full px-3 py-2 border border-gray-600/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-500"
                  placeholder="your_username"
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                )}
                <p className="text-sm text-gray-400 mt-1">Unique identifier for your profile</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Display Name</label>
                <input
                  type="text"
                  {...register('displayName')}
                  className="w-full px-3 py-2 border border-gray-600/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-500"
                  placeholder="Your Display Name"
                />
                <p className="text-sm text-gray-400 mt-1">How others will see your name</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-200 mb-2">Email</label>
                <input
                  type="email"
                  {...register('email', {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  className="w-full px-3 py-2 border border-gray-600/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent  text-gray-500"
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
                <p className="text-sm text-gray-400 mt-1">
                  For notifications and updates (optional)
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-200 mb-2">Bio</label>
                <textarea
                  {...register('bio')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-600/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Tell others about yourself, your interests, and what you're working on..."
                />
                <p className="text-sm text-gray-400 mt-1">
                  Brief description about yourself (max 500 characters)
                </p>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-gray-700/20 rounded-lg shadow-sm border border-gray-600/20 p-6">
            <h2 className="text-xl font-semibold text-gray-200 mb-6">Social Links</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Twitter</label>
                <input
                  type="url"
                  {...register('socialLinks.twitter')}
                  className="w-full px-3 py-2 border border-gray-600/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-500"
                  placeholder="https://twitter.com/yourusername"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">GitHub</label>
                <input
                  type="url"
                  {...register('socialLinks.github')}
                  className="w-full px-3 py-2 border border-gray-600/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-500"
                  placeholder="https://github.com/yourusername"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Discord</label>
                <input
                  type="text"
                  {...register('socialLinks.discord')}
                  className="w-full px-3 py-2 border border-gray-600/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-500"
                  placeholder="yourusername#1234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Website</label>
                <input
                  type="url"
                  {...register('socialLinks.website')}
                  className="w-full px-3 py-2 border border-gray-600/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-500"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-200 mb-2">Telegram</label>
                <input
                  type="text"
                  {...register('socialLinks.telegram')}
                  className="w-full px-3 py-2 border border-gray-600/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-500"
                  placeholder="@yourusername"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => router.push(`/profile/${stxAddress}`)}
              className="border border-gray-600/20 text-gray-200 px-6 py-2 rounded-lg hover:bg-gray-600/20 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 inline-flex items-center"
            >
              <Save className="mr-2" size={16} />
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditProfile;
