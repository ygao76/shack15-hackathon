# Interview Code Challenge Platform

A web application for conducting practical coding interviews with a Next.js calendar app template and integrated ChatGPT interface.

## Features

- **Split-screen layout**: Code editor on the left, chat interface on the right
- **File explorer**: Navigate through the Next.js project structure
- **Monaco Editor**: Full-featured code editor with syntax highlighting
- **Calendar app template**: Pre-built calendar with incomplete functionality for implementation
- **AI Chat Interface**: Direct communication with ChatGPT for interviewer assistance
- **Interview challenges**: Multiple TODO areas for candidates to implement

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main interview interface
│   └── globals.css         # Global styles
├── components/
│   ├── Calendar.tsx        # Calendar component with TODOs
│   ├── MeetingModal.tsx    # Meeting creation/editing modal
│   ├── CodeEditor.tsx      # Monaco code editor wrapper
│   ├── ChatInterface.tsx   # AI chat interface
│   └── FileExplorer.tsx    # Project file navigator
├── lib/
│   └── sampleFiles.ts      # Pre-loaded project files
└── types/
    └── index.ts            # TypeScript interfaces
```

## Installation & Setup

### Prerequisites

Make sure you have Node.js 18+ installed. If you're having Node.js version issues, try using nvm:

```bash
# Install nvm if you don't have it
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use Node.js 18
nvm install 18
nvm use 18
```

### Install Dependencies

```bash
npm install
# or
yarn install
```

### Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Interview Challenges

The calendar app includes several incomplete areas for candidates to implement:

### 1. Meeting Creation (Calendar.tsx)
- **Function**: `handleCreateMeeting()`
- **Challenge**: Open the meeting modal for creating new meetings
- **Location**: Line ~65 in Calendar.tsx

### 2. Meeting Editing (Calendar.tsx)  
- **Function**: `handleEditMeeting(meeting: Meeting)`
- **Challenge**: Set selected meeting and open modal for editing
- **Location**: Line ~70 in Calendar.tsx

### 3. Meeting Save Logic (Calendar.tsx)
- **Function**: `handleSaveMeeting(meeting: Meeting)`
- **Challenge**: Add new meetings or update existing ones in the state
- **Location**: Line ~75 in Calendar.tsx

### 4. Meeting Deletion (Calendar.tsx)
- **Function**: `handleDeleteMeeting(meetingId: string)`
- **Challenge**: Remove meetings from the meetings array
- **Location**: Line ~80 in Calendar.tsx

### 5. Attendee Management (MeetingModal.tsx)
- **Function**: `handleAttendeeChange(index: number, value: string)`
- **Challenge**: Update specific attendee emails in the array
- **Location**: Line ~45 in MeetingModal.tsx

### 6. Add/Remove Attendees (MeetingModal.tsx)
- **Functions**: `addAttendee()` and `removeAttendee(index: number)`
- **Challenge**: Manage dynamic attendee list
- **Location**: Lines ~50-60 in MeetingModal.tsx

### 7. Form Validation & Submission (MeetingModal.tsx)
- **Function**: `handleSubmit(e: React.FormEvent)`
- **Challenge**: Validate form data and call onSave with proper data
- **Location**: Line ~65 in MeetingModal.tsx

## Usage for Interviewers

1. **Setup**: Start the development server and open the application
2. **File Navigation**: Use the file explorer to show candidates different files
3. **Code Challenges**: Guide candidates to implement the TODO functions
4. **AI Assistance**: Use the chat interface to provide hints or answer questions
5. **Real-time Editing**: Watch candidates code in real-time with the Monaco editor

## Usage for Candidates

1. **Explore**: Navigate through the file structure to understand the codebase
2. **Implement**: Complete the TODO functions marked in the calendar components
3. **Test**: Use the calendar interface to test your implementations
4. **Ask Questions**: Use the AI chat interface to get help or clarification
5. **Iterate**: Refine your implementation based on feedback

## Technologies Used

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety and better development experience
- **Tailwind CSS**: Utility-first CSS framework
- **Monaco Editor**: VS Code editor in the browser
- **Lucide React**: Beautiful, customizable icons
- **React Hooks**: Modern React state management

## Customization

### Adding New Challenges

1. Add new TODO comments in the sample files
2. Update the initial chat message with new tasks
3. Modify the file structure in `src/lib/sampleFiles.ts`

### Changing the Project Template

1. Update the sample files in `src/lib/sampleFiles.ts`
2. Modify the initial file structure as needed
3. Update challenge descriptions in the chat interface

### Integrating Real AI

To connect with actual ChatGPT API:

1. Add OpenAI API key to environment variables
2. Create an API route in `src/app/api/chat/route.ts`
3. Update the `handleSendMessage` function to call the API
4. Replace the mock `generateAIResponse` function

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - feel free to use this for your interview processes!
