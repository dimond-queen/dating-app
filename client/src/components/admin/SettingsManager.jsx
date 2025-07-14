import React, { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle, CheckCircle, Edit, Trash, Plus } from 'lucide-react';
import axios from 'axios';

export default function SettingsManager() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editMode, setEditMode] = useState(false);
  const [currentSetting, setCurrentSetting] = useState({
    key: '',
    value: '',
    group: '',
    description: '',
    is_public: false
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/settings');
      setSettings(response.data.data || []);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to fetch settings' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentSetting(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (editMode) {
        await axios.put(`/api/admin/app-settings/${currentSetting.key}`, currentSetting);
        setMessage({ type: 'success', text: 'Setting updated successfully!' });
      } else {
        await axios.post('/api/admin/app-settings', currentSetting);
        setMessage({ type: 'success', text: 'Setting created successfully!' });
      }
      fetchSettings();
      resetForm();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to save setting' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (setting) => {
    setCurrentSetting(setting);
    setEditMode(true);
  };

  const handleDelete = async (key) => {
    if (!window.confirm('Are you sure you want to delete this setting?')) return;
    
    try {
      setLoading(true);
      await axios.delete(`/api/admin/app-settings/${key}`);
      setMessage({ type: 'success', text: 'Setting deleted successfully!' });
      fetchSettings();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to delete setting' 
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentSetting({
      key: '',
      value: '',
      group: '',
      description: '',
      is_public: false
    });
    setEditMode(false);
  };

  // Group settings by their group
  const groupedSettings = settings.reduce((acc, setting) => {
    const group = setting.group || 'Ungrouped';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(setting);
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-red-500 px-8 py-6">
        <div className="flex items-center space-x-3">
          <Settings className="h-8 w-8 text-white" />
          <div>
            <h1 className="text-2xl font-bold text-white">Settings Manager</h1>
            <p className="text-pink-100">Manage application settings</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Message */}
        {message.text && (
          <div className={`rounded-lg p-4 mb-6 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Settings Form */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editMode ? 'Edit Setting' : 'Create New Setting'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="key" className="block text-sm font-medium text-gray-700 mb-2">
                  Key *
                </label>
                <input
                  type="text"
                  id="key"
                  name="key"
                  value={currentSetting.key}
                  onChange={handleInputChange}
                  placeholder="Enter setting key"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                  disabled={editMode}
                />
              </div>

              <div>
                <label htmlFor="group" className="block text-sm font-medium text-gray-700 mb-2">
                  Group
                </label>
                <input
                  type="text"
                  id="group"
                  name="group"
                  value={currentSetting.group}
                  onChange={handleInputChange}
                  placeholder="Enter group name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-2">
                Value *
              </label>
              <input
                type="text"
                id="value"
                name="value"
                value={currentSetting.value}
                onChange={handleInputChange}
                placeholder="Enter setting value"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={currentSetting.description}
                onChange={handleInputChange}
                placeholder="Enter setting description"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                rows="2"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_public"
                name="is_public"
                checked={currentSetting.is_public}
                onChange={handleInputChange}
                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
              />
              <label htmlFor="is_public" className="ml-2 block text-sm text-gray-700">
                Public (visible to all users)
              </label>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-pink-500 to-red-500 text-white py-2 px-4 rounded-lg font-medium hover:from-pink-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>{editMode ? 'Update' : 'Save'}</span>
                  </>
                )}
              </button>

              {editMode && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Settings List */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            All Settings
          </h2>

          {loading && settings.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading settings...</p>
            </div>
          ) : settings.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <p className="text-gray-600">No settings found</p>
            </div>
          ) : (
            Object.entries(groupedSettings).map(([group, groupSettings]) => (
              <div key={group} className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3 border-b pb-2">
                  {group}
                </h3>
                <div className="bg-gray-50 rounded-xl overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Key
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Value
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Public
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {groupSettings.map((setting) => (
                        <tr key={setting.key} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {setting.key}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {setting.value}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {setting.is_public ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Yes
                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                No
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEdit(setting)}
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(setting.key)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}