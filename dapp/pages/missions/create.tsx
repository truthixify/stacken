import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth, useAccount } from '@micro-stacks/react';
import Layout from '../../components/Layout';
import { getDehydratedStateFromSession } from '../../common/session-helpers';
import { Calendar, Plus, X, Image, Link as LinkIcon, ExternalLink, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { useOpenContractCall } from '@micro-stacks/react';
import { uintCV, stringUtf8CV, noneCV, someCV, contractPrincipalCV } from 'micro-stacks/clarity';
import { DEPLOYER_ADDRESS, isDeployerAddress, CONTRACTS } from '../../lib/contracts';
import { useAllowedTokens } from '../../hooks/useAllowedTokens';
import { stxToMicroStx, scaleTokenAmount } from '../../lib/stx-utils';

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
  selectedToken?: string; // Contract address of selected token
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
  rewardDistribution: {
    type: 'LINEAR' | 'TIERED' | 'WINNER_TAKES_ALL' | 'TOP_PERFORMERS';
    maxWinners: number;
    tiers?: Array<{
      rank: string;
      percentage: number;
      minRank: number;
      maxRank: number;
    }>;
  };
}

const CreateMission: NextPage = () => {
  const { isSignedIn } = useAuth();
  const { stxAddress } = useAccount();
  const router = useRouter();
  const { openContractCall } = useOpenContractCall();
  const [loading, setLoading] = useState(false);

  // Check if current user is the deployer (can create point-only missions)
  const isDeployer = isDeployerAddress(stxAddress);

  const [currentStep, setCurrentStep] = useState(1);
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
  const [missionType, setMissionType] = useState<'TOKEN' | 'POINTS'>('TOKEN');

  // Fetch allowed tokens
  const { tokens: allowedTokens, loading: tokensLoading } = useAllowedTokens();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MissionFormData>({
    defaultValues: {
      totalPoints: 1000,
      tags: [],
      taskLinks: [],
      socialLinks: {},
      rewardDistribution: {
        type: 'LINEAR',
        maxWinners: 10,
        tiers: [],
      },
    },
  });

  const rewardDistribution = watch('rewardDistribution') || {
    type: 'LINEAR',
    maxWinners: 10,
    tiers: [],
  };

  const tokenAmount = watch('tokenAmount');

  // Auto-calculate points for non-deployer users or token missions
  React.useEffect(() => {
    if ((!isDeployer || missionType === 'TOKEN') && tokenAmount) {
      setValue('totalPoints', tokenAmount);
    }
  }, [tokenAmount, isDeployer, missionType, setValue]);
  const categories = [
    'Development',
    'Design',
    'Content',
    'Community',
    'Marketing',
    'Research',
    'Testing',
    'DeFi',
    'NFT',
    'Gaming',
    'Education',
    'Other',
  ];

  const distributionTypes = [
    { value: 'LINEAR', label: 'Linear Distribution', description: 'Equal rewards for all winners' },
    {
      value: 'TIERED',
      label: 'Tiered Rewards',
      description: 'Different rewards for different ranks',
    },
    { value: 'WINNER_TAKES_ALL', label: 'Winner Takes All', description: 'Only #1 gets rewards' },
    { value: 'TOP_PERFORMERS', label: 'Top Performers', description: 'Top X% get rewards' },
  ];

  React.useEffect(() => {
    if (!isSignedIn) {
      router.push('/');
    }
  }, [isSignedIn, router]);

  const updateRewardDistribution = (field: string, value: any) => {
    const current = watch('rewardDistribution');
    setValue('rewardDistribution', { ...current, [field]: value });
  };

  const addTier = () => {
    const current = watch('rewardDistribution');
    const newTier = {
      rank: `Tier ${(current.tiers?.length || 0) + 1}`,
      percentage: 10,
      minRank: (current.tiers?.length || 0) + 1,
      maxRank: (current.tiers?.length || 0) + 1,
    };
    setValue('rewardDistribution', {
      ...current,
      tiers: [...(current.tiers || []), newTier],
    });
  };

  const removeTier = (index: number) => {
    const current = watch('rewardDistribution');
    const updatedTiers = current.tiers?.filter((_, i) => i !== index) || [];
    setValue('rewardDistribution', { ...current, tiers: updatedTiers });
  };

  const updateTier = (index: number, field: string, value: any) => {
    const current = watch('rewardDistribution');
    const updatedTiers = [...(current.tiers || [])];
    updatedTiers[index] = { ...updatedTiers[index], [field]: value };
    setValue('rewardDistribution', { ...current, tiers: updatedTiers });
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

  const onSubmit = async (data: MissionFormData) => {
    if (!isSignedIn || !stxAddress) {
      toast.error('Link your Stacks wallet to launch bounties');
      return;
    }

    // Validate reward distribution
    if (
      data.rewardDistribution.type === 'TIERED' &&
      (!data.rewardDistribution.tiers || data.rewardDistribution.tiers.length === 0)
    ) {
      toast.error('Add at least one reward tier to continue');
      return;
    }

    if (data.rewardDistribution.type === 'TIERED') {
      const totalPercentage =
        data.rewardDistribution.tiers?.reduce((sum, tier) => sum + tier.percentage, 0) || 0;
      if (totalPercentage !== 100) {
        toast.error('Reward percentages must total 100%');
        return;
      }
    }

    // Validate deployer vs regular user permissions
    if (!isDeployer) {
      // Regular users must have token amount > 0 and points must equal token amount
      if (!data.tokenAmount || data.tokenAmount <= 0) {
        toast.error('You must specify a token amount.');
        return;
      }
      if (data.totalPoints !== data.tokenAmount) {
        toast.error('Points must equal token amount for token-based missions.');
        return;
      }
    } else {
      // Deployer validation based on mission type
      if (missionType === 'POINTS') {
        // Points-only mission
        if (!data.totalPoints || data.totalPoints <= 0) {
          toast.error('You must specify points for a points-only mission.');
          return;
        }
        // Set token amount to 0 for points-only missions
        data.tokenAmount = 0;
      } else {
        // Token mission
        if (!data.tokenAmount || data.tokenAmount <= 0) {
          toast.error('You must specify a token amount for token missions.');
          return;
        }
        if (data.totalPoints !== data.tokenAmount) {
          toast.error('For token missions, points must equal token amount.');
          return;
        }
      }
    }

    setLoading(true);
    const loadingToast = toast.loading('Launching your bounty mission...');

    try {
      let imageUrl = data.imageUrl;

      // Upload image if file is selected
      if (imageFile) {
        toast.loading('Uploading your mission image...', { id: loadingToast });
        try {
          imageUrl = await uploadImage(imageFile);
        } catch (error) {
          toast.error("Image upload failed — let's try that again", { id: loadingToast });
          setLoading(false);
          return;
        }
      }

      // First create mission on smart contract
      toast.loading('Publishing to Stacks blockchain...', { id: loadingToast });

      let missionId: string | null = null;

      // Prepare mission data for later database save
      const missionData = {
        ...data,
        creatorAddress: stxAddress,
        tags,
        taskLinks,
        details,
        imageUrl,
        description: details, // Use details as description for API compatibility
        tokenAddress: data.selectedToken || null, // Use selectedToken as tokenAddress
        // Store the user-entered amount (unscaled) for display purposes
        tokenAmount: data.tokenAmount || 0,
      };

      try {
        const contractFullAddress = CONTRACTS.MISSION_MANAGER;

        if (!contractFullAddress) {
          throw new Error('Contract address not found in environment variables');
        }

        const contractAddress = contractFullAddress.split('.')[0];
        const contractName = contractFullAddress.split('.')[1] || 'mission-manager';

        // Get current block height from Stacks API
        let currentBlock = 200000; // Fallback block height
        try {
          const blockResponse = await fetch('https://api.testnet.hiro.so/v2/info');
          const blockData = await blockResponse.json();
          currentBlock = blockData.stacks_tip_height || 200000;
          console.log('Current block height:', currentBlock);
        } catch (error) {
          console.warn('Could not fetch current block height, using fallback');
        }

        // Convert dates to block heights (approximate - 10 minutes per block)
        const startTimeMs = new Date(data.startTime).getTime();
        const endTimeMs = new Date(data.endTime).getTime();
        const nowMs = Date.now();

        const startBlock =
          currentBlock + Math.max(1, Math.floor((startTimeMs - nowMs) / (10 * 60 * 1000)));
        const endBlock =
          currentBlock +
          Math.max(startBlock + 144, Math.floor((endTimeMs - nowMs) / (10 * 60 * 1000)));

        console.log('Calculated blocks:', { startBlock, endBlock, currentBlock });

        // Helper function to get scaled token amount
        const getScaledTokenAmount = (amount: number, selectedToken?: string): number => {
          if (!selectedToken) {
            // STX - scale by 10^6 (1 STX = 1,000,000 microSTX)
            return stxToMicroStx(amount);
          } else {
            // Custom token - find decimals from allowedTokens
            const tokenData = allowedTokens.find(token => token.contractAddress === selectedToken);
            const decimals = tokenData?.decimals || 6; // Default to 6 if not found
            return scaleTokenAmount(amount, decimals);
          }
        };

        // Handle token argument based on selected token
        let tokenArg: any = noneCV(); // Default to none (STX)

        if (data.selectedToken && allowedTokens.length > 0) {
          // Find the selected token to get the contract address
          const selectedTokenData = allowedTokens.find(
            token => token.contractAddress === data.selectedToken
          );
          if (selectedTokenData) {
            // Parse contract address (format: SP1ABC...XYZ.token-name)
            const [address, contractName] = selectedTokenData.contractAddress.split('.');
            if (address && contractName) {
              tokenArg = someCV(contractPrincipalCV(address, contractName));
            }
          }
        }

        try {
          await openContractCall({
            contractAddress,
            contractName,
            functionName: 'create-mission',
            functionArgs: [
              tokenArg,
              uintCV(getScaledTokenAmount(data.tokenAmount || 0, data.selectedToken)),
              uintCV(data.totalPoints), // Points remain unscaled - they equal the user input amount
              uintCV(startBlock), // Use calculated start block
              uintCV(endBlock), // Use calculated end block
            ],
            onFinish: async (txData: any) => {
              console.log('Transaction finished:', txData);
              toast.loading('Finalizing your mission...', { id: loadingToast });

              try {
                // Generate mission address (contract address + mission ID)
                // For now, we'll use a placeholder mission ID that will be updated later
                const missionAddress = `${contractAddress}.mission-manager::mission-${Date.now()}`;

                // Now save to database after successful blockchain transaction
                const response = await fetch('/api/missions', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    ...missionData,
                    missionAddress,
                    status: 'ACTIVE', // Set as active since blockchain transaction succeeded
                    txId: txData.txId,
                  }),
                });

                if (!response.ok) {
                  const error = await response.json();
                  throw new Error(error.message || 'Failed to save mission');
                }

                const result = await response.json();
                missionId = result.mission._id;

                toast.success('Mission launched! Your bounty is live and ready for builders.', {
                  id: loadingToast,
                });
                router.push(`/missions/${missionId}`);
              } catch (dbError: any) {
                console.error('Database save error:', dbError);
                // More user-friendly error message
                if (dbError.message?.includes('duplicate key')) {
                  toast.error('Mission created successfully on blockchain! Redirecting...', {
                    id: loadingToast,
                  });
                  // Still redirect to missions page since blockchain transaction succeeded
                  setTimeout(() => router.push('/missions'), 2000);
                } else {
                  toast.error('Mission published successfully! You can find it in your profile.', {
                    id: loadingToast,
                  });
                  setTimeout(() => router.push('/missions'), 2000);
                }
              } finally {
                setLoading(false);
              }
            },
            onCancel: () => {
              console.log('Transaction cancelled');
              toast.error('Transaction cancelled — no worries, try again when ready', {
                id: loadingToast,
              });
              setLoading(false);
            },
          });
        } catch (contractCallError) {
          console.error('Contract call failed:', contractCallError);
          toast.error(
            `Contract call failed: ${
              contractCallError instanceof Error ? contractCallError.message : 'Unknown error'
            }`,
            { id: loadingToast }
          );
          setLoading(false);
        }
      } catch (contractError) {
        console.error('Contract call error:', contractError);
        toast.error('Failed to publish to blockchain. Mission saved as draft.', {
          id: loadingToast,
        });
        router.push(`/missions/${missionId}`);
      }
    } catch (error) {
      console.error('Error creating mission:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to create mission. Please try again.',
        { id: loadingToast }
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isSignedIn) {
    return null;
  }

  const steps = [
    { number: 1, title: 'Mission Details', description: 'Set up your bounty challenge' },
    { number: 2, title: 'Reward Pool', description: 'Configure how builders get paid' },
    { number: 3, title: 'Launch', description: 'Review and go live' },
  ];

  return (
    <Layout title="Launch Your Bounty — Stacken">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-200 mb-2">Launch Your Bounty Mission</h1>
              <p className="text-gray-200">
                Create challenges, set rewards, and watch builders create amazing work
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          {/* Desktop Progress Steps */}
          <div className="hidden md:flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.number
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'border-gray-300 text-gray-400'
                  }`}
                >
                  {step.number}
                </div>
                <div className="ml-3">
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= step.number ? 'text-primary-600' : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-400">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      currentStep > step.number ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Mobile Progress Steps */}
          <div className="md:hidden">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-2">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm ${
                        currentStep >= step.number
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : 'border-gray-300 text-gray-400'
                      }`}
                    >
                      {step.number}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-8 h-0.5 mx-2 ${
                          currentStep > step.number ? 'bg-primary-600' : 'bg-gray-300'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-primary-600">
                Step {currentStep}: {steps[currentStep - 1]?.title}
              </p>
              <p className="text-xs text-gray-400">{steps[currentStep - 1]?.description}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="bg-gray-700/20 rounded-lg shadow-sm border border-gray-600/20 p-6">
              <h2 className="text-xl font-semibold text-gray-200 mb-6">Mission Details</h2>

              {!isDeployer && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-blue-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Token-Based Missions</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Participants also earn points equal to their reward amount, which will be
                        used for future incentives and rewards.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isDeployer && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-200 mb-3">
                    Reward Type *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        missionType === 'TOKEN'
                          ? 'border-primary-500'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => setMissionType('TOKEN')}
                    >
                      <div className="flex items-center mb-2">
                        <input
                          type="radio"
                          name="missionType"
                          value="TOKEN"
                          checked={missionType === 'TOKEN'}
                          onChange={() => setMissionType('TOKEN')}
                          className="mr-2"
                        />
                        <h3 className="font-medium text-white">Token Reward</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        Distribute tokens/STX to contributors. Points will match token amount.
                      </p>
                    </div>

                    <div
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        missionType === 'POINTS'
                          ? 'border-primary-500'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => setMissionType('POINTS')}
                    >
                      <div className="flex items-center mb-2">
                        <input
                          type="radio"
                          name="missionType"
                          value="POINTS"
                          checked={missionType === 'POINTS'}
                          onChange={() => setMissionType('POINTS')}
                          className="mr-2"
                        />
                        <h3 className="font-medium text-white">Points-Only Reward</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        Award only points to contributors. No token distribution.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Mission Title *
                  </label>
                  <input
                    type="text"
                    {...register('title', { required: 'Title is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-500"
                    placeholder="Build a DeFi dashboard, Design a logo, Write documentation, Create video content..."
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Mission Summary *
                  </label>
                  <textarea
                    {...register('summary', { required: 'Summary is required' })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-500"
                    placeholder="What work do you need done? Development, design, content, community - keep it short and exciting..."
                  />
                  {errors.summary && (
                    <p className="text-red-500 text-sm mt-1">{errors.summary.message}</p>
                  )}
                  <p className="text-sm text-gray-400 mt-1">
                    This hook will appear on mission cards — make it compelling!
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Mission Brief & Requirements *
                  </label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
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
                      placeholder="Describe your mission, provide detailed instructions, requirements, and guidelines for contributors. Include deliverables, timeline, and success criteria. You can format text, add links, and create lists."
                      style={{
                        minHeight: '250px',
                        height: '250px',
                      }}
                      theme="snow"
                    />
                  </div>

                  <p className="text-sm text-gray-400 mt-1">
                    Spell out exactly what contributors need to deliver, how you&apos;ll judge
                    submissions, and any special requirements for the work.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Mission Type *
                  </label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-500 text-gray-500"
                  >
                    <option value="">What kind of mission is this?</option>
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

                {allowedTokens.length > 0 && (missionType === 'TOKEN' || !isDeployer) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Token Type *
                    </label>
                    <select
                      {...register('selectedToken')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-500"
                    >
                      <option value="">STX (Default)</option>
                      {allowedTokens.map(token => (
                        <option key={token._id} value={token.contractAddress}>
                          {token.name} ({token.symbol})
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-gray-400 mt-1">
                      Choose STX or select from approved tokens for rewards
                    </p>
                  </div>
                )}

                {(missionType === 'TOKEN' || !isDeployer) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Token Reward Amount{' '}
                      {!isDeployer || missionType === 'TOKEN' ? '*' : '(Optional)'}
                    </label>
                    <input
                      type="number"
                      {...register('tokenAmount', {
                        min: 0,
                        required:
                          !isDeployer || missionType === 'TOKEN'
                            ? 'Token amount is required'
                            : false,
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-500"
                      placeholder="1000"
                    />
                    {errors.tokenAmount && (
                      <p className="text-red-500 text-sm mt-1">{errors.tokenAmount.message}</p>
                    )}
                    <p className="text-sm text-gray-400 mt-1">
                      {isDeployer
                        ? 'How many tokens will you distribute to contributors? Points will automatically match this amount.'
                        : 'How many tokens will you distribute to contributors? This will also set your points amount.'}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Total Reward Points *
                  </label>
                  {isDeployer && missionType === 'POINTS' ? (
                    <>
                      <input
                        type="number"
                        {...register('totalPoints', {
                          required: 'Total points is required',
                          min: 1,
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-500"
                        placeholder="1000"
                      />
                      {errors.totalPoints && (
                        <p className="text-red-500 text-sm mt-1">{errors.totalPoints.message}</p>
                      )}
                      <p className="text-sm text-gray-400 mt-1">
                        Set the total points to distribute among contributors (points-only mission)
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500">
                        {tokenAmount || 0} points (auto-calculated from token amount)
                      </div>
                      <input
                        type="hidden"
                        {...register('totalPoints', {
                          required: 'Total points is required',
                          min: 1,
                        })}
                        value={tokenAmount || 0}
                      />
                      <p className="text-sm text-gray-400 mt-1">
                        Points are automatically set to match your token amount.
                      </p>
                    </>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Mission Cover Image
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
                        className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors"
                      >
                        <Upload className="mr-2 h-5 w-5 text-gray-400" />
                        <span className="text-gray-200">
                          {imageFile ? imageFile.name : 'Add a cover image to grab attention'}
                        </span>
                      </label>
                    </div>
                    {imagePreview && (
                      <div className="flex-shrink-0">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    A great image helps builders understand your mission at a glance
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="datetime-local"
                    {...register('startTime', { required: 'Start time is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-500 text-gray-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-500 text-gray-500"
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
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-500 text-gray-400"
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

                {/* Task Links */}
                <div className="md:col-span-2">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-200">Task Links</label>
                    <button
                      type="button"
                      onClick={addTaskLink}
                      className="bg-primary-600 text-white px-3 py-1 rounded text-sm hover:bg-primary-700 transition-colors inline-flex items-center"
                    >
                      <Plus className="mr-1" size={14} />
                      Add Link
                    </button>
                  </div>

                  {taskLinks.length > 0 ? (
                    <div className="space-y-4">
                      {taskLinks.map((link, index) => (
                        <div key={index} className="border border-gray-600/20 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-medium text-gray-200">Link {index + 1}</h4>
                            <button
                              type="button"
                              onClick={() => removeTaskLink(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X size={16} />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-200 mb-1">
                                Title *
                              </label>
                              <input
                                type="text"
                                value={link.title}
                                onChange={e => updateTaskLink(index, 'title', e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent text-gray-500"
                                placeholder="GitHub Repository"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-200 mb-1">
                                Type *
                              </label>
                              <select
                                value={link.type}
                                onChange={e => updateTaskLink(index, 'type', e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent text-gray-500"
                              >
                                <option value="GITHUB">GitHub</option>
                                <option value="TWITTER">Twitter</option>
                                <option value="DISCORD">Discord</option>
                                <option value="WEBSITE">Website</option>
                                <option value="DOCUMENT">Document</option>
                                <option value="OTHER">Other</option>
                              </select>
                            </div>
                          </div>

                          <div className="mb-3">
                            <label className="block text-xs font-medium text-gray-200 mb-1">
                              URL *
                            </label>
                            <input
                              type="url"
                              value={link.url}
                              onChange={e => updateTaskLink(index, 'url', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent text-gray-500"
                              placeholder="https://github.com/your-repo"
                            />
                          </div>

                          <div className="mb-3">
                            <label className="block text-xs font-medium text-gray-200 mb-1">
                              Description
                            </label>
                            <textarea
                              value={link.description || ''}
                              onChange={e => updateTaskLink(index, 'description', e.target.value)}
                              rows={2}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent text-gray-500"
                              placeholder="Brief description of what this link is for"
                            />
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`required-${index}`}
                              checked={link.required}
                              onChange={e => updateTaskLink(index, 'required', e.target.checked)}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded text-gray-300"
                            />
                            <label
                              htmlFor={`required-${index}`}
                              className="ml-2 text-sm text-gray-200"
                            >
                              Required for participation
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 border-2 border-dashed border-gray-600/20 rounded-lg bg-gray-700/20">
                      <LinkIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-gray-200 mb-3">No task links added yet</p>
                      <p className="text-sm text-gray-400 mb-3">
                        Add links to GitHub repos, Twitter accounts, Discord servers, or other
                        resources participants need
                      </p>
                      <button
                        type="button"
                        onClick={addTaskLink}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        Add Your First Link
                      </button>
                    </div>
                  )}
                  <p className="text-sm text-gray-400 mt-2">
                    Add relevant links for your mission (GitHub repos for code contributions,
                    Twitter for social missions, etc.)
                  </p>
                </div>

                {/* Social Links */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-200 mb-3">
                    Mission Social Links (Optional)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Twitter
                      </label>
                      <input
                        type="url"
                        {...register('socialLinks.twitter')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-500"
                        placeholder="https://twitter.com/yourmission"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Discord
                      </label>
                      <input
                        type="url"
                        {...register('socialLinks.discord')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-500"
                        placeholder="https://discord.gg/yourmission"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        {...register('socialLinks.website')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-500"
                        placeholder="https://yourproject.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Telegram
                      </label>
                      <input
                        type="url"
                        {...register('socialLinks.telegram')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-500"
                        placeholder="https://t.me/yourmission"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Add social media links for your mission to help builders connect and stay
                    updated
                  </p>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => {
                    const title = watch('title');
                    const category = watch('category');
                    const startTime = watch('startTime');
                    const endTime = watch('endTime');
                    const totalPoints = watch('totalPoints');

                    if (
                      !title ||
                      !watch('summary') ||
                      !details ||
                      !category ||
                      !startTime ||
                      !endTime ||
                      !totalPoints
                    ) {
                      toast.error('Please fill in all required fields');
                      return;
                    }

                    if (new Date(startTime) >= new Date(endTime)) {
                      toast.error('End date must be after start date');
                      return;
                    }

                    if (totalPoints <= 0) {
                      toast.error('Total points must be greater than 0');
                      return;
                    }

                    setCurrentStep(2);
                  }}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Next: Rewards
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Reward Distribution */}
          {currentStep === 2 && (
            <div className="bg-gray-700/20 rounded-lg shadow-sm border border-gray-600/20 p-6">
              <h2 className="text-xl font-semibold text-gray-200 mb-6">Reward Distribution</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-3">
                    Distribution Type *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {distributionTypes.map(type => (
                      <div
                        key={type.value}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                          rewardDistribution.type === type.value
                            ? 'border-primary-500 bg-gray-900/20'
                            : 'border-gray-600/20 hover:border-gray-500/20'
                        }`}
                        onClick={() => updateRewardDistribution('type', type.value)}
                      >
                        <h3 className="font-medium text-gray-200 mb-1">{type.label}</h3>
                        <p className="text-sm text-gray-200 mb-2">{type.description}</p>
                        {watch('totalPoints') && (
                          <div className="text-xs text-orange-600">
                            {type.value === 'LINEAR' && (
                              <p>
                                Example: Each winner gets{' '}
                                {Math.floor(
                                  (watch('totalPoints') || 0) / (rewardDistribution.maxWinners || 1)
                                )}{' '}
                                points
                              </p>
                            )}
                            {type.value === 'WINNER_TAKES_ALL' && (
                              <p>
                                Example: 1st place gets all{' '}
                                {(watch('totalPoints') || 0).toLocaleString()} points
                              </p>
                            )}
                            {type.value === 'TIERED' && (
                              <p>Example: 1st: 5000pts, 2nd: 3000pts, 3rd: 2000pts</p>
                            )}
                            {type.value === 'TOP_PERFORMERS' && (
                              <p>
                                Example: Top {rewardDistribution.maxWinners || 1} share{' '}
                                {(watch('totalPoints') || 0).toLocaleString()} points
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Maximum Winners *
                  </label>
                  <input
                    type="number"
                    value={rewardDistribution.maxWinners}
                    onChange={e =>
                      updateRewardDistribution('maxWinners', parseInt(e.target.value) || 1)
                    }
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-500"
                    placeholder="10"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    {rewardDistribution.type === 'WINNER_TAKES_ALL'
                      ? 'Only the top performer will receive rewards'
                      : rewardDistribution.type === 'LINEAR'
                      ? 'All winners will receive equal rewards'
                      : rewardDistribution.type === 'TOP_PERFORMERS'
                      ? 'Top performers will share the reward pool'
                      : 'Number of people who can win rewards'}
                  </p>
                </div>

                {rewardDistribution.type === 'TIERED' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-sm font-medium text-gray-200">
                        Reward Tiers
                      </label>
                      <button
                        type="button"
                        onClick={addTier}
                        className="bg-primary-600 text-white px-3 py-1 rounded text-sm hover:bg-primary-700 transition-colors inline-flex items-center"
                      >
                        <Plus className="mr-1" size={14} />
                        Add Tier
                      </button>
                    </div>

                    {rewardDistribution.tiers && rewardDistribution.tiers.length > 0 ? (
                      <div className="space-y-3">
                        {rewardDistribution.tiers.map((tier, index) => (
                          <div key={index} className="border border-gray-600/20 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-medium text-gray-200">Tier {index + 1}</h4>
                              <button
                                type="button"
                                onClick={() => removeTier(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X size={16} />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-200 mb-1">
                                  Tier Name
                                </label>
                                <input
                                  type="text"
                                  value={tier.rank}
                                  onChange={e => updateTier(index, 'rank', e.target.value)}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent text-gray-500"
                                  placeholder="1st Place"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-200 mb-1">
                                  Percentage %
                                </label>
                                <input
                                  type="number"
                                  value={tier.percentage}
                                  onChange={e =>
                                    updateTier(index, 'percentage', parseInt(e.target.value) || 0)
                                  }
                                  min="0"
                                  max="100"
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent text-gray-500"
                                  placeholder="50"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-200 mb-1">
                                  Min Rank
                                </label>
                                <input
                                  type="number"
                                  value={tier.minRank}
                                  onChange={e =>
                                    updateTier(index, 'minRank', parseInt(e.target.value) || 1)
                                  }
                                  min="1"
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent text-gray-500"
                                  placeholder="1"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-200 mb-1">
                                  Max Rank
                                </label>
                                <input
                                  type="number"
                                  value={tier.maxRank}
                                  onChange={e =>
                                    updateTier(index, 'maxRank', parseInt(e.target.value) || 1)
                                  }
                                  min="1"
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent text-gray-500"
                                  placeholder="1"
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        <div className="bg-gray-700/20 rounded-lg p-3">
                          <div className="space-y-2">
                            <p className="text-sm text-gray-200">
                              Total:{' '}
                              {rewardDistribution.tiers.reduce(
                                (sum, tier) => sum + tier.percentage,
                                0
                              )}
                              %
                              {rewardDistribution.tiers.reduce(
                                (sum, tier) => sum + tier.percentage,
                                0
                              ) !== 100 && (
                                <span className="text-red-600 ml-2">(Must equal 100%)</span>
                              )}
                            </p>
                            {watch('totalPoints') &&
                              rewardDistribution.tiers.reduce(
                                (sum, tier) => sum + tier.percentage,
                                0
                              ) === 100 && (
                                <div className="text-sm text-blue-600">
                                  <p className="font-medium mb-1">Point Distribution Preview:</p>
                                  {rewardDistribution.tiers.map((tier, index) => (
                                    <p key={index}>
                                      • {tier.rank}:{' '}
                                      {Math.floor(
                                        ((watch('totalPoints') || 0) * tier.percentage) / 100
                                      ).toLocaleString()}{' '}
                                      points
                                    </p>
                                  ))}
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 border-2 border-dashed border-gray-600/20 rounded-lg bg-gray-700/20">
                        <p className="text-gray-200 mb-3">No tiers added yet</p>
                        <button
                          type="button"
                          onClick={addTier}
                          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          Add Your First Tier
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {rewardDistribution.type === 'LINEAR' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-orange-700 mb-2">
                      Linear Distribution Preview
                    </h4>
                    <p className="text-sm text-orange-700">
                      Each of the top {rewardDistribution.maxWinners || 1} performers will receive{' '}
                      {Math.floor(
                        (watch('totalPoints') || 0) / (rewardDistribution.maxWinners || 1)
                      )}{' '}
                      points
                      {watch('tokenAmount') && (watch('tokenAmount') || 0) > 0 && (
                        <>
                          {' '}
                          and{' '}
                          {Math.floor(
                            (watch('tokenAmount') || 0) / (rewardDistribution.maxWinners || 1)
                          )}{' '}
                          tokens
                        </>
                      )}
                    </p>
                  </div>
                )}

                {rewardDistribution.type === 'WINNER_TAKES_ALL' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-900 mb-2">Winner Takes All Preview</h4>
                    <p className="text-sm text-yellow-800">
                      Only the #1 performer will receive all {watch('totalPoints') || 0} points
                      {watch('tokenAmount') && (watch('tokenAmount') || 0) > 0 && (
                        <> and {watch('tokenAmount') || 0} tokens</>
                      )}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="border border-gray-300 text-gray-200 px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (rewardDistribution.type === 'TIERED') {
                      if (!rewardDistribution.tiers || rewardDistribution.tiers.length === 0) {
                        toast.error('Please add at least one tier for tiered rewards');
                        return;
                      }

                      const totalPercentage = rewardDistribution.tiers.reduce(
                        (sum, tier) => sum + tier.percentage,
                        0
                      );
                      if (totalPercentage !== 100) {
                        toast.error('Tier percentages must add up to 100%');
                        return;
                      }
                    }

                    setCurrentStep(3);
                  }}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Next: Review
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="bg-gray-700/20 rounded-lg shadow-sm border border-gray-600/20 p-6">
              <h2 className="text-xl font-semibold text-gray-200 mb-6">Review Mission</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-200 mb-2">Mission Details</h3>
                  <div className="bg-gray-700/20 rounded-lg p-4 space-y-2">
                    <p>
                      <strong>Title:</strong> {watch('title')}
                    </p>
                    <p>
                      <strong>Category:</strong> {watch('category')}
                    </p>
                    <p>
                      <strong>Total Points:</strong> {watch('totalPoints')?.toLocaleString() || '0'}
                    </p>
                    {watch('tokenAmount') && (watch('tokenAmount') || 0) > 0 && (
                      <p>
                        <strong>Token Amount:</strong>{' '}
                        {watch('tokenAmount')?.toLocaleString() || '0'}
                      </p>
                    )}
                    <p>
                      <strong>Duration:</strong>{' '}
                      {watch('startTime')
                        ? new Date(watch('startTime') || '').toLocaleDateString()
                        : 'Not set'}{' '}
                      to{' '}
                      {watch('endTime')
                        ? new Date(watch('endTime') || '').toLocaleDateString()
                        : 'Not set'}
                    </p>
                    {tags.length > 0 && (
                      <p>
                        <strong>Tags:</strong> {tags.join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                {details && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-200 mb-2">
                      Mission Description & Instructions
                    </h3>
                    <div className="bg-gray-700/20 rounded-lg p-4">
                      <div
                        className="prose prose-sm max-w-none text-gray-200"
                        dangerouslySetInnerHTML={{ __html: details }}
                      />
                    </div>
                  </div>
                )}

                {taskLinks.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-200 mb-2">Task Links</h3>
                    <div className="bg-gray-700/20 rounded-lg p-4 space-y-3">
                      {taskLinks.map((link, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <ExternalLink className="h-4 w-4 text-gray-400 mt-0.5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-200">{link.title}</span>
                              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                                {link.type}
                              </span>
                              {link.required && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                  Required
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-200 mt-1">{link.url}</p>
                            {link.description && (
                              <p className="text-sm text-gray-400 mt-1">{link.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-medium text-gray-200 mb-2">Reward Distribution</h3>
                  <div className="bg-gray-700/20 rounded-lg p-4 space-y-2">
                    <p>
                      <strong>Type:</strong>{' '}
                      {distributionTypes.find(t => t.value === rewardDistribution.type)?.label}
                    </p>
                    <p>
                      <strong>Max Winners:</strong> {rewardDistribution.maxWinners}
                    </p>

                    {rewardDistribution.type === 'TIERED' && rewardDistribution.tiers && (
                      <div>
                        <p>
                          <strong>Tiers:</strong>
                        </p>
                        <div className="ml-4 space-y-1">
                          {rewardDistribution.tiers.map((tier, index) => (
                            <p key={index} className="text-sm text-gray-200">
                              {tier.rank}: {tier.percentage}% (Ranks {tier.minRank}-{tier.maxRank})
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {rewardDistribution.type === 'LINEAR' && (
                      <p className="text-sm text-gray-200">
                        Each winner gets{' '}
                        {Math.floor(
                          (watch('totalPoints') || 0) / (rewardDistribution.maxWinners || 1)
                        )}{' '}
                        points
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="border border-gray-300 text-gray-200 px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Launching...' : 'Launch Mission'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </Layout>
  );
};

export default CreateMission;
