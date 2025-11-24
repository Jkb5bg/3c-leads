# 3C Leads CRM - Setup Guide

Complete guide to set up and run your government contract leads CRM.

## Prerequisites

- Node.js (v14 or higher)
- AWS Account
- Your leads.txt file

## Step 1: AWS Setup (Secure - No IAM Keys!)

This setup uses **AWS Cognito Identity Pool** to provide temporary credentials. This means:
- ✅ No long-term IAM access keys in your code
- ✅ More secure - credentials expire automatically
- ✅ No risk of accidentally committing secrets
- ✅ AWS best practice for frontend apps

### 1.1 Create an S3 Bucket

1. Log into your AWS Console
2. Navigate to **S3 service**
3. Click **"Create bucket"**
4. Choose a unique bucket name (e.g., `my-company-leads-crm`)
5. Select your preferred region (e.g., `us-east-1`)
6. **Important:** Keep "Block all public access" **CHECKED** for security
7. Enable versioning (optional but recommended)
8. Click **"Create bucket"**

### 1.2 Configure CORS (Cross-Origin Resource Sharing)

1. Click on your newly created bucket
2. Go to the **"Permissions"** tab
3. Scroll to **"Cross-origin resource sharing (CORS)"**
4. Click **"Edit"** and paste this configuration:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

5. Click **"Save changes"**

**Note:** For production, replace `"*"` in `AllowedOrigins` with your actual domain (e.g., `"https://yourapp.com"`).

### 1.3 Create Cognito Identity Pool (Secure Authentication)

This replaces the need for IAM access keys!

1. Navigate to **Amazon Cognito** in AWS Console
2. Click **"Identity pools"** (not User pools)
3. Click **"Create identity pool"**
4. Configure the identity pool:
   - **Identity pool name**: `leads-crm-identity-pool`
   - **Enable access to unauthenticated identities**: ✅ Check this box
     - (We're using your own password system, not Cognito users)
5. Click **"Next"**

### 1.4 Configure Permissions for Identity Pool

1. On the "Configure permissions" step, you'll see two IAM roles being created:
   - Authenticated role (not used in this setup)
   - **Unauthenticated role** ← This is what we'll configure

2. Click **"Edit"** on the unauthenticated role
3. Click **"Add permissions"** → **"Create inline policy"**
4. Click the **"JSON"** tab
5. Paste this policy (replace `YOUR-BUCKET-NAME` with your actual bucket name):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME"
        }
    ]
}
```

6. Click **"Review policy"**
7. Name it: `LeadsCRM-S3-Access`
8. Click **"Create policy"**
9. Go back and click **"Create pool"**

### 1.5 Get Your Identity Pool ID

1. After creating the identity pool, you'll see your **Identity pool ID**
2. It looks like: `us-east-1:12345678-1234-1234-1234-123456789abc`
3. **Copy this!** You'll need it for the `.env` file

## Step 2: Project Setup

### 2.1 Install Dependencies

```bash
npm install
```

### 2.2 Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and fill in your values:
```env
REACT_APP_AWS_REGION=us-east-1
REACT_APP_S3_BUCKET_NAME=your-bucket-name
REACT_APP_COGNITO_IDENTITY_POOL_ID=us-east-1:12345678-1234-1234-1234-123456789abc
REACT_APP_LOGIN_PASSWORD=YourSecurePassword123
```

Fill in:
- `REACT_APP_S3_BUCKET_NAME`: Your S3 bucket name from step 1.1
- `REACT_APP_COGNITO_IDENTITY_POOL_ID`: Your Identity Pool ID from step 1.5
- `REACT_APP_LOGIN_PASSWORD`: Choose a secure password for your CRM

**IMPORTANT:** While this setup is more secure (no IAM keys!), still never commit the `.env` file to git! It's already in `.gitignore`.

## Step 3: Import Your Leads

### Option 1: Via Web Interface (Recommended)

1. Start the application:
```bash
npm start
```

2. Login with your password (from `REACT_APP_LOGIN_PASSWORD`)
3. Click "Import Leads.txt" button
4. Select your leads.txt file
5. Wait for the upload to complete

### Option 2: Manual Upload to S3

1. Parse your leads.txt file using the parser
2. Upload the resulting JSON to S3 as `leads-data.json`

## Step 4: Run the Application

### Development Mode

```bash
npm start
```

The app will open at `http://localhost:3000`

