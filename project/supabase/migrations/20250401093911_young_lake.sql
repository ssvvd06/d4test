/*
  # Initial Schema Setup for Security Advisory System

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `full_name` (text)
      - `role` (text)
      - `client_name` (text)
      - `created_at` (timestamp)
    
    - `advisories`
      - `id` (text, primary key)
      - `title` (text)
      - `severity` (text)
      - `date` (date)
      - `description` (text)
      - `affected_systems` (text[])
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
*/

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'user',
  client_name text,
  created_at timestamptz DEFAULT now()
);

-- Create advisories table
CREATE TABLE advisories (
  id text PRIMARY KEY,
  title text NOT NULL,
  severity text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  description text NOT NULL,
  affected_systems text[] NOT NULL DEFAULT '{}',
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisories ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (role = 'admin');

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can create profiles"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (role = 'admin');

-- Policies for advisories
CREATE POLICY "Anyone can read advisories"
  ON advisories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can create advisories"
  ON advisories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );