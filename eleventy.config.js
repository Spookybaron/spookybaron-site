export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/fonts");
  eleventyConfig.addPassthroughCopy("src/img");
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
  eleventyConfig.addFilter("dateOnly", (date) => new Date(date).toISOString().slice(0, 10));
  eleventyConfig.addFilter("firstSentence", (html) => {
    const paras = [...String(html || "").matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
      .map((match) => match[1]
        .replace(/<[^>]+>/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;|&apos;/g, "'")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim())
      .filter((text) => text && !text.startsWith("Spooky Baron's What's New"));
    const text = paras.find((item) => item.length > 40) || paras[0] || "";
    if (!text) return "";
    if (text.length <= 160) return text;
    const slice = text.slice(0, 156);
    const stop = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("! "), slice.lastIndexOf("? "));
    return stop > 60 ? slice.slice(0, stop + 1) : `${slice.trimEnd()}…`;
  });

  return {
    dir: { input: "src", output: "_site" },
    markdownTemplateEngine: "njk",
  };
}
