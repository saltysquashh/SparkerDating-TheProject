using Microsoft.EntityFrameworkCore;
using sparker.Database;
using sparker.DTOs;
using sparker.Utilities;
using System.Threading.Tasks;

namespace sparker.Utilities
{
    public static class RegistrationUtils
    {

        public static async Task<(bool isValid, string message)> ValidateUpdateUserInfoDTO(UpdateUserInfoDTO updateUserInfoDTO, ApplicationDbContext _context)
        {
            if (!IsValidName(updateUserInfoDTO.FirstName))
            {
                return (false, "First name is invalid. Names should only consists of letters.");
            }

            if (!IsValidName(updateUserInfoDTO.LastName))
            {
                return (false, "Last name is invalid. Names should only consists of letters.");
            }

            if (!IsValidGender(updateUserInfoDTO.Gender))
            {
                return (false, "Gender is invalid. Valid genders are Male, Female or Other.");
            }

            if (!IsValidBirthdate(updateUserInfoDTO.Birthdate))
            {
                return (false, "Birthdate is invalid. You must be at least 18 years old.");
            }

            return (true, string.Empty); // All checks passed
        }


        public static async Task<(bool isValid, string message)> ValidateRegistrationDTO(RegisterDTO registerDTO, ApplicationDbContext _context)
        {
            if (!IsValidName(registerDTO.FirstName))
            {
                return (false, "First name is invalid. Names should only consists of letters.");
            }

            if (!IsValidName(registerDTO.LastName))
            {
                return (false, "Last name is invalid. Names should only consists of letters.");
            }

            if (!IsValidGender(registerDTO.Gender))
            {
                return (false, "Gender is invalid. Valid genders are Male, Female or Other.");
            }

            if (!IsValidBirthdate(registerDTO.Birthdate))
            {
                return (false, "Birthdate is invalid. You must be at least 18 years old.");
            }

            if (!IsValidEmail(registerDTO.Email))
            {
                return (false, "E-mail is invalid. The format is not of a standard e-mail format.");
            }

            if (await UserEmailExists(registerDTO.Email, _context))
            {
                return (false, "E-mail is already in use.");
            }

            if (!IsValidPassword(registerDTO.Password, out var validationMessage)) // out lets us change the value of the variable (ligesom "var" i AL)
            {
                return (false, validationMessage);
            }

            return (true, string.Empty); // All checks passed
        }

        public static bool IsValidPassword(string password, out string message)
        {
            if (!password.Any(char.IsLower))
            {
                message = "Password must contain at least one lowercase letter.";
                return false;
            }
            if (!password.Any(char.IsUpper))
            {
                message = "Password must contain at least one uppercase letter.";
                return false;
            }
            if (!password.Any(ch => !char.IsLetterOrDigit(ch)))
            {
                message = "Password must contain at least one special character.";
                return false;
            }
            message = string.Empty;
            return true;
        }

        public static async Task<bool> UserEmailExists(string email, ApplicationDbContext _context)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            return user != null; // returns true if email is already in use
        }

        public static bool IsValidEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return false;

            if (!email.Contains('@') || !email.Contains('.'))
                return false;

            int atIndex = email.IndexOf('@');
            int lastDotIndex = email.LastIndexOf('.');

            return atIndex < lastDotIndex && lastDotIndex < email.Length - 1;
        }

        public static bool IsValidGender(string gender)
        {
            return gender == "Male" || gender == "Female" || gender == "Both";
        }

        public static bool IsValidName(string name)
        {
            if (string.IsNullOrEmpty(name))
                return false;

            foreach (char c in name)
            {
                if (!char.IsLetter(c) && !char.IsWhiteSpace(c))
                {
                    return false;
                }
            }
            return true;
        }

        public static bool IsValidBirthdate(DateTime birthdate)
        {
            var today = DateTime.Today;
            int age = today.Year - birthdate.Year;

            // if the user's birthday has not occurred this year yet,subtract one year from age
            if (birthdate.Date > today.AddYears(-age)) age--;

            return age >= 18;
        }
    }
}
