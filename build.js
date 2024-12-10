const fs = require("fs-extra");
const path = require("path");
const chokidar = require("chokidar");

const srcDir = path.join(__dirname, "src");
const distDir = path.join(__dirname, "dist");

// Function to process HTML files and replace placeholders
async function processHtml(filePath) {
  let content = await fs.readFile(filePath, "utf-8");

  // Resolve placeholders relative to the current file
  const fileDir = path.dirname(filePath);
  content = content.replace(/<!-- include:(.*?) -->/g, (_, partialPath) => {
    const partial = path.resolve(fileDir, partialPath.trim()); // Resolve path relative to the current file
    if (fs.existsSync(partial)) {
      console.log(`Including partial: ${partial}`);
      return fs.readFileSync(partial, "utf-8");
    } else {
      console.error(`Partial not found: ${partialPath}`);
      return "";
    }
  });

  return content;
}

// Function to build the project
async function build() {
  console.log("Building project...");

  // Ensure the `dist` directory exists
  await fs.ensureDir(distDir);

  // Process HTML files
  const files = await fs.readdir(srcDir);
  for (const file of files) {
    const filePath = path.join(srcDir, file);

    if (file.endsWith(".html")) {
      const processedHtml = await processHtml(filePath);
      await fs.outputFile(path.join(distDir, file), processedHtml);
    } else if (!file.endsWith(".css")) {
      // Copy non-HTML, non-CSS files (e.g., images)
      await fs.copy(filePath, path.join(distDir, file));
    }
  }

  console.log("Build complete!");
}

// Watch for changes in src directory
function watch() {
  chokidar.watch(srcDir, {
    ignoreInitial: true,
    ignored: /[\/\\]\.|~$/, // Ignore hidden files and backup files (~)
  }).on("all", async (event, filePath) => {
    console.log(`Detected ${event} on ${filePath}. Rebuilding...`);
    try {
      await build();
    } catch (error) {
      console.error("Error during build:", error);
    }
  });

  console.log("Watching for changes...");
}

// Run build or watch based on command-line arguments
if (process.argv.includes("--watch")) {
  build().then(() => watch());
} else {
  build().catch((err) => console.error(err));
}
