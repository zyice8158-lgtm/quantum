<template>
  <div class="home">
    <GalleryCategories
      v-if="galleryCategoryFixed"
      :categories="categories"
      :setCategories="setCategories"
    />

    <el-scrollbar ref="scrollBarRef" @touchmove.stop @scroll="onScroll">
      <Banner
        :click="
          async (value) => {
            content = '';
            referenceImageUrl = '';

            await nextTick();

            content = value.content;
            referenceImageUrl = value.url;
          }
        "
      />

      <QuickEntrances />

      <div id="gallery-category-fixed-observer-de0dcb2a"></div>

      <GalleryCategories
        v-if="!galleryCategoryFixed"
        :categories="categories"
        :setCategories="setCategories"
      />

      <GalleryBase
        :images="
          images.filter((image) =>
            selectedCategory?.id ? image.categoryId === selectedCategory?.id : true
          )
        "
      >
        <template #info="{ value, index }">
          <div class="btns">
            <div
              class="edit bg-secondary-container"
              v-helper="
                () => {
                  return {
                    tabIndex: index,
                    role: 'button',
                    ariaLabel: $t('creatorZone.home.tryIt'),
                    focus: () => {
                      _window.document.querySelector(`#id-${index}`)?.classList.add('hovered');
                    },
                    blur: () => {
                      _window.document.querySelector(`#id-${index}`)?.classList.remove('hovered');
                    },
                    click: async () => {
                      content = '';
                      referenceImageUrl = '';

                      await nextTick();

                      content = value.content;
                      referenceImageUrl = value.url;
                    },
                  };
                }
              "
            >
              <div class="icon bg-on-secondary-container"></div>

              <div class="text-on-secondary-container">
                {{ $t("creatorZone.home.tryIt") }}
              </div>
            </div>
          </div>
        </template>
      </GalleryBase>
    </el-scrollbar>

    <ChatInput
      placement="top"
      :content="content"
      :referenceImageUrl="referenceImageUrl"
      :send="
        (value) => {
          router.push({
            path: '/quantum/creator-zone/create/session',
            query: {
              ...value,
            },
          });
        }
      "
    />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { Icategory } from "@/types";
import Banner from "@/components/CreatorZone/Banner/index.vue";
import QuickEntrances from "@/components/CreatorZone/QuickEntrances/index.vue";
import GalleryCategories from "@/components/CreatorZone/GalleryCategories/index.vue";
import GalleryBase from "@/components/CreatorZone/GalleryBase/index.vue";
import ChatInput from "@/components/CreatorZone/ChatInput/index.vue";

