# Research Reader

## Project Structure

- `Node.js` - Main backend server (now uses modular routes and models)
- `models/` - Mongoose models for Paper, Note, Chat
- `routes/` - Express routers for papers, notes, chat
- `main.tsx` - Main frontend React app
- `.env.example` - Example environment variables

## Setup

1. Copy `.env.example` to `.env` and fill in your values.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend:
   ```bash
   node Node.js
   ```
4. Start the frontend (if separate):
   ```bash
   # e.g., npm start or yarn start
   ```

## Environment Variables

See `.env.example` for required variables:
- `MONGODB_URI` - MongoDB connection string
- `OPENAI_API_KEY` - Your OpenAI API key
- `PORT` - Server port (default 5000)

## Backend Refactor

- Models and routes are now modular for maintainability.
- All API endpoints are mounted under `/api`.
- Sensitive config is loaded from environment variables.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)
