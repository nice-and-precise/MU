'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, CloudRain, Sun, Loader2, Thermometer } from 'lucide-react';
import { format } from 'date-fns';

interface WeatherWidgetProps {
    address: string;
    date: Date | string;
}

export function WeatherWidget({ address, date }: WeatherWidgetProps) {
    const [weather, setWeather] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchWeather() {
            try {
                // 1. Geocode the address (Mocking for now as we don't have a geocoding key, using a central MN location)
                // In production, we would use Mapbox or Google Maps Geocoding API
                const lat = 45.118;
                const lon = -93.288;

                // 2. Fetch Weather from OpenMeteo
                const dateStr = new Date(date).toISOString().split('T')[0];
                const res = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=America%2FChicago&start_date=${dateStr}&end_date=${dateStr}`
                );
                const data = await res.json();

                if (data.daily) {
                    setWeather({
                        maxTemp: data.daily.temperature_2m_max[0],
                        minTemp: data.daily.temperature_2m_min[0],
                        precip: data.daily.precipitation_probability_max[0],
                        code: data.daily.weather_code[0]
                    });
                }
            } catch (e) {
                console.error('Weather fetch error:', e);
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        fetchWeather();
    }, [address, date]);

    if (loading) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading Forecast...</div>;
    if (error || !weather) return null;

    const getWeatherIcon = (code: number) => {
        if (code <= 3) return <Sun className="h-8 w-8 text-yellow-500" />;
        if (code <= 67) return <CloudRain className="h-8 w-8 text-blue-500" />;
        return <Cloud className="h-8 w-8 text-gray-500" />;
    };

    return (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                        Forecast for {format(new Date(date), 'MMM d')}
                    </div>
                    <div className="flex items-center gap-3">
                        {getWeatherIcon(weather.code)}
                        <div>
                            <div className="text-2xl font-bold text-blue-900 dark:text-white">
                                {weather.maxTemp}°F
                            </div>
                            <div className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
                                <Thermometer className="h-3 w-3" /> Low: {weather.minTemp}°
                            </div>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-100">Precip Chance</div>
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{weather.precip}%</div>
                </div>
            </CardContent>
        </Card>
    );
}
