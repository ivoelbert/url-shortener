export interface ShortUrl {
    originalUrl: string; // Original, long URL
    shortUrl: string; // Shortened URL
    accessCount: number; // Number of queries to this shortUrl, used for popularity
    title: string; // The title of that HTML
}
