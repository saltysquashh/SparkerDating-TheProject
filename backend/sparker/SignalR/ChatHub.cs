using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using sparker.Database;
using sparker.Models;
using System.Threading.Tasks;

public class ChatHub : Hub
{
    private readonly ApplicationDbContext _context;

    public ChatHub(ApplicationDbContext context)
    {
        _context = context;
    }

    public override async Task OnConnectedAsync()
    {
        await Clients.Caller.SendAsync("ReceiveMessage", "System", "Connected to chat hub");
    }

    public async Task SendMessage(int matchId, int senderId, int receiverId, string message)
    {
        var sender = await _context.Users.FindAsync(senderId);
        if (sender == null)
        {
            // user was not found (error?)
        }

        var chatMessage = new ChatMessage
        {
            Match_Id = matchId,
            Sender_Id = senderId,
            Receiver_Id = receiverId,
            Content = message,
            Time_Stamp = DateTime.Now
        };

        _context.ChatMessages.Add(chatMessage);
        await _context.SaveChangesAsync();

        var senderName = $"{sender.First_Name} {sender.Last_Name}";

        // Broadcast the message to "all" connected clients (max two in this case, unless admins can read the chat in the future) 
        await Clients.All.SendAsync("ReceiveMessage", senderId, senderName, message);

        await Clients.Caller.SendAsync("MessageSentConfirmation", "Message sent successfully");
    }
}