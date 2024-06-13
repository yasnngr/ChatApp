namespace ChatAppServer.WebAPI.DTOs
{
    public sealed record SendMessageDto(Guid UserId, Guid ToUserId,string Message);
}
