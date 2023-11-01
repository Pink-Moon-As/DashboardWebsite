import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAwpyjZOdMAY9RGzbBxCxhzoikOVUYT95s",
  authDomain: "chantingapp-6014f.firebaseapp.com",
  projectId: "chantingapp-6014f",
  storageBucket: "chantingapp-6014f.appspot.com",
  messagingSenderId: "359503745610",
  appId: "1:359503745610:web:4271aae0f1191a2decccb3",
  measurementId: "G-9NQB7X1ZQG",
};

const MantraTable = () => {
  const app = initializeApp(firebaseConfig);
  const [mantras, setMantras] = useState([]);
  const storage = getStorage(app);

  useEffect(() => {
    const fetchMantras = async () => {
      try {
        const db = getFirestore(app);
        const data = await getDocs(collection(db, 'TblMantra'));
        const mantrasArray = data.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // Get download URLs for audio and images
        for (const mantra of mantrasArray) {
          mantra.audio_url = await getDownloadURL(ref(storage, mantra.audio_ref));
          mantra.thumbnail_url = await getDownloadURL(ref(storage, mantra.thumbnail_ref));
          mantra.backdrop_url = await getDownloadURL(ref(storage, mantra.backdrop_ref));
        }

        setMantras(mantrasArray);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchMantras();
  }, [storage]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-semibold mb-4">Mantra Table</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-lg text-black">
          <thead>
            <tr>
              <th className="border-b py-2">ID</th>
              <th className="border-b py-2">Mantra Name</th>
              <th className="border-b py-2">Mantra Owner</th>
              <th className="border-b py-2">Lyrics</th>
              <th className="border-b py-2">Audio</th>
              <th className="border-b py-2">Thumbnail</th>
              <th className="border-b py-2">Backdrop</th>
            </tr>
          </thead>
          <tbody>
            {mantras.map((mantra) => (
              <tr key={mantra.id}>
                <td className="border-b py-2">{mantra.id}</td>
                <td className="border-b py-2">{mantra.mantra_name}</td>
                <td className="border-b py-2">{mantra.mantra_owner}</td>
                <td className="border-b py-2">{mantra.lyrics}</td>
                <td className="border-b py-2">
                  <audio controls controlsList="nodownload">
                    <source src={mantra.audio_url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </td>
                <td className="border-b py-2">
                  <a href={mantra.thumbnail_url} target="_blank" rel="noopener noreferrer">
                    Download Thumbnail
                  </a>
                </td>
                <td className="border-b py-2">
                  <a href={mantra.backdrop_url} target="_blank" rel="noopener noreferrer">
                    Download Backdrop
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MantraTable;
