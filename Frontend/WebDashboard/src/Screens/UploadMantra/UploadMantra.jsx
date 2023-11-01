const firebaseConfig = {
  apiKey: "AIzaSyAwpyjZOdMAY9RGzbBxCxhzoikOVUYT95s",
  authDomain: "chantingapp-6014f.firebaseapp.com",
  projectId: "chantingapp-6014f",
  storageBucket: "chantingapp-6014f.appspot.com",
  messagingSenderId: "359503745610",
  appId: "1:359503745610:web:4271aae0f1191a2decccb3",
  measurementId: "G-9NQB7X1ZQG"
};

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import MantraTable from "./MantraTable";
import Modal from 'react-modal';
import { useState } from "react";
import AddMantraModal from "./AddMantraModal";



const UploadMantra = () => {
  const app = initializeApp(firebaseConfig);
  const storage = getStorage(app);
  const db = getFirestore(app);

  

  const [isModalOpen, setIsModalOpen] = useState(false);



  return (
    <div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 text-white py-2 px-4 rounded-md"
      >
        Add Mantra
      </button>
      <AddMantraModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        appElement="#root"
      />
      <MantraTable />
    </div>
  );
};

export default UploadMantra;