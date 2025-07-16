# Feedback Platform

A modern, full-stack feedback collection and management system built with Next.js, TypeScript, and MongoDB.

## 🚀 Features

- **Form Creation**: Create custom feedback forms with multiple question types
- **Response Collection**: Gather responses from users with ease
- **Analytics Dashboard**: View and analyze form responses
- **User Authentication**: Secure signup and login system
- **Real-time Updates**: Get instant updates on new form submissions
- **Shareable Links**: Easily share your forms with respondents

## 🛠️ Tech Stack

- **Frontend**: Next.js 13+ with App Router
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Type Safety**: TypeScript
- **State Management**: React Context API

## 🚀 Getting Started

### Prerequisites

- Node.js 16.14 or later
- MongoDB Atlas account or local MongoDB instance
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Abhay2004Kumar/feedback-platform.git
   cd feedback-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Usage

1. **Create an account** or log in
2. **Create a new form** with your desired questions
3. **Customize** form settings and appearance
4. **Share** the form link with respondents
5. **View responses** in your dashboard

## 📊 Features in Detail

### Form Builder
- Create forms with multiple question types
- Add required/optional questions
- Preview forms before publishing

### Response Management
- View all responses in one place
- Export responses as CSV/Excel
- Filter and sort responses

### User Dashboard
- Overview of all your forms
- Response analytics
- Form status management

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with Next.js and MongoDB
- UI components powered by shadcn/ui
- Icons from Lucide React
