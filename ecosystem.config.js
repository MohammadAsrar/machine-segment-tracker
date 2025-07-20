module.exports = {
  apps: [
    {
      name: "machine-segment-tracker-api",
      script: "./backend/src/server.js",
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env_development: {
        NODE_ENV: "development",
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
      },
    },
    {
      name: "machine-segment-tracker-frontend-server",
      script: "npx",
      args: "serve -s frontend/build -l 3000",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
