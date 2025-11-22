import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Medicine } from "../models/Medicine.js";
import { Transaction } from "../models/Transaction.js";
import { Pharmacist } from "../models/Pharmacist.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Helper function to verify token from request body
const verifyToken = (token) => {
  if (!token) {
    throw new Error("Access denied: token required");
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
};

/**
 * 📦 ADD MEDICINE TO INVENTORY
 */
router.post("/add-medicine", async (req, res) => {
  try {
    const { token, name, description, quantity, category, expiryDate, price } = req.body;

    const decoded = verifyToken(token);

    const medicine = await Medicine.create({
      name,
      description,
      quantity: quantity || 0,
      category,
      expiryDate,
      price,
      pharmacist_id: decoded.id,
    });

    // Create transaction record
    await Transaction.create({
      type: 'add',
      medicineName: name,
      medicineId: medicine._id,
      quantity: quantity || 0,
      price: price || 0,
      totalAmount: (quantity || 0) * (price || 0),
      pharmacist_id: decoded.id,
      newQuantity: quantity || 0,
      notes: `Added new medicine: ${name}`
    });

    res.status(201).json({
      message: "Medicine added successfully",
      medicine: {
        id: medicine._id,
        name: medicine.name,
        description: medicine.description,
        quantity: medicine.quantity,
        category: medicine.category,
        expiryDate: medicine.expiryDate,
        price: medicine.price,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * 📋 GET ALL MEDICINES IN INVENTORY
 */
router.get("/medicines", async (req, res) => {
  try {
    const { token } = req.query;

    const decoded = verifyToken(token);

    const medicines = await Medicine.find({ pharmacist_id: decoded.id }).sort({
      createdAt: -1,
    });

    res.json({
      medicines: medicines.map((med) => ({
        id: med._id,
        name: med.name,
        description: med.description,
        quantity: med.quantity,
        category: med.category,
        expiryDate: med.expiryDate,
        price: med.price,
        createdAt: med.createdAt,
        updatedAt: med.updatedAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ✏️ UPDATE MEDICINE (for restocking or editing)
 */
router.put("/update-medicine/:id", async (req, res) => {
  try {
    const { token, name, description, quantity, category, expiryDate, price } = req.body;
    const { id } = req.params;

    const decoded = verifyToken(token);

    const medicine = await Medicine.findOne({
      _id: id,
      pharmacist_id: decoded.id,
    });

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    const previousQuantity = medicine.quantity;
    const previousPrice = medicine.price;

    // Update fields
    if (name !== undefined) medicine.name = name;
    if (description !== undefined) medicine.description = description;
    if (quantity !== undefined) medicine.quantity = quantity;
    if (category !== undefined) medicine.category = category;
    if (expiryDate !== undefined) medicine.expiryDate = expiryDate;
    if (price !== undefined) medicine.price = price;

    await medicine.save();

    // Create transaction record if quantity changed
    if (quantity !== undefined && quantity !== previousQuantity) {
      const quantityDiff = quantity - previousQuantity;
      await Transaction.create({
        type: 'update',
        medicineName: medicine.name,
        medicineId: medicine._id,
        quantity: Math.abs(quantityDiff),
        price: medicine.price || 0,
        totalAmount: Math.abs(quantityDiff) * (medicine.price || 0),
        pharmacist_id: decoded.id,
        previousQuantity,
        newQuantity: quantity,
        notes: quantityDiff > 0 
          ? `Restocked ${Math.abs(quantityDiff)} units` 
          : `Reduced stock by ${Math.abs(quantityDiff)} units`
      });
    }

    res.json({
      message: "Medicine updated successfully",
      medicine: {
        id: medicine._id,
        name: medicine.name,
        description: medicine.description,
        quantity: medicine.quantity,
        category: medicine.category,
        expiryDate: medicine.expiryDate,
        price: medicine.price,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * 💊 ISSUE MEDICINE (dispense to patient - decreases quantity)
 */
router.post("/issue-medicine", async (req, res) => {
  try {
    const { token, medicineId, quantity, patientName, notes } = req.body;

    const decoded = verifyToken(token);

    const medicine = await Medicine.findOne({
      _id: medicineId,
      pharmacist_id: decoded.id,
    });

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    if (medicine.quantity < quantity) {
      return res.status(400).json({
        message: "Insufficient stock",
        available: medicine.quantity,
      });
    }

    const previousQuantity = medicine.quantity;

    // Decrease quantity
    medicine.quantity -= quantity;
    await medicine.save();

    // Create transaction record
    await Transaction.create({
      type: 'issue',
      medicineName: medicine.name,
      medicineId: medicine._id,
      quantity,
      price: medicine.price || 0,
      totalAmount: quantity * (medicine.price || 0),
      patientName: patientName || 'Unknown',
      notes: notes || `Issued ${quantity} units to ${patientName || 'patient'}`,
      pharmacist_id: decoded.id,
      previousQuantity,
      newQuantity: medicine.quantity
    });

    res.json({
      message: "Medicine issued successfully",
      medicine: {
        id: medicine._id,
        name: medicine.name,
        remainingQuantity: medicine.quantity,
      },
      transaction: {
        type: "issue",
        quantity,
        patientName,
        notes,
        timestamp: new Date(),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * 🗑️ REMOVE MEDICINE FROM INVENTORY
 */
router.delete("/remove-medicine/:id", async (req, res) => {
  try {
    const { token } = req.body;
    const { id } = req.params;

    const decoded = verifyToken(token);

    const medicine = await Medicine.findOne({
      _id: id,
      pharmacist_id: decoded.id,
    });

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    // Create transaction record before deletion
    await Transaction.create({
      type: 'remove',
      medicineName: medicine.name,
      medicineId: medicine._id,
      quantity: medicine.quantity,
      price: medicine.price || 0,
      totalAmount: medicine.quantity * (medicine.price || 0),
      pharmacist_id: decoded.id,
      previousQuantity: medicine.quantity,
      newQuantity: 0,
      notes: `Removed ${medicine.name} from inventory (${medicine.quantity} units)`
    });

    await Medicine.findByIdAndDelete(id);

    res.json({
      message: "Medicine removed successfully",
      medicine: {
        id: medicine._id,
        name: medicine.name,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * 📊 GET INVENTORY STATS
 */
router.get("/inventory-stats", async (req, res) => {
  try {
    const { token } = req.query;

    const decoded = verifyToken(token);

    const medicines = await Medicine.find({ pharmacist_id: decoded.id });

    const totalItems = medicines.length;
    const totalQuantity = medicines.reduce((sum, med) => sum + med.quantity, 0);
    const lowStock = medicines.filter((med) => med.quantity < 50).length;
    const outOfStock = medicines.filter((med) => med.quantity === 0).length;

    res.json({
      stats: {
        totalItems,
        totalQuantity,
        lowStock,
        outOfStock,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * 📋 GET ALL TRANSACTIONS
 */
router.get("/transactions", async (req, res) => {
  try {
    const { token } = req.query;

    const decoded = verifyToken(token);

    const transactions = await Transaction.find({ pharmacist_id: decoded.id })
      .sort({ createdAt: -1 })
      .limit(100); // Limit to last 100 transactions

    res.json({
      transactions: transactions.map((txn) => ({
        id: txn._id,
        type: txn.type,
        medicineName: txn.medicineName,
        medicineId: txn.medicineId,
        quantity: txn.quantity,
        price: txn.price,
        totalAmount: txn.totalAmount,
        patientName: txn.patientName,
        notes: txn.notes,
        previousQuantity: txn.previousQuantity,
        newQuantity: txn.newQuantity,
        createdAt: txn.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * 👤 GET PHARMACIST PROFILE
 */
router.get("/profile", async (req, res) => {
  try {
    const { token } = req.query;

    const decoded = verifyToken(token);

    const pharmacist = await Pharmacist.findById(decoded.id).select('-password');

    if (!pharmacist) {
      return res.status(404).json({ message: "Pharmacist not found" });
    }

    res.json({
      profile: {
        id: pharmacist._id,
        name: pharmacist.name,
        email: pharmacist.email,
        gender: pharmacist.gender || '',
        phone: pharmacist.phone || '',
        role: pharmacist.role,
        createdAt: pharmacist.createdAt,
        updatedAt: pharmacist.updatedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ✏️ UPDATE PHARMACIST PROFILE
 */
router.put("/profile", async (req, res) => {
  try {
    const { token, name, gender, phone } = req.body;

    const decoded = verifyToken(token);

    const pharmacist = await Pharmacist.findById(decoded.id);

    if (!pharmacist) {
      return res.status(404).json({ message: "Pharmacist not found" });
    }

    // Update fields
    if (name !== undefined) pharmacist.name = name;
    if (gender !== undefined) pharmacist.gender = gender;
    if (phone !== undefined) pharmacist.phone = phone;

    await pharmacist.save();

    res.json({
      message: "Profile updated successfully",
      profile: {
        id: pharmacist._id,
        name: pharmacist.name,
        email: pharmacist.email,
        gender: pharmacist.gender,
        phone: pharmacist.phone,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * 🔒 UPDATE PASSWORD
 */
router.put("/update-password", async (req, res) => {
  try {
    const { token, currentPassword, newPassword } = req.body;

    const decoded = verifyToken(token);

    const pharmacist = await Pharmacist.findById(decoded.id);

    if (!pharmacist) {
      return res.status(404).json({ message: "Pharmacist not found" });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, pharmacist.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    pharmacist.password = hashedPassword;

    await pharmacist.save();

    res.json({
      message: "Password updated successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
