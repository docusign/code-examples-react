# code-examples-react

## Installation
* Install Node.js v12, yarn, and npm.
* Clone, fork, or download as a zip file.
* Enter the app's directory and type `yarn install`.
* After configuration (see below), type `yarn start` to start the 
  app in development mode.

## Configuration
Create an integration key (client id) that enables **Implicit Grant**.
The integration key does not need a secret nor an RSA private key.

Decide if you want the application to redirect its browser tab for authentication
to the DocuSign Identity Provider (IdP) or if it should open a new tab for authentication. 

Decide what the application's URL is. For development, the default 
application URL is
`http://localhost:3000/code-examples-react/build`

### Redirect URIs
Add one or two Redirect URIs to the integration key:
* For redirecting to the IdP, add a Redirect URI that is the same as the application's URL.
* For opening a new tab to the IdP, add a Redirect URI that is the application's URL with
  `/oauthResponse.html` appended.

### Private CORS proxies
Create one or more private CORS proxies. See the 
[blog post](https://www.docusign.com/blog/dsdev-building-single-page-applications-with-docusign-and-cors-part-2).
For nginx, see the [CORS proxy configuration file](https://github.com/docusign/blog-create-a-CORS-gateway/blob/master/nginx_site_file).

You will add the proxy address or addresses to 
the config.js file (see below).

If you'd like to use CORS in production, 
ask your DocuSign support contact to add your company
name to PORTFOLIO-1100. This will help raise the prioritization
of adding CORS to the eSignature API.

### Configuration file
Copy the file `public/config_example.js` to `public/config.js` and fill in the settings.

The config.js file should not be stored with the repository.

## Pull Requests and Questions
Pull requests (PRs) are welcomed, all PRs must use the MIT license.

If you have questions about this code example, please 
ask on StackOverflow, using the `docusignapi` tag.

# Getting Started with Create React App
(The following is the default Readme for apps built with the Create React App utility.)

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `yarn build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
