<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class LogController extends Controller
{
    /**
     * Get list of log files
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
            $logPath = storage_path('logs');
            $files = File::files($logPath);

            $logs = [];
            foreach ($files as $file) {
                $logs[] = [
                    'name' => $file->getFilename(),
                    'size' => $file->getSize(),
                    'modified_at' => Carbon::createFromTimestamp($file->getMTime())->format('Y-m-d H:i:s'),
                    'path' => $file->getPathname(),
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $logs,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get logs: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get contents of a log file
     *
     * @param string $filename
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $filename): JsonResponse
    {
        // Check if user is admin
        if (!auth()->user() || !auth()->user()->is_admin) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        try {
            $logPath = storage_path('logs/' . $filename);

            if (!File::exists($logPath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Log file not found',
                ], 404);
            }

            // Read log file content
            $content = File::get($logPath);

            // Parse log entries (basic parsing for Laravel logs)
            $pattern = '/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] (\w+)\.(\w+): (.*?)(?=\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\]|$)/s';
            preg_match_all($pattern, $content, $matches, PREG_SET_ORDER);

            $entries = [];
            foreach ($matches as $match) {
                $entries[] = [
                    'timestamp' => $match[1],
                    'environment' => $match[2],
                    'level' => $match[3],
                    'message' => trim($match[4]),
                ];
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'filename' => $filename,
                    'size' => File::size($logPath),
                    'modified_at' => Carbon::createFromTimestamp(File::lastModified($logPath))->format('Y-m-d H:i:s'),
                    'entries' => $entries,
                    'raw_content' => $content,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to read log: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download a log file
     *
     * @param string $filename
     * @return \Illuminate\Http\Response|\Illuminate\Http\JsonResponse
     */
    public function download(string $filename)
    {
        // Check if user is admin
        if (!auth()->user() || !auth()->user()->is_admin) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        try {
            $logPath = storage_path('logs/' . $filename);

            if (!File::exists($logPath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Log file not found',
                ], 404);
            }

            return response()->download($logPath);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Download failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a log file
     *
     * @param string $filename
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(string $filename): JsonResponse
    {
        // Check if user is admin
        if (!auth()->user() || !auth()->user()->is_admin) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        try {
            $logPath = storage_path('logs/' . $filename);

            if (!File::exists($logPath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Log file not found',
                ], 404);
            }

            // Delete log file
            File::delete($logPath);

            return response()->json([
                'success' => true,
                'message' => 'Log file deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Delete failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Clear all log files
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function clear(): JsonResponse
    {
        // Check if user is admin
        if (!auth()->user() || !auth()->user()->is_admin) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        try {
            $logPath = storage_path('logs');
            $files = File::files($logPath);

            foreach ($files as $file) {
                // Keep the latest laravel.log file but empty it
                if ($file->getFilename() === 'laravel.log') {
                    File::put($file->getPathname(), '');
                } else {
                    File::delete($file->getPathname());
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'All log files cleared successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear logs: ' . $e->getMessage(),
            ], 500);
        }
    }
}
