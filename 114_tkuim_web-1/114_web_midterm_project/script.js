// ==================== API 配置 ====================
const OPENWEATHER_API_KEY = '6e05b0c0d041b6725c91d38e753141e9';
const GOOGLE_MAPS_API_KEY = 'AIzaSyBnlqM1HFB7XKCXHfyGiZOW9qkQJXnWZL8';
const OPENWEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const AIR_POLLUTION_URL = 'https://api.openweathermap.org/data/2.5/air_pollution';

// ==================== DOM 元素 ====================
const weatherForm = document.querySelector('#weatherForm');
const cityInput = document.querySelector('#cityInput');
const errorMessage = document.querySelector('#errorMessage');
const weatherDisplay = document.querySelector('#weatherDisplay');
const loadingSpinner = document.querySelector('#loadingSpinner');
const quickCityButtons = document.querySelectorAll('.quick-city-btn');

// ==================== 全域變數 ====================
let currentTempCelsius = 0;
let currentFeelsLikeCelsius = 0;
let currentUnit = 'celsius';
let currentCityData = null;

// ==================== 工具函數 ====================
function formatTime(timestamp, timezoneOffset = 0) {
    const date = new Date((timestamp + timezoneOffset) * 1000);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

function showLoading() {
    loadingSpinner.classList.remove('d-none');
}

function hideLoading() {
    loadingSpinner.classList.add('d-none');
}

function showWeatherDisplay() {
    weatherDisplay.classList.remove('d-none');
}

function hideWeatherDisplay() {
    weatherDisplay.classList.add('d-none');
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function hideError() {
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';
}

function showTooltip(message, type = 'info') {
    const tooltip = document.createElement('div');
    tooltip.className = 'share-tooltip';
    tooltip.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    tooltip.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#28a745' : '#17a2b8'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 9999;
        animation: slideInRight 0.3s ease;
    `;
    document.body.appendChild(tooltip);
    setTimeout(() => tooltip.remove(), 2500);
}

// ==================== AQI 計算 ====================
function calculateAQI(pm25) {
    const breakpoints = [
        { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50 },
        { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
        { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
        { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
        { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
        { cLow: 250.5, cHigh: 500.4, iLow: 301, iHigh: 500 }
    ];

    for (let bp of breakpoints) {
        if (pm25 >= bp.cLow && pm25 <= bp.cHigh) {
            const aqi = ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (pm25 - bp.cLow) + bp.iLow;
            return Math.round(aqi);
        }
    }
    return 500;
}

// ==================== 表單驗證 ====================
function validateCityInput(city) {
    console.log('驗證城市:', city); // Debug

    if (!city || city.length === 0) {
        showError('請輸入城市名稱');
        cityInput.classList.add('is-invalid');
        cityInput.focus();
        return false;
    }

    if (/[\u4e00-\u9fa5]/.test(city)) {
        showError('不支援中文！請使用英文城市名稱（例如：台北 → Taipei）');
        cityInput.classList.add('is-invalid');
        cityInput.focus();
        return false;
    }

    if (city.length < 2) {
        showError('城市名稱至少需要 2 個字元');
        cityInput.classList.add('is-invalid');
        cityInput.focus();
        return false;
    }

    if (!/^[A-Za-z\s]+$/.test(city)) {
        showError('僅支援英文字母和空格');
        cityInput.classList.add('is-invalid');
        cityInput.focus();
        return false;
    }

    cityInput.classList.remove('is-invalid');
    cityInput.classList.add('is-valid');
    console.log('驗證通過'); // Debug
    return true;
}

// ==================== 即時輸入驗證 ====================
cityInput.addEventListener('input', function(e) {
    const value = e.target.value.trim();

    hideError();
    e.target.classList.remove('is-invalid', 'is-valid');

    if (value.length === 0) return;

    if (/[\u4e00-\u9fa5]/.test(value)) {
        showError('請使用英文城市名稱');
        e.target.classList.add('is-invalid');
        return;
    }

    if (!/^[A-Za-z\s]+$/.test(value)) {
        showError('請僅輸入英文字母和空格');
        e.target.classList.add('is-invalid');
        return;
    }

    if (value.length >= 2) {
        e.target.classList.add('is-valid');
    }
});

// ==================== 表單提交 ====================
weatherForm.addEventListener('submit', function(e) {
    e.preventDefault();
    console.log('表單提交'); // Debug

    const city = cityInput.value.trim();

    if (validateCityInput(city)) {
        console.log('開始查詢:', city); // Debug
        fetchWeather(city);
    } else {
        console.log('驗證失敗'); // Debug
    }
});

// ==================== 定位功能 ====================

document.getElementById('locate-btn').addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      fetchWeatherByLatLon(pos.coords.latitude, pos.coords.longitude);  // 用經緯度取得即時天氣
      fetchForecast(pos.coords.latitude, pos.coords.longitude);          // 五日預報
    }, () => alert('定位失敗，請允許權限或手動輸入城市。'));
  } else {
    alert('不支援定位功能');
  }
});

// ==================== 天氣查詢 ====================
async function fetchWeatherByLatLon(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=zh_tw`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('無法取得定位天氣資料');
    const data = await response.json();
    displayWeather(data);
  } catch(err) {
    alert(err.message);
  }
}

async function fetchWeather(city) {
    console.log('fetchWeather 被調用:', city); // Debug

    showLoading();
    hideWeatherDisplay();
    hideError();

    try {
        const url = `${OPENWEATHER_URL}?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=zh_tw`;
        console.log('API URL:', url); // Debug

        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) throw new Error('找不到該城市，請檢查拼寫');
            if (response.status === 401) throw new Error('API Key 無效');
            throw new Error('無法取得天氣資訊');
        }

        const data = await response.json();
        console.log('天氣資料:', data); // Debug

        displayWeather(data);

    } catch (error) {
        console.error('查詢錯誤:', error); // Debug
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function displayWeather(data) {
    hideError();

    currentCityData = data;
    currentTempCelsius = data.main.temp;
    currentFeelsLikeCelsius = data.main.feels_like;

    // 基本資訊
    document.querySelector('#cityName').textContent = `${data.name}, ${data.sys.country}`;
    document.querySelector('#weatherIcon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
    document.querySelector('#weatherIcon').alt = data.weather[0].description;
    document.querySelector('#temperature').textContent = Math.round(data.main.temp);
    document.querySelector('#weatherDescription').textContent = data.weather[0].description;

    // 詳細資訊
    document.querySelector('#feelsLike').textContent = `${Math.round(data.main.feels_like)}°C`;
    document.querySelector('#humidity').textContent = `${data.main.humidity}%`;
    document.querySelector('#windSpeed').textContent = `${data.wind.speed} m/s`;
    document.querySelector('#pressure').textContent = `${data.main.pressure} hPa`;
    document.querySelector('#visibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    document.querySelector('#clouds').textContent = `${data.clouds.all}%`;

    // 日出日落（使用當地時區）
    const timezoneOffset = data.timezone;
    document.querySelector('#sunrise').textContent = formatTime(data.sys.sunrise, timezoneOffset);
    document.querySelector('#sunset').textContent = formatTime(data.sys.sunset, timezoneOffset);

    // 載入額外功能
    const { lat, lon } = data.coord;
    loadGoogleMap(data.name, data.sys.country, lat, lon);
    setWeatherBackground(data.weather[0].main);
    fetchForecast(lat, lon);
    fetchAirQuality(lat, lon);

    // 更新歷史和收藏
    saveToHistory(data.name);
    updateFavoriteButton();

    // 重置溫度單位
    currentUnit = 'celsius';
    document.querySelector('#celsiusBtn')?.classList.add('active');
    document.querySelector('#fahrenheitBtn')?.classList.remove('active');

    // 顯示結果
    showWeatherDisplay();
    setTimeout(() => weatherDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
}

// ==================== Google 地圖 ====================
function loadGoogleMap(city, country, lat, lon) {
    const mapIframe = document.querySelector('#googleMap');
    if (!mapIframe) return;

    const mapUrl = `https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=${lat},${lon}&zoom=12&maptype=satellite`;

    mapIframe.src = '';
    setTimeout(() => {
        mapIframe.src = mapUrl;
        console.log('地圖已載入:', city);
    }, 150);
}

// ==================== 天氣背景動畫 ====================
function setWeatherBackground(weatherMain) {
    const heroSection = document.querySelector('.hero-section');
    heroSection.className = heroSection.className.replace(/weather-bg-\w+/g, '');

    const weatherClass = {
        'Clear': 'weather-bg-clear',
        'Rain': 'weather-bg-rain',
        'Drizzle': 'weather-bg-rain',
        'Snow': 'weather-bg-snow',
        'Clouds': 'weather-bg-clouds',
        'Thunderstorm': 'weather-bg-thunderstorm'
    };

    heroSection.classList.add(weatherClass[weatherMain] || 'weather-bg-clear');

    if (weatherMain === 'Snow') {
        createSnowflakes();
    }
}

function createSnowflakes() {
    const heroSection = document.querySelector('.hero-section');
    document.querySelectorAll('.snowflake').forEach(flake => flake.remove());

    for (let i = 0; i < 20; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.textContent = '❄';
        snowflake.style.left = Math.random() * 100 + '%';
        snowflake.style.animationDuration = (Math.random() * 3 + 2) + 's';
        snowflake.style.animationDelay = Math.random() * 2 + 's';
        heroSection.appendChild(snowflake);
    }
}

// ==================== 五日預報 ====================
async function fetchForecast(lat, lon) {
    const forecastContainer = document.querySelector('#forecastCards');
    if (!forecastContainer) return;

    try {
        const url = `${FORECAST_URL}?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=zh_tw`;
        const response = await fetch(url);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        displayForecast(data);

    } catch (error) {
        console.error('五日預報錯誤:', error);
        forecastContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #888;">無法載入預報</div>';
    }
}

function displayForecast(data) {
    const forecastContainer = document.querySelector('#forecastCards');
    if (!forecastContainer) return;

    const dailyForecasts = [];
    const processedDates = new Set();

    data.list.forEach(item => {
        const dateKey = new Date(item.dt * 1000).toDateString();
        if (!processedDates.has(dateKey)) {
            dailyForecasts.push(item);
            processedDates.add(dateKey);
        }
    });

    const fiveDays = dailyForecasts.slice(0, 5);

    let html = '';

    fiveDays.forEach((day, index) => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric', weekday: 'short' });
        const iconUrl = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;
        const temp = Math.round(day.main.temp);
        const tempMin = Math.round(day.main.temp_min);
        const tempMax = Math.round(day.main.temp_max);
        const desc = day.weather[0].description;
        const humidity = day.main.humidity;
        const pop = Math.round((day.pop || 0) * 100);
        const windSpeed = day.wind ? day.wind.speed : 0;
        const pressure = day.main.pressure;
        const clouds = day.clouds ? day.clouds.all : 0;
        const feelsLike = Math.round(day.main.feels_like);

        // 卡片
        html += `
            <div class="forecast-card" onclick="document.getElementById('fm${index}').classList.add('show')">
                <div class="forecast-date">${dayName}</div>
                <img src="${iconUrl}" alt="${desc}" class="forecast-icon">
                <div class="forecast-temp">${temp}°C</div>
                <div class="forecast-temp-range">
                    <span class="temp-high">↑${tempMax}°</span>
                    <span class="temp-low">↓${tempMin}°</span>
                </div>
                <div class="forecast-desc">${desc}</div>
                <div class="forecast-extra">
                    <div class="forecast-extra-item">
                        <i class="fas fa-tint"></i>
                        <span>${humidity}%</span>
                    </div>
                    <div class="forecast-extra-item">
                        <i class="fas fa-umbrella"></i>
                        <span>${pop}%</span>
                    </div>
                </div>
            </div>
        `;
    });

    forecastContainer.innerHTML = html;

    // 彈窗（插入到 body）
    let modals = '';
    fiveDays.forEach((day, index) => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric', weekday: 'short' });
        const iconUrl = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;
        const temp = Math.round(day.main.temp);
        const tempMin = Math.round(day.main.temp_min);
        const tempMax = Math.round(day.main.temp_max);
        const desc = day.weather[0].description;
        const humidity = day.main.humidity;
        const pop = Math.round((day.pop || 0) * 100);
        const windSpeed = day.wind ? day.wind.speed : 0;
        const pressure = day.main.pressure;
        const clouds = day.clouds ? day.clouds.all : 0;
        const feelsLike = Math.round(day.main.feels_like);

        modals += `
            <div class="forecast-modal" id="fm${index}" onclick="if(event.target.id=='fm${index}')this.classList.remove('show')">
                <div class="forecast-modal-content">
                    <button class="modal-close-btn" onclick="document.getElementById('fm${index}').classList.remove('show')">
                        <i class="fas fa-times"></i>
                    </button>

                    <div class="modal-header">
                        <h3 class="modal-date">${dayName}</h3>
                        <img src="${iconUrl}" alt="${desc}" class="modal-icon">
                    </div>

                    <div class="modal-temp-section">
                        <div class="modal-temp-main">${temp}°C</div>
                        <div class="modal-feels-like">體感 ${feelsLike}°C</div>
                        <div class="modal-desc">${desc}</div>
                    </div>

                    <div class="modal-temp-range">
                        <div class="modal-temp-item high">
                            <i class="fas fa-arrow-up"></i>
                            <span>最高溫</span>
                            <strong>${tempMax}°C</strong>
                        </div>
                        <div class="modal-temp-item low">
                            <i class="fas fa-arrow-down"></i>
                            <span>最低溫</span>
                            <strong>${tempMin}°C</strong>
                        </div>
                    </div>

                    <div class="modal-details">
                        <div class="modal-detail-item">
                            <div class="modal-detail-icon"><i class="fas fa-tint"></i></div>
                            <div class="modal-detail-info"><span>濕度</span><strong>${humidity}%</strong></div>
                        </div>
                        <div class="modal-detail-item">
                            <div class="modal-detail-icon"><i class="fas fa-umbrella"></i></div>
                            <div class="modal-detail-info"><span>降雨機率</span><strong>${pop}%</strong></div>
                        </div>
                        <div class="modal-detail-item">
                            <div class="modal-detail-icon"><i class="fas fa-wind"></i></div>
                            <div class="modal-detail-info"><span>風速</span><strong>${windSpeed} m/s</strong></div>
                        </div>
                        <div class="modal-detail-item">
                            <div class="modal-detail-icon"><i class="fas fa-compress-alt"></i></div>
                            <div class="modal-detail-info"><span>氣壓</span><strong>${pressure} hPa</strong></div>
                        </div>
                        <div class="modal-detail-item">
                            <div class="modal-detail-icon"><i class="fas fa-cloud"></i></div>
                            <div class="modal-detail-info"><span>雲量</span><strong>${clouds}%</strong></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    // 移除舊彈窗，插入新彈窗
    document.querySelectorAll('.forecast-modal').forEach(m => m.remove());
    document.body.insertAdjacentHTML('beforeend', modals);
    
    currentCityForecasts = fiveDays.map(day => ({
        dateLabel: new Date(day.dt * 1000).toLocaleDateString('zh-TW', {month:'numeric', day:'numeric'}),
        temp: Math.round(day.main.temp)
    }));

    drawForecastChart(
        fiveDays.map(day => new Date(day.dt * 1000).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })),
        fiveDays.map(day => Math.round(day.main.temp))
    );
    console.log('五日預報已顯示');
}

// 繪製五日氣溫折線圖
let chartInstance = null;
function drawForecastChart(labels, temps) {
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const padding = 1;

  const canvas = document.getElementById('forecastChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: '每日中午溫度(°C)',
        data: temps,
        borderColor: '#4A90E2',
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
        fill: true,
        tension: 0.1,
        pointRadius: 1,
        pointBackgroundColor: '#4A90E2'
      }]
    },
    options: {
        responsive: true,
      scales: {
        x: {
        ticks: {
            maxRotation: 30,   // 文字最大旋轉30度，降低寬度需求
            minRotation: 0,
            autoSkip: true,     // 自動跳過部份標籤避免過度擁擠
            maxTicksLimit: 5   // 最多只顯示幾個標籤
        }
        },
        y: {
        beginAtZero: false,
        min: minTemp - padding,
        max: maxTemp + padding,
        ticks: {
            stepSize: 1
        }
        }}
    }
  });
}

// ==================== 空氣品質 ====================
async function fetchAirQuality(lat, lon) {
    try {
        const url = `${AIR_POLLUTION_URL}?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        displayAirQuality(data);

    } catch (error) {
        console.error('空氣品質錯誤:', error);
        document.querySelector('#aqiValue').textContent = '--';
        document.querySelector('#aqiStatus').textContent = '無法載入';
    }
}

function displayAirQuality(data) {
    if (!data.list || data.list.length === 0) return;

    const components = data.list[0].components;
    const pm25 = components.pm2_5;
    const calculatedAQI = calculateAQI(pm25);

    const aqiLevels = {
        good: { status: '優良', class: 'aqi-good', desc: '空氣品質令人滿意，基本無空氣污染', color: '#56ab2f' },
        fair: { status: '良好', class: 'aqi-fair', desc: '空氣品質可接受，但某些污染物可能對極少數異常敏感人群健康有較弱影響', color: '#f9ca24' },
        moderate: { status: '普通', class: 'aqi-moderate', desc: '易感人群症狀有輕度加劇，健康人群出現刺激症狀', color: '#ff8008' },
        poor: { status: '不良', class: 'aqi-poor', desc: '進一步加劇易感人群症狀，可能對健康人群心臟、呼吸系統有影響', color: '#c94b4b' },
        'very-poor': { status: '非常不良', class: 'aqi-very-poor', desc: '健康人群普遍出現症狀，建議減少外出', color: '#590d22' }
    };

    let level;
    if (calculatedAQI <= 50) level = aqiLevels.good;
    else if (calculatedAQI <= 100) level = aqiLevels.fair;
    else if (calculatedAQI <= 150) level = aqiLevels.moderate;
    else if (calculatedAQI <= 200) level = aqiLevels.poor;
    else level = aqiLevels['very-poor'];

    document.querySelector('#aqiValue').textContent = calculatedAQI;
    const statusElement = document.querySelector('#aqiStatus');
    statusElement.textContent = level.status;
    statusElement.className = `aqi-status ${level.class}`;
    document.querySelector('#aqiDescription').textContent = level.desc;

    const progressBar = document.querySelector('#aqiProgressBar');
    const percentage = Math.min(calculatedAQI / 500, 1);
    const circumference = 2 * Math.PI * 85;
    progressBar.style.strokeDashoffset = circumference - (percentage * circumference);
    progressBar.style.stroke = level.color;

    updatePollutant('pm25', pm25, 150);
    updatePollutant('pm10', components.pm10, 250);
    updatePollutant('o3', components.o3, 180);
    updatePollutant('no2', components.no2, 200);
    if (components.so2) updatePollutant('so2', components.so2, 350);
    if (components.co) {
        document.querySelector('#co').textContent = `${(components.co / 1000).toFixed(2)} mg/m³`;
        updatePollutantBar('coBar', components.co / 1000, 10);
    }

    console.log(`AQI: ${calculatedAQI} (${level.status})`);
}

function updatePollutant(id, value, maxValue) {
    document.querySelector(`#${id}`).textContent = `${value.toFixed(1)} μg/m³`;
    updatePollutantBar(`${id}Bar`, value, maxValue);
}

function updatePollutantBar(barId, value, maxValue) {
    const percentage = Math.min((value / maxValue) * 100, 100);
    const bar = document.querySelector(`#${barId}`);
    if (bar) setTimeout(() => bar.style.width = `${percentage}%`, 100);
}

// ==================== 搜尋歷史 ====================
function saveToHistory(city) {
    let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    history = [city, ...history.filter(c => c.toLowerCase() !== city.toLowerCase())].slice(0, 5);
    localStorage.setItem('searchHistory', JSON.stringify(history));
    displayHistory();
}

function displayHistory() {
    const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    const historySection = document.querySelector('#searchHistorySection');
    const historyContainer = document.querySelector('#searchHistory');

    if (history.length > 0) {
        historySection.style.display = 'block';
        historyContainer.innerHTML = history.map(city =>
            `<span class="history-tag" onclick="fetchWeather('${city}')">${city}<i class="fas fa-times" onclick="event.stopPropagation(); removeFromHistory('${city}')"></i></span>`
        ).join('');
    } else {
        historySection.style.display = 'none';
    }
}

function removeFromHistory(city) {
    let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    history = history.filter(c => c.toLowerCase() !== city.toLowerCase());
    localStorage.setItem('searchHistory', JSON.stringify(history));
    displayHistory();
}

// ==================== 收藏功能 ====================
function toggleFavorite() {
    if (!currentCityData) return;

    const city = currentCityData.name;
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const index = favorites.findIndex(f => f.toLowerCase() === city.toLowerCase());

    if (index > -1) {
        favorites.splice(index, 1);
        showTooltip('已移除收藏', 'info');
    } else {
        favorites.push(city);
        showTooltip('已加入收藏', 'success');
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites();
    updateFavoriteButton();
}

function displayFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const favSection = document.querySelector('#favoritesSection');
    const favContainer = document.querySelector('#favoritesList');

    if (favorites.length > 0) {
        favSection.style.display = 'block';
        favContainer.innerHTML = favorites.map(city =>
            `<span class="history-tag favorite-tag" onclick="fetchWeather('${city}')">
                <i class="fas fa-star"></i> ${city}
                <i class="fas fa-times" onclick="event.stopPropagation(); removeFromFavorites('${city}')"></i>
            </span>`
        ).join('');
    } else {
        favSection.style.display = 'none';
    }
}

function removeFromFavorites(city) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(f => f.toLowerCase() !== city.toLowerCase());
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites();
    updateFavoriteButton();
}

function updateFavoriteButton() {
    const favoriteBtn = document.querySelector('#favoriteBtn');
    if (!favoriteBtn || !currentCityData) return;

    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const isFavorited = favorites.some(f => f.toLowerCase() === currentCityData.name.toLowerCase());

    if (isFavorited) {
        favoriteBtn.classList.add('favorited');
        favoriteBtn.querySelector('i').classList.replace('far', 'fas');
    } else {
        favoriteBtn.classList.remove('favorited');
        favoriteBtn.querySelector('i').classList.replace('fas', 'far');
    }
}

// ==================== 溫度單位切換 ====================
function toggleTemperatureUnit(unit) {
    currentUnit = unit;

    document.querySelector('#celsiusBtn').classList.toggle('active', unit === 'celsius');
    document.querySelector('#fahrenheitBtn').classList.toggle('active', unit === 'fahrenheit');

    // 更新主溫度顯示
    const displayTemp = unit === 'fahrenheit' ? (currentTempCelsius * 9/5) + 32 : currentTempCelsius;
    const displayFeels = unit === 'fahrenheit' ? (currentFeelsLikeCelsius * 9/5) + 32 : currentFeelsLikeCelsius;

    document.querySelector('#temperature').textContent = Math.round(displayTemp);
    document.querySelector('.unit').textContent = unit === 'celsius' ? '°C' : '°F';
    document.querySelector('#feelsLike').textContent = `${Math.round(displayFeels)}${unit === 'celsius' ? '°C' : '°F'}`;

    // 更新五日預報折線圖
    if (currentCityForecasts && currentCityForecasts.length > 0) {
        let temps;
        if (unit === 'fahrenheit') {
            temps = currentCityForecasts.map(day => (day.temp * 9/5) + 32);
        } else {
            temps = currentCityForecasts.map(day => day.temp);
        }
        console.log('更新折線圖溫度資料:', temps);
        drawForecastChart(
            currentCityForecasts.map(day => day.dateLabel),
            temps
        );
    }
}

// ==================== 深色模式 ====================
function initDarkMode() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
}

function toggleDarkMode() {
    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    showTooltip(newTheme === 'dark' ? '🌙 深色模式' : '☀️ 淺色模式', 'info');
}

function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    const icon = document.querySelector('#darkModeToggle i');
    if (icon) icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// ==================== 分享功能 ====================
function shareWeather() {
    if (!currentCityData) return;

    const text = `${currentCityData.name} 現在 ${Math.round(currentTempCelsius)}°C，${currentCityData.weather[0].description}`;

    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => showTooltip('已複製到剪貼簿', 'success'));
    }
}

