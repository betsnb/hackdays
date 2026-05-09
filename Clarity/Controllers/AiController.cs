using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Clarity.Services;

namespace Clarity.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AiController : ControllerBase
    {
        private readonly GeminiService _geminiService;

        public AiController(GeminiService geminiService)
        {
            _geminiService = geminiService;
        }

        [HttpPost("extract")]
        public async Task<IActionResult> ExtractTasks([FromBody] ExtractRequest request)
        {
            var prompt = $@"You are an academic task extractor AND study coach. Today is {DateTime.Now:yyyy-MM-dd}.
The user is {request.Persona.Name}, a {request.Persona.Role} student.
Their context: {request.Persona.Activities}

The user uploaded multiple screenshots that may come from the same platform or task.
Additional text from user: ""{request.Text}""

Analyze ALL images and text together. If multiple inputs refer to the same task, MERGE them into a single task entry.

Rules for merging:
- Same task title or very similar → merge
- Same due date + same course → likely the same task, merge
- When merging, combine all details found across both images

Return ONLY valid JSON, no markdown:
{{
  ""sources_detected"": [""canvas"", ""whatsapp""],
  ""tasks"": [
    {{
      ""title"": ""string"",
      ""course"": ""string or null"",
      ""due_date"": ""YYYY-MM-DD or null"",
      ""task_type"": ""homework | exam | project | reading | other"",
      ""priority"": ""critical | high | medium | low"",
      ""estimated_hours"": 2,
      ""found_in"": ""canvas | whatsapp | handwritten | other"",
      ""merged_from_images"": 1,
      ""breakdown"": {{
        ""what_it_is"": ""one sentence explaining what this task actually requires"",
        ""steps"": [""Step 1: ...""],
        ""start_with"": ""the single first thing to do right now""
      }}
    }}
  ],
  ""confidence"": ""high | medium | low"",
  ""summary"": ""A 2-sentence encouraging briefing based on their week.""
}}";
            return await ExecuteGeminiCall(prompt, request.Files);
        }

        [HttpPost("briefing")]
        public async Task<IActionResult> DailyBriefing([FromBody] BriefingRequest request)
        {
            var prompt = $@"You are an AI study coach. The user is {request.Persona.Name}, a {request.Persona.Role}.
Their current burnout score is {request.Burnout} (0-10).
Tasks currently on their plate: {JsonSerializer.Serialize(request.Tasks)}

Generate a daily briefing.
Return ONLY valid JSON:
{{
  ""greeting"": ""A personalized greeting reflecting their burnout and workload."",
  ""summary"": ""2-sentence state of the day."",
  ""focus"": ""Single concrete next action."",
  ""tone"": ""calm | urgent | optimistic""
}}";
            return await ExecuteGeminiCall(prompt);
        }

        [HttpPost("explain")]
        public async Task<IActionResult> ExplainTask([FromBody] ExplainRequest request)
        {
            var prompt = $@"You are an academic coach. Analyze this task:
{JsonSerializer.Serialize(request.Task)}

Explain why this task is important and break it down.
Return ONLY valid JSON:
{{
  ""reasoning"": ""Why this task matters and what is at risk if delayed."",
  ""breakdown"": [""Actionable step 1"", ""Actionable step 2"", ""Actionable step 3""]
}}";
            return await ExecuteGeminiCall(prompt);
        }

        [HttpPost("flashcards")]
        public async Task<IActionResult> GenerateFlashcards([FromBody] FlashcardRequest request)
        {
            var prompt = $@"Generate a set of 5 study flashcards based on the topic: {request.Topic}.
If there are files attached, use them as the primary source.
Return ONLY valid JSON array:
[
  {{ ""q"": ""Question?"", ""a"": ""Concise answer + 1 explanatory sentence"", ""tag"": ""Topic category"" }}
]";
            return await ExecuteGeminiCall(prompt, request.Files);
        }

        [HttpPost("reschedule")]
        public async Task<IActionResult> SmartReschedule([FromBody] RescheduleRequest request)
        {
            var prompt = $@"You are a smart calendar rebalancer. 
Burnout score: {request.Burnout} (0-10). If > 7, force breaks.
Tasks: {JsonSerializer.Serialize(request.Tasks)}
Fixed blocks: {JsonSerializer.Serialize(request.FixedBlocks)}

Rebalance the week. Put hard tasks in AM, easy in PM. 
Return ONLY valid JSON representing the new schedule.
{{ ""new_schedule"": [ {{ ""time"": ""HH:MM - HH:MM"", ""task_title"": ""..."", ""type"": ""deep_work | break | class"" }} ] }}";
            return await ExecuteGeminiCall(prompt);
        }

        private async Task<IActionResult> ExecuteGeminiCall(string prompt, List<FileData>? files = null)
        {
            try
            {
                var response = await _geminiService.GenerateContentAsync(prompt, files);
                return Ok(new { response });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }

    // Models
    public class UserPersona
    {
        public string Name { get; set; } = "";
        public string Role { get; set; } = "";
        public string Activities { get; set; } = "";
    }

    public class ExtractRequest
    {
        public UserPersona? Persona { get; set; }
        public string Text { get; set; } = "";
        public List<FileData>? Files { get; set; }
    }

    public class BriefingRequest
    {
        public UserPersona? Persona { get; set; }
        public object? Tasks { get; set; }
        public int Burnout { get; set; }
    }

    public class ExplainRequest
    {
        public object? Task { get; set; }
    }

    public class FlashcardRequest
    {
        public string Topic { get; set; } = "";
        public List<FileData>? Files { get; set; }
    }

    public class RescheduleRequest
    {
        public object? Tasks { get; set; }
        public object? FixedBlocks { get; set; }
        public int Burnout { get; set; }
    }
}
