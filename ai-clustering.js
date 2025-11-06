// AI Clustering functionality using Chrome's built-in AI (Gemini Nano)

class AIClusteringService {
  constructor() {
    this.session = null;
  }

  // Check if Chrome's built-in AI is available
  async isAvailable() {
    try {
      console.log('Checking AI availability...');
      console.log('LanguageModel:', typeof LanguageModel);

      // Check for the LanguageModel API (Chrome Built-in AI - Extensions API)
      if (typeof LanguageModel === 'undefined') {
        console.log('LanguageModel API is undefined');
        return { available: false, reason: 'LanguageModel API not available. Requires Chrome 127+ with "Prompt API for Gemini Nano" enabled in chrome://flags.' };
      }

      console.log('Checking availability...');
      const availability = await LanguageModel.availability();
      console.log('Availability:', availability);

      if (availability === 'readily' || availability === 'available') {
        console.log('AI is available!');
        return { available: true };
      } else if (availability === 'after-download' || availability === 'downloadable') {
        return { available: false, reason: 'Gemini Nano needs to be downloaded. Go to chrome://components and download "Optimization Guide On Device Model".' };
      } else {
        return { available: false, reason: 'Gemini Nano is not available on this device. Status: ' + availability };
      }
    } catch (error) {
      console.error('Error checking AI availability:', error);
      return { available: false, reason: 'Error checking availability: ' + error.message };
    }
  }

  // Initialize AI session
  async initSession() {
    if (this.session) {
      return this.session;
    }

    try {
      this.session = await LanguageModel.create({
        temperature: 0.3,
        topK: 3
      });
      return this.session;
    } catch (error) {
      console.error('Error creating AI session:', error);
      throw new Error('Failed to create AI session: ' + error.message);
    }
  }

  // Detect which items contain statistics using AI
  async detectStatistics(items) {
    if (!items || items.length === 0) {
      return [];
    }

    const session = await this.initSession();

    // Analyze items in batches to avoid token limits
    const statisticsItems = [];

    for (const item of items) {
      const preview = item.value.substring(0, 300);

      const prompt = `Does this text contain statistical data, numbers, percentages, or quantitative information?

Text: "${preview}"

Answer with ONLY "yes" or "no" (no explanation needed).`;

      try {
        const response = await session.prompt(prompt);
        const answer = response.trim().toLowerCase();

        if (answer.includes('yes')) {
          statisticsItems.push(item);
          console.log(`✓ Statistics detected in: "${preview.substring(0, 50)}..."`);
        }
      } catch (error) {
        console.error('Error analyzing item for statistics:', error);
      }
    }

    return statisticsItems;
  }

  // Cluster items into collections
  async clusterItems(items) {
    if (!items || items.length === 0) {
      throw new Error('No items to cluster');
    }

    const session = await this.initSession();

    // Prepare snippets for analysis (limit to 200 chars each for context)
    const snippetsText = items.map((item, index) => {
      const preview = item.value.substring(0, 200).replace(/\n/g, ' ');
      return `[${index}] ${preview}`;
    }).join('\n\n');

    const prompt = `You are an AI assistant that analyzes text snippets and groups them into meaningful collections.

Analyze these text snippets and identify common themes, topics, or subjects. Group similar snippets together and suggest collection names.

Snippets:
${snippetsText}

Instructions:
1. Identify 3-8 meaningful collections based on topics, themes, or subjects
2. Each collection should have a clear, descriptive name (1-3 words)
3. Assign each snippet to ONE most relevant collection
4. Use semantic similarity, not just keyword matching

Respond ONLY with valid JSON in this exact format:
{
  "collections": [
    {
      "name": "Collection Name",
      "description": "Brief description",
      "itemIndices": [0, 2, 5]
    }
  ]
}`;

    console.log('Sending prompt to AI:', prompt);

    try {
      const response = await session.prompt(prompt);
      console.log('AI Response:', response);

      // Parse the response
      const result = this.parseAIResponse(response, items);
      return result;
    } catch (error) {
      console.error('Error getting AI response:', error);
      throw new Error('Failed to get AI response: ' + error.message);
    }
  }

  // Parse AI response and map to items
  parseAIResponse(response, items) {
    try {
      // Try to extract JSON from the response
      let jsonText = response.trim();

      // Remove markdown code blocks if present
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }

      // Find JSON object in response
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonText);

      if (!parsed.collections || !Array.isArray(parsed.collections)) {
        throw new Error('Invalid response format: missing collections array');
      }

      // Map indices to actual items
      const result = parsed.collections.map(collection => ({
        name: collection.name,
        description: collection.description,
        items: collection.itemIndices.map(index => items[index]).filter(item => item !== undefined)
      }));

      // Filter out empty collections
      return result.filter(collection => collection.items.length > 0);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.error('Raw response:', response);
      throw new Error('Failed to parse AI response. The AI may have returned an invalid format.');
    }
  }

  // Destroy session
  async destroy() {
    if (this.session) {
      try {
        await this.session.destroy();
      } catch (error) {
        console.error('Error destroying session:', error);
      }
      this.session = null;
    }
  }
}

// Export for use in popup
window.AIClusteringService = AIClusteringService;
