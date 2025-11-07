export default {
  layout: "layouts/author.njk",
  eleventyComputed: {
    // Use explicit front matter `key` if provided; otherwise default to the fileSlug
    key: data => data.key || data.page.fileSlug,
    permalink: data => `/authors/${data.page.fileSlug}/`
  }
};
