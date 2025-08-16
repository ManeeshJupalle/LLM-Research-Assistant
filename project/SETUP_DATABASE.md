# Database Setup Instructions

## Error: "relation public.profiles does not exist"

Your Supabase database is missing the `profiles` table. Follow these steps to fix it:

### Step 1: Go to your Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Select your project
3. Go to the **SQL Editor** tab

### Step 2: Run this SQL script
Copy and paste the following SQL into the SQL Editor and click "Run":

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Step 3: Verify the setup
1. Go to the **Table Editor** tab in your Supabase dashboard
2. You should now see a `profiles` table
3. The table should have the columns: `id`, `email`, `full_name`, `avatar_url`, `created_at`, `updated_at`

### Step 4: Test the application
1. Restart your development server (`npm run dev`)
2. Try signing up with a new account or signing in with an existing one
3. The error should be resolved

## What this does:
- Creates the `profiles` table with proper structure
- Sets up Row Level Security (RLS) policies
- Creates a trigger that automatically creates a profile when a new user signs up
- Ensures existing and new users can access their profile data

## If you still get errors:
1. Check that your `.env` file has the correct Supabase URL and keys
2. Make sure you're running the SQL in the correct Supabase project
3. Verify that the table was created in the Table Editor