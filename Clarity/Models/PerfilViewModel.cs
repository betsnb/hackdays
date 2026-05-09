namespace Clarity.Models
{
    public class PerfilViewModel
    {
        public string NombreCompleto { get; set; } = "María González";
        public string Correo         { get; set; } = "maria.gonzalez@estudiante.edu";  
        public string Universidad    { get; set; } = "Universidad Nacional";
        public string Carrera        { get; set; } = "Ingeniería en Sistemas";
        public string AnoAcademico   { get; set; } = "3er año";
        // Foto: guardamos la ruta relativa o null si no hay
        public string? FotoRuta      { get; set; } = null;
    }
}