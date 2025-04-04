#!/bin/bash

# Create backend directory structure
mkdir -p backend/config
mkdir -p backend/middleware
mkdir -p backend/models
mkdir -p backend/routes
mkdir -p backend/queues

touch backend/config/db.js
touch backend/middleware/auth.js
touch backend/models/User.js
touch backend/models/Printer.js
touch backend/models/PrintJob.js
touch backend/models/SocialMediaAccount.js
touch backend/models/Post.js
touch backend/models/PostDestination.js
touch backend/routes/auth.js
touch backend/routes/printers.js
touch backend/routes/printjobs.js
touch backend/routes/socialmedia.js
touch backend/routes/webhooks.js
touch backend/queues/postQueue.js
touch backend/.env
touch backend/server.js

# Create frontend directory structure
mkdir -p frontend/src/components

touch frontend/src/components/Login.js
touch frontend/src/components/PrinterList.js
touch frontend/src/components/ModelUploader.js
touch frontend/src/components/PostComposer.js
touch frontend/src/App.js
touch frontend/src/index.js
touch frontend/package.json
touch frontend/.env
