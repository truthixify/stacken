import React from 'react';
import { X, Plus } from 'lucide-react';

interface Props {
  tags: string[];
  newTag: string;
  setNewTag: (value: string) => void;
  addTag: () => void;
  removeTag: (tag: string) => void;
}

const CampaignTags: React.FC<Props> = ({ tags, newTag, setNewTag, addTag, removeTag }) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">Tags (Optional)</label>

      {/* Existing Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
            >
              #{tag}
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
      )}

      {/* Add New Tag */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={newTag}
          onChange={e => setNewTag(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a tag"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={addTag}
          disabled={!newTag.trim()}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
        </button>
      </div>

      <p className="text-sm text-gray-500 mt-1">Add tags to help users discover your campaign</p>
    </div>
  );
};

export default CampaignTags;
