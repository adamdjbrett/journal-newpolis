module.exports = function(eleventyConfig) {
  // Add passthrough copies here if needed

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html", "liquid"]
  };
};
