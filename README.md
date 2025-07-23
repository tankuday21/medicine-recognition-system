# 🏥 Medicine Recognition System

A comprehensive AI-powered medicine recognition web application that uses computer vision and multi-image analysis to identify medicines and provide detailed pharmaceutical information.

## Features

- **Image Upload**: Support for JPEG, PNG, and other common image formats
- **Medicine Recognition**: AI-powered identification using Google Gemini Vision API
- **Comprehensive Information**: Detailed medicine data including:
  - Brand and generic names
  - Active ingredients and dosage
  - Manufacturer details
  - Uses and indications
  - Dosage instructions
  - Side effects and contraindications
  - Drug interactions and warnings
  - Storage instructions
  - Price information (when available)
- **Responsive Design**: Works on desktop and mobile devices
- **Privacy Protection**: Uploaded images are automatically deleted after processing

## Technology Stack

- **Frontend**: React.js with TypeScript
- **Backend**: Node.js with Express.js
- **AI/ML**: Google Gemini Vision API
- **Medicine Data**: OpenFDA API + Custom database
- **Styling**: Tailwind CSS
- **File Upload**: Multer

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install-all
   ```
3. Set up environment variables (see .env.example)
4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the server directory with:
```
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
NODE_ENV=development
```

## Usage

1. Open the application in your browser
2. Upload an image of a medicine (pill, bottle, or packaging)
3. Wait for AI analysis and medicine identification
4. View comprehensive medicine information
5. Save or share results as needed

## Important Disclaimer

This application is for informational purposes only. Always consult with healthcare professionals before making any medical decisions. The information provided should not replace professional medical advice.

## License

MIT License
