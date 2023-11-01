import React, { useState } from 'react';

function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleSendOtp = () => {
    // In a real application, you would send an OTP to the user's phone number here.
    // For the sake of this example, we'll just toggle a flag to simulate OTP sent.
    setIsOtpSent(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your OTP verification logic here.
    console.log(`Phone Number: ${phoneNumber}, OTP: ${otp}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-lg max-w-sm w-full">
        <h1 className="text-2xl font-semibold mb-4">Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Phone Number</label>
            <input
              type="tel"
              className="w-full border border-gray-300 rounded p-2"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
            />
          </div>
          {!isOtpSent ? (
            <button
              type="button"
              onClick={handleSendOtp}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none"
            >
              Send OTP
            </button>
          ) : (
            <div>
              <div className="mb-4">
                <label className="block text-gray-700">Enter OTP</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded p-2"
                  value={otp}
                  onChange={handleOtpChange}
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none"
              >
                Verify OTP
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Login;
