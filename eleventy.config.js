export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/fonts");
  eleventyConfig.addPassthroughCopy("src/favicon.ico");
  eleventyConfig.addPassthroughCopy("src/journal/images");

  // The imported entries repeat their title as the first heading or a bold line.
  // The template already prints the title, so drop that repeat when it matches.
  eleventyConfig.addFilter("dropDuplicateTitle", (html, title) => {
    if (!html || !title) return html;
    const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return html
      .replace(new RegExp(`^\\s*<h1>\\s*(?:<strong>)?\\s*${escaped}\\s*(?:</strong>)?\\s*</h1>\\s*`), "")
      .replace(new RegExp(`^\\s*<p>\\s*<strong>\\s*${escaped}\\s*</strong>\\s*</p>\\s*`), "");
  });

  eleventyConfig.addFilter("niceDate", (date) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
    })
  );
  eleventyConfig.addFilter("head", (arr, n) => arr.slice(0, n));
  eleventyConfig.addFilter("isoDate", (date) => new Date(date).toISOString());

  return {
    dir: { input: "src", output: "_site" },
    markdownTemplateEngine: "njk",
  };
}
