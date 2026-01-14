import { Models, Query } from "appwrite";
import { DATABASE_ID, databases, ID, TABLES } from "./appwrite";

export interface Addon extends Models.Document {
  name: string;
  description: string;
  price: number;
  type: "per_person" | "per_booking";
  icon: string;
  isActive: boolean;
}

export const databaseService = {
  addons: {
    async list(limit = 100) {
      try {
        const response = await databases.listDocuments<Addon>(
          DATABASE_ID,
          TABLES.ADDONS,
          [Query.equal("isActive", true), Query.limit(limit)],
        );
        return response.documents;
      } catch (error) {
        console.error("List addons error:", error);
        return [];
      }
    },
    async create(data: Omit<Addon, "$id" | "isActive">) {
      try {
        return await databases.createDocument(
          DATABASE_ID,
          TABLES.ADDONS,
          ID.unique(),
          {
            ...data,
            isActive: true,
            createdAt: new Date().toISOString(),
          },
        );
      } catch (error) {
        console.error("Create addon error:", error);
        throw error;
      }
    },
    async delete(id: string) {
      try {
        // Soft delete
        return await databases.updateDocument(DATABASE_ID, TABLES.ADDONS, id, {
          isActive: false,
        });
      } catch (error) {
        console.error("Delete addon error:", error);
        throw error;
      }
    },
  },
};
