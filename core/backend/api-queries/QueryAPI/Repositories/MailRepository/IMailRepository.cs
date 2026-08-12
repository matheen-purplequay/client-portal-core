using WMAPI.Models.MailModels;

namespace WMAPI.Repositories.MailRepository
{
    public interface IMailRepository
    {
        Task<bool> SendOtpEmailAsync(EmailOtpRequest request);

        Task<bool> SendResetPasswordEmailAsync(EmailResetPasswordRequest request);

    }
}
