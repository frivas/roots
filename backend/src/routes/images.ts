import { FastifyPluginAsync } from 'fastify';
import { getAuth } from '@clerk/fastify';
import OpenAI from 'openai';

// Extend Fastify instance type to include our decorated properties
declare module 'fastify' {
  interface FastifyInstance {
    sseConnections: Set<any>;
  }
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const images: FastifyPluginAsync = async (fastify) => {
  // Test endpoint to verify webhook connectivity
  fastify.get('/test', async (request, reply) => {
    reply.send({ 
      message: 'Images API is working!', 
      timestamp: new Date().toISOString(),
      ngrok_working: true 
    });
  });

  // Existing generate endpoint for direct website calls
  fastify.post('/generate', async (request, reply) => {
    const { userId } = getAuth(request);
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    try {
      const { prompt } = request.body as { prompt: string };
      
      if (!prompt) {
        return reply.status(400).send({ error: 'Prompt is required' });
      }

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "vivid"
      });

      if (!response.data || !response.data[0]?.url) {
        throw new Error('No image URL returned from OpenAI');
      }
      const imageUrl = response.data[0].url;

      reply.send({ imageUrl });
    } catch (error) {
      console.error('Image generation error:', error);
      reply.status(500).send({ 
        error: error instanceof Error ? error.message : 'Failed to generate image' 
      });
    }
  });

  // New webhook endpoint for ElevenLabs agent tool calls (no auth required for webhooks)
  fastify.post('/generate-for-story', async (request, reply) => {
    try {
      const { 
        story_content, 
        characters, 
        setting, 
        mood, 
        current_scene 
      } = request.body as { 
        story_content?: string;
        characters?: string;
        setting?: string;
        mood?: string;
        current_scene?: string;
      };

      // Generate contextual prompt based on story elements
      const generateContextualPrompt = () => {
        // Base style for children's illustrations
        const baseStyle = "Children's book illustration, cartoon style, vibrant colors, friendly and approachable";
        
        // Mood-based style modifiers
        const moodStyles = {
          happy: "bright and cheerful colors, sunny atmosphere, smiling characters",
          scary: "dramatic lighting, mysterious shadows, but still child-appropriate and not too frightening",
          sad: "soft, muted colors, gentle expressions, comforting atmosphere",
          magical: "sparkles, glowing effects, enchanted atmosphere, mystical elements",
          adventurous: "dynamic composition, action poses, exciting landscape, bold colors",
          cheerful: "warm colors, pleasant lighting, joyful expressions"
        };

        // Character description
        const characterDesc = characters 
          ? `featuring ${characters}`
          : 'with charming storybook characters';

        // Scene description
        const sceneDesc = current_scene 
          ? `showing ${current_scene.substring(0, 100)}`
          : 'in an engaging story scene';

        // Setting description
        const settingDesc = setting || 'in a magical storybook world';

        // Selected mood style
        const selectedMoodStyle = moodStyles[mood as keyof typeof moodStyles] || moodStyles.cheerful;

        // Combine all elements
        const prompt = `${baseStyle}, ${selectedMoodStyle}, 
          set in ${settingDesc}, ${characterDesc}, ${sceneDesc}. 
          Perfect for children ages 4-10, safe and wholesome content, high quality digital art.`;

        return prompt.replace(/\s+/g, ' ').trim();
      };

      const contextualPrompt = generateContextualPrompt();

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: contextualPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "vivid"
      });

      if (!response.data || !response.data[0]?.url) {
        throw new Error('No image URL returned from OpenAI');
      }
      const imageUrl = response.data[0].url;

      // Broadcast the image to all connected SSE clients
      const sseConnections = fastify.sseConnections;
      const eventData = JSON.stringify({
        type: 'story-illustration',
        data: {
          imageUrl,
          context: {
            story_content,
            characters,
            setting,
            mood,
            current_scene
          }
        }
      });

      sseConnections.forEach((connection: any) => {
        try {
          connection.write(`data: ${eventData}\n\n`);
        } catch (error) {
          console.error('Error sending SSE message:', error);
          sseConnections.delete(connection);
        }
      });

      // Return response in format expected by ElevenLabs
      reply.send({ 
        success: true,
        image_url: imageUrl,
        message: "I've created a beautiful illustration for your story! The image shows the scene with all the characters and details from our story."
      });
    } catch (error) {
      console.error('Image generation error:', error);
      reply.status(500).send({ 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate image',
        message: "I'm sorry, I couldn't create the illustration right now. Let's continue with our story!"
      });
    }
  });
};

export default images; 