import image1_1 from "@/assets/img/creator/mock/Portrait Photography/image (1).png";
import image1_2 from "@/assets/img/creator/mock/Portrait Photography/image (2).png";
import image1_3 from "@/assets/img/creator/mock/Portrait Photography/image (3).png";
import image1_4 from "@/assets/img/creator/mock/Portrait Photography/image (4).png";
import image1_5 from "@/assets/img/creator/mock/Portrait Photography/image (5).png";
import image1_6 from "@/assets/img/creator/mock/Portrait Photography/image (6).png";
import image1_7 from "@/assets/img/creator/mock/Portrait Photography/image (7).png";
import image1_8 from "@/assets/img/creator/mock/Portrait Photography/image (8).png";
import image1_9 from "@/assets/img/creator/mock/Portrait Photography/image (9).png";
import image1_10 from "@/assets/img/creator/mock/Portrait Photography/image (10).png";
import image1_11 from "@/assets/img/creator/mock/Portrait Photography/image (11).png";
import image1_12 from "@/assets/img/creator/mock/Portrait Photography/image (12).png";
import image1_13 from "@/assets/img/creator/mock/Portrait Photography/image (13).png";
import image1_14 from "@/assets/img/creator/mock/Portrait Photography/image (14).png";
import image1_15 from "@/assets/img/creator/mock/Portrait Photography/image (15).png";
import image1_16 from "@/assets/img/creator/mock/Portrait Photography/image (16).png";
import image1_17 from "@/assets/img/creator/mock/Portrait Photography/image (17).png";
import image1_18 from "@/assets/img/creator/mock/Portrait Photography/image (18).png";
import image2_1 from "@/assets/img/creator/mock/Landscape/image (1).png";
import image2_2 from "@/assets/img/creator/mock/Landscape/image (2).png";
import image2_3 from "@/assets/img/creator/mock/Landscape/image (3).png";
import image2_4 from "@/assets/img/creator/mock/Landscape/image (4).png";
import image2_5 from "@/assets/img/creator/mock/Landscape/image (5).png";
import image2_6 from "@/assets/img/creator/mock/Landscape/image (6).png";
import image2_7 from "@/assets/img/creator/mock/Landscape/image (7).png";
import image2_8 from "@/assets/img/creator/mock/Landscape/image (8).png";
import image2_9 from "@/assets/img/creator/mock/Landscape/image (9).png";
import image2_10 from "@/assets/img/creator/mock/Landscape/image (10).png";
import image2_11 from "@/assets/img/creator/mock/Landscape/image (11).png";
import image2_12 from "@/assets/img/creator/mock/Landscape/image (12).png";
import image2_13 from "@/assets/img/creator/mock/Landscape/image (13).png";
import image2_14 from "@/assets/img/creator/mock/Landscape/image (14).png";
import image3_1 from "@/assets/img/creator/mock/Anime/image (1).png";
import image3_2 from "@/assets/img/creator/mock/Anime/image (2).png";
import image3_3 from "@/assets/img/creator/mock/Anime/image (3).png";
import image3_4 from "@/assets/img/creator/mock/Anime/image (4).png";
import image3_5 from "@/assets/img/creator/mock/Anime/image (5).png";
import image3_6 from "@/assets/img/creator/mock/Anime/image (6).png";
import image3_7 from "@/assets/img/creator/mock/Anime/image (7).png";
import image3_8 from "@/assets/img/creator/mock/Anime/image (8).png";
import image3_9 from "@/assets/img/creator/mock/Anime/image (9).png";
import image3_10 from "@/assets/img/creator/mock/Anime/image (10).png";
import image3_11 from "@/assets/img/creator/mock/Anime/image (11).png";
import image3_12 from "@/assets/img/creator/mock/Anime/image (12).png";
import image3_13 from "@/assets/img/creator/mock/Anime/image (13).png";
import image3_14 from "@/assets/img/creator/mock/Anime/image (14).png";
import image4_1 from "@/assets/img/creator/mock/Art & Poster/image (1).png";
import image4_2 from "@/assets/img/creator/mock/Art & Poster/image (2).png";
import image4_3 from "@/assets/img/creator/mock/Art & Poster/image (3).png";
import image4_4 from "@/assets/img/creator/mock/Art & Poster/image (4).png";
import image4_5 from "@/assets/img/creator/mock/Art & Poster/image (5).png";
import image4_6 from "@/assets/img/creator/mock/Art & Poster/image (6).png";
import image4_7 from "@/assets/img/creator/mock/Art & Poster/image (7).png";
import image4_8 from "@/assets/img/creator/mock/Art & Poster/image (8).png";
import image4_9 from "@/assets/img/creator/mock/Art & Poster/image (9).png";
import image4_10 from "@/assets/img/creator/mock/Art & Poster/image (10).png";
import image4_11 from "@/assets/img/creator/mock/Art & Poster/image (11).png";
import image4_12 from "@/assets/img/creator/mock/Art & Poster/image (12).png";
import image4_13 from "@/assets/img/creator/mock/Art & Poster/image (13).png";
import image4_14 from "@/assets/img/creator/mock/Art & Poster/image (14).png";
import image4_15 from "@/assets/img/creator/mock/Art & Poster/image (15).png";
import image5_1 from "@/assets/img/creator/mock/3D&Product/image (1).png";
import image5_2 from "@/assets/img/creator/mock/3D&Product/image (2).png";
import image5_3 from "@/assets/img/creator/mock/3D&Product/image (3).png";
import image5_4 from "@/assets/img/creator/mock/3D&Product/image (4).png";
import image5_5 from "@/assets/img/creator/mock/3D&Product/image (5).png";
import image5_6 from "@/assets/img/creator/mock/3D&Product/image (6).png";
import image5_7 from "@/assets/img/creator/mock/3D&Product/image (7).png";
import image5_8 from "@/assets/img/creator/mock/3D&Product/image (8).png";
import image5_9 from "@/assets/img/creator/mock/3D&Product/image (9).png";
import image5_10 from "@/assets/img/creator/mock/3D&Product/image (10).png";
import image5_11 from "@/assets/img/creator/mock/3D&Product/image (11).png";

