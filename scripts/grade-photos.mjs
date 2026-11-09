/**
 * Photo pipeline: turns the source photos in assets/photos/ into the graded,
 * cropped files the site serves from public/images/.
 *
 *   npm run photos            (all)
 *   npm run photos -- soul-   (only outputs whose name contains "soul-")
 *
 * Every photo gets the same "house look" so photos from different sources feel
 * like one set: a slightly matte, warm natural-light grade, trimmed saturation,
 * fine film grain and a soft vignette. Each output is cropped to the exact
 * shape it's shown at on the site.
 *
 * To add a photo: drop it in assets/photos/ (stock photos go in stock/ and get
 * a line in assets/photos/CREDITS.md), add an entry to `outputs`, run the
 * script, then reference /images/<out>.jpg in src/brand/.
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = "assets/photos";
const OUT = "public/images";

const CARD = [1200, 900]; // 4:3 dish and service cards
const SQUARE = [1000, 1000]; // gallery
const TALL = [900, 1200]; // gallery, 3:4
const HERO = [1800, 1200]; // 3:2, runs to the right edge of the home page
const PORTRAIT = [1000, 1250]; // 4:5, about sections

/**
 * out:      file name written to public/images (without .jpg)
 * src:      file in assets/photos
 * size:     [width, height] of the output
 * crop:     optional [x, y, w, h] taken first, as fractions of the source (0–1)
 * position: where to keep when filling `size` ("attention" finds the food)
 */
const outputs = [
  // Hero + service cards
  { out: "hero-jollof-table", src: "stock/gh-jollof-kebabs.jpg", size: HERO, position: "centre" },
  { out: "about-candlelit", src: "stock/scene-candlelit-dinner.jpg", size: PORTRAIT },
  { out: "service-dinner-table", src: "stock/scene-dinner-table.jpg", size: CARD, position: "centre" },
  { out: "service-meal-prep-boxes", src: "stock/scene-meal-prep.jpg", size: CARD },
  { out: "service-catering", src: "stock/scene-buffet.jpg", size: CARD },

  // Ghanaian favourites
  { out: "gh-jollof", src: "stock/gh-jollof-kebabs.jpg", size: CARD },
  { out: "gh-waakye", src: "stock/gh-waakye.jpg", size: CARD, position: "centre" },
  { out: "gh-fried-rice", src: "stock/gh-fried-rice.jpg", size: CARD, position: "centre" },
  { out: "gh-grilled-tilapia", src: "stock/gh-grilled-tilapia.jpg", size: CARD },
  { out: "gh-fufu-light-soup", src: "dish-fufu-light-soup.jpg", size: CARD, crop: [0.323, 0.13, 0.677, 0.677] }, // AI stand-in
  { out: "gh-plantain-groundnuts", src: "stock/gh-plantain-groundnuts.jpg", size: CARD },
  { out: "gh-kebabs", src: "stock/gh-kebabs.jpg", size: CARD },
  { out: "gh-koose", src: "stock/gh-koose.jpg", size: CARD },
  { out: "gh-bofrot", src: "stock/gh-bofrot.jpg", size: CARD },

  // Soul food
  { out: "soul-mac-cheese", src: "stock/soul-mac-cheese.jpg", size: CARD, crop: [0.02, 0.24, 0.96, 0.48] },
  { out: "soul-fried-chicken", src: "stock/soul-fried-chicken.jpg", size: CARD },
  { out: "soul-chicken-waffles", src: "stock/soul-chicken-waffles.jpg", size: CARD },
  { out: "soul-shrimp-grits", src: "stock/soul-shrimp-grits.jpg", size: CARD, crop: [0.05, 0.46, 0.889, 0.5] },
  { out: "soul-gumbo", src: "stock/soul-gumbo-greens.jpg", size: CARD, crop: [0.08, 0.28, 0.62, 0.31] },
  { out: "soul-ribs", src: "stock/soul-ribs.jpg", size: CARD },
  { out: "soul-catfish", src: "stock/soul-catfish.jpg", size: CARD, crop: [0.15, 0.56, 0.75, 0.42] },
  { out: "soul-candied-yams", src: "stock/soul-candied-yams.jpg", size: CARD },
  { out: "soul-oxtails", src: "stock/soul-oxtails.jpg", size: CARD },
  { out: "soul-peach-cobbler", src: "stock/soul-peach-cobbler.jpg", size: CARD },
  { out: "soul-banana-pudding", src: "stock/soul-banana-pudding.jpg", size: CARD },
  { out: "soul-red-velvet", src: "stock/soul-red-velvet.jpg", size: CARD },

  // About-page gallery (3 columns: each run of three = one tall + two squares)
  { out: "gal-candlelit-dinner", src: "stock/scene-candlelit-dinner.jpg", size: SQUARE },
  { out: "gal-fried-chicken-tray", src: "stock/gal-fried-chicken-tray.jpg", size: TALL },
  { out: "gal-red-velvet", src: "stock/gal-red-velvet.jpg", size: SQUARE },
  { out: "gal-mac-skillet", src: "stock/gal-mac-skillet.jpg", size: SQUARE },
  { out: "gal-plantain", src: "stock/gal-plantain.jpg", size: SQUARE },
  { out: "gal-ribs", src: "stock/gal-ribs.jpg", size: TALL },
  { out: "gal-chicken-waffles", src: "stock/gal-chicken-waffles.jpg", size: SQUARE },
  { out: "gal-buffet-serving", src: "stock/scene-buffet-serving.jpg", size: TALL },
  { out: "gal-puff-puff", src: "stock/gal-puff-puff-pap.jpg", size: SQUARE },
];

