require("dotenv").config();
const firebase = require('firebase/app')
const firestore=require('firebase/firestore');
const validation = require('../middleware/validation')
const moment = require('moment')

const firebaseConfig = {
  apiKey: "AIzaSyAwpyjZOdMAY9RGzbBxCxhzoikOVUYT95s",
  authDomain: "chantingapp-6014f.firebaseapp.com",
  projectId: "chantingapp-6014f",
  storageBucket: "chantingapp-6014f.appspot.com",
  messagingSenderId: "359503745610",
  appId: "1:359503745610:web:4271aae0f1191a2decccb3",
  measurementId: "G-9NQB7X1ZQG"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firestore.getFirestore(app); 

const get_dashboard_data = async (req, res)=>{
  try{
    const user_id = req.token.user_id;
    const type = req.body.type;
    const typesArray = ["Chanting", "Reading", "Bhajan"]

    if (!typesArray.includes(type)) {
      return res.status(400).json({ message: "Invalid 'type' value. It must be one of 'Chanting', 'Reading', or 'Bhajan'" });
    }
    const userDocRef = firestore.doc(db, 'TblDailyUserStats',user_id)
    const collectionRef = firestore.collection(userDocRef, type);
   
    const dateDocs = await firestore.getDocs(collectionRef);
    
    const userData = {}
  
    for (const dateDoc of dateDocs.docs) {
      const dateId = dateDoc.id;
      // Access the 'mantra' subcollection for the date
      const mantraCollectionRef = firestore.collection(dateDoc.ref, 'mantra');

      const mantraDocs = await firestore.getDocs(mantraCollectionRef);

      // Calculate the sum of 'count' for all mantras
      let totalCount = 0;
      for (const mantraDoc of mantraDocs.docs) {
        const mantraData = mantraDoc.data();
        const count = parseInt(mantraData.count);
        totalCount += count;
      }

      userData[dateId]= totalCount;
    }
    const userDataArray = Object.entries(userData).map(([date, count]) => ({ date, count }));
    userDataArray.sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log(userDataArray)
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate()-1)

    var streak = 0;
    
    for(var entry of userDataArray){
      var entryDate = new Date(entry.date)
      if(entryDate>yesterdayDate){
        continue;
      }
      var duration = yesterdayDate-entryDate
      duration =  Math.round(Math.abs((duration) / (24 * 60 * 60 * 1000)))
      if(duration==streak && entry.count>=108){
        streak++;
      }
      else{
        break;
      }
    }
    return res.status(200).json({ success: true, userData, type, chantingStreak:streak });
  } 
  catch(error){
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
  

}

const add_chanting_data = async (req, res)=>{
  try{
    const user_id = req.token.user_id;
    const { error } = validation.addChantingDataSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const date = req.body.date;
    const count = parseInt(req.body.count);
    const mantra_id = req.body.mantra_id;

    const userDocRef = firestore.doc(db, 'TblDailyUserStats', user_id);
    const type = 'Chanting'; // Assuming you are working with the 'Chanting' type

    // Get a reference to the 'Chanting' collection for the user
    const chantingCollectionRef = firestore.collection(userDocRef, type);

    // Get a reference to the document for the specific date
    const dateDocRef = firestore.doc(chantingCollectionRef, date);

    // Get a reference to the 'mantra' subcollection
    const mantraCollectionRef = firestore.collection(dateDocRef, 'mantra');

    // Check if the date document exists
    const dateDocSnapshot = await firestore.getDoc(dateDocRef);

    if (dateDocSnapshot.exists()) {
      // The date document already exists, add the mantra data
      const mantraDocRef = firestore.doc(mantraCollectionRef, mantra_id);
      // Check if the mantra document exists
      const mantraDocSnapshot = await firestore.getDoc(mantraDocRef);

      if (mantraDocSnapshot.exists()) {
        // Update the existing mantra document with the provided count
        const existingData = mantraDocSnapshot.data();
        const existingCount = parseInt(existingData.count) || 0;
        const newCount = existingCount + count;

        await firestore.updateDoc(mantraDocRef, { count: newCount });
      } else {
        // Create a new mantra document with the provided count
        await firestore.setDoc(mantraDocRef, { count, mantra_id, date });
      }
    } else {
      // The date document doesn't exist, create it along with the mantra document
      await firestore.setDoc(dateDocRef, {});
      const mantraDocRef = firestore.doc(mantraCollectionRef, mantra_id);
      await firestore.setDoc(mantraDocRef, { count, mantra_id, date });
    }

    return res.status(200).json({ success: true });
  } 
  catch(error){
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
}

const get_graph_data = async(req,res)=>{
  try{
    const user_id = req.token.user_id;
    const type = req.body.type;
    const freq = req.body.freq;
    const selectedDate = req.body.date;

    const typesArray = ["Chanting", "Reading", "Bhajan"]
    const freqArray  = ["daily", "monthly", "weekly"]

    if (!typesArray.includes(type)) {
      return res.status(400).json({ message: "Invalid 'type' value. It must be one of 'Chanting', 'Reading', or 'Bhajan'" });
    }
    if (!freqArray.includes(freq)) {
      return res.status(400).json({ message: "Invalid 'freq' value. It must be one of 'daily', 'weekly', or 'monthly'" });
    }
    const userDocRef = firestore.doc(db, 'TblDailyUserStats',user_id)
    const collectionRef = firestore.collection(userDocRef, type);
   
    const dateDocs = await firestore.getDocs(collectionRef);
    
    const userData = {}
  
    for (const dateDoc of dateDocs.docs) {
      const dateId = dateDoc.id;
      // Access the 'mantra' subcollection for the date
      const mantraCollectionRef = firestore.collection(dateDoc.ref, 'mantra');

      const mantraDocs = await firestore.getDocs(mantraCollectionRef);

      // Calculate the sum of 'count' for all mantras
      let totalCount = 0;
      for (const mantraDoc of mantraDocs.docs) {
        const mantraData = mantraDoc.data();
        const count = parseInt(mantraData.count);
        totalCount += count;
      }

      userData[dateId]= totalCount;
    }
    const dataArray = Object.entries(userData).map(([date, count]) => ({ date, count }));
    // sortedArray.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const selectedDateObj = new Date(selectedDate);
    if(freq=="daily"){

      // const last14Days = dataArray.filter(entry => {
      //   const entryDate = new Date(entry.date);
      //   const timeDifference = selectedDateObj.getTime() - entryDate.getTime();
      //   const daysDifference = timeDifference / (1000 * 3600 * 24); // Convert milliseconds to days
      //   return daysDifference >= 0 && daysDifference < 14;
      // });
      // console.log(last14Days,"last 14 days")
      const last14Days = Array.from({ length: 14 }, (_, index) => {
        const date = new Date(selectedDate);
        date.setDate(selectedDateObj.getDate() - index);
        return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      });
      
      const last14DaysWithData = last14Days.map(date => {
        const entry = dataArray.find(entry => entry.date === date);
        return entry ? entry : { date, count: 0 };
      });
      last14DaysWithData.reverse();
      return res.status(200).json({ success: true, dataArray: last14DaysWithData});
    }
    else if (freq === "monthly") {
      // const reqDate = selectedDate.substring(0,7);
      // const monthlySums = {};

      // // Calculate the sum of counts for each month
      // dataArray.forEach(entry => {
      //   const { date, count } = entry;
      //   const month = date.substring(0, 7); // Extract the year and month part
      //   monthlySums[month] = (monthlySums[month] || 0) + count;
      // });

      // // Convert the object to an array of objects with labels
      // const monthlyData = Object.entries(monthlySums).map(([label, sum]) => ({ label, sum }));

      // // Sort the array based on month labels
      // monthlyData.sort((a, b) => a.label.localeCompare(b.label));
      const reqDate = selectedDate.substring(0, 7);
      const monthlySums = {};

      // Calculate the sum of counts for each month
      dataArray.forEach(entry => {
        const { date, count } = entry;
        const month = date.substring(0, 7); // Extract the year and month part
        monthlySums[month] = (monthlySums[month] || 0) + count;
      });

      // Get the last 14 months including the current month
      const last14Months = Array.from({ length: 14 }, (_, index) => {
        const date = new Date(reqDate);
        date.setMonth(date.getMonth() - index);
        return date.toISOString().substring(0, 7);
      });

      // Convert the object to an array of objects with labels
      const monthlyData = last14Months.map(month => ({ date: month, count: monthlySums[month] || 0 }));
      monthlyData.reverse();
      return res.status(200).json({ success: true, dataArray: monthlyData});
      // const last13Months = dataArray.filter(entry => {
      //   const entryDate = new Date(entry.date);
      //   const monthsDifference = selectedDateObj.getMonth() - entryDate.getMonth() +
      //                           12 * (selectedDateObj.getFullYear() - entryDate.getFullYear());
      //   return monthsDifference >= 0 && monthsDifference < 14;
      // });
    
      // const monthlyData = Array.from({ length: 14 }, (_, index) => {
      //   const startDate = new Date(selectedDate);
      //   startDate.setMonth(selectedDateObj.getMonth() - index); // Calculate the start date for each month
      //   const endDate = new Date(startDate);
      //   endDate.setMonth(startDate.getMonth() + 1); // Calculate the end date for each month
    
      //   const sum = last13Months
      //     .filter(entry => {
      //       const entryDate = new Date(entry.date);
      //       return entryDate >= startDate && entryDate < endDate;
      //     })
      //     .reduce((total, entry) => total + entry.count, 0);
    
      //   return { label: `month${index + 1}`, sum };
      // });
    
      // console.log(monthlyData, "monthly data");
      // return res.status(200).json({ success: true, dataArray: monthlyData });
    } else if (freq === "weekly") {
      const weeklySums = {};

      // Calculate the sum of counts for each week
      dataArray.forEach(entry => {
        const { date, count } = entry;
        const weekStart = moment(date).startOf('isoWeek').format('YYYY-MM-DD'); // Start of the ISO week
        weeklySums[weekStart] = (weeklySums[weekStart] || 0) + count;
      });

      // Get the last 14 weeks including the current week
      const last14Weeks = Array.from({ length: 14 }, (_, index) => {
        const startDate = moment(selectedDate).subtract(index, 'weeks').startOf('isoWeek');
        const endDate = moment(startDate).endOf('isoWeek');
        return { start: startDate.format('YYYY-MM-DD'), end: endDate.format('YYYY-MM-DD') };
      });

      // Convert the object to an array of objects with labels
      const weeklyData = last14Weeks.map(week => ({ date: `${week.start} to ${week.end}`, count: weeklySums[week.start] || 0 }));
      weeklyData.reverse();

      return res.status(200).json({ success: true, dataArray: weeklyData});
      // const weeklyData = Array.from({ length: 14 }, (_, index) => {
      //   const startDate = new Date(selectedDate);
      //   startDate.setDate(selectedDateObj.getDate() - (index + 1) * 7); // Calculate the start date for each week
      //   const endDate = new Date(startDate);
      //   endDate.setDate(startDate.getDate() + 7); // Calculate the end date for each week
    
      //   const sum = dataArray
      //     .filter(entry => {
      //       const entryDate = new Date(entry.date);
      //       return entryDate >= startDate && entryDate < endDate;
      //     })
      //     .reduce((total, entry) => total + entry.count, 0);
        
      //   if(index==0){

      //   }
      //   return { label: `week${index + 1}`, sum };
      // });
    
      // console.log(weeklyData, "weekly data");
      // return res.status(200).json({ success: true, dataArray: weeklyData });
    }
    
    
    


  }
  catch(error){
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
}

module.exports = {
  get_dashboard_data,
  add_chanting_data,
  get_graph_data
};
