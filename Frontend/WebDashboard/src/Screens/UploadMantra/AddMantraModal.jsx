// AddMantraModal.js
import React, { useState } from "react";
import ReactLoading from "react-loading";
import Modal from "react-modal";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAwpyjZOdMAY9RGzbBxCxhzoikOVUYT95s",
  authDomain: "chantingapp-6014f.firebaseapp.com",
  projectId: "chantingapp-6014f",
  storageBucket: "chantingapp-6014f.appspot.com",
  messagingSenderId: "359503745610",
  appId: "1:359503745610:web:4271aae0f1191a2decccb3",
  measurementId: "G-9NQB7X1ZQG",
};

const AddMantraModal = ({ isOpen, onRequestClose }) => {
  const [assetsUploaded, setAssetsUploaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const [mantraData, setMantraData] = useState({
    mantraName: "",
    mantraOwner: "",
    lyrics: "",
    audio: null,
    thumbnail: null,
    backdrop: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMantraData({
      ...mantraData,
      [name]: value,
    });
  };

  const onAddMantra = async() => {
    if(!assetsUploaded){
      window.alert('Please upload thumbnails and mantra audio');
      return;
    }
    if (
      !mantraData.mantraName.trim() ||
      !mantraData.mantraOwner.trim() ||
      !mantraData.lyrics.trim() ||
      !mantraData.audio ||
      !mantraData.thumbnail ||
      !mantraData.backdrop
    ) {
      window.alert('Please fill in all the fields');
      return;
    }
    try {
      setIsLoading(true);
      const db = getFirestore();
  
      // Add a new document to the "TblMantra" collection
      const docRef = await addDoc(collection(db, "TblMantra"), {
        mantra_name: mantraData.mantraName,
        mantra_owner: mantraData.mantraOwner,
        lyrics: mantraData.lyrics,
        audio_ref: mantraData.audio, // Replace with your variable if you're using it
        thumbnail_ref: mantraData.thumbnail, // Replace with your variable if you're using it
        backdrop_ref: mantraData.backdrop, // Replace with your variable if you're using it
      });
  
      // Store the auto-generated document ID as a field in the document
      await updateDoc(doc(db, "TblMantra", docRef.id), {
        id: docRef.id
      });
  
      window.alert("Mantra added successfully!");
      setIsLoading(false);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
  
      // Reset the form or take any other necessary action
    } catch (error) {
      setIsLoading(false);
      console.error("Error adding document: ", error);
      window.alert("Failed to add mantra. Please try again.");
    }

  };

  const onUploadAssets = async () => {
    setIsLoading(true);
    const storage = getStorage();
    const thumbnailFile = document.getElementById("thumbnailInput").files[0];
    const backdropFile = document.getElementById("backdropInput").files[0];
    const audioFile = document.getElementById("audioInput").files[0];

    if (thumbnailFile && backdropFile && audioFile) {
      try {
        // Upload Thumbnail
        const thumbnailRef = ref(storage, "Thumbnails/" + thumbnailFile.name);
        await uploadBytes(thumbnailRef, thumbnailFile);

        // Upload Backdrop
        const backdropRef = ref(storage, "Backdrop/" + backdropFile.name);
        await uploadBytes(backdropRef, backdropFile);

        // Upload Audio
        const audioRef = ref(storage, "MantraAudio/" + audioFile.name);
        await uploadBytes(audioRef, audioFile);

        // Once uploaded, set assetsUploaded to true
        setAssetsUploaded(true);

        // Optionally, get the download URLs for the uploaded files
        setMantraData({
        ...mantraData,
        audio: "MantraAudio/" + audioFile.name,
        thumbnail: "Thumbnails/" + thumbnailFile.name,
        backdrop: "Backdrop/" + backdropFile.name,
      });
      
        setIsLoading(false)
        window.alert('Assets uploaded successfully')
        // You can store these URLs in your state or database as needed
      } catch (error) {
        setIsLoading(false)
        window.alert("Some error occured");
        console.error("Error uploading assets:", error);
      }
    }
    else{
      setIsLoading(false);
      window.alert('Please upload assets');
    }
  };


  return (
    <>
    
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Add Mantra Modal"
    >
      <h2 className="text-2xl font-bold mb-4">Add Mantra</h2>

      {/* Mantra Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Mantra Name
        </label>
        <input
          type="text"
          name="mantraName"
          value={mantraData.mantraName}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      {/* Mantra Owner */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Mantra Owner
        </label>
        <input
          type="text"
          name="mantraOwner"
          value={mantraData.mantraOwner}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      {/* Lyrics */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Lyrics
        </label>
        <textarea
          name="lyrics"
          value={mantraData.lyrics}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      {/* Audio */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Audio</label>
        <input
          type="file"
          accept="audio/*"
          className="w-full px-3 py-2 border rounded-md"
          id="audioInput" // Add the ID here
        />
      </div>

      {/* Thumbnail */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Thumbnail
        </label>
        <input
          type="file"
          accept="image/*"
          className="w-full px-3 py-2 border rounded-md"
          id="thumbnailInput" // Add the ID here
        />
      </div>

      {/* Backdrop */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Backdrop
        </label>
        <input
          type="file"
          accept="image/*"
          className="w-full px-3 py-2 border rounded-md"
          id="backdropInput" // Add the ID here
        />
      </div>
      <button
        onClick={onUploadAssets}
        className="w-full bg-blue-500 text-white py-2 rounded-md"
      >
        Upload Assets
      </button>
      <button
        onClick={onAddMantra}
        className={`w-full py-2 rounded-md mt-4 text-white ${
          assetsUploaded ? "bg-blue-500" : "bg-gray-300 cursor-not-allowed"
        }`}
        disabled={!assetsUploaded}
      >
        Add Mantra
      </button>
    </Modal>
    {isLoading && (
      <div className="bg-[#1A1A1A] flex flex-col items-center justify-center absolute z-50 bg-opacity-50 w-full h-full top-0 bottom-0 left-0 right-0">
        <ReactLoading type="balls" color="#FFFFFF" height={100} width={100} />
        <div>Please Wait</div>
      </div>
    )}
    </>
  );
};

export default AddMantraModal;
