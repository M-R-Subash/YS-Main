import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import Heading from "@tiptap/extension-heading";

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
})

export function renderTipTap(json: any) {
  if (!json) return "";
  try {
    return generateHTML(json, [
      StarterKit.configure({ heading: false }), // disable default heading
      CustomHeading,
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      Table,
      TableRow,
      TableHeader,
      TableCell,
    ]);
  } catch (error) {
    console.error("Failed to render TipTap HTML:", error);
    return "";
  }
}

