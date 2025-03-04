import express from 'express';
import * as dotenv from 'dotenv';
import axios from 'axios';
import multer from 'multer';
import FormData from 'form-data';

dotenv.config();

const router = express.Router();
const upload = multer();
const STABILITY_API_KEY = process.env.STABILITY_API_KEY;

router.post('/', upload.none(), async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('width', '512');
    formData.append('height', '512');
    formData.append('steps', '30');
    formData.append('cfg_scale', '7.5');

    const response = await axios.post(
      'https://api.stability.ai/v2beta/stable-image/generate/core',
      formData,
      {
        headers: {
          Authorization: `Bearer ${STABILITY_API_KEY}`,
          ...formData.getHeaders(),
        },
      }
    );

    console.log('🟢 API Response:', response.data);
    const imageBase64 = response.data.image; // Extract base64 image data
    if (!imageBase64) {
      console.error('🔴 No image generated:', response.data);
      return res.status(500).json({ error: 'Image generation failed' });
    }
    res.status(200).json({ photo: `data:image/png;base64,${imageBase64}` }); // Send base64 data
  } catch (error) {
    console.error('🔴 API Error:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.message || 'Something went wrong' });
  }
});


export default router;
