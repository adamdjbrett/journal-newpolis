import { IdAttributePlugin, InputPathToUrlTransformPlugin, HtmlBasePlugin } from "@11ty/eleventy";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import pluginSyntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import pluginNavigation from "@11ty/eleventy-navigation";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import yaml from "js-yaml";
import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import markdownItAttrs from 'markdown-it-attrs';
import markdownItFootnote from "markdown-it-footnote";
import pluginTOC from 'eleventy-plugin-toc';
import pluginFilters from "./_config/filters.js";
import { execSync } from "child_process";

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function(eleventyConfig) {
    // Drafts, see also _data/eleventyDataSchema.js
    eleventyConfig.addPreprocessor("drafts", "*", (data, content) => {
        if(data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
            return false;
        }
    });
    
    eleventyConfig.addDataExtension("yaml", (contents) => yaml.load(contents));

    // Copy the contents of the `public` folder to the output folder
    eleventyConfig
        .addPassthroughCopy({
            "./public/": "/"
        })
        .addPassthroughCopy("./content/feed/pretty-atom-feed.xsl")
        .addPassthroughCopy("src/archives/**/*.pdf")
        .addPassthroughCopy("**/*.pdf")
        .addPassthroughCopy({
            "./public/citations/": "/citations/"
        });

    // Watch files
    eleventyConfig.addWatchTarget("css/**/*.css");
    eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpg,jpeg,gif}");
    eleventyConfig.addWatchTarget("public/citations/**/*");

    // Per-page bundles (CSS)
    eleventyConfig.addBundle("css", {
        toFileDirectory: "dist",
        bundleHtmlContentFromSelector: "style",
    });

    // Per-page bundles (JS)
    eleventyConfig.addBundle("js", {
        toFileDirectory: "dist",
        bundleHtmlContentFromSelector: "script",
    });

    // Official plugins
    eleventyConfig.addPlugin(pluginSyntaxHighlight, {
        preAttributes: { tabindex: 0 }
    });

    // --- Pendaftaran Eleventy TOC Plugin ---
    // Konfigurasi ini menggunakan Shortcode {% toc %}
    eleventyConfig.addPlugin(pluginTOC, {
        tags: ['h2', 'h3', 'h4', 'h5'],
        id: 'toci', 
        class: 'list-group',
        ul: true,
        flat: true,
        wrapper: 'div'
    });
    
    // --- Konfigurasi Markdown-it Terpusat (Wajib untuk TOC) ---
    // Menggabungkan semua inisialisasi 'md' yang sebelumnya terpisah.

    let mdOptions = {
        html: true,
        breaks: true,
        linkify: true,
        typographer: true,
    };

    // 1. Inisialisasi dan Rangkai SEMUA plugin Markdown-it (markdownItAnchor PENTING)
    const md = new markdownIt(mdOptions)
        .use(markdownItAnchor, { 
            permalink: markdownItAnchor.permalink.headerLink(),
            permalinkClass: "direct-link",
            permalinkSymbol: "#"
        })
        .use(markdownItAttrs)
        .use(markdownItFootnote);

    // 2. Daftarkan instance MD yang telah dikonfigurasi ke Eleventy
    eleventyConfig.setLibrary("md", md);

    // 3. Daftarkan filter 'md' (hanya sekali)
    eleventyConfig.addFilter("md", function (content) {
        return md.render(content);
    });

    // Plugin lainnya
    eleventyConfig.addPlugin(pluginNavigation);
    eleventyConfig.addPlugin(HtmlBasePlugin);
    eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);

    // After build hook
    eleventyConfig.on("eleventy.after", () => {
        execSync(`npx pagefind --site _site --glob \"**/*.html\"`, {
            encoding: "utf-8",
        });
    });
    
    // Feed plugin configuration
    eleventyConfig.addPlugin(feedPlugin, {
        type: "atom", // or "rss", "json"
        outputPath: "/feed/feed.xml",
        stylesheet: "pretty-atom-feed.xsl",
        templateData: {
            eleventyNavigation: {
                key: "Feed",
                order: 4
            }
        },
        collection: {
            name: "posts",
            limit: 10,
        },
        metadata: {
            language: "en",
            title: "Blog Title",
            subtitle: "This is a longer description about your blog.",
            base: "http://localhost:8080/",
            author: {
                name: "Your Name"
            }
        }
    });

    // Image optimization
    eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
        formats: ["avif", "webp", "auto"],
        failOnError: false,
        htmlOptions: {
            imgAttributes: {
                loading: "lazy",
                decoding: "async",
            }
        },
        sharpOptions: {
            animated: true,
        },
    });

    // Filters
    eleventyConfig.addPlugin(pluginFilters);

    // Collections
    eleventyConfig.addCollection("authors", function(collectionApi) {
        return collectionApi.getFilteredByGlob("content/authors/*.md").sort((a, b) => {
            const an = (a.data.name || a.id || "").toLowerCase();
            const bn = (b.data.name || b.id || "").toLowerCase();
            return an.localeCompare(bn);
        });
    });

    // Passthrough copy for archives
    eleventyConfig.addPassthroughCopy({ "content/archives": "archives" });
    eleventyConfig.addPassthroughCopy("archives/**/*.pdf");

    eleventyConfig.addCollection("archivesIndex", function(collectionApi) {
        return collectionApi.getFilteredByGlob("content/archives/**/index.md");
    });

    // IdAttributePlugin (dibiarkan jika Anda menggunakannya di tempat lain)
    eleventyConfig.addPlugin(IdAttributePlugin, {});

    // Shortcodes
    eleventyConfig.addShortcode("currentBuildDate", () => {
        return (new Date()).toISOString();
    });
    eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

    // Enable passthrough copy behavior for dev server
    eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

    // End of eleventyConfig function
};

export const config = {
    // Control which files Eleventy will process
    templateFormats: [
        "md",
        "njk",
        "html",
        "liquid",
        "11ty.js",
    ],

    // Template Engines
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",

    // Dir configuration
    dir: {
        input: "content",
        includes: "../_includes",
        data: "../_data",
        output: "_site"
    },

    // Optional items:
    // pathPrefix: "/",
};