const _window = window;

const { t } = useI18n();
const router = useRouter();

const categories = ref<Icategory[]>([
  {
    id: "1",
    value: t("creatorZone.components.galleryCategories.portraitPhotography"),
    selected: false,
  },
  {
    id: "2",
    value: t("creatorZone.components.galleryCategories.landscape"),
    selected: false,
  },
  {
    id: "3",
    value: t("creatorZone.components.galleryCategories.anime"),
    selected: false,
  },
  {
    id: "4",
    value: t("creatorZone.components.galleryCategories.art"),
    selected: false,
  },
  {
    id: "5",
    value: t("creatorZone.components.galleryCategories.3d"),
    selected: false,
  },
]);
const selectedCategory = computed(() => {
  return categories.value.find((category) => category.selected);
});

const images = ref(
  [
    {
      id: "1",
      url: image1_1,
      content:
        "A young boy dashes across the sunlit lawn, feet nimbly tapping the soccer ball as he plays with joyful abandon.",
      width: 576,
      height: 1024,
      categoryId: "1",
    },
    {
      id: "2",
      url: image1_2,
      content: "Cute dog dozing softly on the cozy couch.",
      width: 768,
      height: 1024,
      categoryId: "1",
    },
    {
      id: "3",
      url: image1_3,
      content: "Vaporwave-style pup rocking neon hues amid Hawaii’s sunny, realistic",
      width: 768,
      height: 1024,
      categoryId: "1",
    },
    {
      id: "4",
      url: image1_4,
      content: "A charming rat sporting a bright, playful colorful hat.",
      width: 768,
      height: 1024,
      categoryId: "1",
    },
    {
      id: "5",
      url: image1_5,
      content: "A beautiful woman in the streets",
      width: 768,
      height: 1024,
      categoryId: "1",
    },
    {
      id: "6",
      url: image1_6,
      content: "Stunning beautiful young woman, playing violin, deeply emotive",
      width: 768,
      height: 1024,
      categoryId: "1",
    },
    {
      id: "7",
      url: image1_7,
      content: "the young man in white shirt smiling to the camera",
      width: 768,
      height: 1024,
      categoryId: "1",
    },
    {
      id: "8",
      url: image1_8,
      content: "Close - up: Serious man relaxing on home sofa (profile)",
      width: 768,
      height: 1024,
      categoryId: "1",
    },
    {
      id: "9",
      url: image1_9,
      content: "Brazilian woman at the carnival",
      width: 768,
      height: 1024,
      categoryId: "1",
    },
    {
      id: "10",
      url: image1_10,
      content: "Unique Met Gala - inspired women's fashion lookbook, high - res & detailed",
      width: 768,
      height: 1024,
      categoryId: "1",
    },
    {
      id: "11",
      url: image1_11,
      content: "2024 Korean 20 - something's trendy long wavy/bangs & straight hair, in salon",
      width: 768,
      height: 1024,
      categoryId: "1",
    },
    {
      id: "12",
      url: image1_12,
      content: "Indian woman in orange saree, braided hair with jasmine, on white bg",
      width: 768,
      height: 1024,
      categoryId: "1",
    },
    {
      id: "13",
      url: image1_13,
      content:
        "Magical AI scene: Glowing hand snaps, Asian woman materializes from digital particles. Surrounded by neon - blue circuits, holograms. Cinematic lighting, ultra - realistic.",
      width: 768,
      height: 1024,
      categoryId: "1",
    },
    {
      id: "14",
      url: image1_14,
      content: "Exquisite: Maiden in chrome kimono, among metallic flowers, cinematic light",
      width: 768,
      height: 1024,
      categoryId: "1",
    },
    {
      id: "15",
      url: image1_15,
      content: "Pop - art portrait: Woman in round glasses, flower - ear, on silver - white canvas",
      width: 768,
      height: 1024,
      categoryId: "1",
    },
    {
      id: "16",
      url: image1_16,
      content: "Unique, high - res women's lookbook: bold, art - inspired wearable art",
      width: 768,
      height: 1024,
      categoryId: "1",
    },
    {
      id: "17",
      url: image1_17,
      content: "Asian girl gracefully diving as a few bubbles rise underwater",
      width: 768,
      height: 1024,
      categoryId: "1",
    },
    {
      id: "18",
      url: image1_18,
      content:
        "Red - haired, dimpled woman in lacy yellow - and - white floral wedding dress, walking on white background",
      width: 768,
      height: 1024,
      categoryId: "1",
    },
    {
      id: "19",
      url: image2_1,
      content:
        "A charming cobblestone street scene, where a vintage train glides past as pedestrians stroll and cyclists weave gently through the bustle.",
      width: 512,
      height: 512,
      categoryId: "2",
    },
    {
      id: "20",
      url: image2_2,
      content:
        "A weathered vintage piano, its polished wood bearing subtle marks of time, gracefully anchoring the heart of my living room.",
      width: 576,
      height: 1024,
      categoryId: "2",
    },
    {
      id: "21",
      url: image2_3,
      content: "romantisches Strand panorama",
      width: 1024,
      height: 768,
      categoryId: "2",
    },
    {
      id: "22",
      url: image2_4,
      content: "Mighty mountain waterfall cascades into the ocean",
      width: 1024,
      height: 768,
      categoryId: "2",
    },
    {
      id: "23",
      url: image2_5,
      content:
        "Mesmerizing beach sunset: orange - pink - yellow sky, clear water, white sand, seagulls & palms",
      width: 1024,
      height: 768,
      categoryId: "2",
    },
    {
      id: "24",
      url: image2_6,
      content:
        "Wide - angle: Snow - capped mid - height mountain (left, half - shown) over clear lake, snow - dusted field, trees, blue sky with wisps. Fujifilm X - Pro2, 50mm, f/6.4, ISO 100 (tripod - steadied)",
      width: 1024,
      height: 768,
      categoryId: "2",
    },
    {
      id: "25",
      url: image2_7,
      content: "Calm Santa Monica sunset: warm hues over cool Pacific, 4K cinematic",
      width: 1024,
      height: 768,
      categoryId: "2",
    },
    {
      id: "26",
      url: image2_8,
      content: "Snapshot: Autumn's red, yellow, green fallen leaves on ground",
      width: 1024,
      height: 768,
      categoryId: "2",
    },
    {
      id: "27",
      url: image2_9,
      content:
        "HD Scenery: Morning light dyes Fuji's snow - capped eight peaks red, perfectly framed.",
      width: 1024,
      height: 768,
      categoryId: "2",
    },
    {
      id: "28",
      url: image2_10,
      content: "HD Autumn Maple: Symmetrical, film - like, with extreme light & virtual bg",
      width: 768,
      height: 1024,
      categoryId: "2",
    },
    {
      id: "29",
      url: image2_11,
      content: "Ancient city alley, cobblestone path, stone walls with ivy, soft light.",
      width: 768,
      height: 1024,
      categoryId: "2",
    },
    {
      id: "30",
      url: image2_12,
      content: "Solitary tree in the desert, orange - hued sand, blue sky in high - res.",
      width: 768,
      height: 1024,
      categoryId: "2",
    },
    {
      id: "31",
      url: image2_13,
      content: "Crisp mountain stream, clear water over rocks, tall pines around.",
      width: 768,
      height: 1024,
      categoryId: "2",
    },
    {
      id: "32",
      url: image2_14,
      content: "High - def beach sunrise, golden light on turquoise sea, soft sand.",
      width: 1024,
      height: 768,
      categoryId: "2",
    },
    {
      id: "33",
      url: image3_1,
      content: "A tiny astronaut hatching from a glowing egg on the moon’s dusty surface.",
      width: 768,
      height: 1024,
      categoryId: "3",
    },
    {
      id: "34",
      url: image3_2,
      content:
        "Photo-realistic LOTR-inspired scene: A tiny scarlet dragon nested on a medieval wizard’s oak table. Shot with a Canon EOS R5, 50mm f/2.8 macro lens, soft focus captures cozy morning light filtering through a nearby leaded window. Pastel hues and whimsical wispy steam elevate the serene vibe, evoking a DnD RPG aesthetic. Rendered in 16K/8K, highlighting intricate dragon scales, aged wood grain, and timeless medieval charm.",
      width: 768,
      height: 1024,
      categoryId: "3",
    },
    {
      id: "35",
      url: image3_3,
      content:
        "Close-up DOF render: A mythical creature woven from precise spiraling fractals and sinuous tendrils, its recursive skin brimming with layered, hyper-detailed textures.",
      width: 768,
      height: 1024,
      categoryId: "3",
    },
    {
      id: "36",
      url: image3_4,
      content:
        "Abstract chrome 80s sci-fi automaton à la Hajime Sorayama – airbrushed, bizarrely shaped, anchored by a single vertical line. Generative art crafted in p5.js, dithering texture amplifies its retro-futuristic metallic edge.",
      width: 768,
      height: 1024,
      categoryId: "3",
    },
    {
      id: "37",
      url: image3_5,
      content:
        "Petite light-skinned Black woman with sleek, frizz-free long curly brown hair, glasses, soft freckles, warm brown eyes, and flawless complexion.",
      width: 768,
      height: 1024,
      categoryId: "3",
    },
    {
      id: "38",
      url: image3_6,
      content:
        "Adorable, fluffy fantasy creature in dreamy surreal style, ultra clear fluffy white, smile cute",
      width: 768,
      height: 1024,
      categoryId: "3",
    },
    {
      id: "39",
      url: image3_7,
      content: "Charming illustration: cute mouse sipping a margarita",
      width: 768,
      height: 1024,
      categoryId: "3",
    },
    {
      id: "40",
      url: image3_8,
      content: "CG hand - painted thick style: handsome anime girl in fantasy",
      width: 768,
      height: 1024,
      categoryId: "3",
    },
    {
      id: "41",
      url: image3_9,
      content:
        "CG hand - painted in thick style: A handsome anime - inspired girl in a short skirt, with exquisitely detailed facial features illuminated by soft facial lighting, standing mid - range facing the camera. Set against a spectacular fantasy world backdrop filled with particles and rich details, rendered with Octane, ray - traced for depth of field, in 8K masterpiece quality.",
      width: 768,
      height: 1024,
      categoryId: "3",
    },
    {
      id: "42",
      url: image3_10,
      content:
        "CG hand-painted thick painting style, original god, collapse, exquisite facial features, handsome girl, short skirt, facial lighting, facing the camera, mid-range standing posture, octane rendering, ray tracing, depth of field, super detail, Honor of Kings, League of Legends, fantasy world, spectacular scenery, exquisite facial features, Japanese anime movies, particles, rich details, masterpieces, best quality, super detail, OC rendering, 8K image quality",
      width: 768,
      height: 1024,
      categoryId: "3",
    },
    {
      id: "43",
      url: image3_11,
      content:
        "CG hand - painted: A girl with exquisite features in short skirt, exquisite facial features, in a mid - stance facing camera. Fantasy world, Octane & OC rendered, 8K with extreme details.",
      width: 768,
      height: 1024,
      categoryId: "3",
    },
    {
      id: "44",
      url: image3_12,
      content:
        "In Disney cartoon style, a 20 - year - old, slender Asian beauty with a round face sits on the beach. Her medium - length black - brown hair frames her healthy, wheat - skinned face. Big eyes with long lashes sparkle. She wears a white vest, denim shorts, and pearl earrings. Seashells dot the sunny shore. The light - blue - and - white - toned background sets a charming scene. --ar 3:4",
      width: 768,
      height: 1024,
      categoryId: "3",
    },
    {
      id: "45",
      url: image3_13,
      content: "Hyper - realistic: Sad, kawaii mushroom lost in rainy forest",
      width: 768,
      height: 1024,
      categoryId: "3",
    },
    {
      id: "46",
      url: image3_14,
      content: "Radiant Ramadan: Crescent moon and lanterns in a tranquil eve",
      width: 768,
      height: 1024,
      categoryId: "3",
    },
    {
      id: "47",
      url: image4_1,
      content:
        "4K Film - like: sports car black low - rider with purple neon wheels, sunset, puddles (35mm, tropical bg, bokeh)",
      width: 768,
      height: 1024,
      categoryId: "4",
    },
    {
      id: "48",
      url: image4_2,
      content: "Stunning silver - rhinestoned racing car: magical & powerful ",
      width: 768,
      height: 1024,
      categoryId: "4",
    },
    {
      id: "49",
      url: image4_3,
      content: "Print: Man gazing at alien planet at new dawn",
      width: 768,
      height: 1024,
      categoryId: "4",
    },
    {
      id: "50",
      url: image4_4,
      content: "Ship sailing molten skies, near moon, by glowing city of old tales ",
      width: 768,
      height: 1024,
      categoryId: "4",
    },
    {
      id: "51",
      url: image4_5,
      content: "Vintage blue car on palm - lined road, mountains in golden hour, Dash McNab",
      width: 768,
      height: 1024,
      categoryId: "4",
    },
    {
      id: "52",
      url: image4_6,
      content: "Kawaii pastel - colored fluffy shark swimming, Korean anime style",
      width: 768,
      height: 1024,
      categoryId: "4",
    },
    {
      id: "53",
      url: image4_7,
      content: "1889 Eiffel Tower opening: Iron structure, bustling Paris, awed 19th , 5 people",
      width: 768,
      height: 1024,
      categoryId: "4",
    },
    {
      id: "54",
      url: image4_8,
      content: "Abstract art poster about anything",
      width: 1024,
      height: 768,
      categoryId: "4",
    },
    {
      id: "55",
      url: image4_9,
      content: "Magical abstract - designed race car: sleek, transparent, micro view",
      width: 768,
      height: 1024,
      categoryId: "4",
    },
    {
      id: "56",
      url: image4_10,
      content: "Abstract painting, a beautiful magica frog, magical, beautiful, abstract effects",
      width: 768,
      height: 1024,
      categoryId: "4",
    },
    {
      id: "57",
      url: image4_11,
      content: "Dark marble with flowing golden lines, soft - lit, elegant & luxurious ",
      width: 768,
      height: 1024,
      categoryId: "4",
    },
    {
      id: "58",
      url: image4_12,
      content: "Black - bg poster: Red, distorted “I LOVE YOU” heart - shaped ",
      width: 768,
      height: 1024,
      categoryId: "4",
    },
    {
      id: "59",
      url: image4_13,
      content: "Lively Year of the Dragon: Majestic dragon in bustling, colorful street ",
      width: 768,
      height: 1024,
      categoryId: "4",
    },
    {
      id: "60",
      url: image4_14,
      content: `In a 16K ink - splashed, freehand "Luoshen Travel Map", a close - up reveals Luoshen's captivating visage. Her hair flows freely from a high bun, adorned with fresh and delicate hair accessories. Long, gracefully curved eyebrows frame deep eyes with exquisitely detailed irises, gazing pensively into the distance. Her small nose, petite lips with a vermilion glaze, and a hint of facial blush enhance her charm. A beautiful neck and an obvious jawline add to her allure, complemented by glittering gold, silver, and jadeite jewelry, and shiny pearls. Against a backdrop of a sunset - bathed river and an ancient village, the scene is a masterpiece of traditional Chinese artistry. `,
      width: 768,
      height: 1024,
      categoryId: "4",
    },
    {
      id: "61",
      url: image4_15,
      content:
        "Chinese ink - style line art: Black - gold landscape with mountains, sunset, pavilion & pine ",
      width: 768,
      height: 1024,
      categoryId: "4",
    },
    {
      id: "62",
      url: image5_1,
      content:
        "Isometric pastel living room cube cutout, 3D art with soft light, high - detail (ArtStation/Behance, ray - traced)",
      width: 1024,
      height: 768,
      categoryId: "5",
    },
    {
      id: "63",
      url: image5_2,
      content:
        "High - res product shot: Candle pack “Moonlight in my garden” among flowers, pink minimalism à la [Artist name]",
      width: 768,
      height: 1024,
      categoryId: "5",
    },
    {
      id: "64",
      url: image5_3,
      content: "Luxury Cologne Top: Pink - White on Esthetic Background",
      width: 768,
      height: 1024,
      categoryId: "5",
    },
    {
      id: "65",
      url: image5_4,
      content:
        "16K HD: Futuristic neon - purple headphones, sleek, holographic for Cyber Monday (soft - lit)",
      width: 768,
      height: 1024,
      categoryId: "5",
    },
    {
      id: "66",
      url: image5_5,
      content:
        "Cream swivel chair on light floor, black base, by windows showing mountains & shore. ",
      width: 768,
      height: 1024,
      categoryId: "5",
    },
    {
      id: "67",
      url: image5_6,
      content: "Cinematic: Part - buried mezcal bottle in agave yard, under moody sky",
      width: 768,
      height: 1024,
      categoryId: "5",
    },
    {
      id: "68",
      url: image5_7,
      content: "Kawaii pastel - 3D colored fluffy shark swimming, Korean anime style",
      width: 768,
      height: 1024,
      categoryId: "5",
    },
    {
      id: "69",
      url: image5_8,
      content: "Hearts ballons colorful floats in the sky , clouds,",
      width: 768,
      height: 1024,
      categoryId: "5",
    },
    {
      id: "70",
      url: image5_9,
      content: "Morning coffee by the sea in Helsingborg, Sweden ",
      width: 768,
      height: 1024,
      categoryId: "5",
    },
    {
      id: "71",
      url: image5_10,
      content: "Micro - shot: Elegant, Fluffy Magnificent Christmas Star ",
      width: 768,
      height: 1024,
      categoryId: "5",
    },
    {
      id: "72",
      url: image5_11,
      content: "Breakfast, eggs, fruit, pancake, coffee, in the table, esthetic,",
      width: 768,
      height: 1024,
      categoryId: "5",
    },
  ].map((image) => {
    return {
      ...image,
      url: new window.URL(image.url, import.meta.url).href,
    };
  }),
);

