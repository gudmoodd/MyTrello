# MyTrello

MyTrello is a Trello-like project management application with a React frontend and Node.js/Express backend. It supports boards, lists, cards, tasks, authentication, and real-time collaboration.

## Features
- User authentication (login/register)
- Create and manage boards, lists, cards, and tasks
- Invite users to boards
- Real-time updates via WebSockets
- Email notifications

## Project Structure
```
mytrello/
├── client/   # React frontend
├── server/   # Node.js/Express backend
```

### Client (Frontend)
- Built with React
- Located in `client/`
- Main entry: `src/index.js`
- Components: `src/components/`
- Pages: `src/pages/`
- Redux store: `src/redux/`
- API utilities: `src/ultils/api.js`

### Server (Backend)
- Built with Node.js, Express
- Located in `server/`
- Main entry: `server/index.js`
- Controllers: `server/controllers/`
- Routes: `server/routes/`
- Middleware: `server/middleware/`
- Utilities: `server/ultils/`
- WebSocket: `server/socket.js`

## Getting Started

### Prerequisites
- Node.js (v14+ recommended)
- npm

### 1. Clone the repository
```sh
git clone https://github.com/<your-username>/mytrello.git
cd mytrello
```

### 2. Install dependencies
#### Backend
```sh
cd server
npm install
```
#### Frontend
```sh
cd ../client
npm install
```

### 3. Environment Variables
Create a `.env` file in the `server/` directory. **Do not commit this file to GitHub.**
Example:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
CLIENT_URL=http://localhost:3000
```

### 4. Start the backend server
```sh
cd server
node index.js
```

### 5. Start the frontend
```sh
cd client
npm start
```

The frontend will run on [http://localhost:3000](http://localhost:3000) and the backend on [http://localhost:5000](http://localhost:5000) by default.

## Usage
- Register a new account or log in.
- Create boards, add lists and cards.
- Invite users to collaborate.
- Manage tasks and track progress.

## Notes
- The `.env` file contains sensitive information and should **never** be pushed to GitHub.
- For email features, configure SMTP credentials in `.env`.
- For production, set up proper environment variables and secure your keys.

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)