const GRAIN_SIGMA = 12; // film grain strength; 0 to disable
const MAX_UPSCALE = 1.4;

async function grade({ out, src, size, crop, position = "attention" }) {
  const file = path.join(SRC, src);
  const meta = await sharp(file).metadata();
  let img = sharp(file);
  let w = meta.width;
  let h = meta.height;
  if (crop) {
    const [x, y, cw, ch] = crop;
    const left = Math.round(x * w);
    const top = Math.round(y * h);
    const region = { left, top, width: Math.min(Math.round(cw * w), w - left), height: Math.min(Math.round(ch * h), h - top) };
    img = sharp(await img.extract(region).toBuffer());
    w = region.width;
    h = region.height;
  }
  // Don't blow a small source up past MAX_UPSCALE: shrink the output instead.
  let [W, H] = size;
  const need = Math.max(W / w, H / h);
  if (need > MAX_UPSCALE) {
    const k = MAX_UPSCALE / need;
    W = Math.round(W * k);
    H = Math.round(H * k);
  }
  img = img.resize({ width: W, height: H, fit: "cover", position, kernel: "lanczos3" });

  // Tone: trim saturation, soft matte (lifted blacks, rolled highlights), warm neutral balance
  const toned = await img
    .modulate({ saturation: 0.9 })
    .linear([0.94, 0.93, 0.9], [10, 9, 10])
    .recomb([
      [1.0, 0.03, -0.03],
      [0.01, 0.99, 0.0],
      [-0.02, 0.02, 1.0],
    ])
    .toBuffer();

  const layers = [];
  if (GRAIN_SIGMA > 0) {
    const grain = await sharp({
      create: { width: W, height: H, channels: 3, background: "#808080", noise: { type: "gaussian", mean: 128, sigma: GRAIN_SIGMA } },
    })
      .greyscale()
      .blur(0.55)
      .png()
      .toBuffer();
    layers.push({ input: grain, blend: "soft-light" });
  }
  const vignette = Buffer.from(
    `<svg width="${W}" height="${H}"><defs><radialGradient id="v" cx="50%" cy="48%" r="75%"><stop offset="60%" stop-color="#fff"/><stop offset="100%" stop-color="#d3cdc4"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#v)"/></svg>`,
  );
  layers.push({ input: vignette, blend: "multiply" });

  const dest = path.join(OUT, `${out}.jpg`);
  await sharp(toned).composite(layers).jpeg({ quality: 82, mozjpeg: true, progressive: true }).toFile(dest);
  const { size: bytes } = await fs.stat(dest);
  console.log(`${dest.padEnd(44)} ${W}x${H}  ${Math.round(bytes / 1024)} KB`);
}

const only = process.argv[2];
for (const o of outputs) if (!only || o.out.includes(only)) await grade(o);
