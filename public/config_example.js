var config = {};

// Configuration file example. 
//
// Development: Add to the public directory as config.js.
// 
// Production: Add to the build directory after the build is complete as config.js.

config.DS_CLIENT_ID='xxxx-xxxx-xxxx-xxxx-xxxxxxx';
config.IMPLICIT_SCOPES='signature';

// Your DocuSign eSignature REST API private CORS proxy 
config.DS_API_CORS_PROXY='https://your_private_proxy.xxx.xxx';
config.DS_API_CORS_PROXY_FOR='https://demo.docusign.net';

// Your app's URL
config.DS_APP_URL='http://localhost:3000';
config.DS_DEBUG=true;
config.DS_IDP='https://account-d.docusign.com';
config.DS_AUTHENTICATION='https://account-d.docusign.com';
