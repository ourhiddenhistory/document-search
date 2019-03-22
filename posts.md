---
layout: page
title: Posts
---

<div class="container">
  <div class="page-container">
    <h2>Posts</h2>
    <p>
      <strong>This is a beta version of the posts.</strong> For the full posts, visit the current site at <a href="https://ourhiddenhistory.org">https://ourhiddenhistory.org</a>
    </p>    
    <ul>
    {% for post in site.posts %}
      <li>
        <a href="/doc-search{{ post.url }}">
          {{ post.title }}
        </a>
      </li>
    {% endfor %}
    </ul>
  </div>
</div>
