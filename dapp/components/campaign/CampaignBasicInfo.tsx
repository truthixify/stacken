import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Upload } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

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
}

interface Props {
  register: UseFormRegister<CampaignFormData>;
  errors: FieldErrors<CampaignFormData>;
  details: string;
  setDetails: (value: string) => void;
  setValue: (name: keyof CampaignFormData, value: any) => void;
  imageFile: File | null;
  imagePreview: string;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const categories = ['DeFi', 'NFT', 'Gaming', 'Social', 'Education', 'Community', 'Marketing', 'Other'];

const CampaignBasicInfo: React.FC<Props> = ({
  register,
  errors,
  details,
  setDetails,
  setValue,
  imageFile,
  imagePreview,
  handleImageUpload
}) => {
  return (
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
      </div>
    </div>
  );
};

export default CampaignBasicInfo;