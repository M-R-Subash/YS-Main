export function generateToc(json: any) {
  const headings: { id: string; text: string }[] = [];
  
  if (!json || !json.content) return headings;

  // Simple function to generate slug-like ID
  const slugify = (text: string) => 
    text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');

  // Traverse JSON
  json.content.forEach((node: any) => {
    if (node.type === "heading" && node.attrs?.level === 2) {
      // Get text content of the heading
      let text = "";
      if (node.content) {
        text = node.content.map((child: any) => child.text || "").join("");
      }
      
      if (text.trim()) {
        const id = slugify(text);
        headings.push({ id, text });
      }
    }
  });

  return headings;
}
