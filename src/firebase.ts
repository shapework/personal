import admin from "firebase-admin";
// import serviceKeyJsonFile from "../shapework-personal-2ec7240bac98.json";
import { FieldValue } from "firebase-admin/firestore";
import dotenv from "dotenv";

dotenv.config();
// const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
// const serviceAccountConfig  = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON as string);

const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://shapework-personal-default-rtdb.asia-southeast1.firebasedatabase.app",
});

const db = admin.firestore();

// Function to record visitor data
const recordVisitor = async (ip: string) => {
  try {
    const collectionRef = db.collection("questions");
    const docRef = collectionRef.doc(ip);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      console.log("ip already exists");
      await docRef.update({
        number_of_visits: FieldValue.increment(1),
      });
    } else {
      await docRef.set({
        number_of_visits: 1,
      });
    }
    console.log("Visitor recorded successfully");
  } catch (error) {
    console.error("Error recording visitor:", error);
    throw error;
  }
};

// Function to get visitor data
const getVisitorData = async (ip: string) => {
  try {
    const collectionRef = db.collection("questions");
    const docRef = collectionRef.doc(ip);
    const docSnap = await docRef.get();
    return docSnap.exists ? docSnap.data() : null;
  } catch (error) {
    console.error("Error getting visitor data:", error);
    throw error;
  }
};

export { db, recordVisitor, getVisitorData };
