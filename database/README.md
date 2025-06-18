# Database Setup for Enostics

## Quick Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run the setup SQL**:
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `setup.sql`
   - Click "Run" to execute

3. **Configure environment variables**:
   - Copy `env.example` to `.env.local`
   - Fill in your Supabase project details:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
     ```

## What the setup creates:

### Tables
- `user_profiles` - User profile information
- `enostics_endpoints` - User API endpoints
- `enostics_data` - Incoming data from endpoints

### Triggers
- Automatically creates user profile when someone signs up
- Automatically creates default endpoint for new users
- Updates `updated_at` timestamps

### Security
- Row Level Security (RLS) enabled
- Users can only access their own data
- Public endpoints can receive data from anyone

## Troubleshooting

If you get a 500 error during signup:
1. Make sure you've run the `setup.sql` in your Supabase project
2. Check that all environment variables are set correctly
3. Verify the trigger function exists in your database

## Testing

After setup, try:
1. Register a new user account
2. Check that a profile was created in `user_profiles` table
3. Check that a default endpoint was created in `enostics_endpoints` table 