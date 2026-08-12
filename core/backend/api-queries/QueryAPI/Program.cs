using OfficeOpenXml;
using WMAPI.Models.Configuration;
using WMAPI.Repositories.JsonRepository;
using WMAPI.Repositories.MailRepository;
using WMAPI.Repositories.QueryRepository;

ExcelPackage.License.SetNonCommercialOrganization("org");

var builder = WebApplication.CreateBuilder(args);

//Bind pathsettings from appsettings.json
builder.Services.Configure<PathSettings>(builder.Configuration.GetSection("PathSettings"));

//CORS policy start
const string AllowAllOrigins = "_AllowAllOrigins";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: AllowAllOrigins,
        policy =>
        {
            policy.AllowAnyOrigin() // Add your localhost ports like this WithOrigins("http://localhost:3000", "http://localhost:4200") here or use AllowAnyOrigin() to accept any origin
                  .AllowAnyHeader() // Allow any header
                  .AllowAnyMethod(); // Allow any HTTP method
        });
});
//CORS policy end

// Add services to the container.
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
});

// Add the QueryRepository with connection string
builder.Services.AddScoped<QueryRepository>(_ => new QueryRepository(
    builder.Configuration.GetConnectionString("constrsql1")
));

builder.Services.AddScoped<IMailRepository, MailRepository>();

// Register the repository with dependency injection
builder.Services.AddScoped<IJsonRepository, JsonRepository>();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Use CORS
app.UseCors(AllowAllOrigins);

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.DefaultModelsExpandDepth(-1); // Disable swagger schemas at bottom

        c.SwaggerEndpoint("../swagger/v1/swagger.json", "QueryApi-V2");
    });
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
