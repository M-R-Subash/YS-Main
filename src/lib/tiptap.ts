import { generateHTML as generateHTMLServer } from "@tiptap/html/server";
import { generateHTML as generateHTMLClient } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import Heading from "@tiptap/extension-heading";
import { Node, mergeAttributes } from "@tiptap/core";

const slugify = (text: string) => 
  text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

const CustomHeading = Heading.extend({
  renderHTML({ node, HTMLAttributes }) {
    const hasLevel = this.options.levels.includes(node.attrs.level)
    const level = hasLevel ? node.attrs.level : this.options.levels[0]
    
    // Get text content to slugify
    let text = "";
    if (node.content) {
      node.content.forEach((child: any) => {
        if (child.isText) {
          text += child.text;
        }
      });
    }

    if (level === 2 && text) {
      HTMLAttributes.id = slugify(text);
      HTMLAttributes.class = "scroll-mt-32";
    }
    
    return [`h${level}`, HTMLAttributes, 0]
  },
});

const getEmbedUrl = (url: string) => {
  if (!url) return "";
  if (url.includes("/embed/")) return url;
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split(/[?#]/)[0];
    if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
  }
  const match = url.match(/(?:v=|\/embed\/|\/watch\?v=|\/shorts\/|\/live\/)([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://www.youtube-nocookie.com/embed/${match[1]}`;
  }
  return url;
};

const CustomYoutube = Node.create({
  name: "youtube",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      start: { default: 0 },
      width: { default: "100%" },
      height: { default: "auto" },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-youtube-video] iframe" }, { tag: "iframe[src*='youtube']" }];
  },
  renderHTML({ HTMLAttributes }) {
    const embedUrl = getEmbedUrl(HTMLAttributes.src);
    return [
      "div",
      { class: "aspect-video w-full my-8 rounded-2xl overflow-hidden shadow-xl border border-border bg-black/5" },
      [
        "iframe",
        mergeAttributes(HTMLAttributes, {
          src: embedUrl,
          class: "w-full h-full border-0",
          allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
          allowfullscreen: "true",
        }),
      ],
    ];
  },
});

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      alt: {
        default: "",
        parseHTML: (element) => element.getAttribute("alt") || "",
        renderHTML: (attributes) => ({ alt: attributes.alt || "" }),
      },
      caption: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-caption") || "",
        renderHTML: (attributes) => (attributes.caption ? { "data-caption": attributes.caption } : {}),
      },
      alignment: {
        default: "center",
        parseHTML: (element) => element.getAttribute("data-alignment") || "center",
        renderHTML: (attributes) => ({ "data-alignment": attributes.alignment || "center" }),
      },
    };
  },
  renderHTML({ HTMLAttributes }) {
    const alignment = HTMLAttributes["data-alignment"] || "center";
    const caption = HTMLAttributes["data-caption"];

    let alignmentClass = "mx-auto block";
    let figureClass = "my-8 flex flex-col items-center";

    if (alignment === "left") {
      alignmentClass = "mr-auto block max-w-[70%]";
      figureClass = "my-8 flex flex-col items-start max-w-[70%]";
    } else if (alignment === "full") {
      alignmentClass = "w-full block max-w-full";
      figureClass = "my-8 w-full";
    }

    const imgAttrs = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
      class: `rounded-2xl border border-border shadow-md ${alignmentClass}`,
      loading: "lazy",
    });

    if (caption) {
      return [
        "figure",
        { class: figureClass },
        ["img", imgAttrs],
        [
          "figcaption",
          { class: "mt-2.5 text-center text-xs sm:text-sm text-zinc-500 italic font-medium" },
          caption,
        ],
      ];
    }

    return ["img", imgAttrs];
  },
});

const Details = Node.create({
  name: "details",
  group: "block",
  content: "detailsSummary detailsContent",
  defining: true,
  isolating: true,
  addAttributes() {
    return {
      open: {
        default: true,
        parseHTML: (element) => element.hasAttribute("open"),
        renderHTML: (attributes) => (attributes.open ? { open: "" } : {}),
      },
    };
  },
  parseHTML() {
    return [{ tag: "details" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "details",
      mergeAttributes(HTMLAttributes, {
        class: "my-6 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4 sm:p-5 transition-all duration-200 open:shadow-xs",
      }),
      0,
    ];
  },
});

const DetailsSummary = Node.create({
  name: "detailsSummary",
  group: "block",
  content: "inline*",
  defining: true,
  isolating: true,
  parseHTML() {
    return [{ tag: "summary" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "summary",
      mergeAttributes(HTMLAttributes, {
        class: "font-bold text-base sm:text-lg text-zinc-900 cursor-pointer select-none py-1 transition-colors hover:text-primary",
      }),
      0,
    ];
  },
});

const DetailsContent = Node.create({
  name: "detailsContent",
  group: "block",
  content: "block+",
  defining: true,
  parseHTML() {
    return [{ tag: "div[data-details-content]" }, { tag: "div.details-content" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-details-content": "",
        class: "mt-3 pt-3 border-t border-zinc-200/80 text-zinc-600 leading-relaxed",
      }),
      0,
    ];
  },
});

export function renderTipTap(json: any) {
  if (!json) return "";
  try {
    const generate = typeof window === "undefined" ? generateHTMLServer : generateHTMLClient;
    return generate(json, [
      StarterKit.configure({ 
        heading: false, 
        link: false, 
        underline: false 
      }),
      CustomHeading,
      Underline,
      Link.configure({ openOnClick: false }),
      CustomImage,
      Table,
      TableRow,
      TableHeader,
      TableCell,
      CustomYoutube,
      Details,
      DetailsSummary,
      DetailsContent,
    ]);
  } catch (error) {
    console.error("Failed to render TipTap HTML:", error);
    return "";
  }
}

