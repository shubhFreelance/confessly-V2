# Campus Confessions Frontend

A modern web application for anonymous campus confessions built with React, TypeScript, and Tailwind CSS.

## Features

- User authentication (login/register)
- Create and share anonymous confessions
- React to confessions with emojis
- Report inappropriate content
- User profile management
- Responsive design
- Modern UI with animations

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- React Router v6
- Framer Motion
- Headless UI
- Heroicons
- Axios

## Prerequisites

- Node.js 16+
- npm or yarn

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/campus-confessions.git
cd campus-confessions/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── ui/            # Basic UI components
│   └── ...
├── context/           # React Context providers
├── pages/             # Page components
├── types/             # TypeScript type definitions
├── utils/             # Utility functions and API client
└── App.tsx           # Main application component
```

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 