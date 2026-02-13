---
title: Search
description: Search Articles, Issues, and Editorial content.
permalink: /search/
layout: layouts/base.njk
---
<link href="/pagefind/pagefind-ui.css" rel="stylesheet">
<script src="/pagefind/pagefind-ui.js"></script>

<main class="container my-5">
    <header class="mb-5 pb-3 border-bottom">
        <h1 class="display-5 serif fw-bold">{{ title }}</h1>
        <p class="lead text-secondary">{{ description }}</p>
    </header>

    <div id="search" class="serif"></div>
</main>

<script>
    window.addEventListener('load', function() {
        new PagefindUI({ 
            element: "#search",
            showSubResults: true,
            resetFilters: true,
            translations: {
                placeholder: "Type keywords (e.g. Agile, Ethics, Jurnal...)"
            }
        });
    });
</script>

<style>
    :root {
        --pagefind-ui-primary: #000000;
        --pagefind-ui-text: #212529;
        --pagefind-ui-background: #ffffff;
        --pagefind-ui-border: #dee2e6;
        --pagefind-ui-font: 'Georgia', serif;
    }
    #search .pagefind-ui__drawer {
        gap: 2rem;
    }
    #search .pagefind-ui__result {
        border-bottom: 1px dashed #dee2e6;
        padding: 1.5rem 0;
    }
    #search .pagefind-ui__search-input {
        border-radius: 0;
        font-family: 'Georgia', serif;
    }
</style>