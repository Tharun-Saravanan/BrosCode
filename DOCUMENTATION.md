# Sibiling Shoes - E-commerce Platform

## Table of Contents
- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Setup and Installation](#setup-and-installation)
- [Routing](#routing)
- [Styling](#styling)
- [State Management](#state-management)
- [Best Practices](#best-practices)
- [Future Enhancements](#future-enhancements)
- [Dependencies](#dependencies)

## Project Overview
Sibiling Shoes is a modern e-commerce platform built with React, TypeScript, and Tailwind CSS, designed to sell shoes and sandals. The application features a responsive design, product categorization, and a clean, user-friendly interface.

## Technology Stack
- **Frontend Framework**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Routing**: React Router v7
- **Build Tool**: Vite
- **Linting**: ESLint
- **Form Handling**: React Hook Form
- **Icons**: React Icons

## Project Structure
```
src/
├── assets/            # Static assets (images, fonts, etc.)
├── components/        # Reusable UI components
│   ├── BestSellers.tsx
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── NewArrivals.tsx
│   ├── Newsletter.tsx
│   └── TrendingFormals.tsx
├── pages/             # Page components
│   ├── BestSellers.tsx
│   ├── NewArrivals.tsx
│   ├── Sandals.tsx
│   └── Shoes.tsx
├── App.tsx           # Main application component with routing
├── main.tsx          # Application entry point
└── index.css         # Global styles
```

## Key Features

### 1. Product Gallery & Zoom
- Multiple images per product (admin-configurable)
- Image zoom functionality on hover for detailed product viewing
- Thumbnail navigation for switching between product images
- Smooth transitions and responsive design

### 2. Responsive Design
- Mobile-first approach
- Fully responsive layout that works on all device sizes

### 2. Product Categories
- New Arrivals
- Best Sellers
- Shoes
- Sandals
- Bags
- Accessories

### 3. User Experience
- Clean, modern UI with intuitive navigation
- Featured products on the homepage
- Newsletter subscription
- Promotional banners and sections

### 4. Performance
- Fast page loads with Vite
- Optimized assets
- Code splitting with React.lazy (if implemented)

## Setup and Installation

### Prerequisites
- Node.js (v16 or later)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Routing
The application uses React Router with the following routes:
- `/` - Homepage
- `/collections/new-arrivals` - New Arrivals
- `/collections/best-sellers` - Best Sellers
- `/collections/shoes` - Shoes Collection
- `/collections/sandals` - Sandals Collection
- `/product/:id` - Individual Product Detail Page

## Styling
The application uses Tailwind CSS for styling with a custom configuration. The design follows a consistent color scheme and typography system defined in the Tailwind config.

## State Management
The application uses Redux Toolkit for state management, though the current implementation primarily uses React's built-in state management. The Redux setup is in place for future state management needs.

## Best Practices
- Component-based architecture
- Type safety with TypeScript
- Responsive design principles
- Clean code practices
- Proper file and folder structure

## Future Enhancements
1. Implement user authentication
2. Add shopping cart functionality
3. Integrate with a payment gateway
4. Add product search and filtering
5. Implement product reviews and ratings
6. Add a blog section
7. Implement internationalization

## Dependencies
### Main Dependencies
- @reduxjs/toolkit: ^2.8.2
- react: ^19.1.0
- react-dom: ^19.1.0
- react-redux: ^9.2.0
- react-router-dom: ^7.6.0

### Development Dependencies
- @types/react: ^19.1.2
- @types/react-dom: ^19.1.2
- @vitejs/plugin-react: ^4.4.1
- typescript: ~5.8.3
- tailwindcss: ^3.4.17
- eslint: ^9.25.0
- And other development dependencies (see package.json for complete list)

---

This documentation provides a comprehensive overview of the Sibiling Shoes e-commerce platform. For more detailed information about specific components or features, please refer to the source code and inline documentation.
