using System.Net.Mail;
using System.Net;
using WMAPI.Models.MailModels;

namespace WMAPI.Repositories.MailRepository
{
    public class MailRepository : IMailRepository
    {
        private readonly string _connectionString;
        private readonly IConfiguration _configuration;

        public MailRepository(IConfiguration configuration)
        {
            _configuration = configuration;
            _connectionString = configuration.GetConnectionString("constrsql1");
        }

        public async Task<bool> SendOtpEmailAsync(EmailOtpRequest request)
        {
            string templatePath = Path.Combine(Directory.GetCurrentDirectory(), "Templates", "Email_Otp_Template.html");
            string htmlBody = await File.ReadAllTextAsync(templatePath);

            htmlBody = htmlBody.Replace("{{ $name }}", request.Name)
                               .Replace("{{ $otp }}", request.Otp);

            var smtpClient = new SmtpClient(_configuration["SMTP:Host"])
            {
                Port = int.Parse(_configuration["SMTP:Port"]),
                Credentials = new NetworkCredential(_configuration["SMTP:Username"], _configuration["SMTP:Password"]),
                EnableSsl = true,
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(_configuration["SMTP:From"]),
                Subject = request.Subject,
                Body = htmlBody,
                IsBodyHtml = true,
            };

            mailMessage.To.Add(request.ToEmail);

            await smtpClient.SendMailAsync(mailMessage);
            return true;
        }

        public async Task<bool> SendQueriesSummary(EmailOtpRequest request)
        {
            string templatePath = Path.Combine(Directory.GetCurrentDirectory(), "Templates", "Queries_Summary_Template.html");
            string htmlBody = await File.ReadAllTextAsync(templatePath);

            htmlBody = htmlBody.Replace("{{ $name }}", request.Name)
                .Replace("{{ $otp }}", request.Otp);

            var smtpClient = new SmtpClient(_configuration["SMTP:Host"])
            {
                Port = int.Parse(_configuration["SMTP:Port"]),
                Credentials = new NetworkCredential(_configuration["SMTP:Username"], _configuration["SMTP:Password"]),
                EnableSsl = true,
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(_configuration["SMTP:From"]),
                Subject = request.Subject,
                Body = htmlBody,
                IsBodyHtml = true,
            };

            mailMessage.To.Add(request.ToEmail);

            await smtpClient.SendMailAsync(mailMessage);
            return true;
        }

        public async Task<bool> SendResetPasswordEmailAsync(EmailResetPasswordRequest request)
        {
            string templatePath = Path.Combine(Directory.GetCurrentDirectory(), "Templates", "Email_Reset_Password_Template.html");
            string htmlBody = await File.ReadAllTextAsync(templatePath);

            htmlBody = htmlBody.Replace("{{ $name }}", request.Name)
                               .Replace("{{ $otp }}", request.Otp)
                               .Replace("{{ $subject }}", request.Subject);

            var smtpClient = new SmtpClient(_configuration["SMTP:Host"])
            {
                Port = int.Parse(_configuration["SMTP:Port"]),
                Credentials = new NetworkCredential(_configuration["SMTP:Username"], _configuration["SMTP:Password"]),
                EnableSsl = true,
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(_configuration["SMTP:From"]),
                Subject = request.Subject,
                Body = htmlBody,
                IsBodyHtml = true,
            };

            mailMessage.To.Add(request.ToEmail);

            await smtpClient.SendMailAsync(mailMessage);
            return true;
        }


    }
}
