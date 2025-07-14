<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Artisan;

class DatabaseConfigController extends Controller
{
    /**
     * Get current database configuration
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(): JsonResponse
    {
        // Check if user is admin
        if (!auth()->user() || !auth()->user()->is_admin) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        try {
            $config = [
                'connection' => config('database.default'),
                'host' => config('database.connections.mysql.host'),
                'port' => config('database.connections.mysql.port'),
                'database' => config('database.connections.mysql.database'),
                'username' => config('database.connections.mysql.username'),
                // Don't return the password for security reasons
                'password' => '********',
            ];

            return response()->json([
                'success' => true,
                'data' => $config,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get database configuration: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update database configuration in .env file
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request): JsonResponse
    {
        // Check if user is admin
        if (!auth()->user() || !auth()->user()->is_admin) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'connection' => 'sometimes|string|in:mysql,pgsql,sqlite,sqlsrv',
            'host' => 'sometimes|string',
            'port' => 'sometimes|numeric',
            'database' => 'sometimes|string',
            'username' => 'sometimes|string',
            'password' => 'sometimes|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Read .env file
            $envPath = base_path('.env');
            $envContent = File::get($envPath);

            // Update database configuration
            if ($request->has('connection')) {
                $envContent = $this->updateEnvVariable($envContent, 'DB_CONNECTION', $request->connection);
            }

            if ($request->has('host')) {
                $envContent = $this->updateEnvVariable($envContent, 'DB_HOST', $request->host);
            }

            if ($request->has('port')) {
                $envContent = $this->updateEnvVariable($envContent, 'DB_PORT', $request->port);
            }

            if ($request->has('database')) {
                $envContent = $this->updateEnvVariable($envContent, 'DB_DATABASE', $request->database);
            }

            if ($request->has('username')) {
                $envContent = $this->updateEnvVariable($envContent, 'DB_USERNAME', $request->username);
            }

            if ($request->has('password')) {
                $envContent = $this->updateEnvVariable($envContent, 'DB_PASSWORD', $request->password);
            }

            // Save updated .env file
            File::put($envPath, $envContent);

            // Clear config cache
            Artisan::call('config:clear');

            return response()->json([
                'success' => true,
                'message' => 'Database configuration updated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update database configuration: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Test database connection with provided credentials
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function testConnection(Request $request): JsonResponse
    {
        // Check if user is admin
        if (!auth()->user() || !auth()->user()->is_admin) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'connection' => 'required|string|in:mysql,pgsql,sqlite,sqlsrv',
            'host' => 'required_unless:connection,sqlite|string',
            'port' => 'required_unless:connection,sqlite|numeric',
            'database' => 'required|string',
            'username' => 'required_unless:connection,sqlite|string',
            'password' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Create a temporary connection
            $config = [
                'driver' => $request->connection,
                'host' => $request->host,
                'port' => $request->port,
                'database' => $request->database,
                'username' => $request->username,
                'password' => $request->password,
                'charset' => 'utf8mb4',
                'collation' => 'utf8mb4_unicode_ci',
                'prefix' => '',
            ];

            // Test connection
            $connection = \Illuminate\Support\Facades\DB::connection()->getDriverName();
            $pdo = \Illuminate\Support\Facades\DB::connection()->getPdo();

            return response()->json([
                'success' => true,
                'message' => 'Database connection successful',
                'data' => [
                    'connection' => $connection,
                    'version' => $pdo->getAttribute(\PDO::ATTR_SERVER_VERSION),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Database connection failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update an environment variable in the .env file
     *
     * @param string $envContent
     * @param string $key
     * @param string $value
     * @return string
     */
    private function updateEnvVariable(string $envContent, string $key, $value): string
    {
        // Escape any quotes in the value
        $value = is_string($value) ? '"' . addslashes($value) . '"' : $value;

        // Check if the key exists
        if (preg_match("/^{$key}=.*/m", $envContent)) {
            // Replace existing key
            $envContent = preg_replace("/^{$key}=.*/m", "{$key}={$value}", $envContent);
        } else {
            // Add new key
            $envContent .= PHP_EOL . "{$key}={$value}";
        }

        return $envContent;
    }
}