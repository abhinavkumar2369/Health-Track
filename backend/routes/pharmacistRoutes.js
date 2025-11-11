import express from "express";
import { Medicine } from "../models/Medicine.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

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

    // Update fields
    if (name !== undefined) medicine.name = name;
    if (description !== undefined) medicine.description = description;
    if (quantity !== undefined) medicine.quantity = quantity;
    if (category !== undefined) medicine.category = category;
    if (expiryDate !== undefined) medicine.expiryDate = expiryDate;
    if (price !== undefined) medicine.price = price;

    await medicine.save();

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

    // Decrease quantity
    medicine.quantity -= quantity;
    await medicine.save();

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

    const medicine = await Medicine.findOneAndDelete({
      _id: id,
      pharmacist_id: decoded.id,
    });

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

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

export default router;
