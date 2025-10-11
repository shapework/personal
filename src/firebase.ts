import admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import dotenv from "dotenv";

dotenv.config();
const projectId = process.env.VITE_FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.VITE_FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.VITE_FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  throw new Error('Missing required Firebase Admin environment variables');
}

const serviceAccount = {
  project_id: projectId,
  client_email: clientEmail,
  private_key: privateKey,
} as admin.ServiceAccount;

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
