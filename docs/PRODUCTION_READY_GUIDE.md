# Production Readiness Roadmap: Mediot Platform

To transition Mediot from a local development project to a "real" production website, several critical updates and configurations are required across both the frontend and backend.

## 1. Backend (Server) Updates

### 🔐 Security & Configuration
*   **Environment Secrets**: 
    *   In production (e.g., Vercel, Render, or Railway), you must set all variables from `.env` (like `MONGODB_URI`, `NVIDIA_API_KEY`, `JWT_SECRET`) in the hosting provider's dashboard. Never upload the `.env` file itself.
    *   **Action**: Generate a long, random string for `JWT_SECRET` and `JWT_REFRESH_SECRET` for production.
*   **CORS Strictness**:
    *   Currently, `server/index.js` allows multiple development origins. Ensure `CORS_ORIGIN` in your production environment is set to your final domain (e.g., `https://mediot.app`).
*   **Rate Limiting**:
    *   Current limits are generous for development. For production, tighten `RATE_LIMIT_MAX_REQUESTS` to prevent DDoS attacks and API abuse.

### 🗄️ Database
*   **Indexing**: Ensure your MongoDB collections have proper indexes for `userId`, `medicineName`, and `conversationId` to maintain performance as data grows.
*   **Access Control**: Restrict MongoDB Atlas access to the specific IP of your server, or use a VPC peering if applicable.

---

## 2. Frontend (Client) Updates

### 🌐 API Communication
*   **Dynamic API URL**: 
    *   The `proxy` in `client/package.json` only works during local development.
    *   **Action**: Update `client/src/services/api.js` to use an environment variable for the base URL:
        ```javascript
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3003';
        ```
*   **HTTPS**: Ensure all API calls are made over `https://`.

### 📱 PWA & Performance
*   **Service Worker**: Verify that the service worker is registered and correctly caching assets for offline use.
*   **Asset Optimization**: 
    *   Run `npm run build` to generate the production bundle.
    *   Check for large images and use the `WebP` format where possible (I've already optimized several).
*   **Error Boundaries**: Add React Error Boundaries around major sections (Chat, Scanner) to prevent the whole app from crashing if a component fails.

---

## 3. Deployment Strategy

### 🚀 Recommended Hosting
*   **Frontend**: [Vercel](https://vercel.com) or [Netlify](https://netlify.com) (Best for React PWAs).
*   **Backend**: [Render](https://render.com), [Railway](https://railway.app), or [Railway](https://railway.app) (Best for Node.js/Express servers).
*   **Database**: Keep using [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

### 🛠️ Continuous Integration (CI/CD)
*   Since the project is now on GitHub, connect your repository to Vercel/Render. Every time you push to the `master` branch, the "real" website will update automatically.

---

## 4. Final Polish Checklist
- [ ] **Domain Name**: Purchase and link a domain (e.g., `mediot.in` or `mediot.com`).
- [ ] **SEO**: Update `client/public/index.html` with your real meta tags and title.
- [ ] **Legal**: Update the `Privacy Policy` and `Terms of Service` pages with real content instead of templates.
- [ ] **Analytics**: Integrate a tool like Google Analytics or Vercel Analytics to track user engagement.
