# 3C Leads CRM

A simple, lightweight CRM system for tracking government contract leads, built with React and AWS S3.

## Features

- **Password Protected**: Secure login to protect your lead data
- **Lead Management**: Import, view, search, and filter thousands of leads
- **Contact Tracking**: Add phone numbers, emails, and other contact details
- **Call Logging**: Track every call with outcomes, duration, and notes
- **Status Management**: Mark leads as new, contacted, qualified, or unqualified
- **S3 Backend**: No database needed - all data stored in your AWS S3 bucket
- **Responsive Design**: Works on desktop and mobile

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up AWS S3** (see [SETUP.md](SETUP.md) for detailed instructions)

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your AWS credentials and password
   ```

4. **Start the app**
   ```bash
   npm start
   ```

5. **Import your leads**
   - Login with your password
   - Click "Import Leads.txt"
   - Select your leads file

## Documentation

See [SETUP.md](SETUP.md) for complete setup instructions including:
- AWS S3 bucket creation
- IAM user configuration
- CORS setup
- Deployment options
- Troubleshooting

## Project Structure

```
src/
├── components/
│   ├── Login.js          # Password-protected login
│   ├── LeadsList.js      # Main dashboard with search/filter
│   └── LeadDetail.js     # Detailed lead view with call tracking
├── services/
│   └── s3Service.js      # AWS S3 integration
├── utils/
│   └── leadsParser.js    # Parse leads.txt file
└── App.js                # Main application component
```

## Technology Stack

- **Frontend**: React 19
- **Storage**: AWS S3
- **Authentication**: Simple password (localStorage)
- **Styling**: Custom CSS

## Cost

Running this CRM costs less than $1/month on AWS S3 for typical usage.

## Built with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

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

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
