# Interview Code Challenge - Calendar App

A React/TypeScript coding challenge application with AI-powered interviewer assistance.

## Features

- **File Explorer**: Navigate through project files
- **Code Editor**: Monaco Editor with TypeScript support
- **Live Preview**: See changes in real-time
- **AI Interviewer**: ChatGPT-powered coding assistance
- **Responsive Layout**: Grid-based interface

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. OpenAI API Configuration

To use the AI interviewer, you need an OpenAI API key:

1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a `.env.local` file in the root directory:

```bash
# OpenAI API Configuration
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here

# Optional: Model configuration
NEXT_PUBLIC_OPENAI_MODEL=gpt-4
NEXT_PUBLIC_OPENAI_MAX_TOKENS=1000
```

**Note**: The `NEXT_PUBLIC_` prefix is required for Next.js to expose these variables to the client-side code.

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Enter API Key**: When you first try to chat, you'll be prompted to enter your OpenAI API key
2. **Select Files**: Use the file explorer to navigate and select files to edit
3. **Code**: Write and edit code in the Monaco Editor
4. **Preview**: See live changes in the preview pane
5. **Chat**: Ask the AI interviewer questions about your code and implementation

## Project Structure

```
src/
├── app/           # Next.js app directory
├── components/    # React components
├── lib/          # Utility functions and API calls
├── types/        # TypeScript type definitions
└── lib/          # Sample project files
```

## Technologies Used

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Monaco Editor** - Code editing
- **Tailwind CSS** - Styling
- **OpenAI API** - AI-powered assistance
- **Lucide React** - Icons

## AI Interviewer

The AI interviewer is powered by OpenAI's GPT models and provides:

- **Coding guidance** for React/TypeScript concepts
- **Debugging help** for code issues
- **Best practices** and improvement suggestions
- **Contextual assistance** based on your specific coding challenge

## Development

```bash
# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## License

MIT
