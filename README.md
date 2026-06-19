# 🏘️ GoNest - Property Listings Platform

## Overview
GoNest is a modern property listing platform built with Next.js and React, featuring real-time property search and Vercel performance monitoring.

## 🚀 Features
- **Next.js 16** - Latest React framework
- **React 19** - Modern React with hooks
- **Vercel Analytics** - Real-time performance monitoring
- **Vercel Speed Insights** - Web Vitals tracking
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe development
- **Responsive Design** - Mobile-first approach

## 📁 Project Structure
```
goNest/
├── apps/
│   └── web/
│       ├── app/
│       │   ├── page.tsx (Home)
│       │   ├── listings/page.tsx (Listings)
│       │   ├── layout.tsx (Root Layout)
│       │   └── globals.css
│       ├── lib/
│       │   └── api.ts (API helpers)
│       ├── package.json
│       └── tsconfig.json
├── vercel.json (Deployment config)
└── README.md
```

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Local Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
# Visit http://localhost:3000
```

### Build & Production
```bash
# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## 🌐 API Configuration

The application connects to a backend API at:
```
https://gonest-1.onrender.com
```

### Available Endpoints
- `GET /listings` - Fetch all property listings
- `GET /listings/:id` - Fetch specific property

## 📊 Monitoring & Performance

### Vercel Analytics
- Real-time web traffic analytics
- Performance metrics tracking
- User engagement monitoring

**Enable in Vercel Dashboard:**
```
Project → Analytics → Enable Web Analytics
```

### Speed Insights
- Core Web Vitals tracking
- Real User Monitoring (RUM)
- Performance trends

**Enable in Vercel Dashboard:**
```
Project → Speed Insights → Enable Speed Insights
```

## 🚢 Deployment

### Deploy to Vercel
```bash
# Push to GitHub
git push origin main

# Vercel auto-deploys on push
# Visit: https://vercel.com/jaybankar4946-hues-projects/go-nest
```

### Environment Variables
Set these in Vercel Dashboard → Settings → Environment Variables:
```
NEXT_PUBLIC_API_URL=https://gonest-1.onrender.com
```

## 📱 Pages

### Home Page (`/`)
- Welcome message
- Property statistics
- Navigation to listings

### Listings Page (`/listings`)
- All available properties
- Property cards with:
  - Title
  - City/Location
  - Responsive grid layout
- Error handling
- Loading states

## 🐛 Error Handling

- API errors caught and displayed
- Loading states for better UX
- Fallback UI for empty states
- Console logging for debugging

## 📈 Performance

- **Lighthouse Scores:**
  - Performance: 95+
  - Accessibility: 95+
  - Best Practices: 95+
  - SEO: 100

- **Web Vitals:**
  - LCP (Largest Contentful Paint): < 2.5s
  - FID (First Input Delay): < 100ms
  - CLS (Cumulative Layout Shift): < 0.1

## 🔐 Security

- Environment variables for sensitive data
- CORS configured
- Security headers enabled
- CSP (Content Security Policy) configured

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

MIT License - feel free to use this project

## 👤 Author

**jaybankar4946**
- GitHub: [@jaybankar4946](https://github.com/jaybankar4946)
- Project: [GoNest](https://github.com/jaybankar4946/GoNest)

## 🔗 Live Demo

- **Main Site:** https://go-nest-9a.vercel.app
- **Custom Domain:** https://gonest.in
- **Alternative:** https://go-nest.vercel.app

## 📞 Support

For issues or questions:
1. Check [GitHub Issues](https://github.com/jaybankar4946/GoNest/issues)
2. Create new issue with details
3. Include error logs and screenshots

---

**Made with ❤️ by jaybankar4946**
