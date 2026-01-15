export const generateCreativeTitles = async (topic: string): Promise<string[]> => {
  // Return some default creative titles instead of using AI
  const defaultTitles = [
    "EPIC " + topic.toUpperCase(),
    topic + " MASTERCLASS",
    "ULTIMATE " + topic.toUpperCase() + " GUIDE",
    topic + " SECRETS REVEALED",
    "THE " + topic.toUpperCase() + " CHRONICLES"
  ];

  // Simulate a short delay for smooth UI transition
  await new Promise(resolve => setTimeout(resolve, 500));

  return defaultTitles;
};