const content = ref<string>("");
const referenceImageUrl = ref<string>("");

const galleryCategoryFixedObserverTop = ref(0);
const galleryCategoryFixed = ref(false);
const scrollBarLocked = ref(false);
const scrollBarRef = ref(null);

const setCategories = (id) => {
  categories.value = categories.value.map((category) => {
    return {
      ...category,
      selected: category.id === id ? !category.selected : false,
    };
  });
};

onMounted(() => {
  window.addEventListener("resize", Eresize);

  Eresize();
});

onUnmounted(() => {
  window.removeEventListener("resize", Eresize);
});

watch(
  [() => galleryCategoryFixed.value],
  async () => {
    await nextTick();

    scrollBarLocked.value = true;

    // scrollBarRef.value?.setScrollTop(galleryCategoryFixedObserverTop.value);

    window.setTimeout(() => {
      scrollBarLocked.value = false;

      onScroll();
    }, 300);
  },
  { immediate: false }
);

const Eresize = () => {
  const globalBarEle = window.document.querySelector("#global-bar-9e31c7fa");
  const galleryCategoryFixedObserverEle = window.document.querySelector(
    "#gallery-category-fixed-observer-de0dcb2a"
  );

  const globalBarEleBox = globalBarEle.getBoundingClientRect();
  const galleryCategoryFixedObserverEleBox =
    galleryCategoryFixedObserverEle.getBoundingClientRect();

  galleryCategoryFixedObserverTop.value =
    galleryCategoryFixedObserverEleBox.top - globalBarEleBox.height;
};

