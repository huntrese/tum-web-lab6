const fs = require('fs');
const path = require('path');

module.exports = {
  devServer: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '/etc/letsencrypt/live/juansoft.online/privkey.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '/etc/letsencrypt/live/juansoft.online/fullchain.pem')),
    },
    host: '0.0.0.0',
    port: 9001,
    public: 'juansoft.online/',
  },
};

