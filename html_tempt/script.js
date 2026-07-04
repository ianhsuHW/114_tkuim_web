document.addEventListener('DOMContentLoaded', () => {

    // --- 1. 選取 DOM 元素 ---
    const searchForm = document.querySelector('#search-form');
    const cityInput = document.querySelector('#city-input');
    const languageSelect = document.querySelector('#language-select'); // [!!] 修正 1: 選取語言選單
    const searchButton = document.querySelector('#search-form button');
    const feedbackDisplay = document.querySelector('#feedback-display');
    const cityImageContainer = document.querySelector('#city-image-container');
    const currentContainer = document.querySelector('#current-weather-container');
    const forecastContainer = document.querySelector('#forecast-container');

    // --- 2. 主要事件監聽 ---
    searchForm.addEventListener('submit', handleSubmit);

    /**
     * 主邏輯：處理表單提交
     */
    async function handleSubmit(event) {
        event.preventDefault();
        const city = cityInput.value.trim();
        const language = languageSelect.value; // [!!] 修正 2: 取得目前選擇的語言
        
        if (!city) {
            displayError('請輸入城市名稱');
            return;
        }

        clearDisplay();
        setLoading(true);

        try {
            const results = await getCoordinates(city, language); // [!!] 修正 3: 將語言傳遞下去

            if (results.length === 0) {
                // 情況 1：完全找不到
                throw new Error(`找不到城市：「${city}」`);
            } 
            
            // 檢查第一個結果的 "name" 是否「完全等於」用戶輸入
            const perfectMatch = results.find(r => r.name.toLowerCase() === city.toLowerCase());
            
            if (results.length === 1 || perfectMatch) {
                // 情況 2：完美匹配！(例如 "台北" -> "臺北市")
                const result = perfectMatch || results[0]; 
                const coords = {
                    latitude: result.latitude,
                    longitude: result.longitude,
                    name: result.name 
                };
                await fetchAndDisplayWeather(coords);
            
            } else {
                // 情況 3：找到多個結果 (例如 "taipei" 或 "hi")
                
                const topResult = results[0];
                const topScore = topResult.score || 0; 
                
                if (topScore < 20) { 
                    throw new Error(`找不到城市：「${city}」`);
                }
                
                setLoading(false); 
                displayCitySuggestions(results);
            }

        } catch (error) {
            displayError(error.message); 
        }
    }

    /**
     * API 1: 取得城市的經緯度 (回傳陣列)
     * (這個函數是正確的：移除 language 參數) <-- [!!] 舊的註解是錯的！
     */
    async function getCoordinates(query, language) { // [!!] 修正 4: 接收 language 參數
        
        const encodedQuery = encodeURIComponent(query);
        
        // [!!] 修正 5: 必須將 language 參數加入 API URL，中文搜尋才會準確！
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodedQuery}&count=5&language=${language}&format=json`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('地理編碼服務發生錯誤');
        
        const data = await response.json();
        return data.results || []; 
    }

    /**
     * 新功能：顯示城市建議選項 (容錯功能)
     * (這個函數是正常的)
     */
    function displayCitySuggestions(results) {
        clearDisplay(); 
        
        const title = document.createElement('h3');
        title.className = 'suggestion-title';
        title.textContent = '您是不是想找...？';
        feedbackDisplay.appendChild(title);
        
        results.forEach(result => {
            const button = document.createElement('button');
            button.className = 'suggestion-button';
            let locationName = result.name;
            if (result.country) locationName += `, ${result.country}`;
            if (result.admin1) locationName += ` (${result.admin1})`;
            
            button.textContent = locationName;
            
            button.addEventListener('click', () => {
                const coords = {
                    latitude: result.latitude,
                    longitude: result.longitude,
                    name: result.name 
                };
                handleSuggestionClick(coords);
            });
            
            feedbackDisplay.appendChild(button);
        });
    }

    /**
     * 新功能：處理 "建議按鈕" 的點擊
     * (這個函數是正常的)
     */
    async function handleSuggestionClick(coords) {
        clearDisplay(); 
        setLoading(true); 
        await fetchAndDisplayWeather(coords); 
    }

    /**
     * 核心：將抓取和顯示的邏輯打包
     * (這個函數是正常的)
     */
    async function fetchAndDisplayWeather(coords) {
        try {
            const weatherData = await getWeather(coords.latitude, coords.longitude);
            
            displayCityImage(coords.name, coords.name); 
            displayCurrentWeather(weatherData, coords.name); 
            displayForecast(weatherData.daily);
            
            setLoading(false); 

        } catch (error) {
            displayError(error.message);
        }
    }

    /**
     * API 2: 根據經緯度取得天氣預報
     */
    async function getWeather(latitude, longitude) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&current=temperature_2m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Asia%2FTaipei`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('天氣資料服務發生錯誤');
        return await response.json();
    }

    /**
     * DOM 操作：顯示城市形象照
     */
    function displayCityImage(imageQuery, altText) {
        const img = document.createElement('img');
        img.className = 'city-image';
        const query = imageQuery.split(',')[0].trim();
        img.src = `https://source.unsplash.com/800x400/?${encodeURIComponent(query)},landmark`;
        img.alt = `${altText} 的城市形象照`;
        img.onerror = () => { img.style.display = 'none'; };
        cityImageContainer.appendChild(img);
    }

    /**
     * DOM 操作 1：顯示「目前」天氣
     */
    function displayCurrentWeather(weatherData, cityName) {
        const { current } = weatherData;
        const card = document.createElement('article');
        card.className = 'weather-card';
        card.innerHTML = `
            <h2>${cityName} (現在)</h2>
            <div class="icon">${getWeatherIcon(current.weathercode)}</div>
            <div class="temp">${current.temperature_2m}°C</div>
        `;
        currentContainer.appendChild(card);
    }

    /**
     * DOM 操作 2 (迴圈)：顯示「未來 7 天」預報
     */
    function displayForecast(dailyData) {
        dailyData.time.forEach((date, index) => {
            const card = document.createElement('article');
            card.className = 'weather-card forecast-card';
            
            const formattedDate = new Date(date).toLocaleString('zh-TW', { month: '2-digit', day: '2-digit' });
            
            card.innerHTML = `
                <h3>${formattedDate}</h3>
                <div class="icon">${getWeatherIcon(dailyData.weathercode[index])}</div>
                <p class="temp-max">${dailyData.temperature_2m_max[index]}°C</p>
                <p class="temp-min">${dailyData.temperature_2m_min[index]}°C</p>
            `;
            forecastContainer.appendChild(card);
        });
    }

    /**
     * [Helper] 清空所有顯示區域
     */
    function clearDisplay() {
        feedbackDisplay.innerHTML = '';
        cityImageContainer.innerHTML = '';
        currentContainer.innerHTML = '';
        forecastContainer.innerHTML = '';
        feedbackDisplay.className = '';
    }

    /**
     * [Helper] 設定載入中狀態
     */
    function setLoading(isLoading) {
        if (isLoading) {
            searchButton.disabled = true;
            searchButton.innerHTML = '搜尋中... <span class="spinner"></span>';
        } else {
            searchButton.disabled = false;
            searchButton.innerHTML = '搜尋';
        }
    }

    /**
     * [Helper] 顯示錯誤訊息
     */
    function displayError(message) {
        setLoading(false); 
        feedbackDisplay.textContent = message;
        feedbackDisplay.className = 'error';
    }

    /**
     * [Helper] 根據 Open-Meteo 的 WMO 天氣代碼回傳 Emoji 圖示
     */
    function getWeatherIcon(code) {
        switch (true) {
            case (code === 0): return '☀️'; // 晴天
            case (code === 1): return '🌤️'; // 大致晴朗
            case (code === 2): return '⛅️'; // 局部多雲
            case (code === 3): return '☁️'; // 多雲
            case (code > 40 && code < 50): return '🌫️'; // 霧
            case (code >= 51 && code <= 67): return '🌧️'; // 雨
            case (code >= 71 && code <= 77): return '❄️'; // 雪
            case (code >= 80 && code <= 82): return '🌦️'; // 陣雨
            case (code >= 95 && code <= 99): return '⛈️'; // 雷雨
            default: return '❓';
        }
    }
});