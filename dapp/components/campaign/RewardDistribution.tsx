import React from 'react';
import { Plus, X } from 'lucide-react';

interface RewardDistribution {
  type: 'LINEAR' | 'TIERED' | 'WINNER_TAKES_ALL' | 'TOP_PERFORMERS';
  maxWinners: number;
  tiers?: Array<{
    rank: string;
    percentage: number;
    minRank: number;
    maxRank: number;
  }>;
}

interface Props {
  rewardDistribution: RewardDistribution;
  totalPoints: number;
  updateRewardDistribution: (field: string, value: any) => void;
  addTier: () => void;
  removeTier: (index: number) => void;
  updateTier: (index: number, field: string, value: any) => void;
}

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

const RewardDistribution: React.FC<Props> = ({
  rewardDistribution,
  totalPoints,
  updateRewardDistribution,
  addTier,
  removeTier,
  updateTier,
}) => {
  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-6">
      <h2 className="text-xl font-semibold text-card-foreground mb-6">Reward Distribution</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Distribution Type *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {distributionTypes.map(type => (
              <div
                key={type.value}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                  rewardDistribution.type === type.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => updateRewardDistribution('type', type.value)}
              >
                <h3 className="font-medium text-gray-900 mb-1">{type.label}</h3>
                <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                {totalPoints && (
                  <div className="text-xs text-blue-600">
                    {type.value === 'LINEAR' && (
                      <p>
                        Example: Each winner gets{' '}
                        {Math.floor(totalPoints / (rewardDistribution.maxWinners || 1))} points
                      </p>
                    )}
                    {type.value === 'WINNER_TAKES_ALL' && (
                      <p>Example: 1st place gets all {totalPoints.toLocaleString()} points</p>
                    )}
                    {type.value === 'TIERED' && (
                      <p>Example: 1st: 5000pts, 2nd: 3000pts, 3rd: 2000pts</p>
                    )}
                    {type.value === 'TOP_PERFORMERS' && (
                      <p>
                        Example: Top {rewardDistribution.maxWinners || 1} share{' '}
                        {totalPoints.toLocaleString()} points
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Winners *</label>
          <input
            type="number"
            value={rewardDistribution.maxWinners}
            onChange={e => updateRewardDistribution('maxWinners', parseInt(e.target.value) || 1)}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            Maximum number of participants who can win rewards
          </p>
        </div>

        {/* Tiered Rewards Configuration */}
        {rewardDistribution.type === 'TIERED' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">Reward Tiers</label>
              <button
                type="button"
                onClick={addTier}
                className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                <Plus size={16} />
                <span>Add Tier</span>
              </button>
            </div>

            {rewardDistribution.tiers && rewardDistribution.tiers.length > 0 ? (
              <div className="space-y-3">
                {rewardDistribution.tiers.map((tier, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Tier {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeTier(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tier Name
                        </label>
                        <input
                          type="text"
                          value={tier.rank}
                          onChange={e => updateTier(index, 'rank', e.target.value)}
                          placeholder="e.g., Gold"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Percentage (%)
                        </label>
                        <input
                          type="number"
                          value={tier.percentage}
                          onChange={e =>
                            updateTier(index, 'percentage', parseInt(e.target.value) || 0)
                          }
                          min="0"
                          max="100"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Points
                        </label>
                        <input
                          type="text"
                          value={Math.floor((totalPoints * tier.percentage) / 100).toLocaleString()}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Total Percentage Check */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total Percentage:</span>
                    <span
                      className={`text-sm font-bold ${
                        rewardDistribution.tiers.reduce((sum, tier) => sum + tier.percentage, 0) ===
                        100
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {rewardDistribution.tiers.reduce((sum, tier) => sum + tier.percentage, 0)}%
                    </span>
                  </div>
                  {rewardDistribution.tiers.reduce((sum, tier) => sum + tier.percentage, 0) !==
                    100 && (
                    <p className="text-xs text-red-600 mt-1">Percentages must add up to 100%</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-600 mb-3">No tiers configured yet</p>
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
      </div>
    </div>
  );
};

export default RewardDistribution;
