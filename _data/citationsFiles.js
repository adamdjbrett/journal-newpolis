import fs from "fs";
import path from "path";

// Returns list of citation file names in public/citations (both .ris and .csl.json)
export default function() {
  const citationsDir = path.join(process.cwd(), "public", "citations");
  try {
    const files = fs.readdirSync(citationsDir)
      .filter(f => f.endsWith('.ris') || f.endsWith('.csl.json'))
      .sort();
    return files;
  } catch(e) {
    return [];
  }
}
