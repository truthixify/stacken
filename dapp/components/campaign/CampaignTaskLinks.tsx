import React from 'react';
import { X, Plus, Link as LinkIcon } from 'lucide-react';

interface TaskLink {
  title: string;
  url: string;
  type: 'GITHUB' | 'TWITTER' | 'DISCORD' | 'WEBSITE' | 'DOCUMENT' | 'OTHER';
  required: boolean;
  description?: string;
}

interface Props {
  taskLinks: TaskLink[];
  addTaskLink: () => void;
  removeTaskLink: (index: number) => void;
  updateTaskLink: (index: number, field: string, value: any) => void;
}

const linkTypes = [
  { value: 'GITHUB', label: 'GitHub' },
  { value: 'TWITTER', label: 'Twitter' },
  { value: 'DISCORD', label: 'Discord' },
  { value: 'WEBSITE', label: 'Website' },
  { value: 'DOCUMENT', label: 'Document' },
  { value: 'OTHER', label: 'Other' }
];

const CampaignTaskLinks: React.FC<Props> = ({
  taskLinks,
  addTaskLink,
  removeTaskLink,
  updateTaskLink
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700">
          Task Links (Optional)
        </label>
        <button
          type="button"
          onClick={addTaskLink}
          className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          <Plus size={16} />
          <span>Add Link</span>
        </button>
      </div>

      {taskLinks.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
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
      ) : (
        <div className="space-y-4">
          {taskLinks.map((link, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-gray-900">Link #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeTaskLink(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={link.title}
                    onChange={(e) => updateTaskLink(index, 'title', e.target.value)}
                    placeholder="e.g., GitHub Repository"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    value={link.type}
                    onChange={(e) => updateTaskLink(index, 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {linkTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL *
                  </label>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateTaskLink(index, 'url', e.target.value)}
                    placeholder="https://github.com/your-repo"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={link.description || ''}
                    onChange={(e) => updateTaskLink(index, 'description', e.target.value)}
                    placeholder="Brief description of what participants need to do with this link"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={link.required}
                      onChange={(e) => updateTaskLink(index, 'required', e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Required for participation</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-sm text-gray-500 mt-2">
        Add relevant links for your campaign (GitHub repos for code contributions, Twitter for social campaigns, etc.)
      </p>
    </div>
  );
};

export default CampaignTaskLinks;