### Production Build

```bash
npm run build
```

This creates an optimized build in the `build/` folder that you can deploy to any static hosting service (Netlify, Vercel, AWS S3 + CloudFront, etc.).

## Features

### Lead Management
- View all leads with statistics
- Search and filter by status
- Sort by various criteria
- Click on any lead to view details

### Lead Details
- Update contact information (phone, email)
- Change lead status (new, contacted, qualified, unqualified)
- Add call records with outcomes and notes
- Track call history
- Add general notes

### Call Tracking
- Log every call with date/time
- Record call outcome (answered, voicemail, no answer, busy)
- Add call duration and notes
- View complete call history

### Data Storage
- All data stored securely in your S3 bucket
- Automatic backups can be enabled
- Changes sync immediately to S3
- Data persists between sessions

## Security Notes

1. **Password Protection**: The app uses a simple single password. For multiple users, consider implementing proper authentication with Cognito User Pools.

2. **Cognito Identity Pool**: Uses temporary AWS credentials that expire automatically. Much safer than storing IAM keys!

3. **S3 Bucket**: Your bucket stays private. Only your Cognito Identity Pool can access it.

4. **HTTPS**: When deploying to production, always use HTTPS to protect data in transit.

5. **Identity Pool ID**: While the Identity Pool ID is "safe" to expose (it's designed for client-side use), your password should remain secret.

## Troubleshooting

### "Failed to load leads" Error

- Check your Cognito Identity Pool ID in `.env`
- Verify your S3 bucket name is correct
- Check CORS configuration on your bucket
- Check browser console for detailed error messages

### "Access Denied" Error

- Verify your Cognito Identity Pool's unauthenticated role has S3 permissions
- Check that the IAM policy includes your bucket name (not `YOUR-BUCKET-NAME`)
- Make sure "Enable access to unauthenticated identities" is checked in Cognito
- Verify the Identity Pool ID is correctly set in `.env`

### "Invalid Identity Pool" Error

- Double-check your Identity Pool ID format: `region:uuid`
- Make sure you're using the Identity Pool ID, not the Identity Pool ARN
- Verify the region in your Identity Pool ID matches `REACT_APP_AWS_REGION`

### Import Fails

- Check that your leads.txt file matches the expected format
- Look at browser console for parsing errors
- Try a smaller sample file first

## Cost Estimates

AWS services for this use case are very inexpensive:

- **Cognito Identity Pool**: Free for up to 50,000 MAU (Monthly Active Users)
  - Your usage: FREE (only 1-2 users)
- **S3 Storage**: ~$0.023 per GB per month
  - For several thousand leads (~5-10MB): Less than $0.01/month
- **S3 Requests**:
  - PUT/POST: $0.005 per 1,000 requests
  - GET: $0.0004 per 1,000 requests
  - Typical usage: Less than $0.10/month

**Total estimated cost: Less than $1/month (basically free!)**

## Deployment Options

### Option 1: Netlify (Easiest)
1. Push code to GitHub
2. Connect Netlify to your repo
3. Add environment variables in Netlify dashboard
4. Deploy

### Option 2: Vercel
Similar to Netlify

### Option 3: AWS S3 + CloudFront
1. Build the app: `npm run build`
2. Upload `build/` folder to S3
3. Enable static website hosting
4. Configure CloudFront for HTTPS
5. Set environment variables at build time

## Support

For issues or questions, check:
- Browser console for errors
- AWS CloudWatch logs
- Network tab in browser dev tools

## Future Enhancements

Possible improvements:
- Multi-user authentication
- Export to CSV/Excel
- Email integration
- Calendar integration for follow-ups
- Automated reminders
- Analytics dashboard
