namespace Clarity.Models
{
    public class Flashcard
    {
        public int Id { get; set; }
        public string Pregunta { get; set; } = string.Empty;
        public string Respuesta { get; set; } = string.Empty;
        public string Materia { get; set; } = "General";
    }
 
    public class EstudiarViewModel
    {
        public List<Flashcard> Flashcards { get; set; } = new();
        public string? Mensaje { get; set; }
    }
}