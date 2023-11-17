
// import { initializeApp } from "firebase/app";
// import { getFirestore, collection, getDocs } from "firebase/firestore";
require("dotenv").config();
const firebase_app = require('firebase/app')
const firestore = require('firebase/firestore')
const { default: axios } = require('axios');
const secretKey = process.env.SECRET_KEY;
const validation = require('../middleware/validation')
const jwt = require('jsonwebtoken')

const firebaseConfig = {
  apiKey: "AIzaSyAwpyjZOdMAY9RGzbBxCxhzoikOVUYT95s",
  authDomain: "chantingapp-6014f.firebaseapp.com",
  projectId: "chantingapp-6014f",
  storageBucket: "chantingapp-6014f.appspot.com",
  messagingSenderId: "359503745610",
  appId: "1:359503745610:web:4271aae0f1191a2decccb3",
  measurementId: "G-9NQB7X1ZQG"
};

const app = firebase_app.initializeApp(firebaseConfig);

const sendOtp = async (req, res) => {
  try {
    const requestData = req.body;
    const { error } = validation.sendOtpSchema.validate(requestData);

    if (error) {
      console.log(
        error
      )
      return res.status(400).json({ error: error.details[0].message });
    }

    const { phone_num, login_flag } = requestData;

    if (login_flag) {
      try {
        const { exists, userId } = await checkUserExists(phone_num);

        if (!exists) {
          console.log("User doesn't exist");
          return res.status(409).json({
            success: false,
            message: "User doesn't exist. Please signup first.",
          });
        }
      } catch (error) {
        console.error('An error occurred:', error);
        return res.status(500).json({
          success: false,
          message: 'Error checking user existence',
        });
      }
    }

    const data = JSON.stringify({
      to: phone_num,
      channel: "sms",
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://verify-5337-a7hxqf.twil.io/start-verify',
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };

    const response = await axios.request(config);
    console.log(JSON.stringify(response.data));

    return res.status(200).json({ success: response.data.success });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};


const login = async(req, res) => {
  try{
    const requestData = req.body;
    
    const { error } = validation.verifyOtpSchema.validate(requestData);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const {phone_num, code} = requestData 
    var user_id;
    try {
      const { exists, userId } = await checkUserExists(phone_num);
      user_id = userId
      if (!exists) {
        console.log("User doesn't exist");
        return res.status(409).json({
          success: false,
          message: "User doesn't exist. Please signup first.",
        });
      }
    } catch (error) {
      console.error('An error occurred:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking user existence',
      });
    }

    const data = JSON.stringify({
      to: phone_num,
      code:code,
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://verify-5337-a7hxqf.twil.io/check-verify',
      headers: { 
        'Content-Type': 'application/json'
      },
      data : data
    };
    
    axios.request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
      if (response.data.success) {
        const token = jwt.sign({ user_id }, secretKey);
        return res.status(200).json({ success: true, token });
      } else {
        return res.status(200).json({ success: false, message: response.data.message });
      }
    })
    .catch((error) => {
      console.log(error);
      return res.status(400).json({message:error, success:false})
    });
    

  } catch(error){
    console.log("Error:",error)
    return res.status(400).json({message:"error", success:false})
  }
};

const signup = (req, res) => {
  res.send("Singed up")
};

async function checkUserExists(phone_num){
  const db = firestore.getFirestore(app);

  try {
  
    const q = firestore.query(firestore.collection(db, 'TblUsers'), firestore.where('phone_num', '==', phone_num));

    // Execute the query and get the snapshot of matching documents
    const querySnapshot = await firestore.getDocs(q);

    if (querySnapshot.empty) {
      // No documents match the query, so the user does not exist
      return { exists: false, userId: null };
    } else {
      // At least one document matches the query, indicating the user exists
      const userId = querySnapshot.docs[0].id;
      return { exists: true, userId };
    }
  } catch (error) {
    // Handle errors, such as Firestore connection issues or query errors
    console.error('Error checking user existence:', error);
    throw error; // You can choose to throw the error or handle it as needed.
  }
}

module.exports = {
  sendOtp,
  login,
  signup,
};
