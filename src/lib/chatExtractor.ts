import { ExpenseRecord, LineItem, Member } from "@/types/ledger.schema";
import { toPaise } from "./moneyMath";

function generateId(prefix: string = "exp"): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
}

const COMMON_MERCHANTS = [
  "Swiggy",
  "Zomato",
  "Social Offline",
  "Blinkit",
  "Zepto",
  "Uber",
  "Ola",
  "Starbucks",
  "Third Wave Coffee",
  "Blue Tokai",
  "Dominos",
  "McDonalds",
  "Costco",
  "Trader Joe's",
  "Whole Foods",
  "Sushi Bar",
  "Dhaba",
  "PVR Cinemas",
  "Supermarket",
];

export function extractFromChatOrSms(
  rawText: string,
  existingMembers: Member[]
): ExpenseRecord {
  const text = rawText.trim();
  const id = generateId("exp");
  const createdAt = Date.now();

  let sourceType: "WHATSAPP_CHAT" | "BANK_SMS" | "RECEIPT_OCR" | "MANUAL" = "WHATSAPP_CHAT";
  if (/\b(debited|credited|A\/c|Ref|UPI Ref|IMPS|NEFT)\b/i.test(text)) {
    sourceType = "BANK_SMS";
  }

  // 1. Detect Merchant
  let merchantName = "Group Expense";
  for (const m of COMMON_MERCHANTS) {
    const regex = new RegExp(`\\b${m}\\b`, "i");
    if (regex.test(text)) {
      merchantName = m;
      break;
    }
  }

  // If no common merchant matched, try "at [Merchant]" or "to [Merchant]"
  if (merchantName === "Group Expense") {
    const atMatch = text.match(/\b(?:at|to|from)\s+([A-Za-z0-9&'\s]{2,20}?)(?=[,\.\n\r]|\s+for|\s+via|\s+on|\s+Rs|\s+INR|\s+₹|\s+debited|$)/i);
    if (atMatch && atMatch[1].trim()) {
      merchantName = atMatch[1].trim();
    }
  }

  // 2. Detect Grand Total
  let totalPaise = 0;
  // Match patterns like "Rs. 640.00", "₹1240", "1240 hua", "total 1850", "paid 1850"
  const totalRegexes = [
    /(?:Rs\.?|INR|₹)\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)/i,
    /(?:total|bill|paid|hua)\s*(?:of|is|:)?\s*(?:Rs\.?|INR|₹)?\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)/i,
    /(\d+(?:,\d+)*(?:\.\d{1,2})?)\s*(?:hua|total|paid|bill)/i,
    /debited.*?(?:Rs\.?|INR|₹)\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)/i,
  ];

  for (const rgx of totalRegexes) {
    const match = text.match(rgx);
    if (match && match[1]) {
      totalPaise = toPaise(match[1]);
      break;
    }
  }

  // 3. Detect Tax
  let taxPaise = 0;
  const taxMatch = text.match(/(?:\+|\band\b)?\s*(\d+(?:\.\d{1,2})?)\s*(?:tax|gst|cgst|sgst|vat)/i) ||
                   text.match(/(?:tax|gst|cgst|sgst|vat)\s*(?:of|is|:)?\s*(?:Rs\.?|₹)?\s*(\d+(?:\.\d{1,2})?)/i);
  if (taxMatch && taxMatch[1]) {
    taxPaise = toPaise(taxMatch[1]);
  }

  // Enhanced regex supporting:
  // - "Rahul 400 dega" or "Rahul 400"
  // - "Arjun had Nachos 450"
  // - "Priya owes 300"
  // - "shared Pizza 920"
  const items: LineItem[] = [];
  const segments = text.split(/[,;\n\r]|\s+\b(?:baaki|and then|aur)\b/i);

  for (const seg of segments) {
    const s = seg.trim();
    if (!s) continue;

    // Pattern 1: Known Member followed by amount (e.g. "Rahul 400 dega" or "Priya 300")
    for (const mem of existingMembers) {
      const memRegex = new RegExp(`\\b${mem.name}\\b.*?(\\d+(?:\\.\\d{1,2})?)`, "i");
      const memMatch = s.match(memRegex);
      if (memMatch && memMatch[1]) {
        const itemPaise = toPaise(memMatch[1]);
        if (itemPaise > 0 && itemPaise < (totalPaise || 9999999)) {
          // Extract any item title if present (e.g. "Arjun had Nachos 450" -> "Nachos")
          const cleanItemTitle = s
            .replace(new RegExp(`\\b${mem.name}\\b`, "i"), "")
            .replace(memMatch[1], "")
            .replace(/\b(had|ordered|took|owes|pay|dega|ka|for|₹|Rs\.?)\b/gi, "")
            .trim();

          items.push({
            id: generateId("item"),
            title: cleanItemTitle.length > 2 ? `${mem.name}'s ${cleanItemTitle}` : `${mem.name}'s Share`,
            amountPaise: itemPaise,
            assignedMemberIds: [mem.id],
          });
          break;
        }
      }
    }

    // Pattern 2: Shared item (e.g. "shared Pizza 920" or "Nachos 450")
    const sharedMatch = s.match(/\b(?:shared|common|hum sab)?\s*([A-Za-z\s]{3,20}?)\s*(?:Rs\.?|₹)?\s*(\d+(?:\.\d{1,2})?)/i);
    if (sharedMatch && sharedMatch[1] && sharedMatch[2]) {
      const title = sharedMatch[1].trim();
      const pricePaise = toPaise(sharedMatch[2]);
      const isAlreadyAdded = items.some((i) => Math.abs(i.amountPaise - pricePaise) < 10);
      const isMember = existingMembers.some((m) => new RegExp(`\\b${m.name}\\b`, "i").test(title));
      const isTotalWord = /^(total|bill|hua|paid|swiggy|zomato|debited|tax|gst)/i.test(title);

      if (!isAlreadyAdded && !isMember && !isTotalWord && pricePaise > 0 && pricePaise < (totalPaise || 9999999)) {
        items.push({
          id: generateId("item"),
          title: title,
          amountPaise: pricePaise,
          assignedMemberIds: [], // shared by all
        });
      }
    }
  }

  // If items sum is less than total, add a "Shared Remainder" item to make math balance 100%
  const currentItemsSum = items.reduce((sum, item) => sum + item.amountPaise, 0);
  const effectiveSubtotal = Math.max(0, totalPaise - taxPaise);

  if (totalPaise > 0 && currentItemsSum < effectiveSubtotal) {
    const remainderPaise = effectiveSubtotal - currentItemsSum;
    items.push({
      id: generateId("item"),
      title: "Shared Remainder / Group Split",
      amountPaise: remainderPaise,
      assignedMemberIds: [], // shared by all
    });
  } else if (items.length === 0 && totalPaise > 0) {
    items.push({
      id: generateId("item"),
      title: `${merchantName} Bill`,
      amountPaise: effectiveSubtotal,
      assignedMemberIds: [], // shared by all
    });
  }

  const finalSubtotal = items.reduce((sum, item) => sum + item.amountPaise, 0);
  const finalTotal = totalPaise > 0 ? totalPaise : finalSubtotal + taxPaise;

  const defaultPayerId = existingMembers[0]?.id || "member_you";

  return {
    id,
    sourceType,
    rawSourceText: text,
    merchantName,
    createdAt,
    paidByMemberId: defaultPayerId,
    subtotalPaise: finalSubtotal,
    taxPaise,
    tipPaise: 0,
    totalPaise: finalTotal,
    items,
    settled: false,
  };
}
