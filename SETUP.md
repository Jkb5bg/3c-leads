# 3C Leads CRM - Setup Guide (Ultra Simple)

The absolute simplest setup - public S3 bucket, no authentication.

## ⚠️ SECURITY WARNING

This setup makes your S3 bucket **publicly accessible**. Anyone who knows the URL can:
- Read all your lead data
- Modify or delete data
- Upload new files

**Only use this if:**
- Your lead data is not sensitive
- You're okay with it being publicly accessible
- This is for testing/development only

**For production use, consider securing this properly.**

---

## Prerequisites

- AWS Account (free tier works fine)
- Node.js (v14 or higher)
- Your leads.txt file

---

## Step 1: Create Public S3 Bucket (5 minutes)

### 1.1 Create the Bucket

1. Log into [AWS Console](https://console.aws.amazon.com/)
2. Go to **S3** service
3. Click **"Create bucket"**
4. Enter a unique bucket name (e.g., `my-leads-crm-public`)
5. Select region (e.g., `us-east-1`)
6. **UNCHECK** "Block all public access" ← Important!
7. Check the acknowledgment box
8. Click **"Create bucket"**

### 1.2 Make Bucket Public

1. Click on your bucket name
2. Go to **"Permissions"** tab
3. Scroll to **"Bucket policy"**
4. Click **"Edit"**
5. Paste this policy (replace `YOUR-BUCKET-NAME` with your actual bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadWrite",
      "Effect": "Allow",
      "Principal": "*",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

6. Click **"Save changes"**

### 1.3 Configure CORS

1. Still in **"Permissions"** tab
2. Scroll to **"Cross-origin resource sharing (CORS)"**
3. Click **"Edit"**
4. Paste this:

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

### 1.4 Get Your Bucket URL

Your bucket URL will be one of these formats:
- `https://YOUR-BUCKET-NAME.s3.amazonaws.com`
- `https://YOUR-BUCKET-NAME.s3.REGION.amazonaws.com` (if not us-east-1)

Example: `https://my-leads-crm-public.s3.amazonaws.com`

**Write this down!** You'll need it in the next step.

---

## Step 2: Configure the App (2 minutes)

### 2.1 Install Dependencies

```bash
npm install
```

### 2.2 Set Environment Variables

1. Copy the template:
```bash
cp .env.example .env
```

2. Edit `.env`:
```env
REACT_APP_S3_BUCKET_URL=https://your-bucket-name.s3.amazonaws.com
REACT_APP_LOGIN_PASSWORD=YourPassword123
```

Replace:
- `your-bucket-name` with your actual bucket name
- `YourPassword123` with your desired password

That's it! No AWS keys, no Cognito, no IAM.

---

## Step 3: Run the App

```bash
npm start
```

The app will open at `http://localhost:3000`

1. Login with your password
2. Click **"Import Leads.txt"**
3. Select your leads file
4. Start managing leads!

---

## How It Works

- Your data is stored as `leads-data.json` in your S3 bucket
- The app reads/writes directly to S3 using simple HTTP requests
- No AWS authentication needed (bucket is public)
- Anyone with the URL can access it

---

## Cost

AWS S3 free tier includes:
- 5 GB of storage
- 20,000 GET requests
- 2,000 PUT requests

**Your usage:** Several thousand leads = ~5-10 MB

**Cost: $0/month** (stays in free tier)

---

## Troubleshooting

### "Failed to load leads"

1. Check your bucket URL in `.env` is correct
2. Make sure you unchecked "Block all public access"
3. Verify the bucket policy is saved
4. Check CORS is configured

### Test Your Bucket

Try opening this URL in your browser:
```
https://your-bucket-name.s3.amazonaws.com/leads-data.json
```

- **404 error**: Good! Bucket is accessible, file doesn't exist yet
- **403 Access Denied**: Bucket policy is wrong or bucket isn't public
- **No response**: Bucket URL is wrong

### CORS Errors

If you see CORS errors in browser console:
- Double-check CORS configuration in S3
- Make sure `AllowedOrigins` includes `"*"`
- Try hard-refreshing the browser (Ctrl+Shift+R)

---

## Deployment

### Deploy to Netlify/Vercel

1. Build the app:
```bash
npm run build
```

2. Deploy the `build/` folder

3. Set environment variables in your hosting dashboard:
   - `REACT_APP_S3_BUCKET_URL`
   - `REACT_APP_LOGIN_PASSWORD`

### Update CORS for Production

Once deployed, update your S3 CORS to only allow your domain:

```json
{
  "AllowedOrigins": ["https://yourdomain.com"],
  ...
}
```

---

## Making It More Secure (Optional)

If you want to secure this later:

1. **Option 1: Lambda Proxy** - Add a simple backend API
2. **Option 2: Cognito** - Use AWS Cognito Identity Pool
3. **Option 3: Private bucket + presigned URLs** - Generate temporary access URLs

Let me know if you want help implementing any of these!

---

## Support

Having issues? Check:
- Browser console for error messages
- S3 bucket permissions are public
- CORS is configured correctly
- Bucket URL format is correct

The bucket policy and CORS settings are the most common issues. Make sure those are set up exactly as shown above.
