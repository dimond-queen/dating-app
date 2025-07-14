import React, { useState, useEffect } from 'react';
import { Database, Save, AlertCircle, CheckCircle, RefreshCw, Download, Upload, Trash, Server } from 'lucide-react';
import axios from 'axios';

export default function DatabaseManager() {
  const [dbStatus, setDbStatus] = useState(null);
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [dbConfig, setDbConfig] = useState({
    connection: '',
    host: '',
    port: '',
    database: '',
    username: '',
    password: ''
  });

  useEffect(() => {
    fetchDatabaseStatus();
    fetchBackups();
    fetchDatabaseConfig();
  }, []);

  const fetchDatabaseStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/database/status');
      setDbStatus(response.data.data);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to fetch database status' 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBackups = async () => {
    try {
      const response = await axios.get('/api/admin/backups');
      setBackups(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch backups:', error);
    }
  };

  const fetchDatabaseConfig = async () => {
    try {
      const response = await axios.get('/api/admin/database/config');
      setDbConfig(response.data.data);
    } catch (error) {
      console.error('Failed to fetch database config:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDbConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    setActionLoading('config');
    setMessage({ type: '', text: '' });

    try {
      await axios.put('/api/admin/database/config', dbConfig);
      setMessage({ type: 'success', text: 'Database configuration updated successfully!' });
      fetchDatabaseConfig();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update database configuration' 
      });
    } finally {
      setActionLoading('');
    }
  };

  const handleTestConnection = async () => {
    setActionLoading('test');
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post('/api/admin/database/config/test', dbConfig);
      setMessage({ type: 'success', text: 'Database connection successful!' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Database connection failed' 
      });
    } finally {
      setActionLoading('');
    }
  };

  const handleMigrate = async () => {
    if (!window.confirm('Are you sure you want to run migrations?')) return;
    
    setActionLoading('migrate');
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post('/api/admin/database/migrate');
      setMessage({ type: 'success', text: 'Migrations completed successfully!' });
      fetchDatabaseStatus();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to run migrations' 
      });
    } finally {
      setActionLoading('');
    }
  };

  const handleSeed = async () => {
    if (!window.confirm('Are you sure you want to run database seeders?')) return;
    
    setActionLoading('seed');
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post('/api/admin/database/seed');
      setMessage({ type: 'success', text: 'Database seeding completed successfully!' });
      fetchDatabaseStatus();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to run database seeders' 
      });
    } finally {
      setActionLoading('');
    }
  };

  const handleReset = async () => {
    if (!window.confirm('WARNING: This will reset the entire database. Are you sure?')) return;
    if (!window.confirm('This action cannot be undone. Confirm database reset?')) return;
    
    setActionLoading('reset');
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post('/api/admin/database/reset');
      setMessage({ type: 'success', text: 'Database reset completed successfully!' });
      fetchDatabaseStatus();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to reset database' 
      });
    } finally {
      setActionLoading('');
    }
  };

  const handleCreateBackup = async () => {
    setActionLoading('backup');
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post('/api/admin/backups');
      setMessage({ type: 'success', text: 'Backup created successfully!' });
      fetchBackups();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to create backup' 
      });
    } finally {
      setActionLoading('');
    }
  };

  const handleRestoreBackup = async (filename) => {
    if (!window.confirm(`Are you sure you want to restore from backup: ${filename}?`)) return;
    
    setActionLoading(`restore-${filename}`);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post(`/api/admin/backups/${filename}/restore`);
      setMessage({ type: 'success', text: 'Backup restored successfully!' });
      fetchDatabaseStatus();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to restore backup' 
      });
    } finally {
      setActionLoading('');
    }
  };

  const handleDeleteBackup = async (filename) => {
    if (!window.confirm(`Are you sure you want to delete backup: ${filename}?`)) return;
    
    setActionLoading(`delete-${filename}`);

    try {
      const response = await axios.delete(`/api/admin/backups/${filename}`);
      setMessage({ type: 'success', text: 'Backup deleted successfully!' });
      fetchBackups();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to delete backup' 
      });
    } finally {
      setActionLoading('');
    }
  };

  const handleDownloadBackup = (filename) => {
    window.open(`/api/admin/backups/${filename}`, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
        <div className="flex items-center space-x-3">
          <Database className="h-8 w-8 text-white" />
          <div>
            <h1 className="text-2xl font-bold text-white">Database Manager</h1>
            <p className="text-blue-100">Manage database operations and backups</p>
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

        {/* Database Status */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Server className="h-5 w-5 mr-2" />
            Database Status
          </h2>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading database status...</p>
            </div>
          ) : !dbStatus ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">Unable to fetch database status</p>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-500">Connection</p>
                  <p className="font-medium">{dbStatus.connection}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-500">Database</p>
                  <p className="font-medium">{dbStatus.database}</p>
                </div>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">Tables</h3>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Table Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Row Count
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dbStatus.tables.map((table) => (
                      <tr key={table} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {table}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {dbStatus.table_counts[table]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={handleMigrate}
              disabled={actionLoading === 'migrate'}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {actionLoading === 'migrate' ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5" />
                  <span>Run Migrations</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleSeed}
              disabled={actionLoading === 'seed'}
              className="bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {actionLoading === 'seed' ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  <span>Run Seeders</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleReset}
              disabled={actionLoading === 'reset'}
              className="bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {actionLoading === 'reset' ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5" />
                  <span>Reset Database</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Database Configuration */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Database Configuration
          </h2>
          
          <form onSubmit={handleConfigSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="connection" className="block text-sm font-medium text-gray-700 mb-2">
                  Connection Type
                </label>
                <select
                  id="connection"
                  name="connection"
                  value={dbConfig.connection}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="mysql">MySQL</option>
                  <option value="pgsql">PostgreSQL</option>
                  <option value="sqlite">SQLite</option>
                  <option value="sqlsrv">SQL Server</option>
                </select>
              </div>

              <div>
                <label htmlFor="host" className="block text-sm font-medium text-gray-700 mb-2">
                  Host
                </label>
                <input
                  type="text"
                  id="host"
                  name="host"
                  value={dbConfig.host}
                  onChange={handleInputChange}
                  placeholder="localhost"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="port" className="block text-sm font-medium text-gray-700 mb-2">
                  Port
                </label>
                <input
                  type="text"
                  id="port"
                  name="port"
                  value={dbConfig.port}
                  onChange={handleInputChange}
                  placeholder="3306"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="database" className="block text-sm font-medium text-gray-700 mb-2">
                  Database Name
                </label>
                <input
                  type="text"
                  id="database"
                  name="database"
                  value={dbConfig.database}
                  onChange={handleInputChange}
                  placeholder="dating_app"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={dbConfig.username}
                  onChange={handleInputChange}
                  placeholder="root"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={dbConfig.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={actionLoading === 'config'}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {actionLoading === 'config' ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Save Configuration</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={actionLoading === 'test'}
                className="bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {actionLoading === 'test' ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Test Connection</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Backups */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Database Backups
            </h2>
            
            <button
              onClick={handleCreateBackup}
              disabled={actionLoading === 'backup'}
              className="bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {actionLoading === 'backup' ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  <span>Create Backup</span>
                </>
              )}
            </button>
          </div>
          
          {backups.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-600">No backups found</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Filename
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {backups.map((backup) => (
                    <tr key={backup.name} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {backup.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {backup.created_at}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Math.round(backup.size / 1024)} KB
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDownloadBackup(backup.name)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRestoreBackup(backup.name)}
                          disabled={actionLoading === `restore-${backup.name}`}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          {actionLoading === `restore-${backup.name}` ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteBackup(backup.name)}
                          disabled={actionLoading === `delete-${backup.name}`}
                          className="text-red-600 hover:text-red-900"
                        >
                          {actionLoading === `delete-${backup.name}` ? (
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
          )}
        </div>
      </div>
    </div>
  );
}