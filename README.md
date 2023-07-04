# Skylight Theme Compat Ghost

A compatability layer for Skylight to use Ghost Themes

> 🚨 NOTE 🚨
>
> You probably don't need this library by itself. It is intended for [Skylight](https://github.com/helloandre/skylight) to use the additional handlebars helpers/decorators to properly render Ghost themes.

The helpers listed below (as well as necessary utils and partials) are heavily inspired by the [originals in Ghost](https://github.com/TryGhost/Ghost/tree/c667620d8f2e32c96fe376ad0f3dabc79488532a/ghost/core/core/frontend/helpers). Modifications were made to be compatible wth [WorkersHBS](https://github.com/helloandre/workers-hbs) and Typescript.

## Helpers

❌ indicates missing

- ✅ asset
- ✅ authors
- ✅ body_class
- ❌ cancel_link
- ❌ comment_count
- ❌ commets
- ✅ concat
- ✅ content
- ✅ date
- ❌ encode
- ✅ excerpt
- ❌ facebook_url
- ✅ foreach
- ✅ get
- ✅ ghost_foot
- ✅ ghost_head
- ✅ has
- ✅ img_url
- ✅ is
- ❌ link
- ✅ link_class
- ✅ match
- ❌ meta_description
- ✅ meta_title
- ✅ navigation
- ✅ page_url
- ✅ pagination
- ❌ plural
- ✅ post_class
- ❌ prev_post
- ❌ price
- ❌ raw
- ❌ reading_time
- ❌ search
- ❌ t
- ❌ tags
- ❌ tiers
- ❌ title
- ❌ total_members
- ❌ total_paid_members
- ❌ twitter_url
- ✅ url

## License

Skylight Compat Ghost Theme is released under the MIT license.
