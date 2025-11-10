---
title: Journal Issues
description: Journal Issues Description
permalink: /archives/
---
<h1>Journal Issues</h1>

<ul>
{%- for issue in collections.archivesIndex %}
  <li>
    <a href="{{ issue.url }}">{{ issue.data.title or issue.url }}</a>
  </li>
{%- endfor %}
</ul>
