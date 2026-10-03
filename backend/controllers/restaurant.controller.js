import slugify from "slugify";
import { prisma } from "../db.js";

export const createRestaurant = async (req, res) => {
  try {
    const { name, description, phone, email, address, city, openingTime, closedTime } = req.body;

    if (!name || !address || !city) {
      return res.status(400).json({
        success: false,
        message: "nama, alamat, kota tidak boleh kosong!",
      });
    }

    const slug = slugify(name, {
      //slugify = ubah nama restoran jadi URL yang cantik, huruf kecil semua, tanpa spasi/simbol.
      lower: true,
      strict: true,
      trim: true,
    });

    const existingRestaurant = await prisma.restaurant.findUnique({
      where: {
        slug,
      },
    });

    if (existingRestaurant) {
      return res.status(400).json({
        success: false,
        message: "Restaurant sudah ada",
      });
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        description,
        phone,
        email,
        address,
        city,
        openingTime,
        closedTime,
        ownerId: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      message: "berhasil membuat akun !",
    });
  } catch (error) {
    console.error("error : ", error);
    res.status(500).json({
      success: false,
      message: "server error",
    });
  }
};

export const getAllRestaurant = async (req, res) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      count: restaurants.length,
      restaurants,
    });
  } catch (error) {
    console.error("error: ", error);

    res.status(500).json({
      success: false,
      message: "server error",
    });
  }
};

export const getSingleRestaurant = async (req, res) => {
  try {
    const { sluq } = req.params;

    const restaurant = await prisma.restaurant.findUnique({
      where: {
        slug,
      },

      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!restaurant) {
      return res.status(401).json({
        success: false,
        message: "restaurant tidak ditemukkan ",
      });
    }

    res.status(200).json({
      success: true,
      restaurant,
    });
  } catch (error) {
    console.error("error", error);
    res.status(500).json({
      success: false,
      message: "server",
    });
  }
};

export const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, phone, email, address, city, openingTime, closedTime } = req.body;
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
    });

    if (!restaurant) {
      return res.status(400).json({
        success: false,
        message: "restaurant tidak ditemukkan",
      });
    }

    if (restaurant.ownerId !== req.user.id) {
      return res.status(400).json({
        success: false,
        message: "anda tidak punya akses untuk update pada restaurant ini !",
      });
    }

    let slug = restaurant.slug;

    if (name && name !== restaurant.name) {
      slug = slugify("name, {
        lower: true,
        strict: true,
        trim: true,
      });
    }

    const existingRestaurant = await prisma.restaurant.findFirst({
      where: {
        slug,
        NOT: {
          id,
        },
      },
    });

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id },
      data: {
        name,
        description,
        phone,
        email,
        address,
        city,
        openingTime,
        closedTime,
        isOpen,
      },
    });

    res.status(200).json({
      success: true,
      message: "restaurant berhasil di update",
      restaurant: updateRestaurant,
    });
  } catch (error) {
    console.error("error :", error);
    res.status(500).json({
      success: false,
      message: "server error",
    });
  }
};
