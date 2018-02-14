// Add WCS credentials by mapping a "name" for your credentials to the credential object
// key: "name" your credentials
// value: ""
var wcsCredentials = {
  // '<CredentialName1>': {
  //   'url': '',
  //   'username': '',
  //   'password': ''
  // },
  // '<CredentialName2>': {
  //   'url': '',
  //   'username': '',
  //   'password': ''
  // },
};

if (Object.keys(wcsCredentials).length == 0){
  throw 'Set WCS credentials in config.js';

}


// Optionally set basic auth configuration
// https://www.npmjs.com/package/express-basic-auth
var basicAuthConfig = {
  // users: { 'username': 'password' },
  // challenge: true
};

module.exports = {
  wcsCredentials: wcsCredentials,
  basicAuthConfig: basicAuthConfig
};
