import React from 'react';
import { UseFormRegister } from 'react-hook-form';

interface CampaignFormData {
  socialLinks: {
    twitter?: string;
    discord?: string;
    website?: string;
    telegram?: string;
  };
}

interface Props {
  register: UseFormRegister<CampaignFormData>;
}

const CampaignSocialLinks: React.FC<Props> = ({ register }) => {
  return (
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
  );
};

export default CampaignSocialLinks;