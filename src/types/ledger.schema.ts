import { z } from "zod";

export const MemberSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  upiId: z.string().optional(),
  avatarColor: z.string(),
});
export type Member = z.infer<typeof MemberSchema>;

export const LineItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  amountPaise: z.number().int().min(0), // Integer paise: ₹1 = 100p
  assignedMemberIds: z.array(z.string()), // empty = all active members
});
export type LineItem = z.infer<typeof LineItemSchema>;

export const ExpenseRecordSchema = z.object({
  id: z.string(),
  sourceType: z.enum(["WHATSAPP_CHAT", "BANK_SMS", "RECEIPT_OCR", "MANUAL"]),
  rawSourceText: z.string(),
  merchantName: z.string(),
  createdAt: z.number(),
  paidByMemberId: z.string(),
  subtotalPaise: z.number().int().min(0),
  taxPaise: z.number().int().min(0),
  tipPaise: z.number().int().min(0),
  totalPaise: z.number().int().min(0),
  items: z.array(LineItemSchema),
  settled: z.boolean(),
});
export type ExpenseRecord = z.infer<typeof ExpenseRecordSchema>;

export const SimplifiedDebtSchema = z.object({
  fromMemberId: z.string(),
  fromMemberName: z.string(),
  toMemberId: z.string(),
  toMemberName: z.string(),
  toMemberUpi: z.string().optional(),
  amountPaise: z.number().int().min(1),
});
export type SimplifiedDebt = z.infer<typeof SimplifiedDebtSchema>;

export interface MemberSplitBreakdown {
  memberId: string;
  memberName: string;
  basePaise: number;
  taxSharePaise: number;
  tipSharePaise: number;
  totalPaise: number;
  items: { title: string; sharePaise: number }[];
}

export interface SettlementSummary {
  expenseId: string;
  totalPaise: number;
  paidByMemberId: string;
  memberBreakdowns: Record<string, MemberSplitBreakdown>;
}
