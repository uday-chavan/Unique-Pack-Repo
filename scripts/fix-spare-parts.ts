import { db } from "../server/db";
import { machines } from "../shared/schema";
import { eq, sql, ilike } from "drizzle-orm";

/**
 * Database migration: Fix spare parts category typos
 * This script normalizes incorrect category names in the machines table
 */
async function fixSparePartsCategoryTypos() {
  try {
    console.log("Starting database migration: Fix spare parts category typos...");

    // Fix "spear part" → "spare part"
    const spearPartResult = await db
      .update(machines)
      .set({ category: "spare part" })
      .where(ilike(machines.category, "spear part"))
      .returning();

    if (spearPartResult.length > 0) {
      console.log(
        `✓ Updated ${spearPartResult.length} records: "spear part" → "spare part"`
      );
      spearPartResult.forEach((m) => {
        console.log(`  - ID ${m.id}: ${m.name}`);
      });
    }

    // Fix "spear parts" → "spare parts"
    const spearPartsResult = await db
      .update(machines)
      .set({ category: "spare parts" })
      .where(ilike(machines.category, "spear parts"))
      .returning();

    if (spearPartsResult.length > 0) {
      console.log(
        `✓ Updated ${spearPartsResult.length} records: "spear parts" → "spare parts"`
      );
      spearPartsResult.forEach((m) => {
        console.log(`  - ID ${m.id}: ${m.name}`);
      });
    }

    if (spearPartResult.length === 0 && spearPartsResult.length === 0) {
      console.log("✓ No records needed fixing");
    }

    console.log("\n✓ Migration completed successfully!");

    // Verify: Show all spare parts
    const allSpareParts = await db
      .select({
        id: machines.id,
        name: machines.name,
        category: machines.category,
      })
      .from(machines)
      .where(
        sql`LOWER(${machines.category}) LIKE '%spare%' OR LOWER(${machines.category}) LIKE '%part%'`
      );

    console.log("\nAll spare parts in database:");
    allSpareParts.forEach((m) => {
      console.log(`  - ID ${m.id}: ${m.name} (${m.category})`);
    });

  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the migration
fixSparePartsCategoryTypos();
