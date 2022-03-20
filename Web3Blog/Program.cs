// Start web server -> wwwroot directory
var app = WebApplication.CreateBuilder(args).Build();
app.UseFileServer();
app.Run();