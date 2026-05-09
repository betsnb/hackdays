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
    
    public IActionResult Estudiar()
    {
        return View();
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
        var model = new PerfilViewModel(); // aquí después conectas tu BD
        return View(model);
    }

    [HttpPost]
    public IActionResult Perfil(PerfilViewModel model, IFormFile? fotoPerfil)
    {
        ViewData["ActivePage"] = "Perfil";

        if (fotoPerfil != null && fotoPerfil.Length > 0)
        {
            var ext = Path.GetExtension(fotoPerfil.FileName).ToLower();
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

        // Aquí guardarías en BD. Por ahora regresamos el modelo actualizado:
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
