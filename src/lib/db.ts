import Dexie, { Table } from "dexie";
import { ExpenseRecord, Member } from "@/types/ledger.schema";

export const INITIAL_MEMBERS: Member[] = [
  { id: "member_you", name: "You (Payer)", upiId: "you@okhdfcbank", avatarColor: "#10B981" },
  { id: "member_rahul", name: "Rahul", upiId: "rahul@okaxis", avatarColor: "#3B82F6" },
  { id: "member_priya", name: "Priya", upiId: "priya@paytm", avatarColor: "#F59E0B" },
  { id: "member_arjun", name: "Arjun", upiId: "arjun@ybl", avatarColor: "#8B5CF6" },
];

export class ReceiptSplitDB extends Dexie {
  expenses!: Table<ExpenseRecord, string>;
  members!: Table<Member, string>;

  constructor() {
    super("ReceiptSplitLocalDB");
    this.version(1).stores({
      expenses: "id, merchantName, createdAt, settled, paidByMemberId",
      members: "id, name, upiId",
    });
  }
}

let dbInstance: ReceiptSplitDB | null = null;

export function getDB(): ReceiptSplitDB | null {
  if (typeof window === "undefined") return null;
  if (!dbInstance) {
    dbInstance = new ReceiptSplitDB();
    // Seed initial members if empty
    dbInstance.on("ready", async () => {
      const count = await dbInstance!.members.count();
      if (count === 0) {
        await dbInstance!.members.bulkAdd(INITIAL_MEMBERS);
      }
    });
  }
  return dbInstance;
}

export async function seedInitialMembers(): Promise<void> {
  const db = getDB();
  if (!db) return;
  const count = await db.members.count();
  if (count === 0) {
    await db.members.bulkAdd(INITIAL_MEMBERS);
  }
}

export async function wipeLocalDatabase(): Promise<void> {
  const db = getDB();
  if (!db) return;
  await db.expenses.clear();
  await db.members.clear();
  await db.members.bulkAdd(INITIAL_MEMBERS);
}

export async function exportDatabaseAsJson(): Promise<string> {
  const db = getDB();
  if (!db) return "{}";
  const expenses = await db.expenses.toArray();
  const members = await db.members.toArray();
  return JSON.stringify({ expenses, members, exportedAt: Date.now() }, null, 2);
}
