import { Request, Response } from "express";
import fireflyApi from "./firefly-api";

export const newTransactionWebhook = async (req: Request, res: Response) => {
  const transaction = req.body as {
    content: {
      id: number;
      transactions: Array<{
        transaction_journal_id: string;
        date: string;
        description: string; // 2025.09.05 8995950877 DECATHLON NYUGATI TÉR -APPLE
      }>;
    };
  };

  const modifedTransactions = transaction.content.transactions
    .map((t) => {
      // extract the date from the description
      const dateMatch = t.description.match(/^\d{4}\.\d{2}\.\d{2}/);
      // remove the date and the following space from the description
      const description = dateMatch
        ? t.description.slice(dateMatch[0].length + 1)
        : t.description;

      return {
        transaction_journal_id: t.transaction_journal_id,
        // Date needs to be 2025-09-07T13:56:33+02:00 format and with the extracted date
        date: dateMatch
          ? new Date(
              dateMatch[0].replace(/\./g, "-") + "T00:00:00+02:00",
            ).toISOString()
          : undefined,
        description,
      };
    })
    .filter((t) => t.date || t.description); // only include if date or description is present

  if (modifedTransactions.length === 0) {
    return res
      .status(200)
      .json({ message: "No modifications needed for the transaction" });
  }

  const response = await fireflyApi.put(
    `/transactions/${transaction.content.id}`,
    {
      transactions: modifedTransactions,
    },
  );

  if (response.status !== 200) {
    return res.status(500).json({ error: "Failed to update transaction" });
  }

  console.log(
    "Transaction updated:",
    transaction.content.id,
    modifedTransactions,
  );

  return res.status(200).json({ message: "Transaction updated successfully" });
};
