# Frontend Summarizer

React frontend for the document summarizer app.

## Live Deployment

- Frontend app: https://frontend-summarizer.onrender.com
- Backend API: https://backend-summarizer-latest.onrender.com
- Frontend repository: https://github.com/Prj-007/frontend-summarizer
- Backend repository: https://github.com/Prj-007/backend-summarizer-latest

## Local Run

```bash
npm install
REACT_APP_API_URL=http://localhost:8080 npm start
```

## Production Build

```bash
REACT_APP_API_URL=https://your-backend-url.onrender.com npm run build
```

## Environment Variables

- `REACT_APP_API_URL`: backend API base URL.
