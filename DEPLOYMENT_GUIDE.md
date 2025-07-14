# Dating App Deployment Guide

## Overview
This is a comprehensive video call dating application built with Laravel (backend) and React (frontend). The app includes user authentication, profile management, matching system, real-time chat, video calling with Agora, and a complete admin panel.

## Demo Users Created by Seeders

When you run `php artisan migrate:fresh --seed`, the following demo users will be created:

### Admin User
- **Email**: `admin@loveconnect.com`
- **Password**: `password`
- **Role**: Admin (can access admin panel)
- **Features**: Full admin access to manage settings, database, logs, and Agora configuration

### Regular Users
1. **John Doe**
   - **Email**: `john@example.com`
   - **Password**: `password`
   - **Age**: 28
   - **Bio**: "I love hiking and outdoor activities"
   - **Location**: New York
   - **Interests**: hiking, camping, photography

2. **Jane Smith**
   - **Email**: `jane@example.com`
   - **Password**: `password`
   - **Age**: 26
   - **Bio**: "I enjoy reading books and watching movies"
   - **Location**: Los Angeles
   - **Interests**: reading, movies, travel

3. **Mike Johnson**
   - **Email**: `mike@example.com`
   - **Password**: `password`
   - **Age**: 32
   - **Bio**: "Software developer who loves coding and gaming"
   - **Location**: San Francisco
   - **Interests**: coding, gaming, music

4. **Sarah Wilson**
   - **Email**: `sarah@example.com`
   - **Password**: `password`
   - **Age**: 29
   - **Bio**: "Artist and yoga instructor seeking meaningful connections"
   - **Location**: Austin
   - **Interests**: art, yoga, meditation, nature

5. **Alex Chen**
   - **Email**: `alex@example.com`
   - **Password**: `password`
   - **Age**: 27
   - **Bio**: "Entrepreneur and fitness enthusiast"
   - **Location**: Miami
   - **Interests**: fitness, business, travel, food

## Demo Data Included

### Matches
- John ↔ Jane (mutual match)
- John ↔ Sarah (mutual match)
- Mike ↔ Jane (mutual match)

### Messages
- Pre-populated conversations between matched users
- Realistic chat history for testing messaging functionality
- Mix of read/unread messages

### Profile Photos
- Each user has a profile photo from randomuser.me API
- Photos are set as primary profile images

## Features Available for Testing

### 1. User Authentication
- Login/Register functionality
- Protected routes
- Session management

### 2. Profile Management
- View and edit user profiles
- Upload profile photos
- Set preferences and interests

### 3. Discovery System
- Browse other users
- Like/pass functionality
- Matching algorithm

### 4. Real-time Chat
- Send/receive messages
- Real-time updates via Socket.io
- Message read status
- Chat history

### 5. Video Calling
- Agora-powered video calls
- One-on-one video communication
- Call controls (mute, camera, end call)

### 6. Admin Panel
The admin panel includes four main sections:

#### a) Agora Video Settings
- Configure Agora App ID and Certificate
- Set token expiration time
- Test video calling functionality

#### b) App Settings
- Manage general application settings
- Configure app name, description
- Set user limits and restrictions

#### c) Database Management
- View database status and table information
- Run migrations and seeders
- Database configuration management
- Create and restore backups
- Reset database functionality

#### d) Log Management
- View application logs
- Download log files
- Delete specific logs
- Clear all logs
- Search through log entries

## Deployment Steps

### 1. Server Requirements
- PHP 8.1 or higher
- Composer
- Node.js and npm
- MySQL/PostgreSQL/SQLite database
- Web server (Apache/Nginx)

### 2. Backend Setup (Laravel)
```bash
# Clone the repository
git clone <repository-url>
cd dating-app

# Install PHP dependencies
composer install

# Set up environment
cp .env.example .env
php artisan key:generate

# Configure database in .env file
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=dating_app
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Run migrations and seeders
php artisan migrate:fresh --seed

# Set up storage link
php artisan storage:link

# Set permissions
chmod -R 775 storage bootstrap/cache
```

### 3. Frontend Setup (React)
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Build for production
npm run build
```

### 4. Production Configuration

#### Environment Variables (.env)
```
APP_NAME="Dating App"
APP_ENV=production
APP_KEY=base64:your-generated-key
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=dating_app
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Add other necessary configurations
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-email
MAIL_PASSWORD=your-password
```

### 5. Web Server Configuration

#### Apache (.htaccess in public directory)
```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/dating-app/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

### 6. Post-Deployment Tasks

1. **Configure Agora**
   - Login as admin (`admin@loveconnect.com` / `password`)
   - Go to Admin Panel → Agora Video
   - Enter your Agora App ID and Certificate
   - Test video calling functionality

2. **Set up Cron Jobs**
   ```bash
   * * * * * cd /path/to/dating-app && php artisan schedule:run >> /dev/null 2>&1
   ```

3. **Configure Queue Workers** (if using queues)
   ```bash
   php artisan queue:work --daemon
   ```

4. **Set up SSL Certificate**
   - Use Let's Encrypt or your preferred SSL provider
   - Update APP_URL in .env to use https

## Testing the Application

### 1. Basic User Flow
1. Register a new account or login with demo users
2. Complete profile setup
3. Browse and match with other users
4. Start conversations with matches
5. Initiate video calls

### 2. Admin Features
1. Login as admin
2. Configure Agora settings
3. Manage application settings
4. Monitor database and logs
5. Create backups

### 3. Video Calling
1. Ensure Agora is configured in admin panel
2. Match with another user
3. Start a video call from chat
4. Test call controls and functionality

## Troubleshooting

### Common Issues

1. **Video calls not working**
   - Check Agora configuration in admin panel
   - Verify App ID and Certificate are correct
   - Ensure HTTPS is enabled for production

2. **Database connection errors**
   - Verify database credentials in .env
   - Check database server is running
   - Ensure database exists

3. **File permission errors**
   - Set correct permissions: `chmod -R 775 storage bootstrap/cache`
   - Ensure web server user owns the files

4. **Frontend not loading**
   - Run `npm run build` in client directory
   - Check web server configuration
   - Verify all assets are accessible

## Security Considerations

1. **Environment Variables**
   - Never commit .env files to version control
   - Use strong, unique passwords
   - Rotate API keys regularly

2. **File Uploads**
   - Validate file types and sizes
   - Store uploads outside web root when possible
   - Scan uploads for malware

3. **Database Security**
   - Use prepared statements (Laravel does this by default)
   - Regular backups
   - Monitor for suspicious activity

4. **HTTPS**
   - Always use HTTPS in production
   - Implement HSTS headers
   - Use secure cookies

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Laravel and React documentation
3. Check Agora documentation for video calling issues
4. Monitor application logs through the admin panel

## License

This project is licensed under the MIT License.