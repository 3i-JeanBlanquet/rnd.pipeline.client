# Image Management App

A TypeScript React application for managing images with upload functionality and API service integration.

## Features

- **Image Upload**: Upload images with drag & drop support and preview
- **Image Gallery**: Responsive grid layout for viewing uploaded images
- **File Validation**: Automatic file type and size validation
- **Image Management**: Delete images with confirmation
- **TypeScript Support**: Full type safety throughout the application
- **Modern React**: Built with React 18 and modern hooks
- **Vite Build Tool**: Fast development and build process
- **Responsive Design**: Clean, modern UI that works on all devices

## API Service Features

The included API service provides:

- Generic HTTP methods (GET, POST, PUT, DELETE, PATCH)
- File upload support with FormData handling
- Automatic error handling and timeout management
- Configurable headers
- TypeScript support with full type safety
- Abort controller for request cancellation

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file in the root directory:
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:4999

# S3 Bucket Configuration
VITE_S3_BUCKET_URL=https://3i.beamo.tmp.s3.amazonaws.com
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── services/
│   └── api.ts          # API service with image management
├── App.tsx             # Image management application
└── main.tsx            # Application entry point
```

## API Service Usage

### Basic Usage

```typescript
import { apiService, imageService } from './services/api';

// GET request
const response = await apiService.get('/images');

// File upload
const file = document.getElementById('fileInput').files[0];
const uploadedImage = await imageService.uploadImage(file);
```

### Custom Service

```typescript
import { ApiService } from './services/api';

class CustomService {
  constructor(private api: ApiService) {}

  async uploadFile(file: File) {
    return this.api.uploadFile('/custom-upload', file);
  }
}

const customService = new CustomService(apiService);
```

### Error Handling

```typescript
try {
  const response = await imageService.getImages();
  console.log(response.data);
} catch (error) {
  console.error('API Error:', error.message);
}
```

## Configuration

### Environment Variables

The application uses environment variables for configuration. Create a `.env` file in the root directory:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:4999

# S3 Bucket Configuration
VITE_S3_BUCKET_URL=https://3i.beamo.tmp.s3.amazonaws.com
```

### API Service Configuration

The API service can be configured with:

- Base URL for all requests (via environment variable)
- Default headers
- Request timeouts

```typescript
// Set custom headers
apiService.setDefaultHeaders({
  'X-Custom-Header': 'value'
});

// Create custom API service instance
const customApiService = new ApiService('https://api.example.com');
```

## Demo Features

The demo application includes:

- Image upload with preview
- File type and size validation
- Responsive image gallery
- Image deletion functionality
- Error handling demonstration
- Loading states
- File metadata display

## Development

This project uses:

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Modern CSS** with responsive design
- **ESLint** and **Prettier** for code quality (can be added)

## License

MIT
