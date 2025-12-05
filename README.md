# 🌤️ Weather Prediction Website

A modern, feature-rich weather prediction website with real-time data powered by OpenWeatherMap API.

![Weather App](https://img.shields.io/badge/Weather-App-blue?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## ✨ Features

### Weather Data
- 🌡️ Current temperature & conditions
- 📅 5-day forecast
- ⏰ 24-hour hourly forecast
- 💨 Wind speed, humidity, pressure
- 👁️ Visibility & cloud coverage
- 🌡️ "Feels like" temperature

### Air Quality & Health
- 🌫️ Air Quality Index (AQI) with 5 levels
- 📊 Pollutant tracking (PM2.5, PM10, O₃, NO₂)
- ☀️ UV Index with safety recommendations
- 🌅 Sunrise & sunset times
- ⏱️ Day length calculation

### User Experience
- 🔍 Search any city worldwide
- 📍 Automatic location detection
- 💾 Save favorite locations (localStorage)
- 📈 Interactive temperature charts (Chart.js)
- 🌡️ Toggle between Celsius/Fahrenheit
- 📱 Fully responsive design
- ✨ Glassmorphism UI with smooth animations

## 🚀 Quick Start

### For XAMPP Users

1. **Copy files to XAMPP:**
   ```bash
   # Copy to htdocs folder
   cp -r * C:/xampp/htdocs/weather/
   ```

2. **Start Apache** in XAMPP Control Panel

3. **Open in browser:**
   ```
   http://localhost/weather/
   ```

### For Direct Use

Simply open `index.html` in any modern web browser!

## 🔑 API Setup

1. **Get your free API key** from [OpenWeatherMap](https://openweathermap.org/api)
2. **Open** `script.js`
3. **Replace** the API key on line 4:
   ```javascript
   const API_KEY = 'YOUR_API_KEY_HERE';
   ```

## 📁 Project Structure

```
weather-website/
├── index.html          # Main HTML file
├── style.css           # All styling (24KB)
├── script.js           # JavaScript logic (25KB)
└── README.md           # This file
```

**Total Size:** ~68 KB - lightweight and fast!

## 🎨 Design

- **Glassmorphism** - Frosted glass effect cards
- **Purple/Blue Gradients** - Modern color scheme
- **Smooth Animations** - Fade-ins, slides, hover effects
- **Google Fonts** - Inter font family
- **Responsive** - Works on all devices

## 🛠️ Technologies

- **HTML5** - Semantic structure
- **CSS3** - Modern styling with custom properties
- **Vanilla JavaScript** - No frameworks needed
- **Chart.js** - Temperature visualizations
- **OpenWeatherMap API** - Real-time weather data

## 🌐 Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Opera

## 📊 API Usage

### Free Tier Includes:
- ✅ 60 calls/minute
- ✅ 1,000,000 calls/month
- ✅ Current weather
- ✅ 5-day forecast
- ✅ Air pollution data

## 🎯 Usage

1. **Search for a city** - Type any city name and search
2. **Use your location** - Click "Use My Location" button
3. **Save favorites** - Save cities for quick access
4. **Toggle units** - Switch between °C and °F
5. **View details** - Scroll to see hourly forecast, charts, and more

## 💡 Features Breakdown

### Saved Locations
- Click "Save Location" after searching
- Access saved cities via "Saved" button in header
- Stored in browser's localStorage
- Click any saved location for instant weather

### Temperature Charts
- Interactive Chart.js visualization
- 24-hour temperature trend
- Hover for detailed tooltips
- Smooth gradient fill

### Air Quality
Color-coded levels:
- 🟢 **Good** (1)
- 🟡 **Fair** (2)
- 🟠 **Moderate** (3)
- 🔴 **Poor** (4)
- 🟣 **Very Poor** (5)

## 🤝 Contributing

Feel free to fork, modify, and use this project!

## 📝 License

Free to use for personal and commercial projects.

## 👨‍💻 Author

Built with ❤️ using modern web technologies

## 🙏 Credits

- **Weather Data** - [OpenWeatherMap](https://openweathermap.org/)
- **Charts** - [Chart.js](https://www.chartjs.org/)
- **Font** - [Google Fonts (Inter)](https://fonts.google.com/)

---

**⭐ Star this repo if you found it helpful!**