// ==================== 事件監聽器 ====================
quickCityButtons.forEach(button => {
    button.addEventListener('click', function() {
        const city = this.getAttribute('data-city');
        cityInput.value = city;
        fetchWeather(city);
    });
});

document.querySelector('#clearHistoryBtn')?.addEventListener('click', function() {
    if (confirm('確定要清除所有搜尋記錄嗎？')) {
        localStorage.removeItem('searchHistory');
        displayHistory();
    }
});

document.querySelector('#favoriteBtn')?.addEventListener('click', toggleFavorite);
document.querySelector('#celsiusBtn')?.addEventListener('click', () => toggleTemperatureUnit('celsius'));
document.querySelector('#fahrenheitBtn')?.addEventListener('click', () => toggleTemperatureUnit('fahrenheit'));
document.querySelector('#darkModeToggle')?.addEventListener('click', toggleDarkMode);
document.querySelector('#shareBtn')?.addEventListener('click', shareWeather);

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

cityInput.addEventListener('focus', function() {
    this.parentElement.style.transform = 'scale(1.02)';
});

cityInput.addEventListener('blur', function() {
    this.parentElement.style.transform = 'scale(1)';
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        cityInput.value = '';
        cityInput.focus();
        hideError();
        cityInput.classList.remove('is-invalid', 'is-valid');
    }
});

