using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Clarity.Models;

namespace Clarity.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;

    public HomeController(ILogger<HomeController> logger)
    {
        _logger = logger;
    }

    public IActionResult Index()
    {
        return View();
    }
    
    private static List<Clarity.Models.Flashcard> _flashcards = new()
    {
        new() { Id = 1, Pregunta = "¿Qué es la derivada de una función?",   Respuesta = "La tasa de cambio instantánea de una función en un punto dado, representada como f'(x) o dy/dx.", Materia = "Matemáticas" },
        new() { Id = 2, Pregunta = "¿Cuándo inició la Revolución Industrial?", Respuesta = "A mediados del siglo XVIII en Gran Bretaña, extendiéndose luego al resto de Europa.", Materia = "Historia" },
    };
    private static int _nextId = 3;
    
    // GET /Home/Estudiar
    public IActionResult Estudiar()
    {
        ViewData["ActivePage"] = "Estudiar";
        var vm = new Clarity.Models.EstudiarViewModel
        {
            Flashcards = _flashcards
        };
        return View(vm);
    }
    
    // POST /Home/AgregarFlashcard
    [HttpPost]
    public IActionResult AgregarFlashcard(string pregunta, string respuesta, string materia)
    {
        if (!string.IsNullOrWhiteSpace(pregunta) && !string.IsNullOrWhiteSpace(respuesta))
        {
            _flashcards.Add(new Clarity.Models.Flashcard
            {
                Id       = _nextId++,
                Pregunta = pregunta.Trim(),
                Respuesta = respuesta.Trim(),
                Materia  = string.IsNullOrWhiteSpace(materia) ? "General" : materia.Trim()
            });
        }
        return RedirectToAction("Estudiar");
    }
    
    // POST /Home/EliminarFlashcard
    [HttpPost]
    public IActionResult EliminarFlashcard(int id)
    {
        var fc = _flashcards.FirstOrDefault(f => f.Id == id);
        if (fc != null) _flashcards.Remove(fc);
        return RedirectToAction("Estudiar");
    }
    public IActionResult PaginaInicio()
    {
        return View();
    }

    public IActionResult Calendario()
    {
        return View();
    }

    // GET
    public IActionResult Perfil()
    {
        ViewData["ActivePage"] = "Perfil";

        var model = new PerfilViewModel
        {
            NombreCompleto = HttpContext.Session.GetString("NombreCompleto") ?? "María González",
            Correo         = HttpContext.Session.GetString("Correo")         ?? "maria.gonzalez@estudiante.edu",
            Universidad    = HttpContext.Session.GetString("Universidad")    ?? "Universidad Nacional",
            Carrera        = HttpContext.Session.GetString("Carrera")        ?? "Ingeniería en Sistemas",
            AnoAcademico   = HttpContext.Session.GetString("AnoAcademico")   ?? "3er año",
            FotoRuta       = HttpContext.Session.GetString("FotoRuta"),      // null si no hay foto
        };

        return View(model);
    }

    // POST
    [HttpPost]
    public IActionResult Perfil(PerfilViewModel model, IFormFile? fotoPerfil)
    {
        ViewData["ActivePage"] = "Perfil";

        // Foto: solo actualizar si mandaron una nueva
        if (fotoPerfil != null && fotoPerfil.Length > 0)
        {
            var ext     = Path.GetExtension(fotoPerfil.FileName).ToLower();
            var allowed = new[] { ".jpg", ".jpeg", ".png", ".webp" };

            if (allowed.Contains(ext))
            {
                var fileName = $"perfil_{Guid.NewGuid()}{ext}";
                var path = Path.Combine(Directory.GetCurrentDirectory(),
                                        "wwwroot", "imagenes", "perfiles", fileName);
                Directory.CreateDirectory(Path.GetDirectoryName(path)!);

                using var stream = new FileStream(path, FileMode.Create);
                fotoPerfil.CopyTo(stream);
                model.FotoRuta = $"/imagenes/perfiles/{fileName}";
            }
        }
        else
        {
            // Conservar la foto anterior si no subieron una nueva
            model.FotoRuta = HttpContext.Session.GetString("FotoRuta");
        }

        // Guardar todo en sesión
        HttpContext.Session.SetString("NombreCompleto", model.NombreCompleto ?? "");
        HttpContext.Session.SetString("Correo",         model.Correo         ?? "");
        HttpContext.Session.SetString("Universidad",    model.Universidad    ?? "");
        HttpContext.Session.SetString("Carrera",        model.Carrera        ?? "");
        HttpContext.Session.SetString("AnoAcademico",   model.AnoAcademico   ?? "");
        HttpContext.Session.SetString("FotoRuta",       model.FotoRuta       ?? "");

        TempData["Guardado"] = "true";
        return View(model);
    }
    public IActionResult Privacy()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
