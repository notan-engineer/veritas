# Supabase Integration Setup

This guide will help you set up Supabase integration for the Veritas news application.

## Prerequisites

1. A Supabase account and project
2. Your Supabase project URL and anon key

## Setup Steps

### 1. Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy your Project URL and anon public key

### 2. Configure Environment Variables

1. Create a `.env.local` file in the project root
2. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up the Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database-setup.sql`
4. Run the SQL script to create the articles table and populate it with data

### 4. Verify the Setup

1. Start the development server: `npm run dev`
2. Visit `http://localhost:3000`
3. You should see the articles loaded from Supabase instead of mock data

## Database Schema

The `articles` table has the following structure:

- `id` (TEXT, PRIMARY KEY): Unique identifier for each article
- `title` (TEXT): Article title
- `short_summary` (TEXT): Brief summary of the article
- `tags` (TEXT[]): Array of tags/categories
- `bullet_summary` (TEXT[]): Array of key facts
- `source_urls` (TEXT[]): Array of source URLs
- `created_at` (TIMESTAMP): Article creation date
- `language` (TEXT): Language code ('en' or 'he')

## Features

The integration provides the following features:

- **Real-time data**: Articles are fetched from Supabase in real-time
- **Dynamic filtering**: Articles can be filtered by tags
- **Search functionality**: Full-text search across titles and summaries
- **Language support**: Support for English and Hebrew articles
- **Error handling**: Graceful fallbacks when database is unavailable

## API Functions

The following functions are available in `src/lib/data-service.ts`:

- `getAllArticles()`: Fetch all articles
- `getArticlesByTopic(topic)`: Fetch articles by specific tag
- `getArticleById(id)`: Fetch a single article by ID
- `getArticlesByLanguage(language)`: Fetch articles by language
- `searchArticles(query)`: Search articles by text
- `getUniqueTags()`: Get all unique tags

## Troubleshooting

### Common Issues

1. **Environment variables not loading**: Make sure your `.env.local` file is in the project root
2. **Database connection errors**: Verify your Supabase URL and anon key are correct
3. **No data showing**: Check that the database setup script was run successfully

### Debug Mode

To enable debug logging, add this to your `.env.local`:

```env
NEXT_PUBLIC_DEBUG=true
```

This will log database queries and errors to the console.

## Security

The current setup uses Row Level Security (RLS) with a public read policy, which means:
- Anyone can read articles
- No write access is provided
- This is suitable for a public news feed

For production use, consider implementing authentication and more restrictive policies. 