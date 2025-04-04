# Deploying Vortex Drones to Coolify

This guide provides step-by-step instructions for deploying the Vortex Drones application to a Coolify VPS.

## Prerequisites

1. Access to your VPS server with IP 145.223.126.87
2. Coolify already installed on the VPS
3. Domain name (vortexdrones.pro) already registered and pointing to your server's IP
4. SSH access to the VPS

## Step 1: Prepare Your Project

Before deploying, ensure your project is ready:

```bash
# Build your React application
npm run build

# Ensure all Docker files are properly configured
# The repository already contains:
# - Dockerfile
# - docker-compose.yml
# - coolify.yml
# - nginx.conf
```

## Step 2: Set Up Coolify Dashboard

1. Access your Coolify dashboard by navigating to `http://145.223.126.87:3000` in your browser
2. Log in with your credentials
3. If this is your first time using Coolify, follow the onboarding process

## Step 3: Create a New Project in Coolify

1. In the Coolify dashboard, click on "Projects" in the sidebar
2. Click "Create New Project"
3. Enter "VortexDrones" as the project name
4. Click "Create Project"

## Step 4: Connect Your Git Repository

1. Inside your new project, click "Add New Resource"
2. Select "Application" as the resource type
3. Choose your Git provider (GitHub, GitLab, or BitBucket)
4. Connect your account if you haven't already
5. Select your repository containing the Vortex Drones code
6. Choose the branch you want to deploy (usually `main` or `master`)

## Step 5: Configure the Deployment

1. In the "Deployment Settings" section:
   - Build Method: Choose "Dockerfile"
   - Build Command: Leave as default since we're using a Dockerfile
   - Port: Set to 80
   - Environment Variables: Add the variables from your `.env` file:
     ```
     DOMAIN=vortexdrones.pro
     SERVER_IP=145.223.126.87
     VIRTUAL_HOST=vortexdrones.pro,www.vortexdrones.pro
     CERTBOT_EMAIL=admin@vortexdrones.pro
     REACT_APP_API_URL=https://vortexdrones.pro/api
     ```

2. In the "Advanced Settings" section:
   - Set persistent storage if needed
   - Configure memory and CPU limits according to your VPS capacity

## Step 6: Set Up SSL/TLS with Let's Encrypt

1. In the Coolify application settings, go to the "Domains" section
2. Add your domain: `vortexdrones.pro` and `www.vortexdrones.pro`
3. Check "Enable SSL/TLS"
4. Choose "Let's Encrypt" as the provider
5. Ensure the email address matches the one in your environment variables

## Step 7: Deploy the Application

1. Click "Deploy" to start the deployment process
2. Coolify will pull your repository, build the Docker image, and start the containers
3. Monitor the deployment logs for any errors
4. Once deployed, you'll see a green status indicator

## Step 8: Verify the Deployment

1. Navigate to `https://vortexdrones.pro` in your browser
2. Verify that the website loads correctly
3. Test key functionality to ensure everything works as expected

## Troubleshooting

### Common Issues:

1. **SSL Certificate Issues**:
   ```bash
   # SSH into your VPS
   ssh root@145.223.126.87
   
   # Check Certbot logs
   docker logs <certbot-container-id>
   ```

2. **Nginx Configuration Issues**:
   ```bash
   # Check Nginx logs
   docker logs <nginx-container-id>
   
   # Verify configuration
   docker exec -it <nginx-container-id> nginx -t
   ```

3. **Application Not Loading**:
   - Check the frontend container logs
   - Verify that environment variables are correctly set
   - Ensure the domain is properly pointing to your server

### Restarting Services:

If you need to restart services:
```bash
# SSH into your VPS
ssh root@145.223.126.87

# Navigate to your Coolify project directory
cd /var/lib/coolify/applications/<project-id>

# Restart services using Coolify CLI or Docker Compose
coolify restart <service-name>
# or
docker-compose restart <service-name>
```

## Maintenance and Updates

### Updating the Application:

1. Push changes to your Git repository
2. In the Coolify dashboard, go to your VortexDrones project
3. Click "Deploy" to deploy the latest changes

### Monitoring:

1. Coolify provides basic monitoring for your containers
2. For more advanced monitoring, consider integrating with services like Prometheus or Grafana

## Backup Strategy

1. Database Backups (PostgreSQL):
   ```bash
   # Automatic daily backups using cron
   0 2 * * * docker exec postgres pg_dump -U dentist_user dentist_app > /backups/db_backup_$(date +\%Y\%m\%d).sql
   ```

2. Configuration Backups:
   ```bash
   # Back up important configuration files
   mkdir -p /backups/config
   cp /var/lib/coolify/applications/<project-id>/*.yml /backups/config/
   cp /var/lib/coolify/applications/<project-id>/*.conf /backups/config/
   ```

## Security Considerations

1. Keep Coolify and all containers updated to the latest versions
2. Regularly audit environment variables for sensitive information
3. Use strong passwords for database and administrative access
4. Consider implementing rate limiting and WAF (Web Application Firewall) for production use

## Scaling Considerations

As your application grows:
1. Consider implementing a CDN like Cloudflare for static content
2. Optimize database queries and implement caching
3. Use Redis for session management and caching
4. Scale horizontally by adding more container instances
