# FinTrack - Personal Finance Tracker

A modern, cloud-synced personal finance tracking application built with React, Vite, Tailwind CSS, and Firebase.

## Features

- **Cloud Sync:** Real-time data synchronization across devices using Firebase.
- **Multi-Wallet Support:** Manage multiple bank accounts, e-wallets, or cash.
- **Expense & Income Tracking:** Categorize your transactions easily.
- **Visual Analytics:** Monthly reports and category-wise breakdowns.
- **CSV Export:** Download your data for further analysis in Excel or Google Sheets.
- **Responsive Design:** Optimized for mobile and desktop.

## Deployment to GitHub

To deploy this project to GitHub and host it (e.g., on Vercel, Netlify, or GitHub Pages):

1. **Create a GitHub Repository:**
   - Create a new repository on GitHub.
   - Initialize your local project: `git init`.
   - Add files: `git add .`.
   - Commit: `git commit -m "Initial commit"`.
   - Push to GitHub: `git remote add origin <your-repo-url>` and `git push -u origin main`.

2. **Setup Firebase:**
   - Go to the [Firebase Console](https://console.firebase.google.com/).
   - Create a new project.
   - Add a Web App to your project.
   - Enable **Google Authentication** in the Authentication > Sign-in method tab.
   - Create a **Cloud Firestore** database and configure security rules.

3. **Configure Environment Variables:**
   - Create a `.env` file in the root directory.
   - Copy the variables from `.env.example` and fill in your Firebase credentials.
   - For production hosting (like Vercel), add these variables in the provider's dashboard.

4. **Build and Run:**
   - Install dependencies: `npm install`.
   - Run development server: `npm run dev`.
   - Build for production: `npm run build`.

## Security Rules (Firestore)

For production, use these basic security rules in your Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/expense-tracker-v1/users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## License

Apache-2.0
