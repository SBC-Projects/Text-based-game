export class GoogleGenAI {
  constructor(config = {}) {
    this.config = config;
    this.models = {
      generateContent: this.generateContent.bind(this)
    };
  }

  async generateContent({ model, contents }) {
    const response = await fetch('/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt: contents, model })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `AI request failed (${response.status})`);
    }

    const data = await response.json();
    return {
      text: data.text || '',
      model: data.model || model,
      raw: data
    };
  }
}
