"use client";

// Import necessary hooks and types from React
import { useState, ChangeEvent, FormEvent } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Import icons from the Lucide React library
import { CloudIcon, MapPinIcon, ThermometerIcon } from "lucide-react";

// Define a TypeScript interface for weather data
interface WeatherData {
  temperature: number;
  description: string;
  location: string;
  unit: string;
}

// Default export of the WeatherWidgetComponent function
export default function WeatherWidget() {
  // State hooks for managing location input, weather data, error messages, and loading state
  const [location, setLocation] = useState<string>("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Function to handle the search form submission
  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedLocation = location.trim();
    if (trimmedLocation === "") {
      setError("Please enter a valid location.");
      setWeather(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Log the API key and location for debugging
      console.log("API Key:", process.env.NEXT_PUBLIC_WEATHER_API_KEY);
      console.log("Location:", trimmedLocation);

      // Fetch weather data from the weather API
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}&q=${trimmedLocation}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error Response:", errorData);
        throw new Error("City not found");
      }

      const data = await response.json();
      console.log("Weather Data:", data);

      const weatherData: WeatherData = {
        temperature: data.current.temp_c, // Use Celsius
        description: data.current.condition.text,
        location: data.location.name,
        unit: "C",
      };
      setWeather(weatherData); // Set the fetched weather data
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError("City not found. Please try again.");
      setWeather(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get a temperature message based on the temperature value and unit
  function getTemperatureMessage(temperature: number, unit: string): string {
    if (unit === "C") {
      if (temperature < 0) {
        return `It's freezing at ${temperature}°C! Bundle up!`;
      } else if (temperature < 10) {
        return `It's quite cold at ${temperature}°C. Wear warm clothes.`;
      } else if (temperature < 20) {
        return `The temperature is ${temperature}°C. Comfortable for a light jacket.`;
      } else if (temperature < 30) {
        return `It's a pleasant ${temperature}°C. Enjoy the nice weather!`;
      } else {
        return `It's hot at ${temperature}°C. Stay hydrated!`;
      }
    } else {
      return `${temperature}°${unit}`;
    }
  }

  // Function to get a weather message based on the weather description
  function getWeatherMessage(description: string): string {
    switch (description.toLowerCase()) {
      case "sunny":
        return "It's a beautiful sunny day!";
      case "partly cloudy":
        return "Expect some clouds and sunshine.";
      case "cloudy":
        return "It's cloudy today.";
      case "overcast":
        return "The sky is overcast.";
      case "rain":
        return "Don't forget your umbrella! It's raining.";
      case "thunderstorm":
        return "Thunderstorms are expected today.";
      case "snow":
        return "Bundle up! It's snowing.";
      case "mist":
        return "It's misty outside.";
      case "fog":
        return "Be careful, there's fog outside.";
      default:
        return description;
    }
  }

  // Function to get a location message based on the current time
  function getLocationMessage(location: string): string {
    const currentHour = new Date().getHours();
    const isNight = currentHour >= 18 || currentHour < 6;

    return `${location} ${isNight ? "at Night" : "During the Day"}`;
  }

  // JSX return statement rendering the weather widget UI
  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-400 to-blue-600">
      {/* Center the card within the screen */}
      <Card className="w-full max-w-md mx-auto text-center bg-white shadow-lg rounded-lg p-4">
        {/* Card header with title and description */}
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">Weather Widget</CardTitle>
          <CardDescription className="text-gray-600">
            Search for the current weather conditions in your city.
          </CardDescription>
        </CardHeader>
        {/* Card content including the search form and weather display */}
        <CardContent>
          {/* Form to input and submit the location */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Enter a city name"
              value={location}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)} // Update location state on input change
              className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-500 text-white hover:bg-blue-600 rounded-lg p-2 transition duration-300"
            >
              {isLoading ? "Loading..." : "Search"}{" "}
              {/* Show "Loading..." text while fetching data */}
            </Button>
          </form>
          {/* Display error message if any */}
          {error && <div className="mt-4 text-red-500">{error}</div>}
          {/* Display weather data if available */}
          {weather && (
            <div className="mt-4 grid gap-2">
              {/* Display temperature message with icon */}
              <div className="flex items-center gap-2 text-gray-800">
                <ThermometerIcon className="w-6 h-6" />
                {getTemperatureMessage(weather.temperature, weather.unit)}
              </div>
              {/* Display weather description message with icon */}
              <div className="flex items-center gap-2 text-gray-800">
                <CloudIcon className="w-6 h-6" />
                <div>{getWeatherMessage(weather.description)}</div>
              </div>
              {/* Display location message with icon */}
              <div className="flex items-center gap-2 text-gray-800">
                <MapPinIcon className="w-6 h-6" />
                <div>{getLocationMessage(weather.location)}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
