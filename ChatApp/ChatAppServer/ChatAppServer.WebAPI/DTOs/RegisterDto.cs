namespace ChatAppServer.WebAPI.DTOs
{
    public sealed record RegisterDto(string Name, IFormFile File);
}
