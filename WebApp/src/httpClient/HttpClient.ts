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
      credentials: "include",
    });
    return JSON.parse(await response.json());
  }

  /**
   * Get a summary given an id
   */
  async getSummary(id: string) {
    const response = await fetch(`${this.baseURL}/getSummary/${id}`, {
      credentials: "include",
    });
    return response.json();
  }

  /**
   * Get all notes for a user
   */
  async getAllNotes() {
    const response = await fetch(`${this.baseURL}/getAllNotes`, {
      credentials: "include",
    });
    return JSON.parse(await response.json());
  }

  /**
   * Delete a summary given an id
   */
  async deleteSummary(id: string) {
    const response = await fetch(`${this.baseURL}/deleteSummary/${id}`, {
      method: "POST",
      credentials: "include",
      mode: "no-cors",
    });
  }

  /**
   * Get and set session cookie
   */
  async getGoogleCookie(idToken: string, csrfToken: string) {
    const response = await fetch(`${this.baseURL}/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true",
      },
      body: JSON.stringify({ idToken, csrfToken }),
      credentials: "include",
      mode: "no-cors",
    });
  }

  /**
   * Check if the user is logged in
   */
  async getUserIsLoggedIn() {
    const response = await fetch(`${this.baseURL}/getUserIsLoggedIn`, {
      credentials: "include",
    });
    return await response.json();
  }

  /**
   * Get meeting data for the home page
   */
  async getMeetingData() {
    const response = await fetch(`${this.baseURL}/getMeetingData`, {
      credentials: "include",
    });
    const jsonResponse = await response.json();
    return JSON.parse(jsonResponse);
  }

  /**
   * Query against all embeddings
   */
  async searchEmbeddings(query: string) {
    const response = await fetch(`${this.baseURL}/search/${query}`, {
      credentials: "include",
    });
    const jsonResponse = await response.json();
    return JSON.parse(jsonResponse);
  }
}

const HttpClientInstance = new HttpClient();
export default HttpClientInstance;