// ==================== 意見回饋表單 ====================
const feedbackForm = document.querySelector('#feedbackForm');
const starRating = document.querySelector('#starRating');
const ratingInput = document.querySelector('#rating');
const ratingText = document.querySelector('#ratingText');
const feedbackMessage = document.querySelector('#feedbackMessage');
const charCount = document.querySelector('#charCount');
const feedbackSuccess = document.querySelector('#feedbackSuccess');

// 星級評分
if (starRating) {
    const stars = starRating.querySelectorAll('i');
    let currentRating = 0;

    stars.forEach(star => {
        star.addEventListener('click', function() {
            currentRating = parseInt(this.getAttribute('data-rating'));
            ratingInput.value = currentRating;
            updateStars(currentRating);
            updateRatingText(currentRating);
        });

        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            updateStars(rating);
        });
    });

    starRating.addEventListener('mouseleave', function() {
        updateStars(currentRating);
    });

    function updateStars(rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.remove('far');
                star.classList.add('fas', 'active');
            } else {
                star.classList.remove('fas', 'active');
                star.classList.add('far');
            }
        });
    }

    function updateRatingText(rating) {
        const texts = {
            1: '😞 非常不滿意',
            2: '😕 不滿意',
            3: '😐 普通',
            4: '😊 滿意',
            5: '😍 非常滿意'
        };
        ratingText.textContent = texts[rating] || '請選擇評分';
    }
}

