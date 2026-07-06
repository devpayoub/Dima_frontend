import * as apiPublic from '../lib/api/public';

export async function generateReward(): Promise<{ code: string; message: string }> {
  try {
    return await apiPublic.generateReward();
  } catch {
    // Fallback if API fails
    return {
      code: 'STAMP10',
      message: "Enjoy your well-earned reward!"
    };
  }
}
