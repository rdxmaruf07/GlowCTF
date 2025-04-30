import { GoogleGenerativeAI } from '@google/generative-ai';

// This is a test script to verify that the Google Generative AI SDK works correctly
// It implements the example from the request:
// import google.generativeai as genai
// genai.configure(api_key="AIzaSyDuzTFOYXlBYEqZVi4g598K7yQmPJctOHM")
// model = genai.GenerativeModel(model_name="gemini-2.0-flash")
// response = model.generate_content("Explain how AI works in a few words")
// print(response.text)

async function testGemini() {
  try {
    // Replace with your actual API key
    const API_KEY = "YOUR_API_KEY"; // In production, use environment variables
    
    // Initialize the API
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Create a model instance
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Generate content
    console.log("Sending prompt to Gemini...");
    const result = await model.generateContent("Explain how AI works in a few words");
    const response = await result.response;
    const text = response.text();
    
    console.log("Gemini response:");
    console.log(text);
    
    return text;
  } catch (error) {
    console.error("Error testing Gemini:", error);
    throw error;
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testGemini()
    .then(() => console.log("Test completed successfully"))
    .catch((error) => console.error("Test failed:", error));
}

export { testGemini };