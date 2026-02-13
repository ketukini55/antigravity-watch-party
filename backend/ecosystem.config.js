module.exports = {
    apps: [
        {
            name: 'watchparty-backend',
            script: './dist/index.js',
            instances: 1, // Set to 1 because we are using in-memory storage (Map). Cluster mode requires Redis.
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'development',
                PORT: 3001
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 3001
            }
        }
    ]
};
