export async function pingAppwrite(): Promise<boolean> {
  try {
    const response = await fetch("https://fra.cloud.appwrite.io/v1/health", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": "695cc4c1000bf8d6c904",
      },
    });

    return response.ok;
  } catch {
    return false;
  }
}
