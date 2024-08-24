import React, { useState, ChangeEvent, FormEvent } from 'react';
import '../styles/RegisterPage.css';
import { checkEmailExists, registerUser } from '../services/userService';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from 'dayjs';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {

  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    birthDate: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    gender: '',
    birthDate: '',
    email: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isValidEmail = async (email: string): Promise<{ valid: boolean, message: string }> => {
    if (email.includes('@') && email.includes('.') && email.indexOf('@') < email.lastIndexOf('.') && email.lastIndexOf('.') < email.length - 1) {
      try {
        const emailExists = await checkEmailExists(email);
        if (emailExists) {
          return { valid: false, message: 'Email already exists.' };
        }
        return { valid: true, message: '' };
      } catch (error) {
        return { valid: false, message: 'Failed to check email.' };
      }
    }
    return { valid: false, message: 'Please enter a valid email address.' };
  };

  const isValidBirthdate = (birthdate: string): boolean => {
    const date = new Date(birthdate);
    const today = new Date();
    return date < today; // Ensure birthdate is in the past
  };

  // Go to step 2 (where the passwords are to be confirmed)
  const handleGoNextStep = async () => {
    let errors = { gender: '', birthDate: '', email: '' };

    if (!formData.gender) {
      errors.gender = 'Gender is required.';
    }
    if (!isValidBirthdate(formData.birthDate)) {
      errors.birthDate = 'Please enter a valid birthdate.';
    }

    const emailValidation = await isValidEmail(formData.email);
    if (!emailValidation.valid) {
      errors.email = emailValidation.message;
    }

    setValidationErrors(errors);

    console.log('Errors: ' + errors.email); // Log the errors object directly

    if (!errors.gender && !errors.birthDate && !errors.email) {
      setStep(2);
    }
  };

  const handleGoPreviousStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.password === formData.confirmPassword) {
      const submitData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        gender: formData.gender,
        birthDate: formData.birthDate,
        email: formData.email
      };

      try {
        const response = await registerUser(submitData);
        alert('Registration successful. Please log in to your new account on the next page.');
        navigate('/login');

      } catch (error) {
        setErrorMessage('Registration failed: ' + error);
      }
    } else {
      setErrorMessage('The passwords do not match.');
    }
  };

  return (
    <div className="global-container">
    <div className="form-container">
      <div className="register-container">
      <div className="registration-page-title">
        <h1>Registration</h1>
        </div>
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <p>First Name</p>
              <input type="text" name="firstName" placeholder="First Name" onChange={handleChange} value={formData.firstName} required />
              <p>Last Name</p>
              <input type="text" name="lastName" placeholder="Last Name" onChange={handleChange} value={formData.lastName} required />
              <p>Gender</p>
              <select name="gender" onChange={handleChange} value={formData.gender} required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {validationErrors.gender && <div className="error-message">{validationErrors.gender}</div>}
              <p>Birthdate</p>
              <input type="date" name="birthDate" onChange={handleChange} value={formData.birthDate} required />
              {validationErrors.birthDate && <div className="error-message">{validationErrors.birthDate}</div>}
              <p>Email</p>
              <input type="email" name="email" placeholder="Email" onChange={handleChange} value={formData.email} required />
              {validationErrors.email && <div className="error-message">{validationErrors.email}</div>}
              <div className="next-step-button"><button type="button" onClick={handleGoNextStep}>Next</button></div>
            </>
          )}
          {step === 2 && (
            <>
              <input type="password" name="password" placeholder="Password" onChange={handleChange} value={formData.password} required />
              <input type="password" name="confirmPassword" placeholder="Confirm password" onChange={handleChange} value={formData.confirmPassword} required />
              <div className="previous-step-button"><button type="button" onClick={handleGoPreviousStep}>Previous</button></div>
              <div className="finish-registration-button"><button type="submit">Finish registration</button></div>
            </>
          )}
        </form>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
      </div>
    </div>
    </div>
  );
};

export default RegisterPage;
