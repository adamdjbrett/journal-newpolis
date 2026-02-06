---
title: Authors
description: Authors New Polis
permalink: /authors/
layout: layouts/base.njk
---
<style>
  .authors-list-clean li {
    margin-bottom: 0.2rem !important;
    padding: 0 !important;
    line-height: 1.4 !important;
  }
  .authors-list-clean {
    margin-top: 1rem !important;
  }
</style>

<h1>{{ title }}</h1>

<ul class="authors-list-clean">
{%- set archiveItems = collections.all | byFolder('content/archives') %}
{%- for author in collections.authors %}
  {%- set akey = author.data.key or author.fileSlug or author.data.page and author.data.page.fileSlug -%}
  {%- set count = 0 -%}
  {%- for p in archiveItems %}
    {%- if p.data.authors -%}
      {%- set keys = p.data.authors | authorsToArray -%}
      {%- if akey in keys -%}{%- set count = count + 1 -%}{%- endif -%}
    {%- endif -%}
  {%- endfor -%}
  <li>
    <a href="{{ author.url }}">{{ author.data.name or author.data.title or akey }}</a>
    <span>({{ count }})</span>
    {%- if author.data.organization %} <em>— {{ author.data.organization }}</em>{% endif %}
  </li>
{%- endfor %}
</ul>