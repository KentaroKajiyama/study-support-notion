import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { beforeEach, describe, expect, it, vi, beforeAll, afterAll } from "vitest";
import pool from '@infrastructure/awsDB.js';

// Load environment variables
dotenv.config();

describe("AWS RDS MySQL Connection", () => {
  beforeAll(async () => {
    // Test the initial connection (throws if connection fails)
    const connection = await pool.getConnection();
    expect(connection).toBeDefined();
    connection.release();
  });

  it("should execute a simple SELECT query", async () => {
    const [rows] = await pool.query("SELECT 1 AS test");
    expect(rows).toEqual([{ test: 1 }]);
  });

  it("should execute a query on an actual table", async () => {
    const [rows] = await pool.query("SHOW TABLES");
    expect((rows as Array<any>).length).toBeGreaterThan(13);
  });

  afterAll(async () => {
    await pool.end(); // Close pool after tests
  });
});
