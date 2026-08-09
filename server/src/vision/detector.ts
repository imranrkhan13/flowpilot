import { VisionResult } from '../types/index.js';

const HF_API_URL = 'https://api-inference.huggingface.co/models/facebook/detr-resnet-50';
const HF_TIMEOUT_MS = 15000;

export async function estimateOccupancy(imageBase64: string, zoneId: string, apiToken?: string): Promise<VisionResult> {
  const useLive = !!apiToken && apiToken.length > 10;
  if (!useLive) {
    const hash = zoneId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const peopleCount = (hash % 80) + 20;
    return {
      mode: 'DEMOMODE',
      modelName: 'facebook/detr-resnet-50 (fixture)',
      peopleCount,
      confidence: 0.85,
      zoneId,
      timestamp: new Date().toISOString(),
    };
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), HF_TIMEOUT_MS);
    const buffer = Buffer.from(imageBase64, 'base64');
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'application/octet-stream' },
      body: buffer,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) throw new Error(`HF API error: ${response.status} ${response.statusText}`);
    const data = (await response.json()) as Array<{ label: string; score: number }>;
    const peopleDetections = data.filter((d) => d.label === 'person' && d.score > 0.5);
    const peopleCount = peopleDetections.length;
    const avgConfidence = peopleDetections.length > 0 ? peopleDetections.reduce((s, d) => s + d.score, 0) / peopleDetections.length : 0;
    return {
      mode: 'LIVEMODE',
      modelName: 'facebook/detr-resnet-50',
      peopleCount,
      confidence: parseFloat(avgConfidence.toFixed(2)),
      zoneId,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return {
      mode: 'DEMOMODE',
      modelName: 'facebook/detr-resnet-50 (fallback)',
      peopleCount: 0,
      confidence: 0,
      zoneId,
      timestamp: new Date().toISOString(),
      error: errorMsg,
    };
  }
}
