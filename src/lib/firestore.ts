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
  runTransaction,
  deleteDoc,
  limit
} from "firebase/firestore";
import { app } from "./firebase";

export const db = getFirestore(app);

// User Profile Operations
export const createUserProfile = async (uid: string, data: any) => {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, {
    uid,
    role: "customer",
    ...data,
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

export const updateOrderStatus = async (orderId: string, status: string) => {
  const orderRef = doc(db, "orders", orderId);
  await setDoc(orderRef, { status, updatedAt: serverTimestamp() }, { merge: true });
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
    orderBy("createdAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Vendor Operations
export const getVendors = async (status?: "active" | "pending" | "rejected") => {
  try {
    const vendorsRef = collection(db, "vendors");
    let q;
    if (status) {
      q = query(
        vendorsRef, 
        where("status", "==", status), 
        orderBy("createdAt", "desc"),
        limit(50)
      );
    } else {
      q = query(
        vendorsRef, 
        orderBy("createdAt", "desc"),
        limit(100)
      );
    }
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

export const updateVendorStatus = async (vendorId: string, status: "active" | "rejected" | "pending") => {
  const vendorRef = doc(db, "vendors", vendorId);
  await setDoc(vendorRef, { status, updatedAt: serverTimestamp() }, { merge: true });
};

export const updateVendorAvailability = async (vendorId: string, isOpen: boolean) => {
  const vendorRef = doc(db, "vendors", vendorId);
  await setDoc(vendorRef, { isOpen, updatedAt: serverTimestamp() }, { merge: true });
};

// Dish Operations (Sub-collection)
export const upsertDish = async (vendorId: string, dishData: any) => {
  const dishId = dishData.id || doc(collection(db, "dummy")).id; // Use existing ID or generate one
  const dishRef = doc(db, "vendors", vendorId, "dishes", dishId);
  
  await setDoc(dishRef, {
    ...dishData,
    id: dishId,
    vendorId,
    updatedAt: serverTimestamp(),
  }, { merge: true });
  
  return dishId;
};

export const deleteDish = async (vendorId: string, dishId: string) => {
  const dishRef = doc(db, "vendors", vendorId, "dishes", dishId);
  await deleteDoc(dishRef);
};

export const getVendorDishes = async (vendorId: string) => {
  const dishesRef = collection(db, "vendors", vendorId, "dishes");
  const q = query(dishesRef, orderBy("category", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

export const deleteReview = async (reviewId: string) => {
  const reviewRef = doc(db, "reviews", reviewId);
  await deleteDoc(reviewRef);
};

export const getUsers = async () => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, orderBy("createdAt", "desc"), limit(100));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Fetch ALL dishes across all vendors using collectionGroup
export const getAllDishes = async (limitCount = 50) => {
  try {
    const { collectionGroup } = await import("firebase/firestore");
    const dishesGroup = collectionGroup(db, "dishes");
    const q = query(dishesGroup, where("isAvailable", "==", true), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ 
      id: doc.id, 
      vendorId: doc.ref.parent.parent?.id || "",
      ...doc.data() 
    }));
  } catch (error) {
    console.error("Error fetching all dishes:", error);
    return [];
  }
};
