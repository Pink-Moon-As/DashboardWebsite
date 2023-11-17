require("dotenv").config();
const axios = require('axios')
const BASE_URL = process.env.BASE_URL;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const service_sid = process.env.TWILIO_SERVICE_SID

const sendOtpMessage = async (phoneNumber) => {
  try {
    // const data = {
    //   to: phoneNumber,
    //   channel: "sms",
    // };

    // const url = BASE_URL + "/start-verify"
    // console.log(url);
    // const response = await axios.post(`${BASE_URL}/start-verify`, data, {
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // });

    // Access the response data
    // const responseData = response.data;
    // console.log(responseData,"Response data")
    // Return the 'success' property from the response data
    console.log(accountSid,authToken,service_sid)
    // const verifyClient = await client.verify.v2.services(service_sid)
    //                       .verifications
    //                       .create({to: phoneNumber, channel: 'sms'})
    //                       .then(verification => console.log(verification.status, "Verisss"));
    client.verify.v2.services()
                .verifications
                .create({to: '+15017122661', channel: 'sms'})
                .then(verification => console.log(verification.status));

    // console.log(verifyClient,"Verifies");
    return {success:true};
  } catch (error) {
    console.error(error);
    return {success:false, error:error};
  }
};

const verifyOtp = async (phoneNumber, code) => {
  try {
   
    const data = {
      to: phoneNumber,
      code:code,
    };

    const url = BASE_URL+"/check-verify"

    
    const response = await axios.post(url, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(response.data)

    const responseData = response.data;

    
    return responseData;
  } catch (error) {
    console.error(error);
    return {success:false , error:error};
  }
};


module.exports = {
  sendOtpMessage,
  verifyOtp
}