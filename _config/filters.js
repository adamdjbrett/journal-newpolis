import { DateTime } from "luxon";
import MarkdownIt from "markdown-it";

export default function(eleventyConfig) {
	const md = new MarkdownIt({ html: true, linkify: true, breaks: true });
	eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
		// Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
		return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(format || "dd LLLL yyyy");
	});

	eleventyConfig.addFilter("htmlDateString", (dateObj) => {
		// dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
		return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat('yyyy-LL-dd');
	});

	// Get the first `n` elements of a collection.
	eleventyConfig.addFilter("head", (array, n) => {
		if(!Array.isArray(array) || array.length === 0) {
			return [];
		}
		if( n < 0 ) {
			return array.slice(n);
		}

		return array.slice(0, n);
	});

	// Return the smallest number argument
	eleventyConfig.addFilter("min", (...numbers) => {
		return Math.min.apply(null, numbers);
	});

	// Return the keys used in an object
	eleventyConfig.addFilter("getKeys", target => {
		return Object.keys(target);
	});

	eleventyConfig.addFilter("filterTagList", function filterTagList(tags) {
		// Exclude Eleventy internal collections and custom collections we don't want listed as tags
		const excluded = ["all", "posts", "authors", "archivesIndex"];
		return (tags || []).filter(tag => excluded.indexOf(tag) === -1);
	});

	eleventyConfig.addFilter("sortAlphabetically", strings =>
		(strings || []).sort((b, a) => b.localeCompare(a))
	);

	// Filter a collection to items inside a specific folder (by inputPath)
	eleventyConfig.addFilter("byFolder", (array, folderPath) => {
		if(!Array.isArray(array)) return [];
		if(!folderPath) return array;
		const normalize = p => (p || "")
			.replace(/^\.\/?/, "") // strip leading ./
			.replace(/\\/g, "/"); // normalize slashes
		const target = normalize(folderPath.endsWith("/") ? folderPath : folderPath + "/");
		return array.filter(item => {
			const ip = normalize(item && item.inputPath);
			return ip.startsWith(target) && !ip.endsWith("/index.md");
		});
	});

	// Sort a collection by a data key (numeric if possible)
	eleventyConfig.addFilter("sortByData", (array, key) => {
		if(!Array.isArray(array) || !key) return array || [];
		return [...array].sort((a, b) => {
			const av = a && a.data ? a.data[key] : undefined;
			const bv = b && b.data ? b.data[key] : undefined;
			if(av == null && bv == null) return 0;
			if(av == null) return 1;
			if(bv == null) return -1;
			const an = Number(av);
			const bn = Number(bv);
			if(!Number.isNaN(an) && !Number.isNaN(bn)) {
				return an - bn;
			}
			return String(av).localeCompare(String(bv));
		});
	});

	// Render Markdown to HTML (block)
	eleventyConfig.addFilter("markdownify", (content) => {
		if(!content) return "";
		return md.render(String(content));
	});

	// Normalize `authors` (string/csv/array) to an array of keys
	eleventyConfig.addFilter("authorsToArray", (value) => {
		if(!value) return [];
		if(Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean);
		if(typeof value === "string") {
			return value.split(",").map(s => s.trim()).filter(Boolean);
		}
		return [String(value).trim()];
	});

	// Resolve front matter `authors` (string, csv, or array) to HTML links using the authors collection
	// Usage: {{ authors | authorsToLinks(collections.authors) | safe }}
	eleventyConfig.addFilter("authorsToLinks", (value, authorsCollection) => {
		const toArray = (v) => {
			if(!v) return [];
			if(Array.isArray(v)) return v;
			if(typeof v === "string") {
				const parts = v.split(",").map(s => s.trim()).filter(Boolean);
				return parts.length ? parts : [v.trim()];
			}
			return [String(v)];
		};

		const keys = toArray(value);
		const lookup = new Map();
		(authorsCollection || []).forEach(a => {
			const k = (a.data && (a.data.key || a.page?.fileSlug || a.fileSlug)) || (a.data && a.data.page && a.data.page.fileSlug);
			if(k) lookup.set(String(k), a);
		});

		const links = keys.map(k => {
			const key = String(k).trim();
			const match = lookup.get(key);
			if(match) {
				const display = (match.data && (match.data.name || match.data.title)) || key;
				const url = match.url || (match.data && match.data.page && match.data.page.url) || `/authors/${key}/`;
				return `<a href="${url}">${display}</a>`;
			}
			return key;
		});

		return links.join(", ");
	});

	// Resolve front matter `authors` to display names without links
	// Usage: {{ authors | authorsToNames(collections.authors) }}
	eleventyConfig.addFilter("authorsToNames", (value, authorsCollection) => {
		const toArray = (v) => {
			if(!v) return [];
			if(Array.isArray(v)) return v;
			if(typeof v === "string") {
				const parts = v.split(",").map(s => s.trim()).filter(Boolean);
				return parts.length ? parts : [v.trim()];
			}
			return [String(v)];
		};

		const keys = toArray(value);
		const lookup = new Map();
		(authorsCollection || []).forEach(a => {
			const k = (a.data && (a.data.key || a.page?.fileSlug || a.fileSlug)) || (a.data && a.data.page && a.data.page.fileSlug);
			if(k) lookup.set(String(k), a);
		});

		const names = keys.map(k => {
			const key = String(k).trim();
			const match = lookup.get(key);
			if(match) {
				return (match.data && (match.data.name || match.data.title)) || key;
			}
			return key;
		});

		return names.join(", ");
	});
};
