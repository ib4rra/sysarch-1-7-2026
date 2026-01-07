import mysql from "mysql2/promise";

async function cleanupDatabase() {
  let connection;

  try {
    console.log("🗑️  Connecting to database...");
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "nangka_mis",
    });

    console.log("📋 Clearing test data...\n");

    // Delete data from dependent tables first (foreign key constraints)
    const tables = [
      "pwd_user_login",
      "Nangka_PWD_user",
      "Person_In_Charge",
    ];

    for (const table of tables) {
      try {
        await connection.execute(`DELETE FROM ${table}`);
        console.log(`✅ Cleared ${table}`);
      } catch (err) {
        console.log(`⚠️  ${table} already empty or error: ${err.message}`);
      }
    }

    // Clear disability types (except the required ones)
    try {
      const requiredDisabilities = [
        "Visual Impairment",
        "Hearing Impairment",
        "Physical Disability",
        "Learning Disability",
        "Mental Health Condition",
        "Autism Spectrum",
        "Chronic Illness",
      ];

      const placeholders = requiredDisabilities.map(() => "?").join(",");
      await connection.execute(
        `DELETE FROM disability_types WHERE disability_name NOT IN (${placeholders})`,
        requiredDisabilities
      );
      console.log("✅ Cleared extra disability types");
    } catch (err) {
      console.log(`⚠️  Disability types error: ${err.message}`);
    }

    console.log("\n✨ Database cleanup completed!");
    console.log("🚀 Run 'npm run seed' to reinitialize with fresh test data\n");

    connection.end();
  } catch (error) {
    console.error("❌ Cleanup failed:", error.message);
    process.exit(1);
  }
}

cleanupDatabase();
