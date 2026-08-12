using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WMAPI.Models.MailModels;
using WMAPI.Repositories.MailRepository;

namespace WMAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MailController : ControllerBase
    {
        private readonly IMailRepository _mailRepository;
        private readonly ILogger<MailController> _logger;

        public MailController(IMailRepository mailRepository, ILogger<MailController> logger)
        {
            _mailRepository = mailRepository;
            _logger = logger;
        }

        [HttpPost("SendOtp")]
        public async Task<IActionResult> SendOtpEmail([FromBody] EmailOtpRequest request)
        {
            try
            {
                bool result = await _mailRepository.SendOtpEmailAsync(request);
                return Ok(new { status = result, message = "OTP Email Sent Successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while sending OTP email");
                return StatusCode(500, new { status = false, message = "Email sending failed", error = ex.Message });
            }
        }


        [HttpPost("SendResetPasswordEmail")]
        public async Task<IActionResult> SendResetPasswordEmail([FromBody] EmailResetPasswordRequest request)
        {
            try
            {
                bool result = await _mailRepository.SendResetPasswordEmailAsync(request);
                return Ok(new { status = result, message = "Reset Password Email Sent Successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while sending Reset Password email");
                return StatusCode(500, new { status = false, message = "Email sending failed", error = ex.Message });
            }
        }


    }
}
