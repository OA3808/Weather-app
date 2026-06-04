const temperatureField = document.querySelector(".temp");
const locationField = document.querySelector(".time_location p");
const dateandTimeField = document.querySelector(".time_location span");
const conditionField = document.querySelector(".condition p");
const conditionIcon = document.querySelector(".condition img");
const searchField = document.querySelector(".search_area");
const searchbutton = document.querySelector(".search_button");
const form = document.querySelector("form");
const recentSearchesList = document.getElementById("recent_searches_list");

form.addEventListener("submit", searchForLocation);

let target = "Lucknow"

const fetchHistory = async () => {
    try {
        const res = await fetch('http://localhost:3000/api/history');
        const json = await res.json();
        const searches = json.data;

        recentSearchesList.innerHTML = '';
        if (searches) {
            searches.forEach(search => {
                const li = document.createElement('li');
                li.innerText = search.location;
                li.addEventListener('click', () => {
                    searchField.value = search.location;
                    fetchResults(search.location);
                });
                recentSearchesList.appendChild(li);
            });
        }
    } catch (err) {
        console.error("Error fetching history:", err);
    }
}

const saveHistory = async (location) => {
    try {
        await fetch('http://localhost:3000/api/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ location })
        });
        fetchHistory();
    } catch (err) {
        console.error("Error saving history:", err);
    }
}

const fetchResults = async (target) => {
    let url = `http://localhost:3000/api/weather?q=${target}`;
    const res = await fetch(url);
    const data = await res.json()
    console.log(data)
    let locationName = data.location.name
    let time = data.location.localtime
    let temp = data.current.temp_c
    let condition = data.current.condition.text
    let icon = data.current.condition.icon
    updateDetails(temp, locationName, time, condition, icon)
}

function updateDetails(temp, locationName, time, condition, icon) {
    let splitDate = time.split(" ")[0]
    let splitTime = time.split(" ")[1]
    let currentDay = getDayName(new Date(splitDate).getDay())
    temperatureField.innerText = temp
    locationField.innerText = locationName
    dateandTimeField.innerText = `${splitDate} ${currentDay} ${splitTime}`;
    conditionField.innerText = condition
    conditionIcon.src = `https:${icon}`
}
function searchForLocation(e) {
    e.preventDefault()
    target = searchField.value
    fetchResults(target)
    saveHistory(target)
}

fetchResults(target)
fetchHistory()

function getDayName(number) {
    switch (number) {
        case 0:
            return "Sunday"
        case 1:
            return "Monday"
        case 2:
            return "Tuesday"
        case 3:
            return "Wednesday"
        case 4:
            return "Thursday"
        case 5:
            return "Friday"
        case 6:
            return "Saturday"
    }
}