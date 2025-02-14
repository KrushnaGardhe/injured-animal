/*
  # Fix profiles table RLS policies

  1. Changes
    - Add policy to allow new users to create their own profile during registration
    
  2. Security
    - Only allows users to insert their own profile
    - Maintains existing RLS policies
*/

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);