const onScroll = () => {
  if (scrollBarLocked.value) {
    return;
  }

  const globalBarEle = window.document.querySelector("#global-bar-9e31c7fa");
  const galleryCategoryFixedObserverEle = window.document.querySelector(
    "#gallery-category-fixed-observer-de0dcb2a"
  );

  const globalBarEleBox = globalBarEle.getBoundingClientRect();
  const galleryCategoryFixedObserverEleBox =
    galleryCategoryFixedObserverEle.getBoundingClientRect();

  if (galleryCategoryFixedObserverEleBox.top <= globalBarEleBox.height) {
    // galleryCategoryFixed.value = true;
  } else {
    // galleryCategoryFixed.value = false;
  }
};
</script>

<style lang="less" scoped>
.home {
  width: 100%;
  height: 100%;
  padding: 24px;
  display: flex;
  flex-direction: column;

  :deep(> .el-scrollbar .el-scrollbar__view) {
    padding-bottom: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  :deep(.quick-entrance) {
    margin-top: 16px;
    margin-bottom: 20px;
  }

  :deep(.gallery-category) {
    margin-bottom: 8px;
  }

  :deep(.gallery-base) {
    .btns {
      width: 100%;
      position: absolute;
      right: 0;
      bottom: 16px;
      display: flex;
      justify-content: center;

      .edit {
        padding: 8px 16px;
        border-radius: 999px;
        cursor: pointer;
        display: flex;
        align-items: center;

        .icon {
          margin-right: 4px;
          width: 16px;
          height: 16px;
          mask-image: url("@/assets/img/svg/edit2.svg");
          mask-size: 100%;
        }

        div {
          font-family: Rookery New;
          font-size: 12px;
          font-weight: 500;
        }
      }
    }
  }
}
</style>
