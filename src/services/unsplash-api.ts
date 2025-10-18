import type { UnsplashPhoto } from "../types/index.js";

// Unsplash API Manager
export class UnsplashAPI {
  private static API_KEY = "aOU7kRQy1u9KPcroGJcPT7dRPYEAbBAbw7T_3A5NG2I"; // User needs to replace this
  private static API_URL = "https://api.unsplash.com";

  static async searchPhotos(query: string, page: number = 1, perPage: number = 12): Promise<UnsplashPhoto[]> {
    try {
      const response = await fetch(
        `${this.API_URL}/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&client_id=${this.API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error("Error fetching from Unsplash:", error);
      return [];
    }
  }

  static async getRandomPhotos(count: number = 12, query?: string): Promise<UnsplashPhoto[]> {
    try {
      const queryParam = query ? `&query=${encodeURIComponent(query)}` : "";
      const response = await fetch(`${this.API_URL}/photos/random?count=${count}${queryParam}&client_id=${this.API_KEY}`);

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching random photos:", error);
      return [];
    }
  }

  static async downloadPhoto(photo: UnsplashPhoto): Promise<string | null> {
    try {
      // Trigger download tracking (required by Unsplash API guidelines)
      fetch(`${photo.links.download_location}?client_id=${this.API_KEY}`);

      // Fetch the actual image
      const response = await fetch(photo.urls.regular);
      const blob = await response.blob();

      // Convert to base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error downloading photo:", error);
      return null;
    }
  }
}
