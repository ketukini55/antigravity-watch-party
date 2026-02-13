#!/bin/bash

# 1. Update System
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js (v20 LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Install Nginx
sudo apt install -y nginx

# 4. Install PM2 Globally
sudo npm install -g pm2

# 5. Setup Firewall (UFW)
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# 6. Verify Installations
node -v
npm -v
pm2 -v
nginx -v

echo "VPS Setup Complete! 🚀"
