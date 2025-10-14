import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth, useAccount } from '@micro-stacks/react';
import Layout from '../../../components/Layout';
import { getDehydratedStateFromSession } from '../../../common/session-helpers';
import { Calendar, Plus, X, Upload, Save, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

// Import Quill styles
import 'react-quill/dist/quill.snow.css';

import type { NextPage, GetServerSidePropsContext } from 'next';

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      dehydratedState: await getDehydratedStateFromSession(ctx),
    },
  };
}

interface MissionFormData {
  title: string;
  summary: string;
  details: string;
  category: string;
  imageUrl?: string;
  tokenAddress?: string;
  tokenAmount?: number;
  totalPoints: number;
  startTime: string;
  endTime: string;
  tags: string[];
  taskLinks: Array<{
    title: string;
    url: string;
    type: 'GITHUB' | 'TWITTER' | 'DISCORD' | 'WEBSITE' | 'DOCUMENT' | 'OTHER';
    required: boolean;
    description?: string;
  }>;
  socialLinks: {
    twitter?: string;
    discord?: string;
    website?: string;
    telegram?: string;
  };
}

const EditMission: NextPage = () => {
  const { isSignedIn } = useAuth();
  const { stxAddress } = useAccount();
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [taskLinks, setTaskLinks] = useState<
    Array<{
      title: string;
      url: string;
      type: 'GITHUB' | 'TWITTER' | 'DISCORD' | 'WEBSITE' | 'DOCUMENT' | 'OTHER';
      required: boolean;
      description?: string;
    }>
  >([]);
  const [details, setDetails] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<MissionFormData>();

  const categories = [
    'DeFi',
    'NFT',
    'Gaming',
    'Social',
    'Education',
    'Community',
    'Marketing',
    'Other',
  ];

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/');
      return;
    }

    if (id) {
      fetchMission();
    }
  }, [isSignedIn, id, router]);

  const fetchMission = async () => {
    try {
      const response = await fetch(`/api/missions/${id}`);
      if (response.ok) {
        const data = await response.json();
        const mission = data.mission;

        // Check if user is the creator
        if (mission.creatorAddress !== stxAddress) {
          toast.error('You can only edit missions you created');
          router.push(`/missions/${id}`);
          return;
        }

        // Populate form with existing data
        reset({
          title: mission.title,
          category: mission.category,
          tokenAddress: mission.tokenAddress || '',
          tokenAmount: mission.tokenAmount || 0,
          totalPoints: mission.totalPoints,
          startTime: new Date(mission.startTime).toISOString().slice(0, 16),
          endTime: new Date(mission.endTime).toISOString().slice(0, 16),
          socialLinks: mission.socialLinks || {},
        });

        setDetails(mission.details || mission.description || '');
        setTags(mission.tags || []);
        setTaskLinks(mission.taskLinks || []);
        setImagePreview(mission.imageUrl || '');
      } else {
        toast.error('Mission not found');
        router.push('/missions');
      }
    } catch (error) {
      console.error('Error fetching mission:', error);
      toast.error('Failed to load mission');
      router.push('/missions');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = e => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
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
      console.error('Image upload failed:', error);
      throw new Error('Failed to upload image');
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      setValue('tags', updatedTags);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    setValue('tags', updatedTags);
  };

  const addTaskLink = () => {
    const newLink = {
      title: '',
      url: '',
      type: 'OTHER' as const,
      required: false,
      description: '',
    };
    const updatedLinks = [...taskLinks, newLink];
    setTaskLinks(updatedLinks);
    setValue('taskLinks', updatedLinks);
  };

  const removeTaskLink = (index: number) => {
    const updatedLinks = taskLinks.filter((_, i) => i !== index);
    setTaskLinks(updatedLinks);
    setValue('taskLinks', updatedLinks);
  };

  const updateTaskLink = (index: number, field: string, value: any) => {
    const updatedLinks = [...taskLinks];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setTaskLinks(updatedLinks);
    setValue('taskLinks', updatedLinks);
  };

  const onSubmit = async (data: MissionFormData) => {
    if (!isSignedIn || !stxAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Updating mission...');

    try {
      let imageUrl = data.imageUrl || imagePreview;

      // Upload image if file is selected
      if (imageFile) {
        toast.loading('Uploading image...', { id: loadingToast });
        try {
          imageUrl = await uploadImage(imageFile);
        } catch (error) {
          toast.error('Failed to upload image. Continuing with existing image.', {
            id: loadingToast,
          });
        }
      }

      toast.loading('Updating mission...', { id: loadingToast });
      const missionData = {
        ...data,
        tags,
        taskLinks,
        details,
        imageUrl,
        description: details, // Use details as description for API compatibility
        userAddress: stxAddress, // Add user address for authorization
      };

      const response = await fetch(`/api/missions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(missionData),
      });

      if (response.ok) {
        toast.success('Mission updated successfully!', { id: loadingToast });
        router.push(`/missions/${id}`);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update mission', { id: loadingToast });
      }
    } catch (error) {
      console.error('Error updating mission:', error);
      toast.error('Failed to update mission. Please try again.', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Layout title="Loading...">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700/20 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-700/20 rounded w-2/3 mb-8"></div>
            <div className="space-y-6">
              <div className="h-32 bg-gray-700/20 rounded"></div>
              <div className="h-32 bg-gray-700/20 rounded"></div>
              <div className="h-32 bg-gray-700/20 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Edit Mission - Stacken">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.push(`/missions/${id}`)}
              className="mr-4 p-2 text-gray-200 hover:text-gray-300 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-200">Edit Mission</h1>
              <p className="text-gray-200">Update your mission details and settings</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-gray-700/20 rounded-lg shadow-sm border border-gray-600/20 p-6">
            <h2 className="text-xl font-semibold text-gray-200 mb-6">Mission Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Mission Title *
                </label>
                <input
                  type="text"
                  {...register('title', { required: 'Title is required' })}
                  className="w-full px-3 py-2 border border-gray-600/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-500"
                  placeholder="Enter mission title"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Mission Description & Instructions *
                </label>
                <div className="border border-gray-600/20 rounded-lg">
                  <ReactQuill
                    value={details}
                    onChange={value => {
                      setDetails(value);
                      setValue('details', value);
                    }}
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        ['link', 'code-block'],
                        ['clean'],
                      ],
                    }}
                    formats={[
                      'header',
                      'bold',
                      'italic',
                      'underline',
                      'strike',
                      'list',
                      'bullet',
                      'link',
                      'code-block',
                    ]}
                    placeholder="Describe your mission, provide detailed instructions, requirements, and guidelines for participants."
                    className="text-gray-500"
                    style={{ minHeight: '250px' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Category *</label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="w-full px-3 py-2 border border-gray-600/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-500"
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Total Points Pool *
                </label>
                <input
                  type="number"
                  {...register('totalPoints', { required: 'Total points is required', min: 1 })}
                  className="w-full px-3 py-2 border border-gray-600/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-500"
                  placeholder="1000"
                />
                {errors.totalPoints && (
                  <p className="text-red-500 text-sm mt-1">{errors.totalPoints.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Mission Image
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-600/20 rounded-lg cursor-pointer hover:border-primary-500 transition-colors"
                    >
                      <Upload className="mr-2 h-5 w-5 text-gray-400" />
                      <span className="text-gray-500">
                        {imageFile ? imageFile.name : 'Click to upload new image'}
                      </span>
                    </label>
                  </div>
                  {imagePreview && (
                    <div className="flex-shrink-0">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-lg border border-gray-600/20"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Start Date *</label>
                <input
                  type="datetime-local"
                  {...register('startTime', { required: 'Start time is required' })}
                  className="w-full px-3 py-2 border border-gray-600/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-500"
                />
                {errors.startTime && (
                  <p className="text-red-500 text-sm mt-1">{errors.startTime.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">End Date *</label>
                <input
                  type="datetime-local"
                  {...register('endTime', { required: 'End time is required' })}
                  className="w-full px-3 py-2 border border-gray-600/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-500"
                />
                {errors.endTime && (
                  <p className="text-red-500 text-sm mt-1">{errors.endTime.message}</p>
                )}
              </div>

              {/* Tags */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-200 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-primary-600 hover:text-primary-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 border border-gray-600/20 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-500"
                    placeholder="Add a tag"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-primary-600 text-white rounded-r-lg hover:bg-primary-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => router.push(`/missions/${id}`)}
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
              {loading ? 'Updating...' : 'Update Mission'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditMission;
