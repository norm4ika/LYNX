# N8N Ad-Genius - AI-Powered Creative Agency Portal

A sleek, minimalist, and highly innovative web application that serves as a front-end for an N8N image generation workflow. Users can upload images and text prompts to generate professional advertisements using AI-powered creativity.

## 🚀 Features

- **Modern UI/UX**: Dark mode by default with glassmorphism effects and smooth animations
- **Authentication**: Email/password and Google OAuth using Supabase Auth
- **Image Upload**: Drag-and-drop interface with preview and validation
- **Payment Processing**: Stripe integration for $5 per generation
- **Real-time Updates**: SWR for live dashboard updates
- **Responsive Design**: Works perfectly on all devices
- **N8N Integration**: Webhook-based workflow triggering

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase
- **Payments**: Stripe
- **Animations**: Framer Motion
- **State Management**: SWR for data fetching
- **File Upload**: React Dropzone

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- Stripe account
- N8N instance with webhook endpoint

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd n8n-ad-genius
npm install
```

### 2. Environment Setup

Copy the example environment file and fill in your credentials:

```bash
cp env.example .env.local
```

Fill in the following variables in `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# N8N Configuration
N8N_WEBHOOK_URL=your_n8n_webhook_url_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Supabase Setup

1. Create a new Supabase project
2. Enable Authentication with Email and Google providers
3. Create the following tables:

#### Users Table
```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Generations Table
```sql
CREATE TABLE generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  original_image_url TEXT NOT NULL,
  generated_image_url TEXT,
  prompt_text TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  stripe_payment_intent_id TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

4. Create a storage bucket named `images` with the following policy:
```sql
CREATE POLICY "Users can upload their own images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 4. Stripe Setup

1. Create a Stripe account
2. Get your API keys from the dashboard
3. Set up a webhook endpoint pointing to `/api/webhooks/stripe`
4. Configure the webhook to listen for:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`

### 5. N8N Setup

1. Set up an N8N instance
2. Create a webhook trigger node
3. Configure the webhook to receive:
   - `generationId`: The generation record ID
   - `userId`: The user ID
   - `imageUrl`: The original image URL
   - `promptText`: The user's prompt
   - `callbackUrl`: The callback URL for results

4. Add your image generation workflow nodes
5. Add an HTTP Request node to call the callback URL with the generated image

### 6. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see your application!

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── generate/      # Image generation endpoint
│   │   ├── generations/   # Fetch user generations
│   │   ├── callback/      # N8N callback endpoint
│   │   └── webhooks/      # Stripe webhook handler
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── dashboard/         # User dashboard
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # Reusable components
│   └── ImageUpload.tsx    # Image upload component
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication context
└── lib/                   # Utility functions
    ├── supabase.ts        # Supabase client
    └── utils.ts           # Helper functions
```

## 🔄 Workflow

1. **User Upload**: User uploads an image and enters a prompt
2. **Authentication**: System verifies user is logged in
3. **File Storage**: Image is uploaded to Supabase Storage
4. **Payment**: Stripe checkout session is created
5. **Database**: Generation record is created with 'pending' status
6. **Payment Success**: Stripe webhook triggers N8N workflow
7. **Processing**: N8N processes the image and generates the ad
8. **Callback**: N8N calls back with the generated image URL
9. **Completion**: Database is updated with the result
10. **Display**: User sees the result in their dashboard

## 🎨 Design Features

- **Dark Mode**: Beautiful dark theme with purple/blue gradients
- **Glassmorphism**: Modern glass-like UI elements
- **Animations**: Smooth Framer Motion animations throughout
- **Responsive**: Mobile-first design that works on all devices
- **Loading States**: Elegant loading indicators and progress states

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Include your environment details and error messages

## 🔮 Future Enhancements

- [ ] Batch processing
- [ ] Multiple image formats support
- [ ] Advanced prompt templates
- [ ] User credits system
- [ ] Admin dashboard
- [ ] Analytics and reporting
- [ ] API rate limiting
- [ ] Image optimization
- [ ] Social sharing features
