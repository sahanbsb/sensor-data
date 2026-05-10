async function fetchData() {
    const response = await fetch('sensor_data.csv?t=' + Date.now());
    const csvData = await response.text();

    Papa.parse(csvData, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function (results) {
            processData(results.data);
        }
    });
}

function processData(data) {
    const tableBody = document.querySelector('#dataTable tbody');
    tableBody.innerHTML = "";

    const chartDataTemp = [];
    const chartDataHum = [];

    let tempSum = 0, humSum = 0, count = 0;
    let maxTemp = -Infinity, minTemp = Infinity;
    let maxHum = -Infinity, minHum = Infinity;
    let latestTimestamp = null;
    let latestTemp = null;
    let latestHum = null;

    // Define the cutoff (24 hours ago)
    const now = new Date();
    const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);

    // Filter and Process Data
    data.forEach(row => {
        if (!row.Timestamp) return;

        // Convert CSV UTC time to local JS Date object
        const localDate = new Date(row.Timestamp);

        // Only process if within the last 24 hours
        if (localDate.getTime() > twentyFourHoursAgo) {
            const t = parseFloat(row.Temperature);
            const h = parseFloat(row.Humidity);
            // Chart.js time scale likes {x: Date, y: Value} objects
            chartDataTemp.push({ x: localDate, y: row.Temperature });
            chartDataHum.push({ x: localDate, y: row.Humidity });

            // Stats Calculations
            tempSum += t;
            humSum += h;
            count++;

            if (t > maxTemp) maxTemp = t;
            if (t < minTemp) minTemp = t;
            if (h > maxHum) maxHum = h;
            if (h < minHum) minHum = h;

            // Track latest data point
            if (latestTimestamp === null || localDate.getTime() > latestTimestamp.getTime()) {
                latestTimestamp = localDate;
                latestTemp = t;
                latestHum = h;
            }

            // Add to Table
            const tr = `<tr>
                <td>${localDate.toLocaleString('en-GB')}</td>
                <td>${row.Temperature}°C</td>
                <td>${row.Humidity}%</td>
            </tr>`;
            tableBody.insertAdjacentHTML('afterbegin', tr);
        }
    });

    // Update the Summary Box
    if (count > 0) {
        document.getElementById('temp-high').innerText = maxTemp.toFixed(1);
        document.getElementById('temp-low').innerText = minTemp.toFixed(1);
        document.getElementById('temp-avg').innerText = (tempSum / count).toFixed(1);

        document.getElementById('hum-high').innerText = maxHum.toFixed(1);
        document.getElementById('hum-low').innerText = minHum.toFixed(1);
        document.getElementById('hum-avg').innerText = (humSum / count).toFixed(1);

        // Update Latest Data Box
        if (latestTimestamp) {
            document.getElementById('latest-temp').innerText = latestTemp.toFixed(1);
            document.getElementById('latest-rh').innerText = latestHum.toFixed(1);
            document.getElementById('latest-time').innerText = latestTimestamp.toLocaleString('en-GB');

            // Check if data is live (within 10 minutes)
            const tenMinutesAgo = now.getTime() - (10 * 60 * 1000);
            const isLive = latestTimestamp.getTime() > tenMinutesAgo;

            const statusCircle = document.getElementById('status-circle');
            statusCircle.classList.remove('status-live', 'status-offline');
            statusCircle.classList.add(isLive ? 'status-live' : 'status-offline');
        }
    }

    if (window.tempChart && typeof window.tempChart.destroy === 'function') window.tempChart.destroy();

    try {
        window.tempChart = new Chart(document.getElementById('tempChart'), {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Temp (°C)',
                        data: chartDataTemp,
                        borderColor: '#ff6384',
                        backgroundColor: 'rgba(255, 99, 132, 0.1)',
                        fill: false,
                        borderWidth: 1.5,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        tension: 0.3,
                        spanGaps: false,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Humidity (%)',
                        data: chartDataHum,
                        borderColor: '#36a2eb',
                        backgroundColor: 'rgba(54, 162, 235, 0.1)',
                        fill: false,
                        borderWidth: 1.5,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        tension: 0.3,
                        spanGaps: false,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                hover: {
                    mode: 'index',
                    intersect: false
                },
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'hour',
                            displayFormats: {
                                hour: 'HH:mm'
                            }
                        },
                        title: { display: true, text: 'Local Time' }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: 'Temperature (°C)' },
                        ticks: {
                            color: '#ff6384'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: { display: true, text: 'Humidity (%)' },
                        ticks: {
                            color: '#36a2eb'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating combined chart:', error);
    }
}

fetchData();
setInterval(fetchData, 300000);