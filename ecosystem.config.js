module.exports = {
  apps: [{
    name: 'uptimebot',
    script: 'index.js',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    instances: 1,
    autorestart: true,
    watch: false,
    wait_ready: true,
    env: {
      PORT: 8001
    }
  }]
}
