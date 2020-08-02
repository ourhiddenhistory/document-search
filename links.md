---
layout: page
title: Links
---

<div class="container">
  <div class="page-container">
    <h2>More Archive Websites</h2>
    {% for site in site.data.links %}
      <dt>
        <a href="{{site.href}}" target="_blank">{{site.name}}</a>
      </dt>
      {% if site.description %}
        <dd>{{site.description}}</dd>
      {% endif %}
    {% endfor %}
  </div>
</div>

<div class="container">
  <div class="page-container">
    <h2>Acknowledgements</h2>
    {% for site in site.data.thankyous %}
      <dt>
        <a href="{{site.href}}" target="_blank">{{site.name}}</a>
      </dt>
      {% if site.description %}
        <dd>{{site.description}}</dd>
      {% endif %}
    {% endfor %}
  </div>
</div>
