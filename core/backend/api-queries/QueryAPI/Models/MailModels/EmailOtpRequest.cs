namespace WMAPI.Models.MailModels
{
    public class EmailOtpRequest
    {
        public string ToEmail { get; set; }
        public string Name { get; set; }
        public string Otp { get; set; }
        public string Subject { get; set; }
    }
}