// 字數統計
if (feedbackMessage && charCount) {
    feedbackMessage.addEventListener('input', function() {
        const length = this.value.length;
        charCount.textContent = length;

        if (length > 500) {
            charCount.style.color = '#e74c3c';
            this.value = this.value.substring(0, 500);
        } else {
            charCount.style.color = '#95a5a6';
        }
    });
}

// 表單提交
if (feedbackForm) {
    feedbackForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // 驗證必填欄位
        const feedbackType = document.querySelector('#feedbackType').value;
        const rating = ratingInput.value;
        const message = feedbackMessage.value.trim();

        if (!feedbackType) {
            showTooltip('請選擇意見類型', 'info');
            return;
        }

        if (!rating) {
            showTooltip('請選擇評分', 'info');
            return;
        }

        if (!message) {
            showTooltip('請填寫詳細意見', 'info');
            return;
        }

        // 收集表單資料
        const formData = {
            name: document.querySelector('#userName').value || '匿名',
            email: document.querySelector('#userEmail').value || '未提供',
            type: feedbackType,
            rating: rating,
            message: message,
            timestamp: new Date().toISOString()
        };

        console.log('意見回饋:', formData);

        // 儲存到 localStorage（實際應用中應該發送到後端）
        saveFeedback(formData);

        // 顯示成功訊息
        feedbackSuccess.style.display = 'block';
        feedbackForm.reset();

        // 重置星級評分
        if (starRating) {
            const stars = starRating.querySelectorAll('i');
            stars.forEach(star => {
                star.classList.remove('fas', 'active');
                star.classList.add('far');
            });
            ratingText.textContent = '請選擇評分';
        }

        charCount.textContent = '0';

        // 3秒後隱藏成功訊息
        setTimeout(() => {
            feedbackSuccess.style.display = 'none';
        }, 5000);

        // 滾動到成功訊息
        feedbackSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
}

// 儲存意見到 localStorage
function saveFeedback(data) {
    let feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
    feedbacks.push(data);
    // 只保留最近 50 筆
    if (feedbacks.length > 50) {
        feedbacks = feedbacks.slice(-50);
    }
    localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
    showTooltip('意見已送出！感謝您的回饋', 'success');
}

// ==================== 頁面初始化 ====================
window.addEventListener('load', function() {
    console.log('天氣查詢系統已就緒');
    initDarkMode();
    displayHistory();
    displayFavorites();
});
