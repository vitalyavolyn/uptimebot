module.exports = {
  apps: [{
    name: 'uptimebot',
    script: 'index.js',
    autorestart: true,
    watch: false,
    wait_ready: true,
    env: {
      PORT: 8001
    }
  }]
}
