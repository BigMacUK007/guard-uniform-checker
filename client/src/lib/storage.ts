// Client-side storage helper
// This wraps the server-side storage functionality via tRPC

export async function storagePut(
  key: string,
  data: Uint8Array,
  contentType: string
): Promise<{ key: string; url: string }> {
  // Convert Uint8Array to base64 for transmission
  const base64 = btoa(String.fromCharCode.apply(null, Array.from(data)));
  
  // Call server endpoint to upload to S3
  const response = await fetch('/api/storage/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      key,
      data: base64,
      contentType,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to upload file');
  }

  return response.json();
}

