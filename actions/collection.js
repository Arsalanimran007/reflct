"use server";
import { auth } from "@clerk/nextjs/server"; // Clerk auth se user ID nikaalne ke liye
import { request } from "@arcjet/next"; // Arcjet request object
import aj from "@/lib/arcjet"; // Arcjet configuration
import { db } from "@/lib/prisma"; // Prisma DB access
import { revalidatePath } from "next/cache"; // Cache revalidation

// 🔧 New collection create karne wala server function
export async function createCollection(data) {
  try {
    // 1. Authenticate user
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // 2. Arcjet Rate limiting check
    const req = await request();
    const decision = await aj.protect(req, {
      userId,
      requested: 1,
    });

    // 3. Agar request deny hui to reason check karo
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.log({
          code: "Rate_LIMIT_EXCEEDED",
          details: {
            remaining,
            resetInSeconds: reset,
          },
        });
        throw new Error("Too many requests. Please try again later.");
      }
      throw new Error("Request Blocked");
    }

    // 4. User database me dhoondho
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // 5. Check if collection with the same name already exists
    const existingCollection = await db.collection.findUnique({
      where: { name: data.name }, // Assuming 'name' is the unique identifier
    });

    if (existingCollection) {
      // Update the existing collection
      const updatedCollection = await db.collection.update({
        where: { id: existingCollection.id },
        data: {
          description: data.description,
        },
      });

      // Cache revalidate after updating
      revalidatePath("/dashboard");

      // Return updated collection
      return updatedCollection;
    }

    // If collection doesn't exist, create a new one
    const collection = await db.collection.create({
      data: {
        name: data.name,
        description: data.description,
        userId: user.id,
      },
    });

    // Cache revalidate after creating
    revalidatePath("/dashboard");

    // Return created collection
    return collection;
  } catch (error) {
    throw new Error(error.message);
  }
}


// 🔍 User ki sari collections nikalne ka server function
export async function getCollections() {
  try {
    // 1. Authenticate user
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // 2. User database me dhoondho
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // 3. Collections fetch karo jo user ki hain
    const collections = await db.collection.findMany({
      where: {
        userId: user.id,
      },
      orderBy: { createdAt: "desc" }, // Newest first
    });

    // 4. Return karo
    return collections;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getCollection(collectionId) {
  try {
    // 1. Authenticate user
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // 2. User database me dhoondho
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // 3. Collections fetch karo jo user ki hain
    const collections = await db.collection.findUnique({
      where: {
        userId: user.id,
        id:collectionId
      },
    });

    // 4. Return karo
    return collections;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function deleteCollection(id) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Check if collection exists and belongs to user
    const collection = await db.collection.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!collection) throw new Error("Collection not found");

    // Delete the collection (entries will be cascade deleted)
    await db.collection.delete({
      where: { id },
    });

    return true;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getJournalEntry(id) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const entry = await db.entry.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        collection: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!entry) throw new Error("Entry not found");

    return entry;
  } catch (error) {
    throw new Error(error.message);
  }
}