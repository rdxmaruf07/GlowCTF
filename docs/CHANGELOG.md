# GlowCTF Arena - Changelog

## Groq Package Removal - [28.04.2025]

### Changes

1. **Removed Groq Package**
   - Removed `@groq/groq` package due to unavailability in npm registry
   - Updated all references to Groq in the codebase to indicate that it's currently unavailable
   - Modified the Groq completion function to return a clear error message
   - Updated documentation to reflect the current status of Groq integration

### Files Modified

1. **Package Configuration**
   - `package.json` - Removed `@groq/groq` dependency

2. **Server-side Code**
   - `server/services/chatbot.ts` - Removed Groq import and modified Groq-related functions
   - `server/routes.ts` - Updated comments for Groq completion endpoint

3. **Client-side Code**
   - `client/src/lib/constants.ts` - Updated Groq provider name to indicate unavailability

4. **Documentation**
   - `AI_PROVIDERS.md` - Updated Groq section to indicate unavailability
   - `README.md` - Updated AI integration list and environment variables section

### How to Verify the Changes

1. **Installation**
   - Run `npm install` - Should complete without errors related to `@groq/groq`

2. **Functionality**
   - The application should start and run without errors
   - When selecting Groq as a provider in the chatbot, a clear error message should be displayed

## AI Provider Integration Update - [15.05.2025]

### New Features

1. **Added SDK-based Integration for Multiple AI Providers**
   - Implemented proper SDK-based integration for:
     - Groq (using the `@groq/groq` package)
     - Together AI (using the `together` package)
     - AIML API (using OpenAI SDK with custom base URL)
     - OpenRouter (using OpenAI SDK with custom base URL)
   - File: `server/services/chatbot.ts`

2. **Enhanced AI Client Initialization**
   - Updated the `initializeAIClients` function to properly initialize all AI clients
   - Added support for environment variables as fallbacks for all providers
   - Improved error handling during initialization

3. **Improved API Key Verification**
   - Added API key verification for all new providers
   - Implemented proper error handling for verification failures

### Dependencies

1. **Added New Dependencies**
   - Added `@groq/groq` package (v0.3.0) for Groq API integration
   - Added `together` package (v0.2.0) for Together AI integration

### How to Verify the Changes

1. **AI Provider Integration**
   - Add API keys for each provider in the database or environment variables
   - Test each provider by sending a chat message
   - Verify that the response is received correctly

2. **API Key Verification**
   - Test adding invalid API keys for each provider
   - Verify that the system correctly identifies invalid keys

## Bug Fixes and Improvements - [28.04.2025]

### Bug Fixes

1. **Fixed Anthropic Model Configuration**
   - Updated the Anthropic model from the non-existent future model "claude-3-7-sonnet-20250219" to the current "claude-3-opus-20240229"
   - Removed incorrect comment about a future release date
   - File: `server/services/chatbot.ts`

2. **Improved Error Handling**
   - Fixed error handling middleware in `server/index.ts` to prevent throwing errors after sending responses
   - Added proper error logging instead of throwing errors
   - This prevents potential unhandled promise rejections and improves application stability

3. **Completed External Flag Submission Implementation**
   - Fixed the external flag submission endpoint in `server/routes/contest-routes.ts`
   - Implemented proper database storage for external flag submissions
   - Added submission ID to the response for better tracking

4. **Standardized API Responses**
   - Fixed inconsistent status codes in challenge flag submission endpoints
   - Updated `server/routes/challenge-routes.ts` to return status 200 with success: false for incorrect flags
   - This ensures consistent behavior across all API endpoints

### Improvements

1. **Enhanced Database Documentation**
   - Created a new `DATABASE_CONFIG.md` file with detailed information about:
     - Database configuration options (PostgreSQL/MySQL)
     - How to switch between database providers
     - Environment variables
     - Troubleshooting tips

2. **Added Code Comments**
   - Added clarifying comments to database-related files:
     - `server/db.ts` - PostgreSQL configuration
     - `server/mysql-db.ts` - MySQL configuration
     - `server/storage.ts` - PostgreSQL storage implementation
     - `server/mysql-storage.ts` - MySQL storage implementation

3. **Updated README**
   - Added reference to the new database configuration documentation
   - Clarified that the project uses Neon Serverless PostgreSQL

### No Changes Made

As requested, no changes were made to the database configuration itself. The project continues to use Neon Serverless PostgreSQL as the primary database.

## How to Verify the Changes

1. **Anthropic Model Fix**
   - The chatbot service should initialize without errors
   - Anthropic completions should work with the current model

2. **Error Handling**
   - The application should handle errors gracefully without unhandled promise rejections
   - Error messages should be logged to the console

3. **External Flag Submission**
   - Submitting flags for external contests should save the submission to the database
   - The response should include a submission ID

4. **API Standardization**
   - All flag submission endpoints should return consistent status codes and response formats