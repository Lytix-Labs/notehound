class HttpClient {
  private baseURL: string;

  constructor() {
    this.baseURL = `${
      process.env.NEXT_PUBLIC_BASE_URL ?? "https://notesapi.lytix.co"
    }/api/v1`;
  }

  /**
   * Upload an audio file blob
   */
  async uploadAudio(file: Blob) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${this.baseURL}/uploadAudio`, {
      method: "POST",
      body: formData,
    });
    return JSON.parse(await response.json());
  }

  /**
   * Get a summary given an id
   */
  async getSummary(id: string) {
    const response = await fetch(`${this.baseURL}/getSummary/${id}`);
    return response.json();
  }

  /**
   * Get all notes for a user
   */
  async getAllNotes() {
    const response = await fetch(`${this.baseURL}/getAllNotes`);
    return JSON.parse(await response.json());
  }
}

const HttpClientInstance = new HttpClient();
export default HttpClientInstance;
