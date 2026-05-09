using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Clarity.Services
{
    public class GeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private const string BaseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

        public GeminiService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["Gemini:ApiKey"] ?? throw new ArgumentNullException("Gemini ApiKey is missing");
        }

        public async Task<string> GenerateContentAsync(string prompt, List<FileData>? files = null)
        {
            var parts = new List<object>
            {
                new { text = prompt }
            };

            if (files != null)
            {
                foreach (var file in files)
                {
                    parts.Add(new
                    {
                        inlineData = new
                        {
                            mimeType = file.MimeType,
                            data = file.Data
                        }
                    });
                }
            }

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = parts.ToArray()
                    }
                },
                generationConfig = new
                {
                    response_mime_type = "application/json"
                }
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync($"{BaseUrl}?key={_apiKey}", content);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new Exception($"Gemini API error: {response.StatusCode} - {error}");
            }

            var responseBody = await response.Content.ReadAsStringAsync();
            var geminiResponse = JsonSerializer.Deserialize<GeminiResponse>(responseBody);

            return geminiResponse?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text ?? "No response from AI.";
        }
    }

    public class FileData
    {
        public string MimeType { get; set; }
        public string Data { get; set; } // Base64
    }

    // Clases para deserializar la respuesta de Gemini
    public class GeminiResponse
    {
        [JsonPropertyName("candidates")]
        public List<Candidate> Candidates { get; set; }
    }

    public class Candidate
    {
        [JsonPropertyName("content")]
        public Content Content { get; set; }
    }

    public class Content
    {
        [JsonPropertyName("parts")]
        public List<Part> Parts { get; set; }
    }

    public class Part
    {
        [JsonPropertyName("text")]
        public string Text { get; set; }
    }
}
