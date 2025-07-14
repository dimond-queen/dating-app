import React, { useState, useEffect } from 'react';
import { FileText, Download, Trash, AlertCircle, Search, RefreshCw } from 'lucide-react';
import axios from 'axios';

export default function LogManager() {
  const [logs, setLogs] = useState([]);
  const [currentLog, setCurrentLog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/logs');
      setLogs(response.data.data || []);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to fetch logs' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewLog = async (filename) => {
    setActionLoading(`view-${filename}`);
    setCurrentLog(null);

    try {
      const response = await axios.get(`/api/admin/logs/${filename}`);
      setCurrentLog(response.data.data);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to view log' 
      });
    } finally {
      setActionLoading('');
    }
  };

  const handleDownloadLog = (filename) => {
    window.open(`/api/admin/logs/${filename}/download`, '_blank');
  };

  const handleDeleteLog = async (filename) => {
    if (!window.confirm(`Are you sure you want to delete log: ${filename}?`)) return;
    
    setActionLoading(`delete-${filename}`);

    try {
      const response = await axios.delete(`/api/admin/logs/${filename}`);
      setMessage({ type: 'success', text: 'Log deleted successfully!' });
      fetchLogs();
      if (currentLog && currentLog.filename === filename) {
        setCurrentLog(null);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to delete log' 
      });
    } finally {
      setActionLoading('');
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to clear all logs?')) return;
    
    setActionLoading('clear');

    try {
      const response = await axios.post('/api/admin/logs/clear');
      setMessage({ type: 'success', text: 'Logs cleared successfully!' });
      fetchLogs();
      setCurrentLog(null);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to clear logs' 
      });
    } finally {
      setActionLoading('');
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter logs based on search term
  const filteredLogs = logs.filter(log => 
    log.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter log entries based on search term if a log is selected
  const filteredEntries = currentLog?.entries?.filter(entry => 
    searchTerm === '' || 
    entry.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-8 py-6">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-white" />
          <div>
            <h1 className="text-2xl font-bold text-white">Log Manager</h1>
            <p className="text-purple-100">View and manage application logs</p>
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

        {/* Search and Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search logs..."
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={fetchLogs}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Refresh</span>
            </button>
            
            <button
              onClick={handleClearLogs}
              disabled={actionLoading === 'clear'}
              className="bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {actionLoading === 'clear' ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Trash className="h-5 w-5" />
                  <span>Clear All Logs</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Log Files List */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Log Files
            </h2>
            
            {loading ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading logs...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <p className="text-gray-600">No logs found</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl overflow-hidden">
                <div className="max-h-[600px] overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Filename
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredLogs.map((log) => (
                        <tr 
                          key={log.name} 
                          className={`hover:bg-gray-50 cursor-pointer ${
                            currentLog?.filename === log.name ? 'bg-purple-50' : ''
                          }`}
                          onClick={() => handleViewLog(log.name)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {log.name}
                            <div className="text-xs text-gray-500">
                              {new Date(log.modified_at).toLocaleString()} - {Math.round(log.size / 1024)} KB
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadLog(log.name);
                              }}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLog(log.name);
                              }}
                              disabled={actionLoading === `delete-${log.name}`}
                              className="text-red-600 hover:text-red-900"
                            >
                              {actionLoading === `delete-${log.name}` ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                              ) : (
                                <Trash className="h-4 w-4" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Log Content */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Log Content
            </h2>
            
            {actionLoading.startsWith('view-') ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading log content...</p>
              </div>
            ) : !currentLog ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Select a log file to view its content</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {currentLog.filename}
                  </h3>
                  <div className="text-sm text-gray-500">
                    {new Date(currentLog.modified_at).toLocaleString()} - {Math.round(currentLog.size / 1024)} KB
                  </div>
                </div>
                
                {currentLog.entries && currentLog.entries.length > 0 ? (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="max-h-[500px] overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100 sticky top-0">
                          <tr>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Time
                            </th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Level
                            </th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Message
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredEntries.map((entry, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                                {entry.timestamp}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-xs">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  entry.level === 'ERROR' ? 'bg-red-100 text-red-800' :
                                  entry.level === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                                  entry.level === 'INFO' ? 'bg-blue-100 text-blue-800' :
                                  entry.level === 'DEBUG' ? 'bg-gray-100 text-gray-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {entry.level}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-xs text-gray-900">
                                <div className="whitespace-pre-wrap">{entry.message}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <pre className="text-xs text-gray-800 whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                      {currentLog.raw_content}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}