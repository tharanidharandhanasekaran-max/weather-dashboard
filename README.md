# SkyCast — Live Weather Dashboard

A responsive weather dashboard built with HTML, CSS and vanilla JavaScript. It uses the free Open-Meteo Geocoding and Forecast APIs; no API key is required.

## Features

- Search for a city and retrieve its coordinates with the Geocoding API.
- Display current temperature, condition, today's high and low.
- Show a five-day forecast with weather symbols and daily high/low temperatures.
- Handle empty input, unknown cities, HTTP errors and network errors.
- Disable the search button while requests are loading.
- Remember the last searched city with `localStorage`.
- Responsive layout for desktop and mobile.

## Run locally

1. Extract the ZIP file.
2. Open the `project-4-weather-dashboard` folder in VS Code.
3. Open `index.html` with the VS Code Live Server extension.
4. Search for a city, for example `Chennai`, `Pune` or `London`.

You can also serve the folder with any local static web server. The API calls require an internet connection.

## APIs used

- Geocoding: `https://geocoding-api.open-meteo.com/v1/search`
- Forecast: `https://api.open-meteo.com/v1/forecast`

## Error handling note (for submission)

The application validates the search input before making requests. It checks `response.ok` before parsing API responses, displays a clear message when a city is not found, and catches network failures. The search button is disabled while the request is in progress and re-enabled in a `finally` block.

## Publish with GitHub Pages

1. Create a public GitHub repository.
2. Upload these project files to the repository root (or push them using Git).
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)` folder, then save.
6. Wait for GitHub Pages to publish your site. Open the URL shown in the Pages section.

## Project checklist

- [x] City search and unknown-city message
- [x] Current weather and five forecast days
- [x] Loading, empty, error and success states
- [x] User text rendered with `textContent`
- [x] Last city remembered
- [x] Responsive phone layout
