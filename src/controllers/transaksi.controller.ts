import { Request, Response } from "express";
import TransaksiModel from "../models/transaksi.model";

export const createTransaksi = async (req: Request, res: Response) => {
  try {
    const { tipe, kategori, namaMerchant, nominal, tanggal} = req.body;

    const transaksi = await TransaksiModel.create({
      tipe,
      kategori,
      namaMerchant,
      nominal,
      tanggal,
    });

    return res.status(201).json({ message: "Transaksi berhasil dibuat", data: transaksi });
  } catch (error) {
    return res.status(500).json({ message: "Gagal membuat transaksi", error: String(error) });
  }
};

export const getAllTransaksi = async (req: Request, res: Response) => {
  try {
    const transaksi = await TransaksiModel.find().sort({ tanggal: -1 });
    return res.status(200).json({ data: transaksi });
  } catch (error) {
    return res.status(500).json({ message: "Gagal mengambil data", error: String(error) });
  }
};

export const getTransaksiById = async (req: Request, res: Response) => {
  try {
    const transaksi = await TransaksiModel.findById(req.params.id);
    if (!transaksi) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }
    return res.status(200).json({ data: transaksi });
  } catch (error) {
    return res.status(500).json({ message: "Gagal mengambil data", error: String(error) });
  }
};

export const updateTransaksi = async (req: Request, res: Response) => {
  try {
    const transaksi = await TransaksiModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!transaksi) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }
    return res.status(200).json({ message: "Transaksi berhasil diupdate", data: transaksi });
  } catch (error) {
    return res.status(500).json({ message: "Gagal update transaksi", error: String(error) });
  }
};

export const deleteTransaksi = async (req: Request, res: Response) => {
  try {
    const transaksi = await TransaksiModel.findByIdAndDelete(req.params.id);
    if (!transaksi) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }
    return res.status(200).json({ message: "Transaksi berhasil dihapus" });
  } catch (error) {
    return res.status(500).json({ message: "Gagal hapus transaksi", error: String(error) });
  }
};