---
title: Journal Issues
description: Journal Issues Polis
---
<h1>Journal Issues</h1>

<ul class="dt">
{%- for issue in collections.archivesIndex %}
  <li class="jt">
    <h2><a href="{{ issue.url }}">{{ issue.data.title or issue.url }}</a></h2>
  </li>
{%- endfor %}
</ul>
