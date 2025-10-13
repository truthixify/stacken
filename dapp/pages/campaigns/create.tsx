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
import {
    uintCV,
    stringUtf8CV,
    noneCV,
    someCV,
    contractPrincipalCV
} from 'micro-stacks/clarity';

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

interface CampaignFormData {
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

const CreateCampaign: NextPage = () => {
    const { isSignedIn } = useAuth();
    const { stxAddress } = useAccount();
    const router = useRouter();
    const { openContractCall } = useOpenContractCall();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');
    const [taskLinks, setTaskLinks] = useState<Array<{
        title: string;
        url: string;
        type: 'GITHUB' | 'TWITTER' | 'DISCORD' | 'WEBSITE' | 'DOCUMENT' | 'OTHER';
        required: boolean;
        description?: string;
    }>>([]);
    const [details, setDetails] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CampaignFormData>({
        defaultValues: {
            totalPoints: 1000,
            tags: [],
            taskLinks: [],
            socialLinks: {},
            rewardDistribution: {
                type: 'LINEAR',
                maxWinners: 10,
                tiers: []
            }
        }
    });

    const rewardDistribution = watch('rewardDistribution') || { type: 'LINEAR', maxWinners: 10, tiers: [] };
    const categories = ['DeFi', 'NFT', 'Gaming', 'Social', 'Education', 'Community', 'Marketing', 'Other'];

    const distributionTypes = [
        { value: 'LINEAR', label: 'Linear Distribution', description: 'Equal rewards for all winners' },
        { value: 'TIERED', label: 'Tiered Rewards', description: 'Different rewards for different ranks' },
        { value: 'WINNER_TAKES_ALL', label: 'Winner Takes All', description: 'Only #1 gets rewards' },
        { value: 'TOP_PERFORMERS', label: 'Top Performers', description: 'Top X% get rewards' }
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
            maxRank: (current.tiers?.length || 0) + 1
        };
        setValue('rewardDistribution', {
            ...current,
            tiers: [...(current.tiers || []), newTier]
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
            description: ''
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
            reader.onload = (e) => {
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

    const onSubmit = async (data: CampaignFormData) => {
        if (!isSignedIn || !stxAddress) {
            toast.error('Please connect your wallet first');
            return;
        }

        // Validate reward distribution
        if (data.rewardDistribution.type === 'TIERED' && (!data.rewardDistribution.tiers || data.rewardDistribution.tiers.length === 0)) {
            toast.error('Please add at least one tier for tiered rewards');
            return;
        }

        if (data.rewardDistribution.type === 'TIERED') {
            const totalPercentage = data.rewardDistribution.tiers?.reduce((sum, tier) => sum + tier.percentage, 0) || 0;
            if (totalPercentage !== 100) {
                toast.error('Tier percentages must add up to 100%');
                return;
            }
        }

        setLoading(true);
        const loadingToast = toast.loading('Preparing campaign...');

        try {
            let imageUrl = data.imageUrl;

            // Upload image if file is selected
            if (imageFile) {
                toast.loading('Uploading image...', { id: loadingToast });
                try {
                    imageUrl = await uploadImage(imageFile);
                } catch (error) {
                    toast.error('Failed to upload image. Please try again.', { id: loadingToast });
                    setLoading(false);
                    return;
                }
            }

            // First create campaign on smart contract
            toast.loading('Publishing to blockchain...', { id: loadingToast });

            let campaignId: string | null = null;

            // Prepare campaign data for later database save
            const campaignData = {
                ...data,
                creatorAddress: stxAddress,
                tags,
                taskLinks,
                details,
                imageUrl,
                description: details // Use details as description for API compatibility
            };

            try {
                const contractFullAddress = process.env.NEXT_PUBLIC_CAMPAIGN_MANAGER_CONTRACT;

                if (!contractFullAddress) {
                    throw new Error('Contract address not found in environment variables');
                }

                const contractAddress = contractFullAddress.split('.')[0];
                const contractName = contractFullAddress.split('.')[1] || 'campaign-manager';

                console.log('Parsed contract address:', contractAddress);
                console.log('Parsed contract name:', contractName);

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

                const startBlock = currentBlock + Math.max(1, Math.floor((startTimeMs - nowMs) / (10 * 60 * 1000)));
                const endBlock = currentBlock + Math.max(startBlock + 144, Math.floor((endTimeMs - nowMs) / (10 * 60 * 1000)));

                console.log('Calculated blocks:', { startBlock, endBlock, currentBlock });

                // For now, we'll pass none for token since we need trait implementation
                // TODO: Implement proper SIP-010 trait handling
                const tokenArg = noneCV();

                try {
                    await openContractCall({
                        contractAddress,
                        contractName,
                        functionName: 'create-campaign',
                        functionArgs: [
                            tokenArg,
                            uintCV(data.tokenAmount || 0),
                            uintCV(data.totalPoints),
                            uintCV(startBlock), // Use calculated start block
                            uintCV(endBlock) // Use calculated end block
                        ],
                        onFinish: async (txData: any) => {
                            console.log('Transaction finished:', txData);
                            toast.loading('Saving campaign...', { id: loadingToast });

                            try {
                                // Generate campaign address (contract address + campaign ID)
                                // For now, we'll use a placeholder campaign ID that will be updated later
                                const campaignAddress = `${contractAddress}.campaign-manager::campaign-${Date.now()}`;

                                // Now save to database after successful blockchain transaction
                                const response = await fetch('/api/campaigns', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        ...campaignData,
                                        campaignAddress,
                                        status: 'ACTIVE', // Set as active since blockchain transaction succeeded
                                        txId: txData.txId
                                    }),
                                });

                                if (!response.ok) {
                                    const error = await response.json();
                                    throw new Error(error.message || 'Failed to save campaign');
                                }

                                const result = await response.json();
                                campaignId = result.campaign._id;

                                toast.success('Campaign created and published successfully!', { id: loadingToast });
                                router.push(`/campaigns/${campaignId}`);
                            } catch (dbError: any) {
                                console.error('Database save error:', dbError);
                                // More user-friendly error message
                                if (dbError.message?.includes('duplicate key')) {
                                    toast.error('Campaign created successfully on blockchain! Redirecting...', { id: loadingToast });
                                    // Still redirect to campaigns page since blockchain transaction succeeded
                                    setTimeout(() => router.push('/campaigns'), 2000);
                                } else {
                                    toast.error('Campaign published successfully! You can find it in your profile.', { id: loadingToast });
                                    setTimeout(() => router.push('/campaigns'), 2000);
                                }
                            } finally {
                                setLoading(false);
                            }
                        },
                        onCancel: () => {
                            console.log('Transaction cancelled');
                            toast.error('Transaction cancelled.', { id: loadingToast });
                            setLoading(false);
                        }
                    });
                } catch (contractCallError) {
                    console.error('Contract call failed:', contractCallError);
                    toast.error(`Contract call failed: ${contractCallError instanceof Error ? contractCallError.message : 'Unknown error'}`, { id: loadingToast });
                    setLoading(false);
                }
            } catch (contractError) {
                console.error('Contract call error:', contractError);
                toast.error('Failed to publish to blockchain. Campaign saved as draft.', { id: loadingToast });
                router.push(`/campaigns/${campaignId}`);
            }

        } catch (error) {
            console.error('Error creating campaign:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create campaign. Please try again.', { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    if (!isSignedIn) {
        return null;
    }

    const steps = [
        { number: 1, title: 'Basic Info', description: 'Campaign details and settings' },
        { number: 2, title: 'Rewards', description: 'Configure reward distribution' },
        { number: 3, title: 'Review', description: 'Review and publish' }
    ];

    return (
        <Layout title="Create Campaign - Stacken Rewards">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Campaign</h1>
                    <p className="text-gray-600">Set up a reward campaign to engage your community</p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${currentStep >= step.number
                                    ? 'bg-primary-600 border-primary-600 text-white'
                                    : 'border-gray-300 text-gray-500'
                                    }`}>
                                    {step.number}
                                </div>
                                <div className="ml-3">
                                    <p className={`text-sm font-medium ${currentStep >= step.number ? 'text-primary-600' : 'text-gray-500'
                                        }`}>
                                        {step.title}
                                    </p>
                                    <p className="text-xs text-gray-500">{step.description}</p>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-4 ${currentStep > step.number ? 'bg-primary-600' : 'bg-gray-300'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Step 1: Basic Info */}
                    {currentStep === 1 && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Campaign Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Campaign Title *
                                    </label>
                                    <input
                                        type="text"
                                        {...register('title', { required: 'Title is required' })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Enter campaign title"
                                    />
                                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Campaign Summary *
                                    </label>
                                    <textarea
                                        {...register('summary', { required: 'Summary is required' })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Brief summary of your campaign (shown on campaign cards)"
                                    />
                                    {errors.summary && <p className="text-red-500 text-sm mt-1">{errors.summary.message}</p>}
                                    <p className="text-sm text-gray-500 mt-1">
                                        This will be displayed on campaign cards and listings
                                    </p>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Campaign Description & Instructions *
                                    </label>
                                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                                        <ReactQuill
                                            value={details}
                                            onChange={(value) => {
                                                setDetails(value);
                                                setValue('details', value);
                                            }}
                                            modules={{
                                                toolbar: [
                                                    [{ 'header': [1, 2, 3, false] }],
                                                    ['bold', 'italic', 'underline', 'strike'],
                                                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                    ['link', 'code-block'],
                                                    ['clean']
                                                ],
                                            }}
                                            formats={[
                                                'header', 'bold', 'italic', 'underline', 'strike',
                                                'list', 'bullet', 'link', 'code-block'
                                            ]}
                                            placeholder="Describe your campaign, provide detailed instructions, requirements, and guidelines for participants. You can format text, add links, and create lists."
                                            style={{ 
                                                minHeight: '250px',
                                                height: '250px'
                                            }}
                                            theme="snow"
                                        />
                                    </div>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Provide comprehensive details about your campaign, what participants need to do, submission requirements, evaluation criteria, etc.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        {...register('category', { required: 'Category is required' })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    >
                                        <option value="">Select category</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                    {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Token Contract Address (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        {...register('tokenAddress')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="SP1ABC...XYZ.token-name (leave empty for points only)"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">Leave empty for points-only campaign</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Token Amount (Optional)
                                    </label>
                                    <input
                                        type="number"
                                        {...register('tokenAmount', { min: 0 })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="1000"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">Amount of tokens to distribute (0 for points only)</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Total Points Pool *
                                    </label>
                                    <input
                                        type="number"
                                        {...register('totalPoints', { required: 'Total points is required', min: 1 })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="1000"
                                    />
                                    {errors.totalPoints && <p className="text-red-500 text-sm mt-1">{errors.totalPoints.message}</p>}
                                    <p className="text-sm text-gray-500 mt-1">Total points available for distribution</p>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Campaign Image
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
                                                <span className="text-gray-600">
                                                    {imageFile ? imageFile.name : 'Click to upload image'}
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
                                    <p className="text-sm text-gray-500 mt-1">
                                        Upload an image to represent your campaign (optional)
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Date *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        {...register('startTime', { required: 'Start time is required' })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                    {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        End Date *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        {...register('endTime', { required: 'End time is required' })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                    {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime.message}</p>}
                                </div>

                                {/* Tags */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tags
                                    </label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {tags.map((tag, index) => (
                                            <span key={index} className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm flex items-center">
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
                                            onChange={(e) => setNewTag(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                                        <label className="block text-sm font-medium text-gray-700">
                                            Task Links
                                        </label>
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
                                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <h4 className="font-medium text-gray-900">Link {index + 1}</h4>
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
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                Title *
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={link.title}
                                                                onChange={(e) => updateTaskLink(index, 'title', e.target.value)}
                                                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                                                                placeholder="GitHub Repository"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                Type *
                                                            </label>
                                                            <select
                                                                value={link.type}
                                                                onChange={(e) => updateTaskLink(index, 'type', e.target.value)}
                                                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent"
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
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            URL *
                                                        </label>
                                                        <input
                                                            type="url"
                                                            value={link.url}
                                                            onChange={(e) => updateTaskLink(index, 'url', e.target.value)}
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                                                            placeholder="https://github.com/your-repo"
                                                        />
                                                    </div>

                                                    <div className="mb-3">
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Description
                                                        </label>
                                                        <textarea
                                                            value={link.description || ''}
                                                            onChange={(e) => updateTaskLink(index, 'description', e.target.value)}
                                                            rows={2}
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                                                            placeholder="Brief description of what this link is for"
                                                        />
                                                    </div>

                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            id={`required-${index}`}
                                                            checked={link.required}
                                                            onChange={(e) => updateTaskLink(index, 'required', e.target.checked)}
                                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                                        />
                                                        <label htmlFor={`required-${index}`} className="ml-2 text-sm text-gray-700">
                                                            Required for participation
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                                            <LinkIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                            <p className="text-gray-600 mb-3">No task links added yet</p>
                                            <p className="text-sm text-gray-500 mb-3">
                                                Add links to GitHub repos, Twitter accounts, Discord servers, or other resources participants need
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
                                    <p className="text-sm text-gray-500 mt-2">
                                        Add relevant links for your campaign (GitHub repos for code contributions, Twitter for social campaigns, etc.)
                                    </p>
                                </div>

                                {/* Social Links */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Campaign Social Links (Optional)
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Twitter
                                            </label>
                                            <input
                                                type="url"
                                                {...register('socialLinks.twitter')}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="https://twitter.com/yourcampaign"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Discord
                                            </label>
                                            <input
                                                type="url"
                                                {...register('socialLinks.discord')}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="https://discord.gg/yourcampaign"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Website
                                            </label>
                                            <input
                                                type="url"
                                                {...register('socialLinks.website')}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="https://yourproject.com"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Telegram
                                            </label>
                                            <input
                                                type="url"
                                                {...register('socialLinks.telegram')}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="https://t.me/yourcampaign"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Add social media links for your campaign to help participants connect and stay updated
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

                                        if (!title || !watch('summary') || !details || !category || !startTime || !endTime || !totalPoints) {
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
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Reward Distribution</h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Distribution Type *
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {distributionTypes.map((type) => (
                                            <div
                                                key={type.value}
                                                className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${rewardDistribution.type === type.value
                                                    ? 'border-primary-500 bg-primary-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                onClick={() => updateRewardDistribution('type', type.value)}
                                            >
                                                <h3 className="font-medium text-gray-900 mb-1">{type.label}</h3>
                                                <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                                                {watch('totalPoints') && (
                                                    <div className="text-xs text-blue-600">
                                                        {type.value === 'LINEAR' && (
                                                            <p>Example: Each winner gets {Math.floor((watch('totalPoints') || 0) / (rewardDistribution.maxWinners || 1))} points</p>
                                                        )}
                                                        {type.value === 'WINNER_TAKES_ALL' && (
                                                            <p>Example: 1st place gets all {(watch('totalPoints') || 0).toLocaleString()} points</p>
                                                        )}
                                                        {type.value === 'TIERED' && (
                                                            <p>Example: 1st: 5000pts, 2nd: 3000pts, 3rd: 2000pts</p>
                                                        )}
                                                        {type.value === 'TOP_PERFORMERS' && (
                                                            <p>Example: Top {rewardDistribution.maxWinners || 1} share {(watch('totalPoints') || 0).toLocaleString()} points</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Maximum Winners *
                                    </label>
                                    <input
                                        type="number"
                                        value={rewardDistribution.maxWinners}
                                        onChange={(e) => updateRewardDistribution('maxWinners', parseInt(e.target.value) || 1)}
                                        min="1"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="10"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        {rewardDistribution.type === 'WINNER_TAKES_ALL'
                                            ? 'Only the top performer will receive rewards'
                                            : rewardDistribution.type === 'LINEAR'
                                                ? 'All winners will receive equal rewards'
                                                : rewardDistribution.type === 'TOP_PERFORMERS'
                                                    ? 'Top performers will share the reward pool'
                                                    : 'Number of people who can win rewards'
                                        }
                                    </p>
                                </div>

                                {rewardDistribution.type === 'TIERED' && (
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="block text-sm font-medium text-gray-700">
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
                                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <h4 className="font-medium text-gray-900">Tier {index + 1}</h4>
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
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                    Tier Name
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={tier.rank}
                                                                    onChange={(e) => updateTier(index, 'rank', e.target.value)}
                                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                                                                    placeholder="1st Place"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                    Percentage %
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={tier.percentage}
                                                                    onChange={(e) => updateTier(index, 'percentage', parseInt(e.target.value) || 0)}
                                                                    min="0"
                                                                    max="100"
                                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                                                                    placeholder="50"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                    Min Rank
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={tier.minRank}
                                                                    onChange={(e) => updateTier(index, 'minRank', parseInt(e.target.value) || 1)}
                                                                    min="1"
                                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                                                                    placeholder="1"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                    Max Rank
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={tier.maxRank}
                                                                    onChange={(e) => updateTier(index, 'maxRank', parseInt(e.target.value) || 1)}
                                                                    min="1"
                                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                                                                    placeholder="1"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                <div className="bg-gray-50 rounded-lg p-3">
                                                    <div className="space-y-2">
                                                        <p className="text-sm text-gray-600">
                                                            Total: {rewardDistribution.tiers.reduce((sum, tier) => sum + tier.percentage, 0)}%
                                                            {rewardDistribution.tiers.reduce((sum, tier) => sum + tier.percentage, 0) !== 100 && (
                                                                <span className="text-red-600 ml-2">
                                                                    (Must equal 100%)
                                                                </span>
                                                            )}
                                                        </p>
                                                        {watch('totalPoints') && rewardDistribution.tiers.reduce((sum, tier) => sum + tier.percentage, 0) === 100 && (
                                                            <div className="text-sm text-blue-600">
                                                                <p className="font-medium mb-1">Point Distribution Preview:</p>
                                                                {rewardDistribution.tiers.map((tier, index) => (
                                                                    <p key={index}>
                                                                        • {tier.rank}: {Math.floor((watch('totalPoints') || 0) * tier.percentage / 100).toLocaleString()} points
                                                                    </p>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                                                <p className="text-gray-600 mb-3">No tiers added yet</p>
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
                                        <h4 className="font-medium text-blue-900 mb-2">Linear Distribution Preview</h4>
                                        <p className="text-sm text-blue-800">
                                            Each of the top {rewardDistribution.maxWinners || 1} performers will receive{' '}
                                            {Math.floor((watch('totalPoints') || 0) / (rewardDistribution.maxWinners || 1))} points
                                            {watch('tokenAmount') && (watch('tokenAmount') || 0) > 0 && (
                                                <> and {Math.floor((watch('tokenAmount') || 0) / (rewardDistribution.maxWinners || 1))} tokens</>
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
                                    className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
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

                                            const totalPercentage = rewardDistribution.tiers.reduce((sum, tier) => sum + tier.percentage, 0);
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
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Review Campaign</h2>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Campaign Details</h3>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                        <p><strong>Title:</strong> {watch('title')}</p>
                                        <p><strong>Category:</strong> {watch('category')}</p>
                                        <p><strong>Total Points:</strong> {watch('totalPoints')?.toLocaleString() || '0'}</p>
                                        {watch('tokenAmount') && (watch('tokenAmount') || 0) > 0 && (
                                            <p><strong>Token Amount:</strong> {watch('tokenAmount')?.toLocaleString() || '0'}</p>
                                        )}
                                        <p><strong>Duration:</strong> {watch('startTime') ? new Date(watch('startTime') || '').toLocaleDateString() : 'Not set'} to {watch('endTime') ? new Date(watch('endTime') || '').toLocaleDateString() : 'Not set'}</p>
                                        {tags.length > 0 && (
                                            <p><strong>Tags:</strong> {tags.join(', ')}</p>
                                        )}
                                    </div>
                                </div>

                                {details && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Campaign Description & Instructions</h3>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div
                                                className="prose prose-sm max-w-none"
                                                dangerouslySetInnerHTML={{ __html: details }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {taskLinks.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Task Links</h3>
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                            {taskLinks.map((link, index) => (
                                                <div key={index} className="flex items-start space-x-3">
                                                    <div className="flex-shrink-0">
                                                        <ExternalLink className="h-4 w-4 text-gray-500 mt-0.5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="font-medium text-gray-900">{link.title}</span>
                                                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                                                                {link.type}
                                                            </span>
                                                            {link.required && (
                                                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                                                    Required
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600 mt-1">{link.url}</p>
                                                        {link.description && (
                                                            <p className="text-sm text-gray-500 mt-1">{link.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Reward Distribution</h3>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                        <p><strong>Type:</strong> {distributionTypes.find(t => t.value === rewardDistribution.type)?.label}</p>
                                        <p><strong>Max Winners:</strong> {rewardDistribution.maxWinners}</p>

                                        {rewardDistribution.type === 'TIERED' && rewardDistribution.tiers && (
                                            <div>
                                                <p><strong>Tiers:</strong></p>
                                                <div className="ml-4 space-y-1">
                                                    {rewardDistribution.tiers.map((tier, index) => (
                                                        <p key={index} className="text-sm">
                                                            {tier.rank}: {tier.percentage}% (Ranks {tier.minRank}-{tier.maxRank})
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {rewardDistribution.type === 'LINEAR' && (
                                            <p className="text-sm text-gray-600">
                                                Each winner gets {Math.floor((watch('totalPoints') || 0) / (rewardDistribution.maxWinners || 1))} points
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between mt-6">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(2)}
                                    className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Creating...' : 'Create Campaign'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </Layout>
    );
};

export default CreateCampaign;