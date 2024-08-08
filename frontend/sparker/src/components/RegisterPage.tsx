import React, { useState, ChangeEvent, FormEvent } from 'react';
import '../styles/RegisterPage.css';
import { registerUser } from '../services/userService';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from 'dayjs';

const RegisterPage = () => {

  
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    }
  };

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.password === formData.confirmPassword) {
        const submitData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
		      gender: formData.gender,
          birthDate: formData.birthDate, // Use formData.birthDate instead
		      email: formData.email
        };

        try {
            const response = await registerUser(submitData);
            alert('Registration successful');
        } catch (error) {
            // Error handling
        }
    } else {
        alert('Passwords do not match');
    }
};



  return (
    <div className="form-container"> {/* Wrapper for centering */}
      <div className="register-container">
      <h1>User Registration</h1>
      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <>
          <p>First Name</p>
            <input type="text" name="firstName" placeholder="First Name" onChange={handleChange} value={formData.firstName} required />
            <p>Last Name</p>
            <input type="text" name="lastName" placeholder="Last Name" onChange={handleChange} value={formData.lastName} required />
			      {/* <input type="text" name="gender" placeholder="Gender" onChange={handleChange} value={formData.gender} required /> */}
            <p>Gender</p>
            <select name="gender" onChange={handleChange} value={formData.gender} required>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <p>Birthdate</p>
            <input type="date" name="birthDate" onChange={handleChange} value={formData.birthDate} required />
            <p>Email</p>
            <input type="email" name="email" placeholder="Email" onChange={handleChange} value={formData.email} required />

            <button type="button" onClick={handleNext}>Next</button>
          </>
        )}
        {step === 2 && (
          <>
            <input type="password" name="password" placeholder="Password" onChange={handleChange} value={formData.password} required />
            <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} value={formData.confirmPassword} required />
            <button type="submit">Register</button>
          </>
        )}
      </form>
      </div>
    </div>
  );
};

export default RegisterPage;
