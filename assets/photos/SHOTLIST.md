# Shot list

Source photos for the site. Run `npm run photos` after adding or replacing one
(see `scripts/grade-photos.mjs`). Everything gets the same grade, so shoot or
generate them plainly: no heavy filters.

## House style (use for a photographer brief or as an AI prompt suffix)

> Natural window light from the side, late afternoon, soft shadows. Shot on a
> 50mm lens at eye level or 45°, shallow depth of field. Home dining table with
> an oatmeal linen cloth, matte stoneware in cream and pale sky blue, brushed
> gold cutlery. Food looks freshly served and slightly imperfect: crumbs, drips
> of sauce, uneven pieces. Real Ghanaian home cooking, not restaurant plating.
> No text, no logos, no people's faces.

Keep surfaces consistent: linen or warm wood. Avoid slate, studio white and
glossy restaurant plating.

## Needed first

The site currently uses free stock photos (see CREDITS.md). Clients can tell
stock from the real thing, so these are worth shooting first:

| File | Shot | Used for |
| --- | --- | --- |
| `sonia.jpg` | **Real photo of Sonia only.** Waist-up, in her kitchen or at a set table, smiling, apron on | Home + About |
| `hands-cooking.jpg` | Sonia's hands stirring a pot of stew or plating jollof | About |
| `jollof.jpg` | Her party jollof, portrait, plenty of space at the top | Home hero |
| `fufu-light-soup.jpg` | Fufu and light soup with goat (the only AI image left) | Ghanaian favourites |
| `mac-cheese.jpg`, `oxtails.jpg`, `fried-chicken.jpg` | Her own soul food signatures | Soul food tab |
| `meal-prep.jpg` | Labelled containers of her actual meal prep | Weekly Meal Prep card |
| `buffet.jpg` | A real event she catered (with the host's permission) | Event Catering card |

Then work through every dish in `src/brand/content.ts` and the "also on
request" lists, one photo per dish, all on the same table and light.
