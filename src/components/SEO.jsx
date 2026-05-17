import { useEffect } from "react";

/**
 * Lightweight, dependency-free SEO manager component.
 * Dynamically updates document head metadata (Title, Description, Keywords, Open Graph tags) on page mount.
 */
const SEO = ({ title, description, keywords, ogImage, ogUrl }) => {
  useEffect(() => {
    // 1. Update Page Title
    const baseTitle = "Dreamwed Stories | Premium Wedding Photography in Trivandrum";
    document.title = title ? `${title} | ${baseTitle}` : baseTitle;

    // 2. Update Meta Description
    const metaDescription = document.querySelector('meta[name="description"]');
    const defaultDesc = "Dreamwed Stories is the premier wedding photography and cinematic wedding films studio in Trivandrum, Kerala. Preserving your special moments with artistic candids, elegant traditionals, and epic drone coverages.";
    if (metaDescription) {
      metaDescription.setAttribute("content", description || defaultDesc);
    } else {
      const newMeta = document.createElement("meta");
      newMeta.name = "description";
      newMeta.content = description || defaultDesc;
      document.head.appendChild(newMeta);
    }

    // 3. Update Meta Keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    const defaultKeywords = "wedding photography Trivandrum, Kerala wedding photographer, candid wedding photography Kerala, cinematic wedding films Trivandrum, pre-wedding shoot Kerala, professional photographers Trivandrum, temple wedding photoshoot Kerala, premium wedding albums";
    if (metaKeywords) {
      metaKeywords.setAttribute("content", keywords || defaultKeywords);
    } else {
      const newMeta = document.createElement("meta");
      newMeta.name = "keywords";
      newMeta.content = keywords || defaultKeywords;
      document.head.appendChild(newMeta);
    }

    // 4. Update Open Graph Title
    const ogTitleTag = document.querySelector('meta[property="og:title"]');
    if (ogTitleTag) {
      ogTitleTag.setAttribute("content", title ? `${title} | Dreamwed Stories` : baseTitle);
    }

    // 5. Update Open Graph Description
    const ogDescTag = document.querySelector('meta[property="og:description"]');
    if (ogDescTag) {
      ogDescTag.setAttribute("content", description || defaultDesc);
    }

    // 6. Update Open Graph URL
    const ogUrlTag = document.querySelector('meta[property="og:url"]');
    if (ogUrlTag) {
      ogUrlTag.setAttribute("content", ogUrl || window.location.href);
    }

    // 7. Update Open Graph Image (Hero representation)
    if (ogImage) {
      const ogImgTag = document.querySelector('meta[property="og:image"]');
      if (ogImgTag) {
        ogImgTag.setAttribute("content", ogImage);
      }
    }
  }, [title, description, keywords, ogImage, ogUrl]);

  return null;
};

export default SEO;
