/*
  # Animal Rescue System Schema

  1. New Tables
    - `reports`
      - `id` (uuid, primary key)
      - `description` (text)
      - `latitude` (float)
      - `longitude` (float)
      - `image_url` (text)
      - `status` (text) - can be 'pending', 'accepted', 'declined'
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `ngo_id` (uuid, foreign key) - references profiles.id
    
    - `profiles` (for NGOs)
      - `id` (uuid, primary key)
      - `name` (text)
      - `organization` (text)
      - `phone` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Public can create reports
    - Only authenticated NGOs can view and update reports
    - NGOs can only view their own profile
*/

-- Create profiles table for NGOs
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  organization text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now()
);

-- Create reports table
CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL,
  latitude float NOT NULL,
  longitude float NOT NULL,
  image_url text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  ngo_id uuid REFERENCES profiles(id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS registration_number text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS address text;

-- Policies for profiles
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

  /*
  # Update profiles table structure

  1. Changes
    - Add missing columns to profiles table
    - Add registration_number column
    - Add description column
    - Add address column
    
  2. Security
    - Maintains existing RLS policies
*/

  
CREATE POLICY "NGOs can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "NGOs can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Policies for reports
CREATE POLICY "Anyone can create reports"
  ON reports
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "NGOs can view all reports"
  ON reports
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "NGOs can update reports"
  ON reports
  FOR UPDATE
  TO authenticated
  USING (true);

  /*
  # Add RLS policies for profiles table

  1. Changes
    - Add policy to allow authenticated users to insert their own profile
    - Add policy to allow authenticated users to read their own profile
    - Add policy to allow authenticated users to update their own profile

  2. Security
    - Ensures users can only access their own profile data
    - Maintains RLS security while allowing necessary operations
*/

-- Policy to allow authenticated users to insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy to allow authenticated users to read their own profile
CREATE POLICY "Users can read their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy to allow authenticated users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

  /*
  # Fix profile policies

  1. Changes
    - Drop existing conflicting policies
    - Create new, simplified policies for profile access
    - Ensure proper RLS configuration

  2. Security
    - Enable RLS on profiles table
    - Add policies for authenticated users to manage their profiles
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "NGOs can view own profile" ON profiles;
DROP POLICY IF EXISTS "NGOs can update own profile" ON profiles;

-- Create new simplified policies
CREATE POLICY "Enable read access for authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);