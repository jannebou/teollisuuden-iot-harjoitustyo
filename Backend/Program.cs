using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

class Program {
    private static readonly string urlIosystemGripper = "http://127.0.0.1:8080/rw/iosystem/signals/DI_Gripper1_Closed";
    private static readonly string username = "Default User";
    private static readonly string password = "robotics";
    private static string content = "empty";
    private static List<string> gripperData = new List<string>();

    static void Main(string[] args) {
        var builder = WebApplication.CreateBuilder(args);

        // Add CORS services
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowReactApp", policy =>
            {
                policy.WithOrigins("http://localhost:3000") // Adjust to your React app's URL
                      .AllowAnyMethod()
                      .AllowAnyHeader();
            });
        });

        var app = builder.Build();

        // Enable CORS middleware
        app.UseCors("AllowReactApp");

        app.MapGet("/", () => GetHelloWorld());
        app.MapGet("/api/gripper", () => GetGripper());
        app.MapGet("/api/gripperlatest", () => GetGripperLatest());

        Task.Run(() => ReadRobo());

        app.Run();
    }

    static string GetHelloWorld() {
        return "Hello World!";
    }

    static string GetGripperLatest() {
        return content.ToString();
    }

    static JsonObject GetGripper() {
        var jsonArray = new JsonArray();
        foreach (var data in gripperData) {
            jsonArray.Add(JsonNode.Parse(data));
        }
        var jsonObject = new JsonObject();
        jsonObject["gripperData"] = jsonArray;
        return jsonObject;
    }

    static async Task ReadRobo() {
        var handler = new HttpClientHandler { Credentials = new System.Net.NetworkCredential(username, password) };

        using (var client = new HttpClient(handler)) {
            while (true) {
                var response = await client.GetAsync($"{urlIosystemGripper}?json=1");
                var _content = await response.Content.ReadAsStringAsync();

                Console.WriteLine("gripper: " + _content + "\n");

                content = _content;
                gripperData.Add(_content);

                await Task.Delay(1000);
            }
        }
    }
}
