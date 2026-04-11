import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  query, 
  where, 
  getDocs,
  orderBy,
  Timestamp,
  serverTimestamp,
  increment,
  runTransaction
} from "firebase/firestore";
import { app } from "./firebase";

export const db = getFirestore(app);

// User Profile Operations
export const createUserProfile = async (uid: string, data: any) => {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, {
    ...data,
    role: "customer",
    createdAt: serverTimestamp(),
  }, { merge: true });
};

export const updateUserProfile = async (uid: string, data: any) => {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

export const getUserProfile = async (uid: string) => {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? snap.data() : null;
};

// Order Operations
export const createOrder = async (orderData: any) => {
  const ordersRef = collection(db, "orders");
  const docRef = await addDoc(ordersRef, {
    ...orderData,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getUserOrders = async (uid: string) => {
  const ordersRef = collection(db, "orders");
  const q = query(
    ordersRef, 
    where("userId", "==", uid), 
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getOrder = async (orderId: string) => {
  const orderRef = doc(db, "orders", orderId);
  const snap = await getDoc(orderRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// Review Operations
export const submitReview = async (reviewData: {
  orderId: string;
  vendorId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
}) => {
  const vendorRef = doc(db, "vendors", reviewData.vendorId);
  const reviewsRef = collection(db, "reviews");

  await runTransaction(db, async (transaction) => {
    // 1. Add the review
    const newReviewRef = doc(reviewsRef);
    transaction.set(newReviewRef, {
      ...reviewData,
      createdAt: serverTimestamp(),
    });

    // 2. Update Vendor totals
    transaction.update(vendorRef, {
      totalRatingSum: increment(reviewData.rating),
      totalReviewCount: increment(1),
      // Note: avgRating will be calculated on display or via a cloud function for scale,
      // but for MVP we update it here if we want immediate UI updates.
    });

    // 3. Update Order to mark as reviewed
    const orderRef = doc(db, "orders", reviewData.orderId);
    transaction.update(orderRef, { isReviewed: true });
  });
};

export const getVendorReviews = async (vendorId: string) => {
  const reviewsRef = collection(db, "reviews");
  const q = query(
    reviewsRef,
    where("vendorId", "==", vendorId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Vendor Operations
export const getVendors = async () => {
  try {
    const vendorsRef = collection(db, "vendors");
    const q = query(vendorsRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    
    if (snap.empty) {
      return [];
    }
    
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching kitchens:", error);
    return [];
  }
};

export const getVendor = async (id: string) => {
  const vendorRef = doc(db, "vendors", id);
  const snap = await getDoc(vendorRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// Admin & Payout Operations
export const settleVendorPayout = async (vendorId: string, amount: number) => {
  const vendorRef = doc(db, "vendors", vendorId);
  const payoutsRef = collection(db, "payouts");

  await runTransaction(db, async (transaction) => {
    // 1. Create a payout record
    const newPayoutRef = doc(payoutsRef);
    transaction.set(newPayoutRef, {
      vendorId,
      amount,
      status: "completed",
      settledAt: serverTimestamp(),
    });

    // 2. Reset vendor unpaid balance (if we were tracking it precisely)
    // For now, we update a 'lastSettledAt' timestamp
    transaction.update(vendorRef, {
      lastSettledAt: serverTimestamp(),
      pendingBalance: 0 // Resetting the pending balance
    });
  });
};
