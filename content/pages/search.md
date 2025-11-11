---
title: Search
description: Search Artilce Issues and others.
permalink: /search/
---
<link href="/pagefind/pagefind-ui.css" rel="stylesheet">
<div id="search" class="bg-white">
    <ul class="my-nav">
        {% for n in metadata.navbar.list %}
            <li class="my-nav-item">
                <a href="{{ n.url }}">
                    {{ n.nav }}
                </a>
            </li>
        {% endfor %}
    </ul>
    </div>

<script src="/pagefind/pagefind-ui.js"></script>
<script>
    window.addEventListener('load', function() {
        new PagefindUI({ 
            element: "#search",
            // Opsi lain
        });
    });
</script>