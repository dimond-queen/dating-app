# Dating App API Documentation

This document provides information about the API endpoints available in the Dating App.

## Authentication

All admin endpoints require authentication using Laravel Sanctum. Include the authentication token in the request header:

```
Authorization: Bearer {your_token}
```

## Public Settings API

### Get All Public Settings

```
GET /api/settings
```

Returns all settings marked as public.

### Get Public Setting by Key

```
GET /api/settings/{key}
```

Returns a specific public setting by its key.

### Get Public Settings by Group

```
GET /api/settings/group/{group}
```

Returns all public settings in a specific group.

## Admin Settings API

### Get All Settings (Admin)

```
GET /api/admin/settings
```

Returns all settings (admin access required).

### Create New Setting (Admin)

```
POST /api/admin/app-settings
```

Create a new setting.

**Request Body:**
```json
{
  "key": "setting_key",
  "value": "setting_value",
  "group": "group_name",
  "description": "Setting description",
  "is_public": true
}
```

### Update Setting (Admin)

```
PUT /api/admin/app-settings/{key}
```

Update an existing setting.

**Request Body:**
```json
{
  "value": "new_value",
  "group": "new_group",
  "description": "New description",
  "is_public": false
}
```

### Delete Setting (Admin)

```
DELETE /api/admin/app-settings/{key}
```

Delete a setting.

## Database Management API

### Get Database Status (Admin)

```
GET /api/admin/database/status
```

Returns information about the database connection and tables.

### Run Migrations (Admin)

```
POST /api/admin/database/migrate
```

Run database migrations.

### Run Seeders (Admin)

```
POST /api/admin/database/seed
```

Run database seeders.

### Reset Database (Admin)

```
POST /api/admin/database/reset
```

Reset the database (migrate:fresh) and run seeders.

## Database Configuration API

### Get Database Configuration (Admin)

```
GET /api/admin/database/config
```

Returns the current database configuration.

### Update Database Configuration (Admin)

```
PUT /api/admin/database/config
```

Update the database configuration in the .env file.

**Request Body:**
```json
{
  "connection": "mysql",
  "host": "localhost",
  "port": 3306,
  "database": "dating_app",
  "username": "root",
  "password": "password"
}
```

### Test Database Connection (Admin)

```
POST /api/admin/database/config/test
```

Test a database connection with the provided credentials.

**Request Body:**
```json
{
  "connection": "mysql",
  "host": "localhost",
  "port": 3306,
  "database": "dating_app",
  "username": "root",
  "password": "password"
}
```

## Backup Management API

### Get Backups (Admin)

```
GET /api/admin/backups
```

Returns a list of database backups.

### Create Backup (Admin)

```
POST /api/admin/backups
```

Create a new database backup.

### Download Backup (Admin)

```
GET /api/admin/backups/{filename}
```

Download a specific backup file.

### Restore Backup (Admin)

```
POST /api/admin/backups/{filename}/restore
```

Restore a database from a backup file.

### Delete Backup (Admin)

```
DELETE /api/admin/backups/{filename}
```

Delete a backup file.

## Log Management API

### Get Logs (Admin)

```
GET /api/admin/logs
```

Returns a list of log files.

### View Log (Admin)

```
GET /api/admin/logs/{filename}
```

View the contents of a specific log file.

### Download Log (Admin)

```
GET /api/admin/logs/{filename}/download
```

Download a specific log file.

### Delete Log (Admin)

```
DELETE /api/admin/logs/{filename}
```

Delete a log file.

### Clear All Logs (Admin)

```
POST /api/admin/logs/clear
```

Clear all log files.

## User Management API

### Get All Users (Admin)

```
GET /api/admin/users
```

Returns a list of all users.

### Get User (Admin)

```
GET /api/admin/users/{user}
```

Returns details for a specific user.

### Update User (Admin)

```
PUT /api/admin/users/{user}
```

Update a user's information.

### Delete User (Admin)

```
DELETE /api/admin/users/{user}
```

Delete a user.