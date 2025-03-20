const { constants } = require('crypto')
const fs = require('fs')

const mainConfigStr = fs.readFileSync('./api/config/main.json')
const mainConfigObj = JSON.parse(mainConfigStr);
const domain = mainConfigObj.domainName;

const proxy = require('redbird')({
  port: 80,
  bunyan: false,
  letsencrypt: {
    path: 'certs',
    port: 81
  },
  ssl: {
    http2: true,    
    port: 443
  }
});


proxy.register(`app.${domain}`, 'http://localhost:8080', {
  ssl: {    
    letsencrypt: {
      email: `itadmin@atira.ca`,
      production: true,
    }
  }
});


proxy.register(`api.${domain}`, 'http://localhost:1025', {
  ssl: {	
    letsencrypt: {
      email: `itadmin@atira.ca`,
      production: true,
    }
  }
});
