import fs from "fs";
import path from "path";

const PROMPTS_DIR = path.join(__dirname, "../prompts");

const systemPromptBeforeYouBorrow = fs.readFileSync(
  path.join(PROMPTS_DIR, "system_prompt_BeforeYouBorrow.md"),
  "utf-8",
);
const knowledgeBaseBeforeYouBorrow = fs.readFileSync(
  path.join(PROMPTS_DIR, "knowledge_base_BeforeYouBorrow.md"),
  "utf-8",
);

export const FULL_SYSTEM_INSTRUCTION_BEFORE_YOU_BORROW = `${systemPromptBeforeYouBorrow}

---

# LAMPIRAN: knowledge_base_BeforeYouBorrow.md

${knowledgeBaseBeforeYouBorrow}`;
