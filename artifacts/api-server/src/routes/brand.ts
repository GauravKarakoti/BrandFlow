import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, brandsTable, activityTable } from "@workspace/db";
import {
  UpdateBrandBody,
  GetBrandResponse,
  UpdateBrandResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/brand", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;

  let [brand] = await db.select().from(brandsTable).where(eq(brandsTable.userId, userId));

  if (!brand) {
    // Auto-create a default brand for new users
    const [newBrand] = await db
      .insert(brandsTable)
      .values({ userId, name: "My Brand" })
      .returning();
    brand = newBrand;
  }

  res.json(
    GetBrandResponse.parse({ ...brand, createdAt: brand.createdAt.toISOString() }),
  );
});

router.put("/brand", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const parsed = UpdateBrandBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Upsert brand
  let [brand] = await db.select().from(brandsTable).where(eq(brandsTable.userId, userId));

  if (!brand) {
    const [newBrand] = await db
      .insert(brandsTable)
      .values({ userId, name: parsed.data.name ?? "My Brand", ...parsed.data })
      .returning();
    brand = newBrand;
  } else {
    const [updated] = await db
      .update(brandsTable)
      .set(parsed.data)
      .where(eq(brandsTable.userId, userId))
      .returning();
    brand = updated;
  }

  await db.insert(activityTable).values({
    userId,
    type: "brand_updated",
    description: "Brand settings updated",
  });

  res.json(
    UpdateBrandResponse.parse({ ...brand, createdAt: brand.createdAt.toISOString() }),
  );
});

export default router;
